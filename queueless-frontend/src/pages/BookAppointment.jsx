import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

// Mock data — will come from GET /api/organizations and GET /api/services later
const organizations = [
  {
    id: 'org1',
    name: 'First City Bank — Wuse II',
    services: ['Account Opening', 'Cash Withdrawal', 'Card Collection'],
  },
  {
    id: 'org2',
    name: 'Garki General Hospital',
    services: ['General Consultation', 'Laboratory', 'Pharmacy'],
  },
]

const steps = [
  'Pick an organization & service',
  'Choose a date & time',
  'Get your digital ticket instantly',
]

function BookAppointment() {
  const navigate = useNavigate()
  const [orgId, setOrgId] = useState('')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const selectedOrg = organizations.find((o) => o.id === orgId)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!orgId || !service || !date || !time || !name || !phone) {
      setError('Please fill in every field.')
      return
    }

    const queueNumber = `A-${Math.floor(Math.random() * 900 + 100)}`
    navigate('/queue', {
      state: { queueNumber, service, organization: selectedOrg.name, date, time, name },
    })
  }

  const inputStyles =
    'font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper-raised text-ink focus:outline-none focus:border-forest disabled:opacity-50'
  const labelStyles = 'flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft'

  return (
    <div className="bg-paper-raised border-t border-b border-line py-20">
      <div className="max-w-[1140px] mx-auto px-7 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <p className="font-mono text-xs tracking-wide uppercase text-forest-light font-semibold mb-2.5">
            Book in under a minute
          </p>
          <h2 className="font-display font-semibold text-3xl mb-4">
            Cut your ticket before you leave home.
          </h2>
          <p className="text-ink-soft text-[15px] max-w-[400px] mb-8">
            Choose an organization and a service, pick a time, and we'll hold your
            place in line. You'll get a live countdown so you know exactly when to
            walk out the door.
          </p>
          <ul className="flex flex-col gap-3.5">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3.5 text-[14.5px] font-medium">
                <span className="w-[26px] h-[26px] rounded-full bg-forest text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-2xl p-7 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5">{error}</p>
          )}

          <label className={labelStyles}>
            Organization
            <select
              value={orgId}
              onChange={(e) => {
                setOrgId(e.target.value)
                setService('')
              }}
              className={inputStyles}
            >
              <option value="" disabled>Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </label>

          <label className={labelStyles}>
            Service
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={!selectedOrg}
              className={inputStyles}
            >
              <option value="" disabled>Select a service</option>
              {selectedOrg?.services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3.5">
            <label className={labelStyles}>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyles} />
            </label>
            <label className={labelStyles}>
              Time
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputStyles} />
            </label>
          </div>

          <label className={labelStyles}>
            Full name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chidinma Okafor"
              className={inputStyles}
            />
          </label>

          <label className={labelStyles}>
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="080X XXX XXXX"
              className={inputStyles}
            />
          </label>

          <Button text="Book & get my ticket" type="submit" fullWidth />
        </form>
      </div>
    </div>
  )
}

export default BookAppointment