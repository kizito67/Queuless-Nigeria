// The small header block at the top of every interior page.
function PageHero({ title, subtitle }) {
  return (
    <section className="border-b border-line pt-14 pb-10">
      <div className="max-w-[1140px] mx-auto px-7">
        <h1 className="font-display font-semibold text-[34px] mb-2.5">{title}</h1>
        <p className="text-ink-soft text-[15px] max-w-[480px]">{subtitle}</p>
      </div>
    </section>
  )
}

export default PageHero