import { useEffect, useState } from "react";
import "./dashboard.css";
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import type { Paciente } from "../../types/patient";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [userName, setUserName] = useState("");
    const [patientCount, setPatientCount] = useState(0);
    const [currentDate, setCurrentDate] = useState("");
    const [cumpleanieros, setCumpleanieros] = useState<Paciente[]>([]);
    const [turnosHoy, setTurnosHoy] = useState<Paciente[]>([]);
    const [turnosManiana, setTurnosManiana] = useState<Paciente[]>([]);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);

        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const formatted = today.toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        setCurrentDate(formatted);

        // Función para normalizar fecha: poner hora 00:00:00
        const normalizar = (d: Date) => {
            const nd = new Date(d);
            nd.setHours(0, 0, 0, 0);
            return nd;
        };

        const hoy = normalizar(new Date());
        const maniana = new Date(hoy);
        maniana.setDate(hoy.getDate() + 1);

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

                // Cumpleaños de hoy
                const cumpleHoy = data.filter((p) => {
                    const nacimiento = new Date(p.birthDate);
                    const nacimientoNorm = normalizar(nacimiento);
                    return (
                        nacimientoNorm.getDate() === hoy.getDate() &&
                        nacimientoNorm.getMonth() === hoy.getMonth()
                    );
                });
                setCumpleanieros(cumpleHoy);

                // Turnos de hoy y mañana
                const turnosHoyPacientes = data.filter((p) => {
                    if (!p.proximoTurno) return false;
                    // proximoTurno puede ser string con fecha ISO o un objeto, ajustá según tu tipo
                    const fechaTurno = typeof p.proximoTurno === "string" ? p.proximoTurno : (p.proximoTurno as any).date;
                    if (!fechaTurno) return false;
                    const turno = normalizar(new Date(fechaTurno));
                    return turno.getTime() === hoy.getTime();
                });

                const turnosManianaPacientes = data.filter((p) => {
                    if (!p.proximoTurno) return false;
                    const fechaTurno = typeof p.proximoTurno === "string" ? p.proximoTurno : (p.proximoTurno as any).date;
                    if (!fechaTurno) return false;
                    const turno = normalizar(new Date(fechaTurno));
                    return turno.getTime() === maniana.getTime();
                });

                setTurnosHoy(turnosHoyPacientes);
                setTurnosManiana(turnosManianaPacientes);
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
                            {cumpleanieros.map((p) => (
                                <li key={p._id}>
                                    {p.firstName} {p.lastName}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 📅 Turnos de hoy */}
                <div className="card">
                    <h3>📅 Turnos de hoy</h3>
                    {turnosHoy.length === 0 ? (
                        <p>No hay turnos hoy.</p>
                    ) : (
                        <ul>
                            {turnosHoy.map((p) => {
                                const fechaTurno = typeof p.proximoTurno === "string" ? p.proximoTurno : (p.proximoTurno as any).date;
                                return (
                                    <li key={p._id}>
                                        {p.firstName} {p.lastName} -{" "}
                                        {new Date(fechaTurno).toLocaleTimeString("es-AR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* 📆 Turnos de mañana */}
                <div className="card">
                    <h3>📆 Turnos de mañana</h3>
                    {turnosManiana.length === 0 ? (
                        <p>No hay turnos mañana.</p>
                    ) : (
                        <ul>
                            {turnosManiana.map((p) => {
                                const fechaTurno = typeof p.proximoTurno === "string" ? p.proximoTurno : (p.proximoTurno as any).date;
                                return (
                                    <li key={p._id}>
                                        {p.firstName} {p.lastName} -{" "}
                                        {new Date(fechaTurno).toLocaleTimeString("es-AR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
