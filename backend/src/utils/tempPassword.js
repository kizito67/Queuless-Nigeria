const crypto = require('crypto')

// Readable temporary password, leaving out look-alike characters (0/O, 1/l/I)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

function generateTempPassword(length = 10) {
    return Array.from({ length }, () => CHARS[crypto.randomInt(CHARS.length)]).join('')
}

module.exports = generateTempPassword