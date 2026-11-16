const rateLimit = require('express-rate-limit')

const make = (windowMs, limit, message, extra = {}) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message },
        ...extra,
    })

// Everything under /api
const apiLimiter = make(15 * 60 * 1000, 300, 'Too many requests. Please slow down.')

// Logging in and changing a password: only failed attempts count,
// so normal use never gets blocked but password guessing does
const loginLimiter = make(15 * 60 * 1000, 10, 'Too many attempts. Try again in 15 minutes.', {
    skipSuccessfulRequests: true,
})

// Creating accounts
const signupLimiter = make(60 * 60 * 1000, 10, 'Too many sign-ups from this network. Try again later.')

module.exports = { apiLimiter, loginLimiter, signupLimiter }