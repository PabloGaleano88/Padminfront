import { useEffect, useState } from "react";
import "./dashboard.css";
import DashboardHeader from '../dashboardHeader/dashboardHeader';
import type { Paciente } from "../../types/patient";
import { Link } from "react-router-dom";


export default function Dashboard() {
    const [userName, setUserName] = useState("");
    const [patientCount, setPatientCount] = useState(0);
    const [currentDate, setCurrentDate] = useState("");
    const [cumpleanieros, setCumpleanieros] = useState<Paciente[]>([]);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);


        // Obtener fecha actual
        const today = new Date();
        today.setHours(12, 0, 0, 0); // Evitar desfases por zona horaria
        const formatted = today.toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        setCurrentDate(formatted);

        // Llamada al backend para obtener pacientes y calcular cumpleaños
        const fetchPatients = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patients`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data: Paciente[] = await res.json();
                setPatientCount(data.length || 0);

                const hoy = new Date();
                hoy.setHours(12, 0, 0, 0); // Normalizar

                const cumpleHoy = data.filter(p => {
                    const nacimiento = new Date(p.birthDate);
                    nacimiento.setHours(12, 0, 0, 0); // Normalizar

                    return (
                        nacimiento.getDate() === hoy.getDate() &&
                        nacimiento.getMonth() === hoy.getMonth()
                    );
                });

                setCumpleanieros(cumpleHoy);
            } catch (error) {
                console.error("Error al obtener pacientes", error);
            }
        };

        fetchPatients();
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserName(user.name || "");
        }
    }, []);
    return (
        <div className="dashboard-container">
            <DashboardHeader />
            <h1>¡Hola, {userName}!</h1>
            <p className="dashboard-date">Hoy es {currentDate}</p>

            <div className="dashboard-cards">
                <Link to="/patients" className="card-link">
                    <div className="card">
                        <h3>Pacientes</h3>
                        <p>{patientCount}</p>
                    </div>
                </Link>


                {/* 🎂 Cumpleaños */}
                <div className="card cumpleanios">
                    <h3>🎂 Cumpleaños de hoy</h3>
                    {cumpleanieros.length === 0 ? (
                        <p>No hay cumpleaños hoy.</p>
                    ) : (
                        <ul>
                            {cumpleanieros.map(p => (
                                <li key={p._id}>
                                    {p.firstName} {p.lastName}
                                </li>
                            ))}
                        </ul>
                    )}
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
