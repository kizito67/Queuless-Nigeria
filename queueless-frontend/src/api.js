const API_URL = import.meta.env.VITE_API_URL

export async function api(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json().catch(() => ({}))

    // A rejected token means the session is over: expired, or the account was deactivated.
    // Only when we sent a token, because a wrong password on the login form is also a 401.
    if (res.status === 401 && token) {
        localStorage.removeItem('queueless_auth')
        window.location.assign('/login?expired=1')
        throw new Error('Your session has ended. Please log in again.')
    }

    if (!res.ok) throw new Error(data.message || 'Something went wrong.')
    return data
}