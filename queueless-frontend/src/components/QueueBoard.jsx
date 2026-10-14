// Same visual language as the personal live-queue page, but organization-level:
// shows "Next up" and "People waiting" instead of "Your number".
function QueueBoard({ orgName, nowServing, nextUp, peopleWaiting }) {
  return (
    <div className="bg-[#1E2E24] border border-[#2E4033] rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center px-7 py-4 font-mono text-xs tracking-wide text-[#B9C9BC] border-b border-[#2E4033]">
        <span>{orgName}</span>
        <span className="flex items-center gap-2 text-amber font-semibold">
          <span className="w-[7px] h-[7px] rounded-full bg-amber animate-pulse" /> Live
        </span>
      </div>
      <div className="grid md:grid-cols-3">
        <div className="p-8 flex flex-col gap-2.5 border-b md:border-b-0 md:border-r border-[#2E4033]">
          <span className="font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]">
            Now serving
          </span>
          <span className="font-mono font-bold text-5xl text-amber">{nowServing}</span>
        </div>
        <div className="p-8 flex flex-col gap-2.5 border-b md:border-b-0 md:border-r border-[#2E4033]">
          <span className="font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]">
            Next up
          </span>
          <span className="font-mono font-bold text-4xl text-[#6E8074]">{nextUp}</span>
        </div>
        <div className="p-8 flex flex-col gap-2.5">
          <span className="font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]">
            People waiting
          </span>
          <span className="font-mono font-bold text-4xl text-[#6E8074]">{peopleWaiting}</span>
        </div>
      </div>
    </div>
  )
}

export default QueueBoard