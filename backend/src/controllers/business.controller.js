const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')
const generateTempPassword = require('../utils/tempPassword')
const { todayLagos } = require('../utils/time')

const staffSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    isActive: true,
    mustChangePassword: true,
    createdAt: true,
}

async function getOverview(req, res) {
    const org = req.organization
    const today = todayLagos()

    const [staffCount, servicesCount, bookingsToday, servedToday] = await Promise.all([
        prisma.user.count({ where: { organizationId: org.id, role: 'staff', isActive: true } }),
        prisma.service.count({ where: { organizationId: org.id, isActive: true } }),
        prisma.appointment.count({ where: { organizationId: org.id, date: today, status: { not: 'cancelled' } } }),
        prisma.appointment.count({ where: { organizationId: org.id, date: today, status: 'completed' } }),
    ])

    res.json({
        organization: {
            id: org.id,
            name: org.name,
            status: org.status,
            plan: org.plan,
            openTime: org.openTime,
            closeTime: org.closeTime,
        },
        stats: { staffCount, servicesCount, bookingsToday, servedToday },
    })
}

async function listStaff(req, res) {
    const staff = await prisma.user.findMany({
        where: { organizationId: req.organization.id, role: 'staff' },
        select: staffSelect,
        orderBy: { createdAt: 'desc' },
    })
    res.json({ staff })
}

async function addStaff(req, res) {
    const { name, email, phone } = req.body || {}
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // The server makes the password and shows it once. Only the hash is stored.
    const temporaryPassword = generateTempPassword()

    const staff = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || null,
            password: await bcrypt.hash(temporaryPassword, 10),
            role: 'staff',
            organizationId: req.organization.id, // the owner's organization, never from the request
            mustChangePassword: true,
        },
        select: staffSelect,
    })

    res.status(201).json({ staff, temporaryPassword })
}

async function updateStaff(req, res) {
    const { isActive } = req.body || {}
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be true or false.' })
    }

    // organizationId + role in the filter: an owner can only touch their own staff
    const result = await prisma.user.updateMany({
        where: { id: req.params.id, organizationId: req.organization.id, role: 'staff' },
        data: { isActive },
    })
    if (result.count === 0) {
        return res.status(404).json({ message: 'Staff member not found.' })
    }
    res.json({ ok: true })
}

async function resetStaffPassword(req, res) {
    const temporaryPassword = generateTempPassword()

    const result = await prisma.user.updateMany({
        where: { id: req.params.id, organizationId: req.organization.id, role: 'staff' },
        data: { password: await bcrypt.hash(temporaryPassword, 10), mustChangePassword: true },
    })
    if (result.count === 0) {
        return res.status(404).json({ message: 'Staff member not found.' })
    }
    res.json({ temporaryPassword })
}

const serviceSelect = { id: true, name: true, durationMinutes: true, isActive: true }

function parseDuration(value) {
    const n = Number(value)
    return Number.isInteger(n) && n >= 1 && n <= 240 ? n : null
}

async function listServices(req, res) {
    const services = await prisma.service.findMany({
        where: { organizationId: req.organization.id },
        select: serviceSelect,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    })
    res.json({ services })
}

async function addService(req, res) {
    const name = String(req.body?.name || '').trim()
    const durationMinutes = parseDuration(req.body?.durationMinutes ?? 15)

    if (!name) {
        return res.status(400).json({ message: 'Service name is required.' })
    }
    if (durationMinutes === null) {
        return res.status(400).json({ message: 'Duration must be a whole number of minutes, from 1 to 240.' })
    }

    const organizationId = req.organization.id
    const existing = await prisma.service.findUnique({
        where: { organizationId_name: { organizationId, name } },
    })

    if (existing?.isActive) {
        return res.status(409).json({ message: 'You already have a service with that name.' })
    }

    // An archived service with the same name is brought back instead of duplicated
    const service = existing
        ? await prisma.service.update({
            where: { id: existing.id },
            data: { isActive: true, durationMinutes },
            select: serviceSelect,
        })
        : await prisma.service.create({
            data: { name, durationMinutes, organizationId },
            select: serviceSelect,
        })

    res.status(201).json({ service })
}

async function updateService(req, res) {
    const data = {}

    if (req.body?.name !== undefined) {
        const name = String(req.body.name).trim()
        if (!name) return res.status(400).json({ message: 'Service name cannot be empty.' })
        data.name = name
    }
    if (req.body?.durationMinutes !== undefined) {
        const duration = parseDuration(req.body.durationMinutes)
        if (duration === null) {
            return res.status(400).json({ message: 'Duration must be a whole number of minutes, from 1 to 240.' })
        }
        data.durationMinutes = duration
    }
    if (req.body?.isActive !== undefined) {
        if (typeof req.body.isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be true or false.' })
        }
        data.isActive = req.body.isActive
    }
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'Nothing to update.' })
    }

    const organizationId = req.organization.id

    // Customers can't book an organization with no services, so keep at least one active
    if (data.isActive === false) {
        const others = await prisma.service.count({
            where: { organizationId, isActive: true, id: { not: req.params.id } },
        })
        if (others === 0) {
            return res.status(400).json({ message: 'Keep at least one active service.' })
        }
    }

    try {
        // organizationId in the filter: owners can only change their own services
        const result = await prisma.service.updateMany({
            where: { id: req.params.id, organizationId },
            data,
        })
        if (result.count === 0) {
            return res.status(404).json({ message: 'Service not found.' })
        }
    } catch (err) {
        // P2002 is Prisma's code for breaking a unique rule (a duplicate name)
        if (err.code === 'P2002') {
            return res.status(409).json({ message: 'You already have a service with that name.' })
        }
        throw err
    }

    res.json({ ok: true })
}

module.exports = {
    getOverview, listStaff, addStaff, updateStaff, resetStaffPassword,
    listServices, addService, updateService,
}