const express = require('express')
const {
    getQueue, callNext, completeServing, setPaused, appointmentAction,
} = require('../controllers/staff.controller')
const protect = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const staffOrganization = require('../middleware/staffOrganization')

const router = express.Router()

// Logged in, staff (or admin), and linked to a verified organization
router.use(protect, requireRole('staff', 'admin'), staffOrganization)

router.get('/queue', getQueue)
router.post('/queue/call-next', callNext)
router.post('/queue/complete', completeServing)
router.patch('/queue/pause', setPaused)
router.patch('/appointments/:id/action', appointmentAction)

module.exports = router