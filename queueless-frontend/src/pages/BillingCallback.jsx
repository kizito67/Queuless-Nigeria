import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const copy = {
  checking: {
    title: "Confirming your payment...",
    body: "Please wait a moment.",
  },
  success: {
    title: "Payment received",
    body: "Your subscription is active. Thank you!",
  },
  failed: {
    title: "Payment failed",
    body: "You have not been charged. You can try again.",
  },
  unfinished: {
    title: "Payment not completed",
    body: "It looks like the payment was not finished. You can try again.",
  },
  missing: {
    title: "Nothing to confirm",
    body: "No payment reference was found.",
  },
};

function BillingCallback() {
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  // Paystack sends the reference as both "reference" and "trxref"
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [state, setState] = useState(reference ? "checking" : "missing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;

    api("/api/business/billing/verify", {
      method: "POST",
      token,
      body: { reference },
    })
      .then(({ status }) => {
        if (cancelled) return;
        setState(
          status === "success"
            ? "success"
            : status === "failed"
              ? "failed"
              : "unfinished",
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setState("error");
        setMessage(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, token]);

  const content =
    state === "error"
      ? { title: "Something went wrong", body: message }
      : copy[state];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display font-semibold text-3xl mb-3">
        {content.title}
      </h1>
      <p className="text-ink-soft text-[15px] max-w-[380px] mb-7">
        {content.body}
      </p>
      {state !== "checking" && (
        <Link
          to="/business?tab=billing"
          className="text-forest font-semibold text-sm hover:underline"
        >
          Back to billing →
        </Link>
      )}
    </div>
  );
}

export default BillingCallback;
