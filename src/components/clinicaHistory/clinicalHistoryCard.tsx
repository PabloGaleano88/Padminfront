
import "./clinicalHistoryCard.css";

interface HistoriaClinica {
    _id: string;
    observations: string;
    diagnosis: string;
    treatment: string;
    date: string;
}

interface Props {
    historias: HistoriaClinica[];
    onDelete: (id: string) => void;
}


export default function ClinicalHistoryCard({ historias, onDelete }: Props) {
    if (historias.length === 0) {
        return <p>No hay historias clínicas para este paciente.</p>;
    }

    return (
        <div className="clinical-history-list">
            {historias.map((historia) => (
                <div key={historia._id} className="clinical-history-card">
                    <p><strong>Fecha:</strong> {new Date(historia.date).toLocaleDateString()}</p>
                    <p><strong>Observaciones:</strong> {historia.observations || "-"}</p>
                    <p><strong>Diagnóstico:</strong> {historia.diagnosis || "-"}</p>
                    <p><strong>Tratamiento:</strong> {historia.treatment || "-"}</p>
                    <button className="btn-delete" onClick={() => onDelete(historia._id)}>Eliminar</button>
                </div>
            ))}
        </div>
    );
}