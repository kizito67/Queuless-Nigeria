import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { homeFor } from "../utils/roleHome";

const inputStyles =
  "font-body text-[14.5px] px-3 py-2.5 rounded-lg border-[1.5px] border-line-strong bg-paper text-ink focus:outline-none focus:border-forest";

function ChangePassword() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirm) {
      setError("The new passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await api("/api/auth/change-password", {
        method: "POST",
        token,
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      login(result.user, result.token); // swap in the fresh token and user
      navigate(homeFor(result.user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-16">
      <div className="w-full max-w-[420px] bg-paper-raised border border-line rounded-2xl shadow-lg px-8 py-9 h-fit">
        <h1 className="font-display font-semibold text-2xl mb-1">
          Choose a new password
        </h1>
        <p className="text-ink-soft text-sm mb-6">
          {user.mustChangePassword
            ? "You signed in with a temporary password. Set your own to continue."
            : "Update your password."}
        </p>

        {error && (
          <p className="text-sm text-[#B8402F] bg-[#F6E3E1] rounded-lg p-2.5 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            {user.mustChangePassword
              ? "Temporary password"
              : "Current password"}
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className={inputStyles}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            New password
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className={inputStyles}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
            Confirm new password
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className={inputStyles}
            />
          </label>
          <Button
            text={loading ? "Saving..." : "Save password"}
            type="submit"
            fullWidth
          />
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
