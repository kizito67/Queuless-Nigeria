import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

// Each role gets one extra link in the nav once logged in
const accountLinks = {
  customer: { to: "/dashboard", label: "My tickets" },
  staff: { to: "/staff", label: "Staff console" },
  admin: { to: "/admin", label: "Admin" },
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const account = user ? accountLinks[user.role] : null;
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const active = (path) =>
    location.pathname === path ? "text-forest" : "hover:text-forest";

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur border-b border-line">
      <div className="max-w-[1140px] mx-auto px-7 py-4 flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
          <span className="w-[34px] h-[34px] rounded-[9px] bg-forest text-white font-mono font-bold text-[13px] flex items-center justify-center">
            QL
          </span>
          <span className="font-display font-bold text-lg leading-tight flex flex-col">
            QueueLess
            <span className="font-mono text-[9.5px] tracking-[0.16em] font-semibold text-amber-deep">
              NIGERIA
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex gap-7 text-sm font-medium text-ink-soft">
          <Link to="/organizations" className={active("/organizations")}>
            Organizations
          </Link>
          <a href="/#services" className="hover:text-forest">
            Services
          </a>
          <Link to="/queue" className={active("/queue")}>
            Live Queue
          </Link>
          <a href="/#business" className="hover:text-forest">
            For Business
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <Link
                to={account.to}
                className="text-sm font-semibold text-forest hover:underline"
              >
                {account.label}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-ink-soft hover:text-forest"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-ink-soft hover:text-forest"
              >
                Log in
              </Link>
              <a href="/#book">
                <Button text="Get a ticket" small />
              </a>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden p-2 -mr-2 text-ink"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <nav className="md:hidden border-t border-line bg-paper px-7 py-5 flex flex-col gap-4 text-[15px] font-medium text-ink-soft">
          <Link to="/organizations" onClick={closeMenu}>
            Organizations
          </Link>
          <a href="/#services" onClick={closeMenu}>
            Services
          </a>
          <Link to="/queue" onClick={closeMenu}>
            Live Queue
          </Link>
          <a href="/#business" onClick={closeMenu}>
            For Business
          </a>
          <div className="border-t border-line pt-4 flex flex-col gap-4">
            {user ? (
              <>
                <Link
                  to={account.to}
                  onClick={closeMenu}
                  className="text-forest font-semibold"
                >
                  {account.label}
                </Link>
                <button onClick={handleLogout} className="text-left">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Log in
                </Link>
                <a href="/#book" onClick={closeMenu}>
                  <Button text="Get a ticket" fullWidth />
                </a>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
