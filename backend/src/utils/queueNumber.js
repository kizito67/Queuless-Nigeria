// 7 -> "A-007"
function formatQueueNumber(n) {
    return `A-${String(n).padStart(3, '0')}`
}

module.exports = { formatQueueNumber }