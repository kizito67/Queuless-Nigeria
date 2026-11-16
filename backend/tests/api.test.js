const test = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const app = require('../app')

test('health check responds', async () => {
    const res = await request(app).get('/api/health')
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.status, 'ok')
})

test('unknown routes return 404', async () => {
    const res = await request(app).get('/api/does-not-exist')
    assert.strictEqual(res.status, 404)
})

test('protected routes refuse requests without a token', async () => {
    for (const path of [
        '/api/auth/me',
        '/api/appointments/mine',
        '/api/staff/queue',
        '/api/business/overview',
        '/api/admin/organizations',
    ]) {
        const res = await request(app).get(path)
        assert.strictEqual(res.status, 401, `${path} should be 401`)
    }
})

test('a garbage token is refused', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token')
    assert.strictEqual(res.status, 401)
})

test('register rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' })
    assert.strictEqual(res.status, 400)
})

test('register rejects an invalid email', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'password123' })
    assert.strictEqual(res.status, 400)
})

test('register rejects a short or oversized password', async () => {
    const short = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'a@b.com', password: 'short' })
    assert.strictEqual(short.status, 400)

    const huge = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'a@b.com', password: 'x'.repeat(200) })
    assert.strictEqual(huge.status, 400)
})

test('a non-string password does not crash the server', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@b.com', password: { $ne: null } })
    assert.strictEqual(res.status, 400)
})

test('malformed JSON gets a clean 400', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": ')
    assert.strictEqual(res.status, 400)
})