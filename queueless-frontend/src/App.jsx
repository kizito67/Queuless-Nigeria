import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Organizations from "./pages/Organizations";
import Dashboard from "./pages/Dashboard";
import StaffConsole from "./pages/StaffConsole";
import Admin from "./pages/Admin";
import LiveQueue from "./pages/LiveQueue";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/queue" element={<LiveQueue />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Restricted pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["customer"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["staff", "admin"]}>
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

        {/* Anything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
