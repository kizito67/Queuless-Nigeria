// Small coloured label used in tables and cards (upcoming, completed, etc.)
const styles = {
  upcoming: 'bg-amber-tint text-amber-deep',
  completed: 'bg-[#E4F0E6] text-forest',
  verified: 'bg-[#E4F0E6] text-forest',
  missed: 'bg-[#F6E3E1] text-[#B8402F]',
  suspended: 'bg-[#F6E3E1] text-[#B8402F]',
  cancelled: 'bg-[#EFEFEF] text-[#6B6B6B]',
  pending: 'bg-[#EFEFEF] text-[#6B6B6B]',
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[11px] py-1 font-mono text-[11px] font-semibold tracking-wide uppercase ${styles[status]}`}
    >
      {status}
    </span>
  )
}

export default StatusPill