// Use after protect:  router.get('/x', protect, requireRole('admin'), handler)
function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to do this.' })
        }
        next()
    }
}

module.exports = requireRole