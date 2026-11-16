const defaults = ['http://localhost:5173', 'http://localhost:5174']

module.exports = process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(',').map((s) => s.trim())
    : defaults