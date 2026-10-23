const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()


app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }))


app.use(express.json())


app.use(morgan('dev'))


app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'QueueLess API is running' })
})

module.exports = app