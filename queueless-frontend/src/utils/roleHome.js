// Where each role lands after logging in
export function homeFor(role) {
    if (role === 'admin') return '/admin'
    if (role === 'owner') return '/business'
    if (role === 'staff') return '/staff'
    return '/dashboard'
}