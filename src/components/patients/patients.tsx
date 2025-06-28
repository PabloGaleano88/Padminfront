import { useEffect, useState } from "react";
import "./patients.css";
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import Swal from "sweetalert2";
import type { Paciente } from "../../types/patient";
import { useNavigate } from "react-router-dom";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

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
    }
}

export default function Pacientes() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPacientes = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/patients`, {
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
    <input
        type="text"
        placeholder="Buscar por nombre o apellido..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />


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
      <label>Motivo de consulta:</label>
<textarea id="swal-input-motivo" class="swal2-textarea" placeholder="Motivo de consulta"></textarea>

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
                const motivo = (document.getElementById("swal-input-motivo") as HTMLTextAreaElement)?.value;

                if (!nombre || !apellido || !dni || !birthDate) {
                    Swal.showValidationMessage("Todos los campos obligatorios excepto teléfono");
                    return null;
                }

                return { firstName: nombre, lastName: apellido, dni, birthDate, email, phone, motivoConsulta: motivo };
            },
        });

        if (formValues) {
            try {
                // 1. Crear paciente
                const resPaciente = await fetch(`${import.meta.env.VITE_API_URL}/api/patients`, {
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


                const resHistoria = await fetch(`${import.meta.env.VITE_API_URL}/api/clinicalhistory`, {
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
    const handleDeletePaciente = async (pacienteId: string) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Se eliminará el paciente y todas sus historias clínicas. Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${pacienteId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    Swal.fire("Error", errorData.error || "No se pudo eliminar el paciente", "error");
                    return;
                }

                Swal.fire("¡Paciente eliminado!", "", "success");
                fetchPacientes(); // recargar lista
            } catch (error) {
                Swal.fire("Error", "Error al eliminar el paciente", "error");
            }
        }
    };
    const handleEditPaciente = async (paciente: Paciente) => {
        const { value: formValues } = await Swal.fire({
            title: "Editar paciente",
            html: `
                < label > Nombre:</label >
      <input id="swal-input-nombre" class="swal2-input" value="${paciente.firstName}" /><br />
      <label>Apellido:</label>
      <input id="swal-input-apellido" class="swal2-input" value="${paciente.lastName}" /><br />
      <label>DNI:</label>
      <input id="swal-input-dni" class="swal2-input" value="${paciente.dni}" /><br />
      <label>Fecha de Nacimiento:</label>
      <input id="swal-input-fechanac" class="swal2-input" type="date" value="${paciente.birthDate.split('T')[0]}" /><br />
      <label>Email:</label>
      <input id="swal-input-email" class="swal2-input" value="${paciente.email || ''}" /><br />
      <label>Teléfono:</label>
      <input id="swal-input-phone" class="swal2-input" value="${paciente.phone || ''}" /><br />
      <label>Motivo de consulta:</label>
      <textarea id="swal-input-motivo" class="swal2-textarea">${paciente.motivoConsulta || ''}</textarea>
    `,
            focusConfirm: false,
            confirmButtonText: "Guardar cambios",
            preConfirm: () => {
                const firstName = (document.getElementById("swal-input-nombre") as HTMLInputElement).value;
                const lastName = (document.getElementById("swal-input-apellido") as HTMLInputElement).value;
                const dni = (document.getElementById("swal-input-dni") as HTMLInputElement).value;
                const birthDate = (document.getElementById("swal-input-fechanac") as HTMLInputElement).value;
                const email = (document.getElementById("swal-input-email") as HTMLInputElement).value;
                const phone = (document.getElementById("swal-input-phone") as HTMLInputElement).value;
                const motivoConsulta = (document.getElementById("swal-input-motivo") as HTMLTextAreaElement).value;

                if (!firstName || !lastName || !dni || !birthDate) {
                    Swal.showValidationMessage("Los campos obligatorios están incompletos");
                    return null;
                }

                return { firstName, lastName, dni, birthDate, email, phone, motivoConsulta };
            },
        });

        if (formValues) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${paciente._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(formValues),
                });

                if (!res.ok) {
                    const err = await res.json();
                    Swal.fire("Error", err.error || "No se pudo actualizar el paciente", "error");
                    return;
                }

                Swal.fire("¡Paciente actualizado!", "", "success");
                fetchPacientes(); // recargar lista
            } catch (error) {
                Swal.fire("Error", "Ocurrió un problema al editar el paciente", "error");
            }
        }
    };
    const pacientesFiltrados = pacientes.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pacientes-container">
            <DashboardHeader />
            <div className="add-patient" onClick={handleAddPaciente}>
                <span>Agregar paciente </span>
                <p className="plus-icon">+</p>
            </div>

            <div className="pacientes-content">
                <h2>Mis consultantes</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}

                    />
                    <button
                        className="clear-button"
                        onClick={() => setSearchTerm("")}
                        disabled={searchTerm === ""}
                    >
                        Limpiar
                    </button>
                </div>
                {loading ? (
                    <p>Cargando pacientes...</p>
                ) : pacientes.length === 0 ? (
                    <div>
                        <p>No hay pacientes registrados.</p>
                    </div>
                ) : (
                    <div className="pacientes-table">
                        <div className="pacientes-header">
                            <span>Nombre</span>
                            <span>Teléfono</span>
                            <span>Email</span>
                            <span>Acciones</span>
                        </div>

                        {pacientesFiltrados.map((paciente) => (

                            <div
                                key={paciente._id}
                                className="paciente-row"
                                onClick={() => navigate(`/patients/${paciente._id}`)}


                            >
                                <span>{paciente.firstName} {paciente.lastName}</span>
                                <span>{paciente.phone || "-"}</span>
                                <span>{paciente.email || "-"}</span>
                                <span className="paciente-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="btn-edit-paciente"
                                        onClick={() => handleEditPaciente(paciente)}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        className="btn-delete-paciente"
                                        onClick={() => handleDeletePaciente(paciente._id)}
                                    >
                                        <DeleteForeverIcon />
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}