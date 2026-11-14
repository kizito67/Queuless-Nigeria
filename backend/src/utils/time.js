// Dates and times in Nigerian local time, whatever timezone the server runs in
const todayLagos = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })

const nowLagos = () =>
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })

module.exports = { todayLagos, nowLagos }