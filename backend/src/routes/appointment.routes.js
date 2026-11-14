const express = require('express')
const {
    createAppointment,
    listMyAppointments,
    cancelAppointment,
} = require('../controllers/appointment.controller')
const protect = require('../middleware/auth')

const router = express.Router()

router.use(protect) // every booking route needs a logged-in user

router.post('/', createAppointment)
router.get('/mine', listMyAppointments)
router.patch('/:id/cancel', cancelAppointment)

module.exports = router