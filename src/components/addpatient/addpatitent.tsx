import { useState } from "react";
import Swal from "sweetalert2";

export default function AddPaciente({ onAdd }: { onAdd: () => void }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dni, setDni] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState(""); // nuevo estado para teléfono
    const [initialComment, setInitialComment] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    dni,
                    birthDate,
                    email,
                    phone,
                    initialComment, // enviar teléfono
                }),
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire("Paciente agregado", "", "success");
                setFirstName("");
                setLastName("");
                setDni("");
                setBirthDate("");
                setEmail("");
                setPhone(""); // limpiar teléfono
                setInitialComment(""); // limpiar comentario inicial
                onAdd(); // recargar lista
            } else {
                Swal.fire("Error", data.error || "No se pudo agregar", "error");
            }
        } catch (err) {
            console.error("Error al agregar paciente:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-paciente-form">
            <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <input
                type="text"
                placeholder="DNI (ej. 12.345.678)"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                pattern="\d{2}\.\d{3}\.\d{3}"
                title="Formato: xx.xxx.xxx"
                required
            />
            <input type="date" placeholder="Fecha de nacimiento" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
                type="tel"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern="^\+?[0-9\s\-]{7,15}$"
                title="Ingrese un número válido (7-15 dígitos, puede incluir +, espacios o guiones)"
            />
            <input type="text" placeholder="Descripción" value={initialComment} onChange={(e) => setInitialComment(e.target.value)} />
            <button type="submit">Agregar</button>
        </form>
    );
}
