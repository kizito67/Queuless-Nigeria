const jwt = require('jsonwebtoken')
const prisma = require('../../config/db')

// Runs before a protected route. If the token is good, it attaches the user
// to req.user so the route knows who is calling.
async function protect(req, res, next) {
    const header = req.headers.authorization

    // Clients send:  Authorization: Bearer <token>
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not logged in.' })
    }

    const token = header.split(' ')[1]

    let payload
    try {
        // Throws if the token was tampered with or has expired
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    // Load the user fresh from the database, so a changed role or a deleted
    // account takes effect immediately instead of waiting for the token to expire
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) {
        return res.status(401).json({ message: 'This account no longer exists.' })
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role }
    next()
}

module.exports = protect