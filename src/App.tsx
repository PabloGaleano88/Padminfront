// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/login';
import Register from './components/register/register';
import Dashboard from './components/dashboard/dashboard';
import Patients from './components/patients/patients';
import PatientDetail from "./components/patientDetail/patientDetail";

import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <div className="App">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
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
        </Routes>
      </main>
    </div>
  );
}

export default App;

