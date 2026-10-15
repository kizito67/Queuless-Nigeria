import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Organizations from './pages/Organizations'
import Dashboard from './pages/Dashboard'
import StaffConsole from './pages/StaffConsole'
import Admin from './pages/Admin'
import LiveQueue from './pages/LiveQueue'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/staff" element={<StaffConsole />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/queue" element={<LiveQueue />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App