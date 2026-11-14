const express = require('express')
const { listAllOrganizations, setOrganizationStatus } = require('../controllers/admin.controller')
const protect = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')

const router = express.Router()

// Every route in this file needs a valid token AND the admin role
router.use(protect, requireRole('admin'))

router.get('/organizations', listAllOrganizations)
router.patch('/organizations/:id/status', setOrganizationStatus)

module.exports = router