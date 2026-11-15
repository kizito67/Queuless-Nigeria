const prisma = require('../../config/db')

async function ownerOrganization(req, res, next) {
    const organization = await prisma.organization.findFirst({
        where: { ownerId: req.user.id },
        orderBy: { createdAt: 'asc' },
    })
    if (!organization) {
        return res.status(404).json({ message: 'No organization is linked to this account.' })
    }
    req.organization = organization
    next()
}

module.exports = ownerOrganization