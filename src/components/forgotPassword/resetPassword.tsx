import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./resetPassword.css"; // Asegúrate de tener este archivo CSS

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Las contraseñas no coinciden",
            });
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Contraseña cambiada",
                    text: "Ya puedes iniciar sesión con tu nueva contraseña",
                }).then(() => navigate("/login"));
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Token inválido o expirado",
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
        <div className="reset-password-container">
            <h2>Cambiar contraseña</h2>
            <form onSubmit={handleSubmit}>
                <label>Nueva contraseña</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <label>Confirmar contraseña</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Cambiar contraseña</button>
            </form>
        </div>
    );
}
