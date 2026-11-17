const BASE = 'https://api.paystack.co'

// One place that talks to Paystack. Returns the "data" part of the reply.
async function paystack(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.status === false) {
        throw new Error(json.message || 'Payment provider error.')
    }
    return json.data
}

module.exports = paystack