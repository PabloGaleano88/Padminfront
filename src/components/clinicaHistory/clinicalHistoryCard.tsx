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
    onEdit: (historia: HistoriaClinica) => void;
}

export default function ClinicalHistoryCard({ historias, onDelete, onEdit }: Props) {
    if (historias.length === 0) {
        return <p>No hay historias clínicas para este paciente.</p>;
    }

    return (
        <div className="clinical-history-list">
            {historias.map((historia) => (
                <div key={historia._id} className="historia-card">
                    <p><strong>Fecha:</strong> {new Date(historia.date).toLocaleString()}</p>
                    <div>
                        <strong></strong>
                        <div dangerouslySetInnerHTML={{ __html: historia.observations }} />
                    </div>

                    <div className="historia-actions">
                        <button onClick={() => onEdit(historia)}>✎ Editar</button>
                        <button onClick={() => onDelete(historia._id)}>🗑 Eliminar</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
