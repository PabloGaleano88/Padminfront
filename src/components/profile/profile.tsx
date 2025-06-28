import { useEffect, useState } from "react";
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import "./profile.css";

export default function Profile() {
    const [user, setUser] = useState({ name: "", email: "", role: "" });

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <div className="profile-container">
            <DashboardHeader />
            <h1>Mi Perfil</h1>
            <div className="profile-card">
                <p><strong>Nombre:</strong> {user.name || "No disponible"}</p>
                <p><strong>Email:</strong> {user.email || "No disponible"}</p>
                <p><strong>Rol:</strong> {user.role || "No disponible"}</p>
            </div>
        </div>
    );
}
