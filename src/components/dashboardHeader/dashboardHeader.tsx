import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./dashboardHeader.css";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function DashboardHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    const toggleMenu = () => setMenuOpen(!menuOpen);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserName(user.name || "");
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
                <div className="icon-link"><Link to="/dashboard">Dashboard</Link><HomeIcon /></div>
                <div className="icon-link"><Link to="/patients">Consultantes</Link> <GroupIcon /></div>
                <div className="icon-link"><Link to="/profile">Mi perfil</Link><PersonIcon /></div>
                <div className="icon-link"><button className="logout-button" onClick={handleLogout}>Cerrar sesión</button><ExitToAppIcon /></div>
            </nav>
        </header >
    );
}
