const jwt = require('jsonwebtoken')
const prisma = require('../../config/db')

async function protect(req, res, next) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not logged in.' })
    }

    let payload
    try {
        payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    // Loaded fresh every request, so deactivating a staff member takes effect immediately
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user || !user.isActive) {
        return res.status(401).json({ message: 'This account is not available.' })
    }

    req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
    }
    next()
}

module.exports = protect