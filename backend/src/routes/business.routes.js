const express = require('express')
const {
    getOverview, listStaff, addStaff, updateStaff, resetStaffPassword,
} = require('../controllers/business.controller')
const protect = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const ownerOrganization = require('../middleware/ownerOrganization')

const router = express.Router()

router.use(protect, requireRole('owner'), ownerOrganization)

router.get('/overview', getOverview)
router.get('/staff', listStaff)
router.post('/staff', addStaff)
router.patch('/staff/:id', updateStaff)
router.post('/staff/:id/reset-password', resetStaffPassword)

module.exports = router