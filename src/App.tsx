// App.tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login/login';
import Register from './components/register/register';
import Dashboard from './components/dashboard/dashboard';
import Patients from './components/patients/patients';
import PatientDetail from "./components/patientDetail/patientDetail";
import Header from './components/header/header';
import ForgotPassword from "./components/forgotPassword/forgotPassword";
import ResetPassword from "./components/forgotPassword/resetPassword";
import Profile from './components/profile/profile';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();


  const showMainHeader =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  ;
  console.log(showMainHeader)
  return (
    <div className="App">
      <main className="main-content">
        {showMainHeader && <Header key={location.pathname} />}

        {/* Rutas de la aplicación */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/patients"
            element={isAuthenticated ? <Patients /> : <Navigate to="/login" />}
          />
          <Route path="/patients/:id" element={<PatientDetail />} />

          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

