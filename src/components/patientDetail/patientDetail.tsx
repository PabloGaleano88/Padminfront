import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClinicalHistoryCard from "../clinicaHistory/clinicalHistoryCard"; // importa el nuevo componente
import "./patitentDetail.css";

interface Paciente {
    _id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    email?: string;
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
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Cargando paciente...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!paciente) return <p>No hay paciente seleccionado</p>;

    return (
        <div className="patient-detail-container">
            <h2>Detalle del paciente</h2>
            <p><strong>Nombre:</strong> {paciente.firstName} {paciente.lastName}</p>
            <p><strong>DNI:</strong> {paciente.dni}</p>
            <p>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {new Date(paciente.birthDate).toLocaleDateString()}
            </p>
            <p><strong>Email:</strong> {paciente.email || "N/A"}</p>
            <p><strong>Teléfono:</strong> {paciente.phone || "N/A"}</p>

            <h3>Historia Clínica</h3>
            <ClinicalHistoryCard historias={historias} />

            <button onClick={() => navigate(-1)}>Volver</button>
        </div>
    );
}
