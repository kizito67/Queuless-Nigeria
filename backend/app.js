const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const authRoutes = require('./src/routes/auth.routes')
const protect = require('./src/middleware/auth')
const requireRole = require('./src/middleware/requireRole')
const errorHandler = require('./src/middleware/errorHandler')
const organizationRoutes = require('./src/routes/organization.routes')
const adminRoutes = require('./src/routes/admin.routes')
const appointmentRoutes = require('./src/routes/appointment.routes')
const staffRoutes = require('./src/routes/staff.routes')

const app = express()


app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))

app.use(express.json())

app.use(morgan('dev'))


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the QueueLess API', health: '/api/health' })
})


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'QueueLess API is running' })
})
app.use('/api/auth', authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/staff', staffRoutes)


app.get('/api/admin-test', protect, requireRole('admin'), (req, res) => {
    res.json({ message: `Hello admin ${req.user.name}` })
})


app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))
app.use(errorHandler)

module.exports = app
