import { Link, useLocation } from 'react-router-dom'
import Button from './Button'

function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur border-b border-line">
      <div className="max-w-[1140px] mx-auto px-7 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
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

        <nav className="hidden md:flex gap-7 text-sm font-medium text-ink-soft">
          {/* Organizations page isn't built yet — link is in place for when it is */}
          <Link to="/organizations" className="hover:text-forest">
            Organizations
          </Link>
          {/* Plain anchors scroll to sections of the home page */}
          <a href="/#services" className="hover:text-forest">
            Services
          </a>
          <Link
            to="/queue"
            className={location.pathname === '/queue' ? 'text-forest' : 'hover:text-forest'}
          >
            Live Queue
          </Link>
          <a href="/#business" className="hover:text-forest">
            For Business
          </a>
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm font-semibold text-ink-soft hover:text-forest">
            Log in
          </Link>
          <a href="/#book">
            <Button text="Get a ticket" small />
          </a>
        </div>
      </div>
    </header>
  )
}

export default Navbar