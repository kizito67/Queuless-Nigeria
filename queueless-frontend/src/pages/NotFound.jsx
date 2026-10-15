import { Link } from "react-router-dom";
import Button from "../components/Button";

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="font-mono font-bold text-7xl text-forest mb-4">404</span>
      <h1 className="font-display font-semibold text-3xl mb-3">
        This line doesn't go anywhere.
      </h1>
      <p className="text-ink-soft text-[15px] max-w-[380px] mb-7">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/">
        <Button text="Back to home" />
      </Link>
    </div>
  );
}

export default NotFound;
