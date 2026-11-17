const express = require('express')
const {
    getOverview, listStaff, addStaff, updateStaff, resetStaffPassword,
    listServices, addService, updateService,
} = require('../controllers/business.controller')
const protect = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const ownerOrganization = require('../middleware/ownerOrganization')
const { getBilling, createCheckout, verifyPayment } = require('../controllers/billing.controller')

const router = express.Router()

router.use(protect, requireRole('owner'), ownerOrganization)

router.get('/overview', getOverview)
router.get('/staff', listStaff)
router.post('/staff', addStaff)
router.patch('/staff/:id', updateStaff)
router.post('/staff/:id/reset-password', resetStaffPassword)

router.get('/services', listServices)
router.post('/services', addService)
router.patch('/services/:id', updateService)

router.get('/billing', getBilling)
router.post('/billing/checkout', createCheckout)
router.post('/billing/verify', verifyPayment)

module.exports = router