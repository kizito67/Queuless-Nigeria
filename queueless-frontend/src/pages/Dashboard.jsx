import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import StatusPill from "../components/StatusPill";
import Ticket from "../components/Ticket";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const formatDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Dashboard() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/appointments/mine", { token })
      .then((data) => setBookings(data.appointments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // The active ticket is the soonest upcoming or in-service booking
  const active = bookings
    .filter((b) => b.status === "upcoming" || b.status === "serving")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  const cancelBooking = async (id) => {
    setError("");
    try {
      await api(`/api/appointments/${id}/cancel`, { method: "PATCH", token });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const th =
    "text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line";
  const td = "px-5 py-[15px] border-b border-line text-sm";

  return (
    <div>
      <PageHero
        title="My tickets"
        subtitle="Your active ticket and everything you've booked before."
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24 grid lg:grid-cols-[340px_1fr] gap-8 items-start">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-[15px] font-bold mb-4">Active ticket</h2>
          {active ? (
            <>
              <Ticket
                flat
                org={active.organization}
                service={active.service}
                number={active.queueNumber}
                bottomLeft={{ label: "Date", value: formatDate(active.date) }}
                bottomRight={{ label: "Time", value: active.time }}
              />
              <Link
                to="/queue"
                state={active}
                className="inline-block mt-4 text-sm font-semibold text-forest hover:underline"
              >
                Watch the live queue →
              </Link>
            </>
          ) : (
            <div className="border-[1.5px] border-dashed border-line-strong rounded-2xl p-8 text-center text-ink-soft text-sm">
              {loading ? "Loading..." : "You have no active ticket. "}
              {!loading && (
                <a href="/#book" className="text-forest font-semibold">
                  Book one
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-[15px] font-bold mb-4">Booking history</h2>

          {error && (
            <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">
              {error}
            </p>
          )}

          <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
            {!loading && bookings.length === 0 ? (
              <p className="p-5 text-sm text-ink-soft">
                You haven't booked anything yet.
              </p>
            ) : (
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
                      <td className={`${td} font-mono font-semibold`}>
                        {b.queueNumber}
                      </td>
                      <td className={td}>
                        <div className="font-semibold">{b.service}</div>
                        <div className="text-xs text-ink-soft">
                          {b.organization}
                        </div>
                      </td>
                      <td className={td}>
                        {formatDate(b.date)}
                        <div className="text-xs text-ink-soft">{b.time}</div>
                      </td>
                      <td className={td}>
                        <StatusPill status={b.status} />
                      </td>
                      <td className={td}>
                        {b.status === "upcoming" && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
