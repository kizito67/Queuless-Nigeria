const express = require('express')
const { registerOrganization, listOrganizations, getBoard } = require('../controllers/organization.controller')

const router = express.Router()

router.post('/register', registerOrganization)
router.get('/', listOrganizations)
router.get('/board', getBoard)

module.exports = router