import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in both fields.')
      return
    }

    // TODO: replace with a real call to the backend's /api/auth/login
    console.log('Logging in with', { email, password })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-paper-raised border border-line rounded-2xl shadow-lg px-8 py-9 h-fit">
        <h1 className="font-display font-semibold text-2xl mb-1">Welcome back</h1>
        <p className="text-ink-soft text-sm mb-6">Log in to manage your tickets.</p>

        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper text-ink focus:outline-none focus:border-forest"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper text-ink focus:outline-none focus:border-forest"
            />
          </label>

          <Button text="Log In" type="submit" fullWidth />
        </form>

        <p className="text-center text-[13.5px] text-ink-soft mt-5">
          No account?{' '}
          <Link to="/register" className="text-forest font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login