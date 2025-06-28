import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Asegurate de tenerlo instalado: npm i sweetalert2
import "./login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                Swal.fire({
                    icon: "success",
                    title: "¡Bienvenido!",
                    text: "Redirigiendo al panel principal...",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(() => navigate("/dashboard"));



            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error de autenticación",
                    text: data.error || "Credenciales incorrectas",
                });
            }
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al conectar con el servidor.",
            });
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="title">
                    <img className="logo-login" src="/logo.png" alt="" />
                    <h1>Padmin</h1>
                </div>
                <h2 className="login-title">Te damos la bienvenida!</h2>
                <h4>Ingresa tu correo electrónico y contraseña para acceder o registrarte.</h4>
                <form onSubmit={handleSubmit}>
                    <label className="login-label" htmlFor="email">Correo electrónico</label>
                    <input
                        className="login-input"
                        type="email"
                        id="email"
                        placeholder="ejemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="login-label" htmlFor="password">Contraseña</label>
                    <input
                        className="login-input"
                        type="password"
                        id="password"
                        placeholder="*********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button className="login-button" type="submit">Ingresar</button>
                    <a className="login-forgot" href="/forgot-password">¿Olvidaste tu contraseña? Te ayudamos</a>
                </form>

                <div className="login-footer">
                    ¿Sos nuevo en Padmin? <Link to="/register">Create una cuenta</Link>
                </div>

                <div className="separator"></div>
                <div className="google-login-container">

                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ credential: credentialResponse.credential }),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    localStorage.setItem("token", data.token);
                                    localStorage.setItem("user", JSON.stringify(data.user));
                                    Swal.fire({
                                        icon: "success",
                                        title: "Inicio de sesión con Google exitoso",
                                        text: "Redirigiendo...",
                                        showConfirmButton: false,
                                        timer: 2000,
                                        timerProgressBar: true,
                                    }).then(() => {
                                        navigate("/dashboard");
                                    });
                                })
                                .catch((err) => {
                                    console.error("Error al iniciar sesión con Google", err);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Error con Google",
                                        text: "No se pudo iniciar sesión",
                                    });
                                });
                        }}
                        onError={() => {
                            Swal.fire({
                                icon: "error",
                                title: "Falló el inicio de sesión con Google",
                                text: "Intentalo nuevamente",
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
