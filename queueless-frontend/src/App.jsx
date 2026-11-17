import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Organizations from "./pages/Organizations";
import Dashboard from "./pages/Dashboard";
import Business from "./pages/Business";
import StaffConsole from "./pages/StaffConsole";
import Admin from "./pages/Admin";
import LiveQueue from "./pages/LiveQueue";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import BillingCallback from "./pages/BillingCallback";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route
          path="/queue"
          element={
            <ProtectedRoute roles={["customer"]}>
              <LiveQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queue/:id"
          element={
            <ProtectedRoute roles={["customer"]}>
              <LiveQueue />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/book"
          element={
            <ProtectedRoute roles={["customer"]}>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["customer"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business"
          element={
            <ProtectedRoute roles={["owner"]}>
              <Business />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/billing/callback"
          element={
            <ProtectedRoute roles={["owner"]}>
              <BillingCallback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["staff", "owner"]}>
              <StaffConsole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
