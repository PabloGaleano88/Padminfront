import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./dashboardHeader.css";

export default function DashboardHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    const toggleMenu = () => setMenuOpen(!menuOpen);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setUserName(storedName);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <header className="dashboard-header">
            <div className="dashboard-title">Padmin</div>
            <div className="user-name">{userName}</div>
            <div className="hamburger" onClick={toggleMenu}>
                ☰
            </div>
            <nav className={`menu ${menuOpen ? "open" : ""}`}>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/patients">Consultantes</Link>
                <Link to="/perfil">Mi perfil</Link>
                <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
            </nav>
        </header>
    );
}
