import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.')
      return
    }

    // TODO: replace with a real call to the backend's /api/auth/register
    console.log('Registering', form)
    navigate('/login')
  }

  const fields = [
    { name: 'name', label: 'Full name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone number', type: 'tel' },
    { name: 'password', label: 'Password', type: 'password' },
  ]

  return (
    <div className="min-h-screen flex justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-paper-raised border border-line rounded-2xl shadow-lg px-8 py-9 h-fit">
        <h1 className="font-display font-semibold text-2xl mb-1">Create your account</h1>
        <p className="text-ink-soft text-sm mb-6">Book tickets across every organization on QueueLess.</p>

        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map((field) => (
            <label
              key={field.name}
              className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft"
            >
              {field.label}
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper text-ink focus:outline-none focus:border-forest"
              />
            </label>
          ))}

          <Button text="Register" type="submit" fullWidth />
        </form>

        <p className="text-center text-[13.5px] text-ink-soft mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register