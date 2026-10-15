import { useState } from 'react'
import PageHero from '../components/PageHero'

// Mock data — will come from the queue API + Socket.IO later
const initialQueue = [
  { id: 1, number: 'A-019', name: 'Chidinma Okafor', service: 'Account Opening', checkedIn: true },
  { id: 2, number: 'A-020', name: 'Emeka Nwosu', service: 'Cash Withdrawal', checkedIn: true },
  { id: 3, number: 'A-021', name: 'Aisha Bello', service: 'Card Collection', checkedIn: false },
  { id: 4, number: 'A-022', name: 'Tunde Adeyemi', service: 'Account Opening', checkedIn: true },
  { id: 5, number: 'A-023', name: 'Ngozi Eze', service: 'Cash Withdrawal', checkedIn: false },
]

function StaffConsole() {
  const [queue, setQueue] = useState(initialQueue)
  const [skipped, setSkipped] = useState([])
  const [serving, setServing] = useState({ number: 'A-018', name: 'Ibrahim Musa' })
  const [paused, setPaused] = useState(false)
  const [servedCount, setServedCount] = useState(17)
  const [message, setMessage] = useState('')

  const callNext = () => {
    setMessage('')
    // Only customers who have scanned the QR code (checkedIn) can be called
    const next = queue.find((c) => c.checkedIn)
    if (!next) {
      setMessage('No checked-in customers are waiting.')
      return
    }
    if (serving) setServedCount((n) => n + 1) // finishing the previous customer
    setServing({ number: next.number, name: next.name })
    setQueue((prev) => prev.filter((c) => c.id !== next.id))
  }

  const markServed = () => {
    setServing(null)
    setServedCount((n) => n + 1)
  }

  const skip = (customer) => {
    setQueue((prev) => prev.filter((c) => c.id !== customer.id))
    setSkipped((prev) => [...prev, customer])
  }

  const recall = (customer) => {
    setSkipped((prev) => prev.filter((c) => c.id !== customer.id))
    setQueue((prev) => [customer, ...prev])
  }

  const cancel = (id) => setQueue((prev) => prev.filter((c) => c.id !== id))

  const toggleCheckIn = (id) =>
    setQueue((prev) => prev.map((c) => (c.id === id ? { ...c, checkedIn: !c.checkedIn } : c)))

  const smallBtn =
    'border-[1.5px] border-line-strong bg-paper-raised rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-forest hover:text-forest'
  const panelBtn =
    'w-full rounded-full py-3 font-semibold text-[15px] border-[1.5px] transition active:scale-95'

  return (
    <div>
      <PageHero
        title="Staff console"
        subtitle="First City Bank — Wuse II. Call customers, skip no-shows and keep the line moving."
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24 grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
        <div className="bg-ink text-white rounded-2xl p-7 text-center">
          <span className="font-mono text-[11.5px] tracking-wide uppercase text-[#93A599]">
            {paused ? 'Queue paused' : 'Now serving'}
          </span>
          <span className="block font-mono font-bold text-6xl text-amber my-2.5">
            {serving ? serving.number : '—'}
          </span>
          <p className="text-sm text-[#B9C9BC] mb-6 min-h-5">
            {serving ? serving.name : 'No one at the desk'}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={callNext}
              disabled={paused}
              className={`${panelBtn} bg-forest-light border-transparent text-white hover:bg-forest disabled:opacity-40`}
            >
              Call next
            </button>
            <button
              onClick={markServed}
              disabled={!serving}
              className={`${panelBtn} border-white/30 text-white hover:border-white disabled:opacity-40`}
            >
              Mark served
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className={`${panelBtn} border-white/30 text-white hover:border-white`}
            >
              {paused ? 'Resume queue' : 'Pause queue'}
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-amber">{message}</p>}
          <p className="mt-5 font-mono text-xs text-[#93A599]">Served today: {servedCount}</p>
        </div>

        <div>
          <h2 className="text-[15px] font-bold mb-4">Waiting ({queue.length})</h2>
          <div className="flex flex-col gap-2.5">
            {queue.length === 0 && (
              <p className="text-sm text-ink-soft">The queue is empty.</p>
            )}
            {queue.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between gap-3.5 bg-paper-raised border border-line rounded-xl px-[18px] py-3.5 ${
                  c.checkedIn ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-mono font-bold text-base text-forest bg-amber-tint rounded-lg px-2.5 py-1.5">
                    {c.number}
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-[12.5px] text-ink-soft">
                      {c.service} · {c.checkedIn ? 'Checked in' : 'Not checked in'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleCheckIn(c.id)} className={smallBtn}>
                    {c.checkedIn ? 'Undo check-in' : 'Check in'}
                  </button>
                  <button onClick={() => skip(c)} className={smallBtn}>Skip</button>
                  <button
                    onClick={() => cancel(c.id)}
                    className={`${smallBtn} hover:!border-[#B8402F] hover:!text-[#B8402F]`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {skipped.length > 0 && (
            <>
              <h2 className="text-[15px] font-bold mt-8 mb-4">Skipped ({skipped.length})</h2>
              <div className="flex flex-col gap-2.5">
                {skipped.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-paper-raised border border-line rounded-xl px-[18px] py-3.5"
                  >
                    <span className="text-sm">
                      <span className="font-mono font-bold text-forest">{c.number}</span> · {c.name}
                    </span>
                    <button onClick={() => recall(c)} className={smallBtn}>Recall</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffConsole