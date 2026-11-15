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
        prisma.service.count({ where: { organizationId: org.id } }),
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

module.exports = { getOverview, listStaff, addStaff, updateStaff, resetStaffPassword }