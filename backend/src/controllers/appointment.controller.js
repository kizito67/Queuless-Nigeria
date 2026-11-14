const prisma = require('../../config/db')
const { formatQueueNumber } = require('../utils/queueNumber')
const { todayLagos, nowLagos } = require('../utils/time')


const include = {
    organization: { select: { name: true } },
    service: { select: { name: true } },
}

// What we send to the frontend
const toDto = (a) => ({
    id: a.id,
    queueNumber: formatQueueNumber(a.queueNumber),
    date: a.date,
    time: a.time,
    status: a.status,
    organization: a.organization.name,
    service: a.service.name,
})

async function createAppointment(req, res) {
    const { organizationId, serviceId, date, time } = req.body || {}

    if (!organizationId || !serviceId || !date || !time) {
        return res.status(400).json({ message: 'Organization, service, date and time are required.' })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ message: 'Invalid date or time.' })
    }
    if (date < todayLagos()) {
        return res.status(400).json({ message: 'Choose today or a future date.' })
    }
    if (date === todayLagos() && time < nowLagos()) {
        return res.status(400).json({ message: 'That time has already passed today.' })
    }

    // The service must belong to the organization the client named, and that
    // organization must be verified. Never trust ids from the request on their own.
    const service = await prisma.service.findFirst({
        where: { id: serviceId, organizationId },
        include: { organization: true },
    })
    if (!service || service.organization.status !== 'verified') {
        return res.status(404).json({ message: 'That service is not available.' })
    }

    const org = service.organization
    if (time < org.openTime || time > org.closeTime) {
        return res.status(400).json({ message: `${org.name} is open ${org.openTime} to ${org.closeTime}.` })
    }

    // Next queue number = highest so far for this organization and day, plus one.
    // If two bookings race and pick the same number, the unique constraint rejects
    // one of them (error code P2002), and we simply try again with the new highest.
    for (let attempt = 0; attempt < 5; attempt++) {
        const last = await prisma.appointment.findFirst({
            where: { organizationId, date },
            orderBy: { queueNumber: 'desc' },
            select: { queueNumber: true },
        })

        try {
            const appointment = await prisma.appointment.create({
                data: {
                    queueNumber: (last?.queueNumber ?? 0) + 1,
                    date,
                    time,
                    customerId: req.user.id, // from the verified token, not the request body
                    organizationId,
                    serviceId,
                },
                include,
            })
            return res.status(201).json({ appointment: toDto(appointment) })
        } catch (err) {
            if (err.code !== 'P2002') throw err
        }
    }

    res.status(409).json({ message: 'The queue is busy right now. Please try again.' })
}

async function listMyAppointments(req, res) {
    const appointments = await prisma.appointment.findMany({
        where: { customerId: req.user.id },
        include,
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
    })
    res.json({ appointments: appointments.map(toDto) })
}

async function cancelAppointment(req, res) {
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } })

    // Same answer whether it doesn't exist or belongs to someone else,
    // so nobody can probe for other people's booking ids
    if (!appointment || appointment.customerId !== req.user.id) {
        return res.status(404).json({ message: 'Appointment not found.' })
    }
    if (appointment.status !== 'upcoming') {
        return res.status(400).json({ message: 'Only upcoming appointments can be cancelled.' })
    }

    const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'cancelled' },
        include,
    })
    res.json({ appointment: toDto(updated) })
}

module.exports = { createAppointment, listMyAppointments, cancelAppointment }
