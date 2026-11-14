import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const steps = [
  "Pick an organization & service",
  "Choose a date & time",
  "Get your digital ticket instantly",
];

function BookAppointment() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [organizations, setOrganizations] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/api/organizations")
      .then((data) => setOrganizations(data.organizations))
      .catch((err) => setError(err.message));
  }, []);

  const selectedOrg = organizations.find((o) => o.id === orgId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!orgId || !serviceId || !date || !time) {
      setError("Please fill in every field.");
      return;
    }

    setLoading(true);
    try {
      const { appointment } = await api("/api/appointments", {
        method: "POST",
        token,
        body: { organizationId: orgId, serviceId, date, time },
      });
      // The server assigned the queue number; the live queue page displays it
      navigate("/queue", { state: appointment });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    "font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper-raised text-ink focus:outline-none focus:border-forest disabled:opacity-50";
  const labelStyles =
    "flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft";

  return (
    <div className="bg-paper-raised border-t border-b border-line py-20">
      <div className="max-w-[1140px] mx-auto px-7 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <p className="font-mono text-xs tracking-wide uppercase text-forest-light font-semibold mb-2.5">
            Book in under a minute
          </p>
          <h2 className="font-display font-semibold text-3xl mb-4">
            Cut your ticket before you leave home.
          </h2>
          <p className="text-ink-soft text-[15px] max-w-[400px] mb-8">
            Choose an organization and a service, pick a time, and we'll hold
            your place in line. You'll get a live countdown so you know exactly
            when to walk out the door.
          </p>
          <ul className="flex flex-col gap-3.5">
            {steps.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-3.5 text-[14.5px] font-medium"
              >
                <span className="w-[26px] h-[26px] rounded-full bg-forest text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {!user ? (
          <div className="bg-paper border border-line rounded-2xl p-7 text-center">
            <h3 className="font-display font-semibold text-xl mb-2">
              Log in to book
            </h3>
            <p className="text-ink-soft text-sm mb-6">
              Your tickets live in your account, so you can see them on any
              device.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login">
                <Button text="Log in" />
              </Link>
              <Link to="/register">
                <Button text="Create account" variant="ghost" />
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-paper border border-line rounded-2xl p-7 flex flex-col gap-4"
          >
            {error && (
              <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5">
                {error}
              </p>
            )}

            <label className={labelStyles}>
              Organization
              <select
                value={orgId}
                onChange={(e) => {
                  setOrgId(e.target.value);
                  setServiceId("");
                }}
                className={inputStyles}
              >
                <option value="" disabled>
                  {organizations.length === 0
                    ? "No organizations available yet"
                    : "Select an organization"}
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelStyles}>
              Service
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                disabled={!selectedOrg}
                className={inputStyles}
              >
                <option value="" disabled>
                  Select a service
                </option>
                {selectedOrg?.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedOrg && (
              <p className="text-xs text-ink-soft -mt-2">
                Open {selectedOrg.openTime} to {selectedOrg.closeTime}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <label className={labelStyles}>
                Date
                <input
                  type="date"
                  value={date}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputStyles}
                />
              </label>
              <label className={labelStyles}>
                Time
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputStyles}
                />
              </label>
            </div>

            <Button
              text={loading ? "Booking..." : "Book & get my ticket"}
              type="submit"
              fullWidth
            />
          </form>
        )}
      </div>
    </div>
  );
}

export default BookAppointment;
