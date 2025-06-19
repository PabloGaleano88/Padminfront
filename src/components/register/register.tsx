import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./register.css";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("medico");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Las contraseñas no coinciden",
                confirmButtonText: "Entendido",
            });
            return;
        }

        setPasswordError("");

        try {
            const res = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                Swal.fire({
                    icon: "success",
                    title: "¡Registro exitoso!",
                    text: "Serás redirigido al inicio de sesión.",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/login");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Ocurrió un error al registrarte",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error de red",
                text: "No se pudo conectar al servidor.",
            });
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleRegister}>
                <h2>Crear cuenta</h2>

                <div>
                    <label>Nombre completo</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div>
                    <label>Correo electrónico</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                    <label>Contraseña</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div>
                    <label>Repetir Contraseña</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    {passwordError && <p className="error-text">{passwordError}</p>}
                </div>

                <div>
                    <label>Rol</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="medico">Médico/a</option>
                        <option value="psicologo">Psicólogo/a</option>
                        <option value="kinesiologo">Kinesiólogo/a</option>
                    </select>
                </div>

                <button className="register-button" type="submit">Registrarme</button>
            </form>
        </div>
    );
}
