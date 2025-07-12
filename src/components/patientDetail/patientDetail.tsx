import "./patientDetail.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ClinicalHistoryCard from "../clinicaHistory/clinicalHistoryCard";
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Swal from "sweetalert2";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

interface Paciente {
    _id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    email?: string;
    motivoConsulta?: string;
    phone?: string;
    proximoTurno?: {
        _id: string;
        date: string;
        professional?: {
            _id: string;
            name: string;
        };
    };
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
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"resumen" | "ficha" | "historia">("resumen");

    const [showAddModal, setShowAddModal] = useState(false);
    const [newHistoriaContent, setNewHistoriaContent] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editHistoria, setEditHistoria] = useState<HistoriaClinica | null>(null);
    const [editHistoriaContent, setEditHistoriaContent] = useState("");

    const addEditor = useEditor({
        extensions: [StarterKit, Underline],
        content: newHistoriaContent,
        onUpdate: ({ editor }) => setNewHistoriaContent(editor.getHTML()),
    });

    const editEditor = useEditor({
        extensions: [StarterKit, Underline],
        content: editHistoriaContent,
        onUpdate: ({ editor }) => setEditHistoriaContent(editor.getHTML()),
    });
    function toLocalDatetimeInputValue(dateString: string): string {
        const date = new Date(dateString);
        const pad = (n: number) => n.toString().padStart(2, "0");

        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());

        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError("");

        fetch(`${import.meta.env.VITE_API_URL}/api/patients/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Paciente no encontrado");
                return res.json();
            })
            .then((data) => {
                setPaciente(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Error al obtener paciente");
                setLoading(false);
            });

        fetchHistorias();
    }, [id]);

    const fetchHistorias = () => {
        if (!id) return;

        fetch(`${import.meta.env.VITE_API_URL}/api/clinicalhistory/patient/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => res.json())
            .then((data) => setHistorias(data))
            .catch((err) => console.error("Error al obtener historia clínica:", err));
    };

    const openAddModal = () => {
        setShowAddModal(true);
        setNewHistoriaContent("");
        addEditor?.commands.setContent("");
    };

    const handleAddAppointment = async () => {
        const { value: fecha } = await Swal.fire({
            title: "Selecciona la fecha del próximo turno",
            input: "datetime-local",
            inputLabel: "Fecha y hora",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return "Debes ingresar una fecha";
            },
        });

        if (!fecha) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ patient: id, date: new Date(fecha).toISOString() }),
            });

            if (!res.ok) throw new Error("Error al guardar el turno");

            const nuevoTurno = await res.json();
            setPaciente((prev) =>
                prev ? { ...prev, proximoTurno: nuevoTurno } : prev
            );
            Swal.fire("Turno agregado", "El próximo turno fue guardado", "success");
        } catch (err) {
            Swal.fire("Error", "No se pudo guardar el turno", "error");
        }
    };

    // Función para editar el próximo turno
    const handleEditAppointment = async () => {
        if (!paciente) return;

        const { value: fecha } = await Swal.fire({
            title: "Editar fecha del próximo turno",
            input: "datetime-local",
            inputLabel: "Fecha y hora",
            inputValue: paciente.proximoTurno
                ? toLocalDatetimeInputValue(paciente.proximoTurno.date)
                : undefined,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return "Debes ingresar una fecha";
            },
        });

        if (!fecha) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${paciente.proximoTurno?._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ date: new Date(fecha).toISOString() }),
            });

            if (!res.ok) throw new Error("Error al editar el turno");

            const updatedTurno = await res.json();
            setPaciente((prev) =>
                prev ? { ...prev, proximoTurno: updatedTurno } : prev
            );
            Swal.fire("Turno actualizado", "El próximo turno fue actualizado", "success");
        } catch (err) {
            Swal.fire("Error", "No se pudo actualizar el turno", "error");
        }
    };

    // Función para eliminar el próximo turno
    const handleDeleteAppointment = async () => {
        if (!paciente?.proximoTurno) return;

        const confirm = await Swal.fire({
            title: "¿Estás seguro de eliminar el próximo turno?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${paciente.proximoTurno._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Error al eliminar el turno");

            setPaciente((prev) => prev ? { ...prev, proximoTurno: undefined } : prev);
            Swal.fire("Turno eliminado", "El próximo turno fue eliminado", "success");
        } catch (err) {
            Swal.fire("Error", "No se pudo eliminar el turno", "error");
        }
    };

    const handleSaveHistoria = async () => {
        if (!newHistoriaContent.trim() || newHistoriaContent === "<p></p>") {
            alert("La historia clínica no puede estar vacía.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await fetch(`${import.meta.env.VITE_API_URL}/api/clinicalhistory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    patient: id,
                    observations: newHistoriaContent,
                    diagnosis: "",
                    treatment: "",
                    date: new Date().toISOString(),
                }),
            });

            setShowAddModal(false);
            setNewHistoriaContent("");
            addEditor?.commands.clearContent();
            fetchHistorias();
        } catch {
            alert("Error al guardar historia clínica");
        }
    };

    const handleOpenEdit = (historia: HistoriaClinica) => {
        setEditHistoria(historia);
        setEditHistoriaContent(historia.observations);
        setShowEditModal(true);
        setTimeout(() => editEditor?.commands.setContent(historia.observations || ""), 50);
    };

    const handleSaveEditHistoria = async () => {
        if (!editHistoria || !editHistoriaContent.trim() || editHistoriaContent === "<p></p>") {
            alert("La historia clínica no puede estar vacía.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await fetch(`${import.meta.env.VITE_API_URL}/api/clinicalhistory/${editHistoria._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    observations: editHistoriaContent,
                    diagnosis: editHistoria.diagnosis,
                    treatment: editHistoria.treatment,
                    date: new Date().toISOString(),
                }),
            });

            setShowEditModal(false);
            setEditHistoria(null);
            setEditHistoriaContent("");
            editEditor?.commands.clearContent();
            fetchHistorias();
        } catch {
            alert("Error al editar historia clínica");
        }
    };

    const handleDeleteHistoria = async (historiaId: string) => {
        if (!window.confirm("¿Seguro que querés eliminar esta historia clínica?")) return;

        try {
            const token = localStorage.getItem("token");
            await fetch(`${import.meta.env.VITE_API_URL}/api/clinicalhistory/${historiaId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Historia clínica eliminada correctamente");
            fetchHistorias();
        } catch {
            alert("Error al eliminar la historia clínica");
        }
    };

    const MenuBar = ({ editor }: { editor: any }) => {
        if (!editor) return null;

        return (
            <div className="menu-bar">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "is-active" : ""}><b>B</b></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "is-active" : ""}><i>I</i></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "is-active" : ""}><u>U</u></button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "is-active" : ""}>• List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "is-active" : ""}>1. List</button>
                <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear</button>
            </div>
        );
    };

    const phoneForWhatsApp = paciente?.phone ? `+54${paciente.phone.replace(/^\+/, "").replace(/\D/g, "")}` : null;
    const whatsappUrl = phoneForWhatsApp ? `https://wa.me/${phoneForWhatsApp.replace(/\D/g, "")}` : null;

    if (loading) return <p>Cargando paciente...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!paciente) return <p>No hay paciente seleccionado</p>;

    return (
        <>
            <DashboardHeader />
            <div className="patient-detail-layout">
                <div className="patient-summary">
                    <h2>{paciente.firstName} {paciente.lastName}</h2>
                    {whatsappUrl ? (
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                            <WhatsAppIcon /> WhatsApp
                        </a>
                    ) : (
                        <p>Teléfono no disponible</p>
                    )}
                    <hr />
                </div>

                <div className="patient-tabs">
                    <div className="tabs-buttons">
                        <button className={activeTab === "resumen" ? "active" : ""} onClick={() => setActiveTab("resumen")}>Resumen</button>
                        <button className={activeTab === "ficha" ? "active" : ""} onClick={() => setActiveTab("ficha")}>Ficha</button>
                        <button className={activeTab === "historia" ? "active" : ""} onClick={() => setActiveTab("historia")}>Historia clínica</button>
                    </div>

                    <div className="tab-content">
                        {activeTab === "resumen" && (
                            <div className="tab-resumen">
                                <p><strong>Motivo de consulta:</strong> {paciente.motivoConsulta || "No disponible"}</p>
                                <p><strong>Historial de pagos:</strong> Próximamente</p>
                                <p>
                                    <strong>Próxima sesión:</strong>{" "}
                                    {paciente.proximoTurno?.date ? (
                                        <>
                                            {new Date(paciente.proximoTurno.date).toLocaleString("es-AR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                            })}
                                            <span
                                                style={{
                                                    marginLeft: "10px",
                                                    cursor: "pointer",
                                                    display: "inline-flex",
                                                    gap: "8px",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                <EditIcon
                                                    fontSize="small"
                                                    color="primary"
                                                    onClick={handleEditAppointment}
                                                    titleAccess="Editar próximo turno"
                                                />
                                                <DeleteIcon
                                                    fontSize="small"
                                                    color="error"
                                                    onClick={handleDeleteAppointment}
                                                    titleAccess="Eliminar próximo turno"
                                                />
                                            </span>
                                        </>
                                    ) : (
                                        <AddCircleIcon
                                            color="primary"
                                            fontSize="medium"
                                            style={{ cursor: "pointer", marginLeft: "10px", verticalAlign: "middle", color: "green" }}
                                            titleAccess="Agregar próximo turno"
                                            onClick={handleAddAppointment}
                                        />
                                    )}
                                </p>
                            </div>
                        )}

                        {activeTab === "ficha" && (
                            <div className="tab-ficha">
                                <p><strong>Nombre:</strong> {paciente.firstName} {paciente.lastName}</p>
                                <p><strong>DNI:</strong> {paciente.dni}</p>
                                <p><strong>Fecha de nacimiento:</strong> {paciente.birthDate.split("T")[0]}</p>
                                <p><strong>Email:</strong> {paciente.email || "No disponible"}</p>
                                <p><strong>Teléfono:</strong> {paciente.phone || "No disponible"}</p>
                                <p><strong>Motivo de consulta:</strong> {paciente.motivoConsulta || "No disponible"}</p>
                            </div>
                        )}

                        {activeTab === "historia" && (
                            <div className="tab-historia">
                                <div className="historia-clinica-header">
                                    <h3>Historia Clínica</h3>
                                    <button onClick={openAddModal} className="btn-add-history">+ Agregar Historia Clínica</button>
                                </div>

                                {showAddModal && (
                                    <div className="modal-backdrop">
                                        <div className="modal-content">
                                            <h4>Agregar historia clínica</h4>
                                            <MenuBar editor={addEditor} />
                                            <EditorContent editor={addEditor} />
                                            <div className="modal-buttons">
                                                <button onClick={() => setShowAddModal(false)}>Cancelar</button>
                                                <button onClick={handleSaveHistoria}>Guardar</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showEditModal && editHistoria && (
                                    <div className="modal-backdrop">
                                        <div className="modal-content">
                                            <h4>Editar historia clínica</h4>
                                            <MenuBar editor={editEditor} />
                                            <EditorContent editor={editEditor} />
                                            <div className="modal-buttons">
                                                <button onClick={() => {
                                                    setShowEditModal(false);
                                                    setEditHistoria(null);
                                                }}>Cancelar</button>
                                                <button onClick={handleSaveEditHistoria}>Guardar</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <ClinicalHistoryCard historias={historias} onDelete={handleDeleteHistoria} onEdit={handleOpenEdit} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
