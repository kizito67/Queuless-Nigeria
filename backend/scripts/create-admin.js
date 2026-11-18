const bcrypt = require('bcryptjs')
const prisma = require('../config/db')

async function main() {
    const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD, for example:')
        console.error('ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=a-long-password node scripts/create-admin.js')
        process.exit(1)
    }
    if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 72) {
        console.error('Use a password of 12 to 72 characters for the admin account.')
        process.exit(1)
    }

    const email = ADMIN_EMAIL.trim().toLowerCase()
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10)

    // Creates the account, or promotes it if the email already exists
    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'admin', password, isActive: true, mustChangePassword: false },
        create: { name: ADMIN_NAME, email, password, role: 'admin' },
    })

    console.log(`Admin ready: ${user.email}`)
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())