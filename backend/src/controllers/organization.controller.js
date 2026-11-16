const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')
const { formatQueueNumber } = require('../utils/queueNumber')
const { todayLagos } = require('../utils/time')
const { isEmail } = require('../utils/validate')

const PLANS = ['starter', 'professional', 'enterprise']
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

async function registerOrganization(req, res) {
    const {
        businessName, category, address, state, lga,
        openTime, closeTime, contactEmail, contactPhone,
        plan, password, services,
    } = req.body || {}

    const required = { businessName, category, address, state, lga, openTime, closeTime, contactEmail, password }
    if (Object.values(required).some((v) => typeof v !== 'string' || !v.trim())) {
        return res.status(400).json({ message: 'Please fill in every required field.' })
    }
    if (!isEmail(contactEmail)) {
        return res.status(400).json({ message: 'Enter a valid contact email.' })
    }
    if (businessName.length > 120 || address.length > 200) {
        return res.status(400).json({ message: 'Business name or address is too long.' })
    }

    if (!TIME.test(openTime) || !TIME.test(closeTime)) {
        return res.status(400).json({ message: 'Invalid opening or closing time.' })
    }
    if (closeTime <= openTime) {
        return res.status(400).json({ message: 'Closing time must be after opening time.' })
    }

    // Trim, drop blanks and duplicates
    const cleanServices = [...new Set((services || []).map((s) => String(s).trim()).filter(Boolean))]
    if (cleanServices.length === 0) {
        return res.status(400).json({ message: 'Add at least one service.' })
    }

    if (password.length < 8 || password.length > 72) {
        return res.status(400).json({ message: 'Password must be 8 to 72 characters.' })
    }

    const planValue = String(plan || 'professional').toLowerCase()
    if (!PLANS.includes(planValue)) {
        return res.status(400).json({ message: 'Invalid plan.' })
    }

    const email = contactEmail.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // One create call with nested creates: Prisma runs it as a single transaction,
    // so we never end up with a user but no organization, or an organization but no services.
    const user = await prisma.user.create({
        data: {
            name: businessName.trim(),
            email,
            phone: contactPhone || null,
            password: hashedPassword,
            role: 'owner', // set here on the server, never read from the request
            ownedOrganizations: {
                create: {
                    name: businessName.trim(),
                    category,
                    address: address.trim(),
                    state,
                    lga: lga.trim(),
                    openTime,
                    closeTime,
                    contactEmail: email,
                    contactPhone: contactPhone || null,
                    plan: planValue,
                    services: { create: cleanServices.map((name) => ({ name })) },
                },
            },
        },
        include: { ownedOrganizations: { include: { services: true } } },
    })

    res.status(201).json({
        message: 'Application received. We will verify your organization shortly.',
        organization: { id: user.ownedOrganizations[0].id, name: user.ownedOrganizations[0].name, status: 'pending' },
    })
}

async function listOrganizations(req, res) {
    const organizations = await prisma.organization.findMany({
        where: { status: 'verified' }, // pending and suspended ones stay hidden
        select: {
            id: true,
            name: true,
            category: true,
            address: true,
            state: true,
            lga: true,
            openTime: true,
            closeTime: true,
            services: { where: { isActive: true }, select: { id: true, name: true, durationMinutes: true } },
        },
        orderBy: { name: 'asc' },
    })

    res.json({ organizations })
}

// Public: shows queue numbers and counts only, never names
async function getBoard(req, res) {
    const date = todayLagos()

    // The verified organization with the most bookings, as long as it has some today
    const org = await prisma.organization.findFirst({
        where: {
            status: 'verified',
            appointments: { some: { date, status: { not: 'cancelled' } } },
        },
        orderBy: { appointments: { _count: 'desc' } },
        select: { id: true, name: true },
    })

    if (!org) return res.json({ board: null })

    const where = { organizationId: org.id, date }
    const [serving, next, waitingCount] = await Promise.all([
        prisma.appointment.findFirst({ where: { ...where, status: 'serving' }, select: { queueNumber: true } }),
        prisma.appointment.findFirst({
            where: { ...where, status: 'upcoming' },
            orderBy: { queueNumber: 'asc' },
            select: { queueNumber: true },
        }),
        prisma.appointment.count({ where: { ...where, status: 'upcoming' } }),
    ])

    res.json({
        board: {
            organization: org.name,
            nowServing: serving ? formatQueueNumber(serving.queueNumber) : null,
            nextUp: next ? formatQueueNumber(next.queueNumber) : null,
            peopleWaiting: waitingCount,
        },
    })
}

module.exports = { registerOrganization, listOrganizations, getBoard }
