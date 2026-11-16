import { io } from 'socket.io-client'

// One connection per page that needs live updates, authenticated with the login token
export function connectSocket(token) {
    return io(import.meta.env.VITE_API_URL, { auth: { token } })
}