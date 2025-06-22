// src/components/dashboard/Dashboard.tsx
import DashboardHeader from '../dashboardHeader/dashboardHeader';
import "./dashboard.css";

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <DashboardHeader />
            <main className="dashboard-main">
                <p>Aquí verás tu lista de pacientes, turnos, etc.</p>
            </main>
        </div>
    );
}
