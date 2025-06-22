interface ClinicalHistory {
    _id: string;
    date: string;
    description: string;
    // otros campos que tengas
}

export interface Paciente {
    _id: string;
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    email?: string;
    phone?: string;
    clinicalHistories: ClinicalHistory[];  // <-- aquí
}