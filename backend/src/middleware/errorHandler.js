function errorHandler(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON in request body.' })
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request is too large.' })
    }

    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
}

module.exports = errorHandler