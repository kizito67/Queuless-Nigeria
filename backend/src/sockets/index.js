const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const prisma = require('../../config/db')

let io

// One room per organization. Everyone watching that organization's queue is in it.
const room = (organizationId) => `org:${organizationId}`

function init(httpServer, origins) {
    io = new Server(httpServer, { cors: { origin: origins } })

    // Every connection must present the same JWT the REST API uses
    io.use(async (socket, next) => {
        try {
            const payload = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
            const user = await prisma.user.findUnique({ where: { id: payload.id } })
            if (!user || !user.isActive) return next(new Error('unauthorized'))
            socket.data.user = user
            next()
        } catch {
            next(new Error('unauthorized'))
        }
    })

    io.on('connection', (socket) => {
        const user = socket.data.user

        // A customer asks to watch the queue their appointment is in.
        // We check the appointment really belongs to them before letting them in.
        socket.on('queue:watch', async (appointmentId) => {
            const appointment = await prisma.appointment.findUnique({
                where: { id: String(appointmentId) },
            })
            if (appointment && appointment.customerId === user.id) {
                socket.join(room(appointment.organizationId))
            }
        })

        // Staff and owners watch their own organization's queue
        socket.on('staff:watch', async () => {
            if (!['staff', 'owner'].includes(user.role)) return

            let organizationId = user.organizationId
            if (user.role === 'owner') {
                const org = await prisma.organization.findFirst({
                    where: { ownerId: user.id },
                    orderBy: { createdAt: 'asc' },
                })
                organizationId = org?.id
            }
            if (organizationId) socket.join(room(organizationId))
        })
    })
}

// Called by the controllers whenever a queue changes
function queueChanged(organizationId, date) {
    if (io) io.to(room(organizationId)).emit('queue:changed', { date })
}

module.exports = { init, queueChanged }