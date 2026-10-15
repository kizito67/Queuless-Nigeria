import { useState } from 'react'
import PageHero from '../components/PageHero'
import StatusPill from '../components/Statuspill'

// Mock data — will come from admin API endpoints later
const stats = [
  { label: 'Total users', value: '12,480' },
  { label: 'Organizations', value: '184' },
  { label: 'Tickets today', value: '1,236' },
  { label: 'Avg. wait', value: '18 min' },
]

const initialOrgs = [
  { id: 1, name: 'First City Bank — Wuse II', category: 'Bank', status: 'verified' },
  { id: 2, name: 'Garki General Hospital', category: 'Hospital', status: 'verified' },
  { id: 3, name: 'Rivers State General Hospital', category: 'Hospital', status: 'pending' },
  { id: 4, name: 'Lagos Island Licensing Office', category: 'Government', status: 'pending' },
  { id: 5, name: 'QuickCash Microfinance', category: 'Bank', status: 'suspended' },
]

const topServices = [
  { name: 'Cash Withdrawal', count: 412 },
  { name: 'Account Opening', count: 318 },
  { name: 'General Consultation', count: 276 },
  { name: 'Passport Renewal', count: 144 },
  { name: "Driver's License Renewal", count: 86 },
]

function Admin() {
  const [orgs, setOrgs] = useState(initialOrgs)

  const setStatus = (id, status) =>
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))

  const maxCount = Math.max(...topServices.map((s) => s.count))

  const th = 'text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line'
  const td = 'px-5 py-[15px] border-b border-line text-sm'
  const smallBtn =
    'border-[1.5px] border-line-strong rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-forest hover:text-forest'

  return (
    <div>
      <PageHero title="Admin" subtitle="Platform overview, business verification and usage." />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper-raised border border-line rounded-2xl p-5">
              <span className="block font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-2.5">
                {s.label}
              </span>
              <span className="font-mono font-bold text-[28px] text-forest">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-[15px] font-bold mb-4">Organizations</h2>
            <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-paper">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Status</th>
                    <th className={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((o) => (
                    <tr key={o.id}>
                      <td className={td}>
                        <div className="font-semibold">{o.name}</div>
                        <div className="text-xs text-ink-soft">{o.category}</div>
                      </td>
                      <td className={td}>
                        <StatusPill status={o.status} />
                      </td>
                      <td className={td}>
                        {o.status === 'pending' && (
                          <button onClick={() => setStatus(o.id, 'verified')} className={smallBtn}>
                            Verify
                          </button>
                        )}
                        {o.status === 'verified' && (
                          <button onClick={() => setStatus(o.id, 'suspended')} className={smallBtn}>
                            Suspend
                          </button>
                        )}
                        {o.status === 'suspended' && (
                          <button onClick={() => setStatus(o.id, 'verified')} className={smallBtn}>
                            Reinstate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-[15px] font-bold mb-4">Most requested services</h2>
            <div className="bg-paper-raised border border-line rounded-2xl p-6 flex flex-col gap-3.5">
              {topServices.map((s) => (
                <div key={s.name} className="grid grid-cols-[150px_1fr_44px] items-center gap-3 text-[13px]">
                  <span>{s.name}</span>
                  <div className="bg-paper rounded-md h-2.5 overflow-hidden">
                    {/* width is a percentage of the biggest bar, set with an inline style */}
                    <div
                      className="bg-forest h-full rounded-md"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[12.5px] text-ink-soft text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin