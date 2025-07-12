interface ClinicalHistory {
    _id: string;
    date: string;
    description: string;
    // otros campos que tengas
}

interface Paciente {
    _id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    email?: string;
    motivoConsulta?: string;
    phone?: string;
    proximoTurno?: Turno | null;
}