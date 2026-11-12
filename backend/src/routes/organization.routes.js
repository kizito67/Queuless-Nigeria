const express = require('express')
const { registerOrganization, listOrganizations } = require('../controllers/organization.controller')

const router = express.Router()

router.post('/register', registerOrganization)
router.get('/', listOrganizations)

module.exports = router