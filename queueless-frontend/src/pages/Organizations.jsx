import { useState } from 'react'
import PageHero from '../components/PageHero'
import StatusPill from '../components/Statuspill'

// Mock data — will come from GET /api/organizations later
const organizations = [
  { id: 1, name: 'First City Bank — Wuse II', category: 'Bank', location: 'Abuja', rating: 4.5, verified: true, services: ['Account Opening', 'Cash Withdrawal', 'Card Collection'] },
  { id: 2, name: 'Garki General Hospital', category: 'Hospital', location: 'Abuja', rating: 4.2, verified: true, services: ['General Consultation', 'Laboratory Test', 'Pharmacy'] },
  { id: 3, name: 'NIS Passport Office — Abuja', category: 'Government', location: 'Abuja', rating: 3.8, verified: true, services: ['Passport Renewal', 'New Passport Application'] },
  { id: 4, name: 'FRSC Licensing Office', category: 'Government', location: 'Abuja', rating: 3.9, verified: true, services: ["Driver's License Renewal", 'Vehicle Registration'] },
  { id: 5, name: 'Rivers State General Hospital', category: 'Hospital', location: 'Port Harcourt', rating: 4.0, verified: false, services: ['General Consultation', 'X-Ray'] },
  { id: 6, name: 'FirstTrust Bank — Trans-Amadi', category: 'Bank', location: 'Port Harcourt', rating: 4.4, verified: true, services: ['Account Opening', 'Loan Enquiry'] },
]

const categories = ['All', 'Bank', 'Hospital', 'Government']

function Organizations() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // Derived value: no extra state needed, it's recalculated on every render
  const filtered = organizations.filter((org) => {
    const text = (org.name + ' ' + org.services.join(' ')).toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory = category === 'All' || org.category === category
    return matchesSearch && matchesCategory
  })

  const inputStyles =
    'font-body text-sm px-3.5 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper-raised focus:outline-none focus:border-forest'

  return (
    <div>
      <PageHero
        title="Organizations"
        subtitle="Find a bank, hospital or government office and book your place in line."
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24">
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or service..."
            className={`${inputStyles} flex-1 min-w-[200px]`}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputStyles}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink-soft text-sm">No organizations match your search.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
            {filtered.map((org) => (
              <div
                key={org.id}
                className="bg-paper-raised border border-line rounded-2xl p-[22px] flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-2.5">
                  <h3 className="font-display font-semibold text-[17px]">{org.name}</h3>
                  <StatusPill status={org.verified ? 'verified' : 'pending'} />
                </div>
                <div className="flex gap-2 items-center font-mono text-[12.5px] text-ink-soft">
                  <span className="text-amber-deep font-bold">★ {org.rating}</span>
                  <span>·</span>
                  <span>{org.location}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {org.services.map((s) => (
                    <span
                      key={s}
                      className="text-[11.5px] px-[9px] py-1 rounded-full bg-paper border border-line text-ink-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-1.5 pt-3.5 border-t border-line">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-forest-light font-bold">
                    {org.category}
                  </span>
                  <a href="/#book" className="text-sm font-semibold text-forest hover:underline">
                    Book →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Organizations