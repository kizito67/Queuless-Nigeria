const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')
const generateToken = require('../utils/generateToken')

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
})

async function register(req, res) {
    const { name, email, phone, password } = req.body || {}

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || null,
            password: hashedPassword,
        },
    })

    res.status(201).json({ token: generateToken(user), user: publicUser(user) })
}

async function login(req, res) {
    const { email, password } = req.body || {}

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
    })

    const passwordMatches = user && (await bcrypt.compare(password, user.password))
    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (!user.isActive) {
        return res.status(403).json({ message: 'This account has been deactivated. Contact your organization.' })
    }

    res.json({ token: generateToken(user), user: publicUser(user) })
}

async function me(req, res) {
    res.json({ user: req.user })
}

async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body || {}

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required.' })
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters.' })
    }
    if (newPassword === currentPassword) {
        return res.status(400).json({ message: 'New password must be different from the current one.' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ message: 'Current password is incorrect.' })
    }

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(newPassword, 10), mustChangePassword: false },
    })

    res.json({ token: generateToken(updated), user: publicUser(updated) })
}

module.exports = { register, login, me, changePassword }