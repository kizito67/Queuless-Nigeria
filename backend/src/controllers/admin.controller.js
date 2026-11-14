const prisma = require('../../config/db')

const STATUSES = ['pending', 'verified', 'suspended']

async function listAllOrganizations(req, res) {
    const organizations = await prisma.organization.findMany({
        select: {
            id: true,
            name: true,
            category: true,
            state: true,
            contactEmail: true,
            status: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    })
    res.json({ organizations })
}

async function setOrganizationStatus(req, res) {
    const { status } = req.body || {}
    if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' })
    }

    try {
        const organization = await prisma.organization.update({
            where: { id: req.params.id },
            data: { status },
            select: { id: true, name: true, status: true },
        })
        res.json({ organization })
    } catch (err) {
        // P2025 is Prisma's code for "no record with that id"
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Organization not found.' })
        }
        throw err
    }
}

module.exports = { listAllOrganizations, setOrganizationStatus }