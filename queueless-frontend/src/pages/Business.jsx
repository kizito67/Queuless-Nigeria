import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import StatusPill from "../components/StatusPill";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "staff", label: "Staff" },
  { id: "services", label: "Services" },
  { id: "billing", label: "Billing" },
];

const inputStyles =
  "font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper text-ink focus:outline-none focus:border-forest";

function Overview({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/business/overview", { token })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <p className="text-sm text-[#B8402F]">{error}</p>;
  if (!data) return <p className="text-sm text-ink-soft">Loading...</p>;

  const { organization: org, stats } = data;
  const cards = [
    { label: "Active staff", value: stats.staffCount },
    { label: "Services", value: stats.servicesCount },
    { label: "Bookings today", value: stats.bookingsToday },
    { label: "Served today", value: stats.servedToday },
  ];

  return (
    <div className="flex flex-col gap-6">
      {org.status !== "verified" && (
        <p className="text-sm bg-amber-tint text-amber-deep rounded-lg p-3">
          {org.status === "pending"
            ? "Your organization is awaiting verification. Customers can't book with you until it's approved. You can add your staff in the meantime."
            : "Your organization is suspended. Contact QueueLess support."}
        </p>
      )}

      <div className="bg-paper-raised border border-line rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-xl">{org.name}</h2>
          <p className="text-sm text-ink-soft mt-1">
            <span className="capitalize">{org.plan}</span> plan · Open{" "}
            {org.openTime} to {org.closeTime}
          </p>
        </div>
        <StatusPill status={org.status} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-paper-raised border border-line rounded-2xl p-5"
          >
            <span className="block font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-2.5">
              {c.label}
            </span>
            <span className="font-mono font-bold text-[28px] text-forest">
              {c.value}
            </span>
          </div>
        ))}
      </div>

      {org.status === "verified" && (
        <Link
          to="/staff"
          className="text-sm font-semibold text-forest hover:underline"
        >
          Open the staff console →
        </Link>
      )}
    </div>
  );
}

function StaffTab({ token }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [creds, setCreds] = useState(null); // login details, shown once
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    api("/api/business/staff", { token })
      .then((data) => setStaff(data.staff))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const { staff: created, temporaryPassword } = await api(
        "/api/business/staff",
        {
          method: "POST",
          token,
          body: form,
        },
      );
      setStaff((prev) => [created, ...prev]);
      setCreds({ name: created.name, email: created.email, temporaryPassword });
      setCopied(false);
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member) => {
    setError("");
    try {
      await api(`/api/business/staff/${member.id}`, {
        method: "PATCH",
        token,
        body: { isActive: !member.isActive },
      });
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id ? { ...s, isActive: !member.isActive } : s,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const resetPassword = async (member) => {
    if (
      !window.confirm(
        `Reset the password for ${member.name}? Their current password will stop working.`,
      )
    )
      return;
    setError("");
    try {
      const { temporaryPassword } = await api(
        `/api/business/staff/${member.id}/reset-password`,
        {
          method: "POST",
          token,
        },
      );
      setCreds({ name: member.name, email: member.email, temporaryPassword });
      setCopied(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const copyCreds = () => {
    const text = `QueueLess login\nEmail: ${creds.email}\nTemporary password: ${creds.temporaryPassword}\nLog in at: ${window.location.origin}/login`;
    navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .catch(() => {});
  };

  const th =
    "text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line";
  const td = "px-5 py-[15px] border-b border-line text-sm";
  const smallBtn =
    "border-[1.5px] border-line-strong rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-forest hover:text-forest";

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
      <div>
        <h2 className="text-[15px] font-bold mb-4">Add a staff member</h2>
        <form
          onSubmit={handleAdd}
          className="bg-paper-raised border border-line rounded-2xl p-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Full name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputStyles}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputStyles}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Phone (optional)
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputStyles}
            />
          </label>
          <Button
            text={saving ? "Creating..." : "Create login"}
            type="submit"
            fullWidth
          />
        </form>
      </div>

      <div>
        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">
            {error}
          </p>
        )}

        {creds && (
          <div className="bg-amber-tint border border-amber rounded-2xl p-5 mb-6">
            <p className="font-semibold text-sm mb-1">
              Login details for {creds.name}
            </p>
            <p className="text-xs text-ink-soft mb-3">
              Share these securely. The temporary password is shown only this
              once, and they'll be asked to choose their own when they first log
              in.
            </p>
            <div className="font-mono text-sm flex flex-col gap-1">
              <span>Email: {creds.email}</span>
              <span>
                Temporary password: <strong>{creds.temporaryPassword}</strong>
              </span>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={copyCreds} className={smallBtn}>
                {copied ? "Copied" : "Copy details"}
              </button>
              <button onClick={() => setCreds(null)} className={smallBtn}>
                Done
              </button>
            </div>
          </div>
        )}

        <h2 className="text-[15px] font-bold mb-4">Your staff</h2>
        <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
          {loading ? (
            <p className="p-5 text-sm text-ink-soft">Loading...</p>
          ) : staff.length === 0 ? (
            <p className="p-5 text-sm text-ink-soft">
              No staff yet. Add your first team member.
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
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td className={td}>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-ink-soft">{s.email}</div>
                      {s.mustChangePassword && (
                        <div className="text-xs text-amber-deep">
                          Hasn't set a password yet
                        </div>
                      )}
                    </td>
                    <td className={td}>
                      <StatusPill status={s.isActive ? "active" : "inactive"} />
                    </td>
                    <td className={td}>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => resetPassword(s)}
                          className={smallBtn}
                        >
                          Reset password
                        </button>
                        <button
                          onClick={() => toggleActive(s)}
                          className={smallBtn}
                        >
                          {s.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ServicesTab({ token }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", durationMinutes: "15" });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // { id, name, durationMinutes } while a row is being edited

  const load = useCallback(() => {
    api("/api/business/services", { token })
      .then((data) => setServices(data.services))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Service name is required.");
      return;
    }
    setSaving(true);
    try {
      await api("/api/business/services", {
        method: "POST",
        token,
        body: {
          name: form.name,
          durationMinutes: Number(form.durationMinutes),
        },
      });
      setForm({ name: "", durationMinutes: "15" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    setError("");
    try {
      await api(`/api/business/services/${editing.id}`, {
        method: "PATCH",
        token,
        body: {
          name: editing.name,
          durationMinutes: Number(editing.durationMinutes),
        },
      });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (service) => {
    setError("");
    try {
      await api(`/api/business/services/${service.id}`, {
        method: "PATCH",
        token,
        body: { isActive: !service.isActive },
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const th =
    "text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line";
  const td = "px-5 py-[15px] border-b border-line text-sm";
  const smallBtn =
    "border-[1.5px] border-line-strong rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-forest hover:text-forest";

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
      <div>
        <h2 className="text-[15px] font-bold mb-4">Add a service</h2>
        <form
          onSubmit={handleAdd}
          className="bg-paper-raised border border-line rounded-2xl p-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Service name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Cash Withdrawal"
              className={inputStyles}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Typical duration (minutes)
            <input
              type="number"
              min="1"
              max="240"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
              className={inputStyles}
            />
          </label>
          <Button
            text={saving ? "Adding..." : "Add service"}
            type="submit"
            fullWidth
          />
        </form>
      </div>

      <div>
        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">
            {error}
          </p>
        )}

        <h2 className="text-[15px] font-bold mb-4">Your services</h2>
        <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
          {loading ? (
            <p className="p-5 text-sm text-ink-soft">Loading...</p>
          ) : services.length === 0 ? (
            <p className="p-5 text-sm text-ink-soft">No services yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-paper">
                <tr>
                  <th className={th}>Service</th>
                  <th className={th}>Duration</th>
                  <th className={th}>Status</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const isEditing = editing?.id === s.id;
                  return (
                    <tr key={s.id} className={s.isActive ? "" : "opacity-60"}>
                      <td className={td}>
                        {isEditing ? (
                          <input
                            value={editing.name}
                            onChange={(e) =>
                              setEditing({ ...editing, name: e.target.value })
                            }
                            className={`${inputStyles} w-full`}
                          />
                        ) : (
                          <span className="font-semibold">{s.name}</span>
                        )}
                      </td>
                      <td className={td}>
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="240"
                            value={editing.durationMinutes}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                durationMinutes: e.target.value,
                              })
                            }
                            className={`${inputStyles} w-24`}
                          />
                        ) : (
                          `${s.durationMinutes} min`
                        )}
                      </td>
                      <td className={td}>
                        <StatusPill
                          status={s.isActive ? "active" : "inactive"}
                        />
                      </td>
                      <td className={td}>
                        <div className="flex gap-2 justify-end">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className={smallBtn}>
                                Save
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className={smallBtn}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  setEditing({
                                    id: s.id,
                                    name: s.name,
                                    durationMinutes: String(s.durationMinutes),
                                  })
                                }
                                className={smallBtn}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleActive(s)}
                                className={smallBtn}
                              >
                                {s.isActive ? "Archive" : "Restore"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-ink-soft mt-3">
          Archived services disappear from the booking form but stay in your
          history. Restore one anytime.
        </p>
      </div>
    </div>
  );
}

const naira = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function BillingTab({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [payingPlan, setPayingPlan] = useState(null);

  useEffect(() => {
    api("/api/business/billing", { token })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  const pay = async (planId) => {
    setError("");
    setPayingPlan(planId);
    try {
      const { authorizationUrl } = await api("/api/business/billing/checkout", {
        method: "POST",
        token,
        body: { plan: planId },
      });
      window.location.assign(authorizationUrl); // off to Paystack's checkout page
    } catch (err) {
      setError(err.message);
      setPayingPlan(null);
    }
  };

  if (!data) {
    return error ? (
      <p className="text-sm text-[#B8402F]">{error}</p>
    ) : (
      <p className="text-sm text-ink-soft">Loading...</p>
    );
  }

  const { billing, plans, payments } = data;
  const th =
    "text-left px-5 py-3.5 font-mono text-[11px] tracking-wide uppercase text-ink-soft border-b border-line";
  const td = "px-5 py-[15px] border-b border-line text-sm";

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5">
          {error}
        </p>
      )}

      <div className="bg-paper-raised border border-line rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-xl capitalize">
            {billing.plan} plan
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            {billing.active
              ? `Active until ${fmtDate(billing.paidUntil)}`
              : billing.paidUntil
                ? `Expired on ${fmtDate(billing.paidUntil)}`
                : "No active subscription yet"}
          </p>
        </div>
        <StatusPill status={billing.active ? "active" : "inactive"} />
      </div>

      <div>
        <h2 className="text-[15px] font-bold mb-4">Choose a plan</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const current = billing.active && billing.plan === p.id;
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 flex flex-col gap-4 border-[1.5px] ${
                  current
                    ? "border-forest bg-[#EEF5EF]"
                    : "border-line bg-paper-raised"
                }`}
              >
                <div>
                  <h3 className="font-semibold text-[15px]">{p.name}</h3>
                  <p className="font-mono font-bold text-2xl text-forest mt-1">
                    {naira(p.price)}
                    <span className="text-xs font-medium text-ink-soft">
                      /month
                    </span>
                  </p>
                </div>
                <ul className="text-sm text-ink-soft flex flex-col gap-1.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                <Button
                  text={
                    payingPlan === p.id
                      ? "Redirecting..."
                      : current
                        ? "Renew for 30 days"
                        : billing.active
                          ? "Switch to this plan"
                          : `Pay ${naira(p.price)}`
                  }
                  onClick={() => pay(p.id)}
                  variant={current ? "ghost" : "primary"}
                  fullWidth
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ink-soft mt-3">
          Each payment adds 30 days. Paying before your plan ends adds the time
          on top of what's left.
        </p>
      </div>

      <div>
        <h2 className="text-[15px] font-bold mb-4">Payment history</h2>
        <div className="bg-paper-raised border border-line rounded-2xl overflow-x-auto">
          {payments.length === 0 ? (
            <p className="p-5 text-sm text-ink-soft">No payments yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-paper">
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>Plan</th>
                  <th className={th}>Amount</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>{fmtDate(p.paidAt || p.createdAt)}</td>
                    <td className={`${td} capitalize`}>{p.plan}</td>
                    <td className={`${td} font-mono`}>{naira(p.amount)}</td>
                    <td className={td}>
                      <StatusPill status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Business() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const [tab, setTab] = useState(
    tabs.some((t) => t.id === requested) ? requested : "overview",
  );

  return (
    <div>
      <PageHero
        title="Business dashboard"
        subtitle="Manage your organization, your team, and how customers reach you."
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-8 pb-24">
        <div className="flex gap-2 border-b border-line mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                tab === t.id
                  ? "border-forest text-forest"
                  : "border-transparent text-ink-soft hover:text-forest"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview token={token} />}
        {tab === "staff" && <StaffTab token={token} />}
        {tab === "services" && <ServicesTab token={token} />}
        {tab === "billing" && <BillingTab token={token} />}
      </div>
    </div>
  );
}

export default Business;
