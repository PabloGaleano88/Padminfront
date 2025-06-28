import { useState } from "react";
import Swal from "sweetalert2";
import "./forgotPassword.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Email enviado",
                    text: "Revisa tu correo para el enlace de recuperación",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Ocurrió un error",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error de red",
                text: "No se pudo conectar al servidor",
            });
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Recuperar contraseña</h2>
            <form onSubmit={handleSubmit}>
                <label>Correo electrónico</label>
                <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Enviar enlace</button>
            </form>
        </div>
    );
}
