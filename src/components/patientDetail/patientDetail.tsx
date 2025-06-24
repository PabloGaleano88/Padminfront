import "./patitentDetail.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClinicalHistoryCard from "../clinicaHistory/clinicalHistoryCard"; // importa el nuevo componente
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import Swal from "sweetalert2";

interface Paciente {
    _id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    email?: string;
    motivoConsulta?: string;
    phone?: string;
}

interface HistoriaClinica {
    _id: string;
    observations: string;
    diagnosis: string;
    treatment: string;
    date: string;
}

export default function PatientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Función para recargar historias
    const fetchHistorias = () => {
        if (!id) return;

        fetch(`http://localhost:3000/api/clinicalhistory/patient/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Error al obtener la historia clínica");
                return res.json();
            })
            .then((data) => {
                setHistorias(data);
            })
            .catch((err) => {
                console.error("Error al obtener historia clínica:", err);
            });
    };

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError("");

        fetch(`http://localhost:3000/api/patients/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Paciente no encontrado");
                return res.json();
            })
            .then((data) => {
                setPaciente(data);
            })
            .catch((err) => {
                setError(err.message || "Error al obtener paciente");
            });

        fetchHistorias();

        setLoading(false);
    }, [id]);

    const handleAddHistoria = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Agregar historia clínica",
            html: `
                <label>Observaciones:</label>
                <textarea id="swal-input-observations" class="swal2-textarea" placeholder="Observaciones"></textarea>

                <label>Diagnóstico:</label>
                <textarea id="swal-input-diagnosis" class="swal2-textarea" placeholder="Diagnóstico"></textarea>

                <label>Tratamiento:</label>
                <textarea id="swal-input-treatment" class="swal2-textarea" placeholder="Tratamiento"></textarea>
            `,
            focusConfirm: false,
            confirmButtonText: "Guardar",
            preConfirm: () => {
                const observations = (document.getElementById("swal-input-observations") as HTMLTextAreaElement)?.value;
                const diagnosis = (document.getElementById("swal-input-diagnosis") as HTMLTextAreaElement)?.value;
                const treatment = (document.getElementById("swal-input-treatment") as HTMLTextAreaElement)?.value;

                if (!observations) {
                    Swal.showValidationMessage("Las observaciones son obligatorias");
                    return null;
                }

                return { observations, diagnosis, treatment };
            }
        });

        if (formValues) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3000/api/clinicalhistory", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        patient: id,  // id del paciente desde useParams
                        ...formValues,
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    Swal.fire("Error", errorData.error || "No se pudo agregar la historia clínica", "error");
                    return;
                }

                Swal.fire("¡Historia clínica agregada!", "", "success");
                fetchHistorias();  // recarga historias
            } catch (error) {
                Swal.fire("Error", "Error al agregar la historia clínica", "error");
            }
        }
    };
    const handleDeleteHistoria = async (historiaId: string) => {
        const confirmar = window.confirm("¿Seguro que querés eliminar esta historia clínica?");
        if (!confirmar) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:3000/api/clinicalhistory/${historiaId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                const err = await res.json();
                return Swal.fire("Error", err.error || "No se pudo eliminar", "error");
            }
            Swal.fire("¡Eliminada!", "Historia clínica eliminada correctamente", "success");
            fetchHistorias();
        } catch (e) {
            Swal.fire("Error", "Error al eliminar la historia clínica", "error");
        }
    };

    const handleEditHistoria = async (historia: HistoriaClinica) => {
        const { value: formValues } = await Swal.fire({
            title: "Editar historia clínica",
            html: `
            <label>Observaciones:</label>
            <textarea id="swal-input-observations" class="swal2-textarea">${historia.observations}</textarea>

            <label>Diagnóstico:</label>
            <textarea id="swal-input-diagnosis" class="swal2-textarea">${historia.diagnosis}</textarea>

            <label>Tratamiento:</label>
            <textarea id="swal-input-treatment" class="swal2-textarea">${historia.treatment}</textarea>
        `,
            focusConfirm: false,
            confirmButtonText: "Guardar cambios",
            preConfirm: () => {
                const observations = (document.getElementById("swal-input-observations") as HTMLTextAreaElement)?.value;
                const diagnosis = (document.getElementById("swal-input-diagnosis") as HTMLTextAreaElement)?.value;
                const treatment = (document.getElementById("swal-input-treatment") as HTMLTextAreaElement)?.value;

                if (!observations) {
                    Swal.showValidationMessage("Las observaciones son obligatorias");
                    return null;
                }

                return { observations, diagnosis, treatment };
            },
        });

        if (formValues) {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:3000/api/clinicalhistory/${historia._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formValues),
                });

                if (!res.ok) {
                    const err = await res.json();
                    Swal.fire("Error", err.error || "No se pudo editar la historia clínica", "error");
                    return;
                }

                Swal.fire("¡Historia clínica actualizada!", "", "success");
                fetchHistorias();
            } catch (e) {
                Swal.fire("Error", "Error al actualizar la historia clínica", "error");
            }
        }
    };


    if (loading) return <p>Cargando paciente...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!paciente) return <p>No hay paciente seleccionado</p>;

    return (<>
        <DashboardHeader />
        <div className="patient-detail-layout">
            <div className="patient-info">
                <h2>Detalle del paciente</h2>
                <p><strong>Nombre:</strong> {paciente.firstName} {paciente.lastName}</p>
                <p><strong>DNI:</strong> {paciente.dni}</p>
                <p><strong>Fecha de Nacimiento:</strong> {new Date(paciente.birthDate).toLocaleDateString()}</p>
                <p><strong>Email:</strong> {paciente.email || "N/A"}</p>
                <p><strong>Teléfono:</strong> {paciente.phone || "N/A"}</p>
                <p><strong>Motivo de consulta:</strong> {paciente.motivoConsulta || "N/A"}</p>

                <button className="btn-back" onClick={() => navigate(-1)}>← Volver</button>
            </div>

            <div className="historia-clinica-section">
                <div className="historia-clinica-header">
                    <h3>Historia Clínica</h3>
                    <button onClick={handleAddHistoria} className="btn-add-history">+ Agregar Historia Clínica</button>
                </div>
                <ClinicalHistoryCard historias={historias} onDelete={handleDeleteHistoria} onEdit={handleEditHistoria} />
            </div>
        </div>
    </>
    );
}
