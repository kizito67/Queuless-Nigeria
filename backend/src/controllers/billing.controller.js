const crypto = require('crypto')
const prisma = require('../../config/db')
const plans = require('../../config/plans')
const paystack = require('../utils/paystack')

const PERIOD_DAYS = 30
const addDays = (date, n) => new Date(date.getTime() + n * 24 * 60 * 60 * 1000)

const paymentDto = (p) => ({
    id: p.id,
    reference: p.reference,
    plan: p.plan,
    amount: p.amount / 100, // kobo to naira for display
    status: p.status,
    paidAt: p.paidAt,
    createdAt: p.createdAt,
})

console.log(typeof prisma.organization, typeof prisma.payment)
async function getBilling(req, res) {
    const org = req.organization
    console.log(typeof prisma, Object.keys(prisma).slice(0, 10))
    const payments = await prisma.payment.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })

    res.json({
        billing: {
            plan: org.plan,
            paidUntil: org.paidUntil,
            active: !!org.paidUntil && org.paidUntil > new Date(),
        },
        plans: Object.entries(plans).map(([id, p]) => ({
            id,
            name: p.name,
            price: p.amount / 100,
            features: p.features,
        })),
        payments: payments.map(paymentDto),
    })
}

console.log('paystack key set:', !!process.env.PAYSTACK_SECRET_KEY, '| client url:', process.env.CLIENT_URL)
async function createCheckout(req, res) {
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.CLIENT_URL) {
        return res.status(503).json({ message: 'Billing is not configured yet.' })
    }

    const plan = req.body?.plan
    // hasOwn stops odd inputs like "constructor" from matching
    if (typeof plan !== 'string' || !Object.hasOwn(plans, plan)) {
        return res.status(400).json({ message: 'Choose a valid plan.' })
    }

    const reference = `ql_${crypto.randomBytes(12).toString('hex')}`
    const amount = plans[plan].amount // always from our own list, never from the request

    let checkout
    try {
        checkout = await paystack('/transaction/initialize', {
            method: 'POST',
            body: {
                email: req.user.email,
                amount,
                currency: 'NGN',
                reference,
                callback_url: `${process.env.CLIENT_URL}/business/billing/callback`,
                metadata: { organizationId: req.organization.id, plan },
            },
        })
    } catch (err) {
        console.error('Paystack initialize failed:', err.message)
        return res.status(502).json({ message: 'Could not reach the payment provider. Please try again.' })
    }

    await prisma.payment.create({
        data: { reference, plan, amount, organizationId: req.organization.id },
    })

    res.json({ authorizationUrl: checkout.authorization_url })
}

async function verifyPayment(req, res) {
    const reference = String(req.body?.reference || '')
    if (!reference) {
        return res.status(400).json({ message: 'Payment reference is required.' })
    }

    // organizationId in the filter: owners can only verify their own payments
    const payment = await prisma.payment.findFirst({
        where: { reference, organizationId: req.organization.id },
    })
    if (!payment) {
        return res.status(404).json({ message: 'Payment not found.' })
    }
    if (payment.status === 'success') {
        return res.json({ status: 'success' }) // already processed
    }

    let charge
    try {
        charge = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`)
    } catch (err) {
        console.error('Paystack verify failed:', err.message)
        return res.status(502).json({ message: 'Could not confirm the payment. Please try again.' })
    }

    if (charge.status !== 'success') {
        if (charge.status === 'failed') {
            await prisma.payment.updateMany({
                where: { id: payment.id, status: 'pending' },
                data: { status: 'failed' },
            })
        }
        return res.json({ status: charge.status }) // abandoned, ongoing, failed...
    }

    // Paystack says paid. Make sure it is exactly what we asked for.
    if (charge.amount !== payment.amount || charge.currency !== payment.currency || charge.reference !== reference) {
        console.error('Payment mismatch', { reference, expected: payment.amount, got: charge.amount })
        await prisma.payment.updateMany({
            where: { id: payment.id, status: 'pending' },
            data: { status: 'failed' },
        })
        return res.status(400).json({ message: 'The payment details did not match. Please contact support.' })
    }

    await prisma.$transaction(async (db) => {
        // Only one request can flip pending to success, so a double click or a
        // refresh can never extend the subscription twice
        const claimed = await db.payment.updateMany({
            where: { id: payment.id, status: 'pending' },
            data: { status: 'success', paidAt: new Date() },
        })
        if (claimed.count === 0) return

        const org = await db.organization.findUnique({
            where: { id: payment.organizationId },
            select: { paidUntil: true },
        })
        const now = new Date()
        // Paying early adds time on top of what's left, rather than wasting it
        const start = org.paidUntil && org.paidUntil > now ? org.paidUntil : now

        await db.organization.update({
            where: { id: payment.organizationId },
            data: { plan: payment.plan, paidUntil: addDays(start, PERIOD_DAYS) },
        })
    })

    res.json({ status: 'success' })
}

module.exports = { getBilling, createCheckout, verifyPayment }