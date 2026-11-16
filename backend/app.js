const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')

const origins = require('./config/origins')
const { apiLimiter, loginLimiter, signupLimiter } = require('./src/middleware/rateLimits')
const authRoutes = require('./src/routes/auth.routes')
const organizationRoutes = require('./src/routes/organization.routes')
const adminRoutes = require('./src/routes/admin.routes')
const appointmentRoutes = require('./src/routes/appointment.routes')
const staffRoutes = require('./src/routes/staff.routes')
const businessRoutes = require('./src/routes/business.routes')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()

// Behind a hosting provider's proxy, the real visitor IP comes from a header.
// Without this, every visitor would share one rate limit.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)

app.use(helmet()) // security headers
app.use(cors({ origin: origins }))
app.use(express.json({ limit: '100kb' })) // no giant request bodies
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Before the limiter, so uptime checks never get blocked
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'QueueLess API is running' })
})

app.use('/api', apiLimiter)
app.post('/api/auth/login', loginLimiter)
app.post('/api/auth/change-password', loginLimiter)
app.post('/api/auth/register', signupLimiter)
app.post('/api/organizations/register', signupLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/business', businessRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))
app.use(errorHandler)

module.exports = app