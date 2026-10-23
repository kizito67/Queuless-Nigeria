const bcrypt = require('bcryptjs')
const prisma = require('../config/db')
const generateToken = require('../utils/generateToken')


const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
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

    // One-way hash: we can check a password against it, but never recover it
    const hashedPassword = await bcrypt.hash(password, 10)

    // Note: role is NOT read from the request. Everyone who registers here is a customer.
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

    // Same message whether the email or the password is wrong, so attackers
    // can't use this endpoint to find out which emails have accounts
    const passwordMatches = user && (await bcrypt.compare(password, user.password))
    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid email or password.' })
    }

    res.json({ token: generateToken(user), user: publicUser(user) })
}

module.exports = { register, login }