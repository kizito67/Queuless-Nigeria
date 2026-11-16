const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const isEmail = (value) =>
    typeof value === 'string' && value.length <= 254 && EMAIL.test(value.trim())

module.exports = { isEmail }