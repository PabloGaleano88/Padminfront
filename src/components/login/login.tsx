import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from 'react-router-dom';

import "./login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt:", { email, password });
        // Aquí podrías llamar a tu backend, por ejemplo:
        // await loginUser({ email, password });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img className="logo-login" src="/logo.png" alt="" />
                <h2 className="login-title">Te damos la bienvenida!</h2>
                <h4>                    Ingresa tu correo electrónico y contraseña para acceder o registrarte.</h4>
                <form onSubmit={handleSubmit}>
                    <label className="login-label" htmlFor="email">
                        Correo electrónico
                    </label>
                    <input
                        className="login-input"
                        type="email"
                        id="email"
                        placeholder="ejemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="login-label" htmlFor="password">
                        Contraseña
                    </label>
                    <input
                        className="login-input"
                        type="password"
                        id="password"
                        placeholder="*********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="login-button" type="submit">
                        Ingresar
                    </button>
                    <a className="login-forgot" href="">
                        ¿Olvidaste tu contraseña? Te ayudamos
                    </a>
                </form>
                <div className="login-footer">
                    ¿Sos nuevo en Padmin? <Link to="/register">Create una cuenta</Link>
                </div>
                <div className="separator"></div>
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        fetch("http://localhost:3000/api/auth/google", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ credential: credentialResponse.credential }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                console.log("Login exitoso:", data);
                                localStorage.setItem("token", data.token);
                                // redirigir al panel de usuario si querés
                            })
                            .catch((err) => console.error("Error al iniciar sesión con Google", err));
                    }}
                    onError={() => {
                        console.log("Falló el inicio de sesión con Google");
                    }}
                />
            </div>
        </div >
    );
}
