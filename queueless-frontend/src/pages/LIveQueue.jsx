import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Ticket from '../components/Ticket'

function LiveQueue() {
  const location = useLocation()

  const booking = location.state || {
    queueNumber: 'A-024',
    service: 'Account Opening',
    organization: 'First City Bank — Wuse II',
    date: '2026-09-22',
    time: '10:30',
  }

  const [nowServing, setNowServing] = useState(18)
  const yourNumber = parseInt(booking.queueNumber.split('-')[1], 10)
  const peopleAhead = Math.max(yourNumber - nowServing, 0)

  // Placeholder for a real Socket.IO "queue:update" event later.
  useEffect(() => {
    const interval = setInterval(() => {
      setNowServing((prev) => (prev < yourNumber ? prev + 1 : prev))
    }, 4000)
    return () => clearInterval(interval)
  }, [yourNumber])

  return (
    <div className="bg-ink min-h-screen text-white py-16 px-4">
      <div className="max-w-[1140px] mx-auto">
        <div className="flex justify-center mb-10">
          <Ticket
            org={booking.organization}
            service={booking.service}
            number={booking.queueNumber}
            bottomLeft={{ label: 'Date', value: booking.date }}
            bottomRight={{ label: 'Time', value: booking.time }}
          />
        </div>

        <div className="bg-[#1E2E24] border border-[#2E4033] rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-7 py-4 font-mono text-xs tracking-wide text-[#B9C9BC] border-b border-[#2E4033]">
            <span>{booking.organization}</span>
            <span className="flex items-center gap-2 text-amber font-semibold">
              <span className="w-[7px] h-[7px] rounded-full bg-amber animate-pulse" /> Live
            </span>
          </div>

          <div className="grid md:grid-cols-3">
            <div className="p-8 flex flex-col gap-2.5 border-b md:border-b-0 md:border-r border-[#2E4033] text-center">
              <span className="font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]">
                Now serving
              </span>
              <span className="font-mono font-bold text-5xl text-amber">
                A-{String(nowServing).padStart(3, '0')}
              </span>
            </div>
            <div className="p-8 flex flex-col gap-2.5 border-b md:border-b-0 md:border-r border-[#2E4033] text-center">
              <span className="font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]">
                Your number
              </span>
              <span className="font-mono font-bold text-4xl text-[#6E8074]">
                {booking.queueNumber}
              </span>
            </div>
            <div className="p-8 flex flex-col gap-2.5 text-center">
              <span className="font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]">
                People ahead
              </span>
              <span className="font-mono font-bold text-4xl text-[#6E8074]">
                {peopleAhead}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold text-[15px] border-[1.5px] border-white/30 text-white hover:border-white transition"
          >
            Book another appointment
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LiveQueue