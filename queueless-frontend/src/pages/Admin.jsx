import { useState, useEffect } from "react";
import PageHero from "../components/PageHero";
import StatusPill from "../components/StatusPill";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

// Still sample data until real bookings exist
const topServices = [
  { name: "Cash Withdrawal", count: 412 },
  { name: "Account Opening", count: 318 },
  { name: "General Consultation", count: 276 },
  { name: "Passport Renewal", count: 144 },
  { name: "Driver's License Renewal", count: 86 },
];

function Admin() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null); // which row is mid-request

  // Load every organization (including pending ones) once the page opens.
  // The token goes in the Authorization header; the backend checks the admin role.
  useEffect(() => {
    api("/api/admin/organizations", { token })
      .then((data) => setOrgs(data.organizations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const setStatus = async (id, status) => {
    setError("");
    setBusyId(id);
    try {
      await api(`/api/admin/organizations/${id}/status`, {
        method: "PATCH",
        body: { status },
        token,
      });
      // Only update the screen after the server confirmed the change
      setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const count = (status) => orgs.filter((o) => o.status === status).length;
  const stats = [
    { label: "Organizations", value: orgs.length },
    { label: "Verified", value: count("verified") },
    { label: "Pending", value: count("pending") },
    { label: "Suspended", value: count("suspended") },
  ];

  const maxCount = Math.max(...topServices.map((s) => s.count));

  const th =
    "text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line";
  const td = "px-5 py-[15px] border-b border-line text-sm";
  const smallBtn =
    "border-[1.5px] border-line-strong rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-forest hover:text-forest disabled:opacity-40";

  return (
    <div>
      <PageHero
        title="Admin"
        subtitle="Platform overview, business verification and usage."
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-paper-raised border border-line rounded-2xl p-5"
            >
              <span className="block font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-2.5">
                {s.label}
              </span>
              <span className="font-mono font-bold text-[28px] text-forest">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-6">
            {error}
          </p>
        )}

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-[15px] font-bold mb-4">Organizations</h2>
            <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
              {loading ? (
                <p className="p-5 text-sm text-ink-soft">Loading...</p>
              ) : orgs.length === 0 ? (
                <p className="p-5 text-sm text-ink-soft">
                  No organizations have registered yet.
                </p>
              ) : (
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
                          <div className="text-xs text-ink-soft">
                            {o.category} · {o.state}
                          </div>
                          <div className="text-xs text-ink-soft">
                            {o.contactEmail}
                          </div>
                        </td>
                        <td className={td}>
                          <StatusPill status={o.status} />
                        </td>
                        <td className={td}>
                          {o.status === "pending" && (
                            <button
                              onClick={() => setStatus(o.id, "verified")}
                              disabled={busyId === o.id}
                              className={smallBtn}
                            >
                              Verify
                            </button>
                          )}
                          {o.status === "verified" && (
                            <button
                              onClick={() => setStatus(o.id, "suspended")}
                              disabled={busyId === o.id}
                              className={smallBtn}
                            >
                              Suspend
                            </button>
                          )}
                          {o.status === "suspended" && (
                            <button
                              onClick={() => setStatus(o.id, "verified")}
                              disabled={busyId === o.id}
                              className={smallBtn}
                            >
                              Reinstate
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

          <div>
            <h2 className="text-[15px] font-bold mb-4">
              Most requested services{" "}
              <span className="font-mono text-[10px] uppercase tracking-wide text-amber-deep bg-amber-tint rounded-full px-2 py-0.5 align-middle">
                Sample data
              </span>
            </h2>
            <div className="bg-paper-raised border border-line rounded-2xl p-6 flex flex-col gap-3.5">
              {topServices.map((s) => (
                <div
                  key={s.name}
                  className="grid grid-cols-[150px_1fr_44px] items-center gap-3 text-[13px]"
                >
                  <span>{s.name}</span>
                  <div className="bg-paper rounded-md h-2.5 overflow-hidden">
                    <div
                      className="bg-forest h-full rounded-md"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[12.5px] text-ink-soft text-right">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
