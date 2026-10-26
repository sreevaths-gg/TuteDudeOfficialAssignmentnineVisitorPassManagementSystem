import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";
import Visitors from "./pages/Visitors";
import Dashboard from "./pages/Dashboard";
import Passes from "./pages/Passes";
import Appointments from "./pages/Appointments";
import QRScanner from "./pages/QRScanner";
import GeneratePass from "./pages/GeneratePass";
import AddVisitor from "./pages/AddVisitor";
import CheckLogs from "./pages/CheckLogs";
import CheckIn from "./pages/CheckIn";
import Checkout from "./pages/Checkout";
import AddUsers from "./pages/AddUsers";
import UserInfoBox from "./components/UserInfoBox";

function App() {
  return (
    <BrowserRouter>
      <nav>
         <Link to="/login">Login</Link>        {" | "}
        <Link to="/register">Register</Link> {" | "}
        <Link to="/dashboard">Dashboard</Link>        {" | "}
        <Link to="/visitors">Visitors</Link>        {" | "}
        <Link to="/passes">Passes</Link>        {" | "}
         <Link to="admin/add-users">Add Users </Link> {" | "}
        <Link to="/add-visitor">AddVisitor</Link>{" | "}
        <Link to="/appointments">Appointments</Link> {" | "}
        <Link to="/generate-pass">GeneratePass</Link> {" | "}
        <Link to="/check-logs">CheckLogs</Link> {" | "}
        <Link to="/checkin">CheckIn</Link> {" | "}
         <Link to="/scanner">QRScanner</Link>{" | "}
        <Link to="/checkout">Checkout </Link> {" | "}
     <LogoutButton />
       
     
      </nav>
  <div>
      <UserInfoBox />
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visitors" element={<Visitors />} />
        <Route path="/passes" element={<Passes />} />
        <Route path="/add-visitor" element={<AddVisitor />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/generate-pass" element={<GeneratePass />} />
        <Route path="/scanner" element={<QRScanner />} />
        <Route path="/check-logs" element={<CheckLogs />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/add-users"   element={
    <ProtectedRoute allowedRoles={["Admin"]}>
  <AddUsers />
</ProtectedRoute>  }
/>

      </Routes>
</div>
    </BrowserRouter>
  );
}

export default App;
