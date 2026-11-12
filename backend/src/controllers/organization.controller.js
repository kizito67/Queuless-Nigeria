const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')

const PLANS = ['starter', 'professional', 'enterprise']

async function registerOrganization(req, res) {
    const {
        businessName, category, address, state, lga,
        openTime, closeTime, contactEmail, contactPhone,
        plan, password, services,
    } = req.body || {}

    const required = { businessName, category, address, state, lga, openTime, closeTime, contactEmail, password }
    if (Object.values(required).some((v) => !v)) {
        return res.status(400).json({ message: 'Please fill in every required field.' })
    }

    // Trim, drop blanks and duplicates
    const cleanServices = [...new Set((services || []).map((s) => String(s).trim()).filter(Boolean))]
    if (cleanServices.length === 0) {
        return res.status(400).json({ message: 'Add at least one service.' })
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' })
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
            role: 'staff', // set here on the server, never read from the request
            organizations: {
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
        include: { organizations: { include: { services: true } } },
    })

    res.status(201).json({
        message: 'Application received. We will verify your organization shortly.',
        organization: { id: user.organizations[0].id, name: user.organizations[0].name, status: 'pending' },
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
            services: { select: { id: true, name: true, durationMinutes: true } },
        },
        orderBy: { name: 'asc' },
    })

    res.json({ organizations })
}

module.exports = { registerOrganization, listOrganizations }