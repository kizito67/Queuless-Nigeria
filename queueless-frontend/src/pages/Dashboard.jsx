import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import StatusPill from '../components/Statuspill'
import Ticket from '../components/Ticket'

// Mock data — will come from GET /api/appointments/mine later
const initialBookings = [
  { id: 1, org: 'First City Bank — Wuse II', service: 'Account Opening', date: '22 Sep 2026', time: '10:30', number: 'A-024', status: 'upcoming' },
  { id: 2, org: 'Garki General Hospital', service: 'General Consultation', date: '14 Sep 2026', time: '09:00', number: 'B-012', status: 'completed' },
  { id: 3, org: 'NIS Passport Office — Abuja', service: 'Passport Renewal', date: '02 Sep 2026', time: '11:15', number: 'C-045', status: 'missed' },
  { id: 4, org: 'FRSC Licensing Office', service: "Driver's License Renewal", date: '18 Aug 2026', time: '13:00', number: 'D-031', status: 'completed' },
]

function Dashboard() {
  const [bookings, setBookings] = useState(initialBookings)

  const active = bookings.find((b) => b.status === 'upcoming')

  const cancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    )
  }

  const th = 'text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line'
  const td = 'px-5 py-[15px] border-b border-line text-sm'

  return (
    <div>
      <PageHero title="My tickets" subtitle="Your active ticket and everything you've booked before." />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24 grid lg:grid-cols-[340px_1fr] gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-[15px] font-bold mb-4">Active ticket</h2>
          {active ? (
            <>
              <Ticket
                flat
                org={active.org}
                service={active.service}
                number={active.number}
                bottomLeft={{ label: 'Date', value: active.date }}
                bottomRight={{ label: 'Time', value: active.time }}
              />
              <Link
                to="/queue"
                className="inline-block mt-4 text-sm font-semibold text-forest hover:underline"
              >
                Watch the live queue →
              </Link>
            </>
          ) : (
            <div className="border-[1.5px] border-dashed border-line-strong rounded-2xl p-8 text-center text-ink-soft text-sm">
              You have no active ticket.{' '}
              <a href="/#book" className="text-forest font-semibold">
                Book one
              </a>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-[15px] font-bold mb-4">Booking history</h2>
          <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-paper">
                <tr>
                  <th className={th}>Number</th>
                  <th className={th}>Service</th>
                  <th className={th}>Date</th>
                  <th className={th}>Status</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className={`${td} font-mono font-semibold`}>{b.number}</td>
                    <td className={td}>
                      <div className="font-semibold">{b.service}</div>
                      <div className="text-xs text-ink-soft">{b.org}</div>
                    </td>
                    <td className={td}>
                      {b.date}
                      <div className="text-xs text-ink-soft">{b.time}</div>
                    </td>
                    <td className={td}>
                      <StatusPill status={b.status} />
                    </td>
                    <td className={td}>
                      {b.status === 'upcoming' && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="border-[1.5px] border-line-strong rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-[#B8402F] hover:text-[#B8402F]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard