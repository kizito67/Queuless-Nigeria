import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Ticket from "../components/Ticket";
import QueueBoard from "../components/QueueBoard";
import BookAppointment from "./BookAppointment";

const stats = [
  { value: "2.4 hrs", label: "avg. time saved per visit" },
  { value: "180+", label: "organizations onboard" },
  { value: "50k+", label: "tickets issued" },
];

const services = [
  {
    letter: "A",
    title: "Account Opening",
    org: "First City Bank — Wuse II",
    time: "~15 min",
  },
  {
    letter: "B",
    title: "Cash Withdrawal",
    org: "First City Bank — Wuse II",
    time: "~5 min",
  },
  {
    letter: "C",
    title: "General Consultation",
    org: "Garki General Hospital",
    time: "~20 min",
  },
  {
    letter: "D",
    title: "Laboratory Test",
    org: "Garki General Hospital",
    time: "~30 min",
  },
  {
    letter: "E",
    title: "Passport Renewal",
    org: "NIS Passport Office — Abuja",
    time: "~40 min",
  },
  {
    letter: "F",
    title: "New Passport Application",
    org: "NIS Passport Office — Abuja",
    time: "~45 min",
  },
  {
    letter: "G",
    title: "Driver's License Renewal",
    org: "FRSC Licensing Office",
    time: "~25 min",
  },
  {
    letter: "H",
    title: "Vehicle Registration",
    org: "FRSC Licensing Office",
    time: "~35 min",
  },
];

const pricing = [
  {
    tier: "Starter",
    amount: "₦10,000",
    desc: "One branch · up to 500 bookings",
    featured: false,
  },
  {
    tier: "Professional",
    amount: "₦25,000",
    desc: "Multiple branches · advanced analytics",
    featured: true,
  },
  {
    tier: "Enterprise",
    amount: "₦50,000+",
    desc: "Unlimited branches · custom integrations",
    featured: false,
  },
];

function Home() {
  // Which pricing plan is selected (Professional is the featured one)
  const [plan, setPlan] = useState("Professional");

  return (
    <div>
      {/* HERO */}
      <section className="py-20">
        <div className="max-w-[1140px] mx-auto px-7 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-mono text-xs tracking-wide uppercase text-forest-light font-semibold mb-2.5">
              No more standing in line
            </p>
            <h1 className="font-display font-semibold text-5xl leading-[1.05] mb-5">
              Take your number.
              <br />
              Then take your time.
            </h1>
            <p className="text-ink-soft text-[17px] max-w-[460px] mb-7">
              Book your spot at any bank, hospital, or government office in
              Nigeria before you leave the house. Watch the queue move in real
              time, and arrive right when it's your turn.
            </p>
            <div className="flex flex-wrap gap-3.5 mb-12">
              <a href="#book">
                <Button text="Book an appointment" />
              </a>
              <a href="#business">
                <Button text="Register your business" variant="ghost" />
              </a>
            </div>
            <div className="flex gap-9 pt-7 border-t border-line">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-[3px]">
                  <strong className="font-mono text-xl text-forest">
                    {s.value}
                  </strong>
                  <span className="text-[12.5px] text-ink-soft">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            {/* stacked card behind the ticket, same trick as the original */}
            <div className="absolute inset-0 -z-10 bg-amber-tint rounded-2xl rotate-[4deg] translate-y-1.5" />
            <Ticket
              org="FIRST CITY BANK — WUSE II"
              service="Account Opening"
              number="A-024"
              bottomLeft={{ label: "Now serving", value: "A-021" }}
              bottomRight={{ label: "Est. wait", value: "19 min" }}
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20">
        <div className="max-w-[1140px] mx-auto px-7">
          <p className="font-mono text-xs tracking-wide uppercase text-forest-light font-semibold mb-2.5">
            What you can book
          </p>
          <h2 className="font-display font-semibold text-3xl max-w-[520px] mb-11">
            One app. Every queue in the country.
          </h2>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-[18px]">
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-paper-raised border border-line rounded-2xl p-[22px] hover:border-forest-light hover:-translate-y-1 transition"
              >
                <span className="w-[38px] h-[38px] rounded-[9px] bg-amber-tint text-amber-deep font-mono font-bold text-[13px] flex items-center justify-center mb-4">
                  {s.letter}
                </span>
                <h3 className="text-[16.5px] font-semibold mb-1.5">
                  {s.title}
                </h3>
                <p className="text-[13.5px] text-ink-soft mb-3.5">{s.org}</p>
                <div className="flex justify-between border-t border-line pt-3 font-mono text-[11.5px] text-forest-light">
                  <span>{s.time}</span>
                  <a href="#book" className="font-semibold hover:underline">
                    Book →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING — reuses the form built earlier as a section of the homepage */}
      <div id="book">
        <BookAppointment />
      </div>

      {/* LIVE DASHBOARD PREVIEW */}
      <section className="bg-ink py-20">
        <div className="max-w-[1140px] mx-auto px-7">
          <p className="font-mono text-xs tracking-wide uppercase text-amber font-semibold mb-2.5">
            Right now
          </p>
          <h2 className="font-display font-semibold text-3xl text-white mb-10">
            Watch the queue move.
          </h2>
          <QueueBoard
            orgName="First City Bank — Wuse II"
            nowServing="A-095"
            nextUp="A-096"
            peopleWaiting="0"
          />
        </div>
      </section>

      {/* BUSINESS / PRICING */}
      <section id="business" className="py-20">
        <div className="max-w-[1140px] mx-auto px-7 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-mono text-xs tracking-wide uppercase text-forest-light font-semibold mb-2.5">
              For organizations
            </p>
            <h2 className="font-display font-semibold text-3xl mb-4">
              Run your front desk without the front-desk chaos.
            </h2>
            <p className="text-ink-soft text-[15px] max-w-[420px] mb-6">
              Give your staff a live queue console, cut no-shows with QR
              check-in, and see exactly where your bottlenecks are — by branch,
              by hour, by service.
            </p>
            <Link to={`/register?type=business&plan=${plan}`}>
              <Button text="Register your business" />
            </Link>
          </div>

          <div
            role="radiogroup"
            aria-label="Choose a plan"
            className="flex flex-col gap-3.5"
          >
            {pricing.map((p) => {
              const selected = plan === p.tier;
              return (
                <button
                  key={p.tier}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPlan(p.tier)}
                  className={`text-left border-[1.5px] rounded-2xl px-6 py-5 flex items-baseline justify-between flex-wrap gap-1 cursor-pointer transition duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                    selected
                      ? "border-forest bg-[#EEF5EF]"
                      : "border-line bg-paper-raised hover:border-forest-light"
                  }`}
                >
                  <span className="flex items-center gap-2.5 font-semibold text-[14.5px] w-44">
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center ${
                        selected
                          ? "border-forest bg-forest"
                          : "border-line-strong"
                      }`}
                    >
                      {selected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    {p.tier}
                    {p.featured && (
                      <span className="font-mono text-[10px] uppercase tracking-wide text-amber-deep bg-amber-tint rounded-full px-2 py-0.5">
                        Popular
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-lg text-forest">
                    {p.amount}
                    <span className="text-xs font-medium text-ink-soft">
                      /mo
                    </span>
                  </span>
                  <span className="block w-full text-xs text-ink-soft pl-7">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10">
        <div className="max-w-[1140px] mx-auto px-7 flex justify-between items-center flex-wrap gap-3">
          <span className="font-display font-bold text-lg flex flex-col leading-tight">
            QueueLess
            <span className="font-mono text-[9.5px] tracking-[0.16em] font-semibold text-amber-deep">
              NIGERIA
            </span>
          </span>
          <span className="text-[13px] text-ink-soft">
            Built to end the wait, one ticket at a time.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
