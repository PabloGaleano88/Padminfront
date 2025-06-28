import "./patientDetail.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClinicalHistoryCard from "../clinicaHistory/clinicalHistoryCard";
import DashboardHeader from "../dashboardHeader/dashboardHeader";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError("");

        fetch(`http://localhost:3000/api/patients/${id}`, {
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

        fetch(`http://localhost:3000/api/clinicalhistory/patient/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Error al obtener la historia clínica");
                return res.json();
            })
            .then((data) => setHistorias(data))
            .catch((err) => console.error("Error al obtener historia clínica:", err));
    };

    const openAddModal = () => {
        setShowAddModal(true);
        setNewHistoriaContent("");
        addEditor?.commands.setContent("");
    };

    const handleSaveHistoria = async () => {
        if (!newHistoriaContent.trim() || newHistoriaContent === "<p></p>") {
            alert("La historia clínica no puede estar vacía.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/clinicalhistory", {
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

            if (!res.ok) throw new Error("Error al guardar historia clínica");

            setShowAddModal(false);
            setNewHistoriaContent("");
            addEditor?.commands.clearContent();
            fetchHistorias();
        } catch (error) {
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
            const res = await fetch(`http://localhost:3000/api/clinicalhistory/${editHistoria._id}`, {
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

            if (!res.ok) throw new Error("Error al editar historia clínica");

            setShowEditModal(false);
            setEditHistoria(null);
            setEditHistoriaContent("");
            editEditor?.commands.clearContent();
            fetchHistorias();
        } catch (error) {
            alert("Error al editar historia clínica");
        }
    };

    const handleDeleteHistoria = async (historiaId: string) => {
        if (!window.confirm("¿Seguro que querés eliminar esta historia clínica?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/clinicalhistory/${historiaId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("No se pudo eliminar la historia clínica");

            alert("Historia clínica eliminada correctamente");
            fetchHistorias();
        } catch (error) {
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
                                <p><strong>Próxima sesión:</strong> Próximamente</p>
                                <p><strong>Historial de pagos:</strong> Próximamente</p>
                            </div>
                        )}

                        {activeTab === "ficha" && (
                            <div className="tab-ficha">
                                <p><strong>Nombre:</strong> {paciente.firstName} {paciente.lastName}</p>
                                <p><strong>DNI:</strong> {paciente.dni}</p>
                                <p><strong>Fecha de nacimiento:</strong> {new Date(paciente.birthDate).toLocaleDateString()}</p>
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
