import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Ticket from "../components/Ticket";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { connectSocket } from "../socket";

const messages = {
  serving: "It's your turn. Please go to the desk now.",
  completed: "You've been served. Thank you!",
  cancelled: "This booking was cancelled.",
  skipped: "You were skipped. Please speak to the staff.",
  missed: "This booking was marked as missed.",
};

const formatDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function LiveQueue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const [noTicket, setNoTicket] = useState(false);
  const [actionError, setActionError] = useState("");

  // /queue with no id: jump to the soonest active ticket
  useEffect(() => {
    if (id) return;
    api("/api/appointments/mine", { token })
      .then(({ appointments }) => {
        const active = appointments
          .filter((b) => b.status === "upcoming" || b.status === "serving")
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
        if (active) navigate(`/queue/${active.id}`, { replace: true });
        else setNoTicket(true);
      })
      .catch((err) => setError(err.message));
  }, [id, token, navigate]);

  const checkIn = async () => {
    setActionError("");
    try {
      await api(`/api/appointments/${id}/checkin`, { method: "POST", token });
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  };
  const load = useCallback(async () => {
    try {
      setStatus(await api(`/api/appointments/${id}/status`, { token }));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [id, token]);

  // Load once, then listen. The socket only says "something changed";
  // we ask the API what the queue looks like now.
  useEffect(() => {
    if (!id) return;
    load();

    const socket = connectSocket(token);
    socket.on("connect", () => {
      setLive(true);
      socket.emit("queue:watch", id); // runs again after every reconnect
      load(); // catch anything missed while disconnected
    });
    socket.on("disconnect", () => setLive(false));
    socket.on("queue:changed", () => load());

    // Safety net in case the socket is blocked on someone's network
    const poll = setInterval(load, 30000);

    return () => {
      clearInterval(poll);
      socket.disconnect(); // leaving the page ends the connection
    };
  }, [id, token, load]);

  if (noTicket) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display font-semibold text-2xl mb-3">
          No active ticket
        </h1>
        <p className="text-ink-soft text-sm mb-6">
          Book an appointment to join a queue.
        </p>
        <a
          href="/#book"
          className="text-forest font-semibold text-sm hover:underline"
        >
          Book one →
        </a>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <p className={`text-sm ${error ? "text-[#B8402F]" : "text-ink-soft"}`}>
          {error || "Loading your ticket..."}
        </p>
      </div>
    );
  }

  const {
    appointment,
    nowServing,
    peopleAhead,
    estimatedWaitMinutes,
    paused,
    checkedIn,
  } = status;
  const waiting = appointment.status === "upcoming";
  const isToday = appointment.date === new Date().toLocaleDateString("en-CA");

  const label =
    "font-mono text-[11.5px] uppercase tracking-wide text-[#93A599]";

  return (
    <div className="bg-ink min-h-screen text-white py-16 px-4">
      <div className="max-w-[1140px] mx-auto">
        <div className="flex justify-center mb-10">
          <Ticket
            org={appointment.organization}
            service={appointment.service}
            number={appointment.queueNumber}
            bottomLeft={{ label: "Date", value: formatDate(appointment.date) }}
            bottomRight={{ label: "Time", value: appointment.time }}
          />
        </div>

        {messages[appointment.status] && (
          <p className="max-w-[560px] mx-auto mb-6 text-center bg-forest-light/30 border border-forest-light rounded-xl p-4 text-sm">
            {messages[appointment.status]}
          </p>
        )}

        {paused && waiting && (
          <p className="max-w-[560px] mx-auto mb-6 text-center bg-amber/20 border border-amber rounded-xl p-4 text-sm text-amber">
            The queue is paused for now. Your place is kept.
          </p>
        )}

        <div className="bg-[#1E2E24] border border-[#2E4033] rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-7 py-4 font-mono text-xs tracking-wide text-[#B9C9BC] border-b border-[#2E4033]">
            <span>{appointment.organization}</span>
            <span
              className={`flex items-center gap-2 font-semibold ${live ? "text-amber" : "text-[#93A599]"}`}
            >
              <span
                className={`w-[7px] h-[7px] rounded-full ${live ? "bg-amber animate-pulse" : "bg-[#6E8074]"}`}
              />
              {live ? "Live" : "Reconnecting..."}
            </span>
          </div>

          <div className="grid md:grid-cols-3">
            <div className="p-8 flex flex-col gap-2.5 border-b md:border-b-0 md:border-r border-[#2E4033] text-center">
              <span className={label}>Now serving</span>
              <span className="font-mono font-bold text-5xl text-amber">
                {nowServing || "—"}
              </span>
            </div>
            <div className="p-8 flex flex-col gap-2.5 border-b md:border-b-0 md:border-r border-[#2E4033] text-center">
              <span className={label}>Your number</span>
              <span className="font-mono font-bold text-4xl text-white">
                {appointment.queueNumber}
              </span>
            </div>
            <div className="p-8 flex flex-col gap-2.5 text-center">
              <span className={label}>
                {waiting ? "People ahead" : "Status"}
              </span>
              <span className="font-mono font-bold text-4xl text-[#6E8074]">
                {waiting ? peopleAhead : appointment.status}
              </span>
            </div>
          </div>
        </div>

        {waiting && isToday && (
          <p className="text-center text-sm text-[#B9C9BC] mt-6">
            Estimated wait: about {estimatedWaitMinutes} min
          </p>
        )}
        {waiting && isToday && !checkedIn && (
          <div className="text-center mt-6">
            <button
              onClick={checkIn}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-[15px] bg-amber text-ink hover:opacity-90 transition active:scale-95"
            >
              I've arrived
            </button>
            <p className="text-xs text-[#93A599] mt-2">
              Tap this when you get there. Staff can only call you once you've
              checked in.
            </p>
          </div>
        )}
        {waiting && checkedIn && (
          <p className="text-center text-sm text-amber mt-4">
            You're checked in. Staff can call you now.
          </p>
        )}
        {actionError && (
          <p className="text-center text-sm text-[#F2B8AE] mt-3">
            {actionError}
          </p>
        )}

        <div className="flex justify-center mt-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold text-[15px] border-[1.5px] border-white/30 text-white hover:border-white transition"
          >
            Back to my tickets
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LiveQueue;
