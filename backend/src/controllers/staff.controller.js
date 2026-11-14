const prisma = require('../../config/db')
const { formatQueueNumber } = require('../utils/queueNumber')
const { todayLagos } = require('../utils/time')

const include = {
    customer: { select: { name: true } },
    service: { select: { name: true } },
}

const toDto = (a) => ({
    id: a.id,
    queueNumber: formatQueueNumber(a.queueNumber),
    name: a.customer.name,
    service: a.service.name,
    time: a.time,
    checkedIn: a.checkedIn,
    status: a.status,
})

async function getQueue(req, res) {
    const org = req.organization
    const where = { organizationId: org.id, date: todayLagos() }

    const [serving, waiting, skipped, servedToday] = await Promise.all([
        prisma.appointment.findFirst({ where: { ...where, status: 'serving' }, include }),
        prisma.appointment.findMany({ where: { ...where, status: 'upcoming' }, include, orderBy: { queueNumber: 'asc' } }),
        prisma.appointment.findMany({ where: { ...where, status: 'skipped' }, include, orderBy: { queueNumber: 'asc' } }),
        prisma.appointment.count({ where: { ...where, status: 'completed' } }),
    ])

    res.json({
        organization: { id: org.id, name: org.name, queuePaused: org.queuePaused },
        serving: serving ? toDto(serving) : null,
        waiting: waiting.map(toDto),
        skipped: skipped.map(toDto),
        servedToday,
    })
}

async function callNext(req, res) {
    const org = req.organization
    if (org.queuePaused) {
        return res.status(409).json({ message: 'The queue is paused.' })
    }

    const where = { organizationId: org.id, date: todayLagos() }

    // A transaction: finishing the current customer and starting the next one
    // either both happen or neither does
    const next = await prisma.$transaction(async (tx) => {
        // Only customers who have checked in can be called
        const candidate = await tx.appointment.findFirst({
            where: { ...where, status: 'upcoming', checkedIn: true },
            orderBy: { queueNumber: 'asc' },
        })
        if (!candidate) return null

        await tx.appointment.updateMany({
            where: { ...where, status: 'serving' },
            data: { status: 'completed' },
        })
        return tx.appointment.update({
            where: { id: candidate.id },
            data: { status: 'serving' },
            include,
        })
    })

    if (!next) {
        return res.status(409).json({ message: 'No checked-in customers are waiting.' })
    }
    res.json({ serving: toDto(next) })
}

async function completeServing(req, res) {
    const result = await prisma.appointment.updateMany({
        where: { organizationId: req.organization.id, date: todayLagos(), status: 'serving' },
        data: { status: 'completed' },
    })
    if (result.count === 0) {
        return res.status(409).json({ message: 'No one is being served right now.' })
    }
    res.json({ ok: true })
}

async function setPaused(req, res) {
    const { paused } = req.body || {}
    if (typeof paused !== 'boolean') {
        return res.status(400).json({ message: 'paused must be true or false.' })
    }
    const org = await prisma.organization.update({
        where: { id: req.organization.id },
        data: { queuePaused: paused },
        select: { queuePaused: true },
    })
    res.json(org)
}

// Each action says which statuses it may start from, and what it changes
const ACTIONS = {
    skip: { from: ['upcoming'], data: { status: 'skipped' } },
    recall: { from: ['skipped'], data: { status: 'upcoming' } },
    cancel: { from: ['upcoming', 'skipped'], data: { status: 'cancelled' } },
    checkin: { from: ['upcoming'], data: { checkedIn: true } },
    uncheckin: { from: ['upcoming'], data: { checkedIn: false } },
}

async function appointmentAction(req, res) {
    const rule = ACTIONS[req.body?.action]
    if (!rule) {
        return res.status(400).json({ message: 'Unknown action.' })
    }

    // organizationId in the filter means staff can only touch their own organization's bookings
    const result = await prisma.appointment.updateMany({
        where: {
            id: req.params.id,
            organizationId: req.organization.id,
            status: { in: rule.from },
        },
        data: rule.data,
    })
    if (result.count === 0) {
        return res.status(404).json({ message: 'Appointment not found, or it cannot be changed.' })
    }
    res.json({ ok: true })
}

module.exports = { getQueue, callNext, completeServing, setPaused, appointmentAction }