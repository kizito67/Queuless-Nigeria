const prisma = require('../../config/db')

async function staffOrganization(req, res, next) {
    const organization = await prisma.organization.findFirst({
        where: { ownerId: req.user.id },
        orderBy: { createdAt: 'asc' },
    })

    if (!organization) {
        return res.status(404).json({ message: 'No organization is linked to this account.' })
    }
    if (organization.status !== 'verified') {
        return res.status(403).json({
            message:
                organization.status === 'pending'
                    ? 'Your organization is awaiting verification.'
                    : 'Your organization is suspended.',
        })
    }

    req.organization = organization
    next()
}

module.exports = staffOrganization