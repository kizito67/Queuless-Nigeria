import { useState, useEffect, useCallback } from "react";
import PageHero from "../components/PageHero";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

function StaffConsole() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api("/api/staff/queue", { token });
      setData(result);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  // Load now, then every 10 seconds. A stopgap until the live updates arrive.
  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  // Run an action on the server, then reload the queue so the screen shows
  // what the server actually has, not what we guess happened.
  const act = async (path, options = {}) => {
    setMessage("");
    setBusy(true);
    try {
      await api(path, { method: "POST", token, ...options });
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const rowAction = (id, action) =>
    act(`/api/staff/appointments/${id}/action`, {
      method: "PATCH",
      body: { action },
    });

  if (error && !data) {
    return (
      <div>
        <PageHero
          title="Staff console"
          subtitle="Call customers and keep the line moving."
        />
        <div className="max-w-[1140px] mx-auto px-7 py-12">
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-3 inline-block">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHero
          title="Staff console"
          subtitle="Call customers and keep the line moving."
        />
        <p className="max-w-[1140px] mx-auto px-7 py-12 text-sm text-ink-soft">
          Loading...
        </p>
      </div>
    );
  }

  const { organization, serving, waiting, skipped, servedToday } = data;
  const paused = organization.queuePaused;

  const smallBtn =
    "border-[1.5px] border-line-strong bg-paper-raised rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-forest hover:text-forest disabled:opacity-40";
  const panelBtn =
    "w-full rounded-full py-3 font-semibold text-[15px] border-[1.5px] transition active:scale-95 disabled:opacity-40";

  return (
    <div>
      <PageHero
        title="Staff console"
        subtitle={`${organization.name} · today's queue. Call customers, skip no-shows and keep the line moving.`}
      />

      <div className="max-w-[1140px] mx-auto px-7 pt-12 pb-24 grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
        <div className="bg-ink text-white rounded-2xl p-7 text-center">
          <span className="font-mono text-[11.5px] tracking-wide uppercase text-[#93A599]">
            {paused ? "Queue paused" : "Now serving"}
          </span>
          <span className="block font-mono font-bold text-6xl text-amber my-2.5">
            {serving ? serving.queueNumber : "—"}
          </span>
          <p className="text-sm text-[#B9C9BC] mb-6 min-h-5">
            {serving ? serving.name : "No one at the desk"}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => act("/api/staff/queue/call-next")}
              disabled={paused || busy}
              className={`${panelBtn} bg-forest-light border-transparent text-white hover:bg-forest`}
            >
              Call next
            </button>
            <button
              onClick={() => act("/api/staff/queue/complete")}
              disabled={!serving || busy}
              className={`${panelBtn} border-white/30 text-white hover:border-white`}
            >
              Mark served
            </button>
            <button
              onClick={() =>
                act("/api/staff/queue/pause", {
                  method: "PATCH",
                  body: { paused: !paused },
                })
              }
              disabled={busy}
              className={`${panelBtn} border-white/30 text-white hover:border-white`}
            >
              {paused ? "Resume queue" : "Pause queue"}
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-amber">{message}</p>}
          <p className="mt-5 font-mono text-xs text-[#93A599]">
            Served today: {servedToday}
          </p>
        </div>

        <div>
          <h2 className="text-[15px] font-bold mb-4">
            Waiting ({waiting.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {waiting.length === 0 && (
              <p className="text-sm text-ink-soft">The queue is empty.</p>
            )}
            {waiting.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between gap-3.5 bg-paper-raised border border-line rounded-xl px-[18px] py-3.5 ${
                  c.checkedIn ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-mono font-bold text-base text-forest bg-amber-tint rounded-lg px-2.5 py-1.5">
                    {c.queueNumber}
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-[12.5px] text-ink-soft">
                      {c.service} · {c.time} ·{" "}
                      {c.checkedIn ? "Checked in" : "Not checked in"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      rowAction(c.id, c.checkedIn ? "uncheckin" : "checkin")
                    }
                    disabled={busy}
                    className={smallBtn}
                  >
                    {c.checkedIn ? "Undo check-in" : "Check in"}
                  </button>
                  <button
                    onClick={() => rowAction(c.id, "skip")}
                    disabled={busy}
                    className={smallBtn}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => rowAction(c.id, "cancel")}
                    disabled={busy}
                    className={`${smallBtn} hover:!border-[#B8402F] hover:!text-[#B8402F]`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {skipped.length > 0 && (
            <>
              <h2 className="text-[15px] font-bold mt-8 mb-4">
                Skipped ({skipped.length})
              </h2>
              <div className="flex flex-col gap-2.5">
                {skipped.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-paper-raised border border-line rounded-xl px-[18px] py-3.5"
                  >
                    <span className="text-sm">
                      <span className="font-mono font-bold text-forest">
                        {c.queueNumber}
                      </span>{" "}
                      · {c.name}
                    </span>
                    <button
                      onClick={() => rowAction(c.id, "recall")}
                      disabled={busy}
                      className={smallBtn}
                    >
                      Recall
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffConsole;
