// The signature visual from your design: a "physical ticket" card with a
// dashed perforation and a barcode strip. Reused on the booking page (as a
// live preview) and the live queue page.
function Ticket({ org, service, number, bottomLeft, bottomRight, className = '' }) {
  return (
    <div
      className={`relative w-80 bg-paper-raised rounded-2xl shadow-lg px-6 pt-6 pb-5 -rotate-3 hover:-rotate-1 hover:-translate-y-1 transition-transform ${className}`}
    >
      <div className="flex flex-col gap-[3px] pb-4">
        <span className="font-mono text-[10.5px] tracking-wide text-ink-soft uppercase">
          {org}
        </span>
        <span className="font-display font-semibold text-lg text-ink">{service}</span>
      </div>

      <div className="flex flex-col gap-1 py-2.5">
        <span className="font-mono text-[10px] tracking-wide uppercase text-ink-soft">
          Your number
        </span>
        <span className="font-mono font-bold text-5xl text-forest">{number}</span>
      </div>

      {/* perforation: a dashed line with two "cut out" circles at each end */}
      <div className="relative border-t-2 border-dashed border-line-strong -mx-6 my-1">
        <span className="absolute -top-[9px] -left-[9px] w-[18px] h-[18px] rounded-full bg-paper" />
        <span className="absolute -top-[9px] -right-[9px] w-[18px] h-[18px] rounded-full bg-paper" />
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide uppercase text-ink-soft">
            {bottomLeft?.label}
          </span>
          <span className="font-mono font-semibold text-lg text-amber-deep">
            {bottomLeft?.value}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-wide uppercase text-ink-soft">
            {bottomRight?.label}
          </span>
          <span className="font-mono font-semibold text-lg text-amber-deep">
            {bottomRight?.value}
          </span>
        </div>
      </div>

      {/* barcode: a repeating gradient, same trick as the original CSS */}
      <div
        className="mt-4 h-7 opacity-75"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--color-ink) 0 2px, transparent 2px 5px, var(--color-ink) 5px 6px, transparent 6px 11px, var(--color-ink) 11px 14px, transparent 14px 18px)',
        }}
      />
    </div>
  )
}

export default Ticket