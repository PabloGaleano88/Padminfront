// src/components/dashboard/Dashboard.tsx
import "./dashboard.css";

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Bienvenido a Padmin</h1>
            </header>
            <main className="dashboard-main">
                <p>Aquí verás tu lista de pacientes, turnos, etc.</p>
            </main>
        </div>
    );
}
