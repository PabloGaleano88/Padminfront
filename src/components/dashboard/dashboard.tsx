import { useEffect, useState } from "react";
import "./dashboard.css";
import DashboardHeader from '../dashboardHeader/dashboardHeader';

export default function Dashboard() {
    const [userName, setUserName] = useState("");
    const [patientCount, setPatientCount] = useState(0);
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);

        // Obtener fecha actual
        const today = new Date();
        const formatted = today.toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        setCurrentDate(formatted);

        // Llamada al backend para obtener cantidad de pacientes
        const fetchPatients = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patients`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setPatientCount(data.length || 0);
            } catch (error) {
                console.error("Error al obtener pacientes", error);
            }
        };

        fetchPatients();
    }, []);

    return (
        <div className="dashboard-container">
            <DashboardHeader />
            <h1>¡Hola, {userName}!</h1>
            <p className="dashboard-date">Hoy es {currentDate}</p>

            <div className="dashboard-cards">
                <div className="card active">
                    <h3>Pacientes</h3>
                    <p>{patientCount}</p>
                </div>

                <div className="card">
                    <h3>Novedades</h3>
                    <p>Próximamente</p>
                </div>

                <div className="card">
                    <h3>Solicitudes</h3>
                    <p>Próximamente</p>
                </div>

                <div className="card">
                    <h3>Facturación</h3>
                    <p>Próximamente</p>
                </div>

                <div className="card">
                    <h3>Chat</h3>
                    <p>Próximamente</p>
                </div>
            </div>
        </div>
    );
}
