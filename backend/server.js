require('./config/env')
const http = require('http')
const app = require('./app')
const origins = require('./config/origins')
const { init } = require('./src/sockets')

const PORT = process.env.PORT || 5000

const server = http.createServer(app)
init(server, origins)

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})