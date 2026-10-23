const prisma = require('./config/db')

async function main() {
    const user = await prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com', password: 'not-a-real-hash' },
    })
    console.log('Created:', user)

    const all = await prisma.user.findMany()
    console.log('Users in database:', all.length)

    await prisma.user.delete({ where: { id: user.id } })
    console.log('Deleted the test user')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())