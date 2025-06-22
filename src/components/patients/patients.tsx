import { useEffect, useState } from "react";
import "./patients.css";
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import Swal from "sweetalert2";
import type { Paciente } from "../../types/patient";
import { useNavigate } from "react-router-dom";

interface TokenPayload {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Función para decodificar el payload del JWT sin librería
function parseJwt(token: string): TokenPayload | null {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload);  // Decodifica Base64
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

const token = localStorage.getItem("token");
let userId = "";

if (token) {
    const decoded = parseJwt(token);
    if (decoded) {
        userId = decoded.id;
        console.log("UserId extraído del token:", userId);
    }
}

export default function Pacientes() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPacientes = () => {
        fetch("http://localhost:3000/api/patients", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setPacientes(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener pacientes:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPacientes();
    }, []);

    const handleAddPaciente = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Agregar paciente",
            html: `
      <label>Nombre:</label>
      <input id="swal-input-nombre" class="swal2-input" placeholder="Nombre" /><br />
      <label>Apellido:</label>
      <input id="swal-input-apellido" class="swal2-input" placeholder="Apellido"/><br />
      <label>DNI:</label>
      <input id="swal-input-dni" class="swal2-input" placeholder="12.345.678" type="text" /><br />
      <label>Fecha de Nacimiento:</label>
      <input id="swal-input-fechanac" class="swal2-input" type="date" /><br />
      <label>Email:</label>
      <input id="swal-input-email" class="swal2-input" placeholder="Correo" type="email" /><br />
      <label>Teléfono:</label>
      <input id="swal-input-phone" class="swal2-input" placeholder="Teléfono" type="tel" />
    `,
            focusConfirm: false,
            confirmButtonText: "Guardar",
            preConfirm: () => {
                const nombre = (document.getElementById("swal-input-nombre") as HTMLInputElement)?.value;
                const apellido = (document.getElementById("swal-input-apellido") as HTMLInputElement)?.value;
                const dni = (document.getElementById("swal-input-dni") as HTMLInputElement)?.value;
                const birthDate = (document.getElementById("swal-input-fechanac") as HTMLInputElement)?.value;
                const email = (document.getElementById("swal-input-email") as HTMLInputElement)?.value;
                const phone = (document.getElementById("swal-input-phone") as HTMLInputElement)?.value;

                if (!nombre || !apellido || !dni || !birthDate) {
                    Swal.showValidationMessage("Todos los campos obligatorios excepto teléfono");
                    return null;
                }

                return { firstName: nombre, lastName: apellido, dni, birthDate, email, phone };
            },
        });

        if (formValues) {
            try {
                // 1. Crear paciente
                const resPaciente = await fetch("http://localhost:3000/api/patients", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(formValues),
                });

                if (!resPaciente.ok) {
                    const errorData = await resPaciente.json();
                    Swal.fire("Error", errorData.error || "No se pudo agregar el paciente", "error");
                    return;
                }

                const pacienteCreado = await resPaciente.json();

                // 2. Crear historia clínica inicial asociada al paciente
                const historiaInicial = {
                    patient: pacienteCreado._id,
                    observations: "Consulta inicial",
                    diagnosis: "",
                    treatment: ""
                };


                const resHistoria = await fetch("http://localhost:3000/api/clinicalhistory", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(historiaInicial),
                });

                if (!resHistoria.ok) {
                    const errorData = await resHistoria.json();
                    Swal.fire("Error", errorData.error || "No se pudo crear la historia clínica", "error");
                    return;
                }

                Swal.fire("¡Paciente e historia clínica creados!", "", "success");
                fetchPacientes(); // recargar lista

            } catch (err) {
                console.error("Error al agregar paciente e historia:", err);
                Swal.fire("Error", "Ocurrió un problema al agregar paciente e historia clínica.", "error");
            }
        }
    };

    return (
        <div className="pacientes-container">
            <DashboardHeader />
            <div className="add-patient" onClick={handleAddPaciente}>
                <span>Agregar paciente </span>
                <p className="plus-icon">+</p>
            </div>

            <div className="pacientes-content">
                <h2>Mis consultantes</h2>
                {loading ? (
                    <p>Cargando pacientes...</p>
                ) : pacientes.length === 0 ? (
                    <div>
                        <p>No hay pacientes registrados.</p>
                    </div>
                ) : (
                    <ul className="pacientes-list">
                        {pacientes.map((paciente) => (
                            <li
                                key={paciente._id}
                                className="paciente-card"
                                onClick={() => navigate(`/patients/${paciente._id}`)}
                            >
                                <strong>{paciente.firstName} {paciente.lastName}</strong>
                                <p>Teléfono: {paciente.phone}</p>
                                <p>Email: {paciente.email}</p>
                            </li>
                        ))}
                    </ul>

                )}
            </div>
        </div>
    );
}
