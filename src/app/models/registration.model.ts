export type CategoryId = 'automatizacion' | 'seguidores' | 'educativos';

export type RegistrationStatus = 'Confirmado' | 'En revisión' | 'Aprobado' | 'Pendiente';

export interface TeamMember {
  id: string;
  fullName: string;
  documentId: string;
  role: 'Líder / Capitán' | 'Integrante' | 'Tutor / Asesor';
  email?: string;
  phone?: string;
}

export interface Registration {
  id: string;
  code: string; // e.g. NOBSA-ROB-2026-X892
  createdAt: string; // ISO date
  category: CategoryId;
  categoryName: string;
  teamName: string;
  projectTitle: string;
  institution: string;
  institutionType: 'Colegio / I.E.' | 'Universidad / SENA' | 'Club / Independiente' | 'Empresa / StartUp';
  city: string;
  department: string;
  leaderName: string;
  leaderDoc: string;
  leaderEmail: string;
  leaderPhone: string;
  mentorName?: string;
  mentorDoc?: string;
  members: TeamMember[];
  projectDescription: string;
  technicalSpecs?: string;
  spaceRequirements?: string;
  status: RegistrationStatus;
  qrCodeUrl?: string;
}

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  badgeColor: string;
  prizes: string[];
  rulesHighlights: string[];
  specs: {
    maxTeamSize: number;
    targetAudience: string;
    dimensionsOrTrack?: string;
  };
}

export interface RegistrationStats {
  totalTeams: number;
  totalParticipants: number;
  totalMunicipalities: number;
  byCategory: {
    automatizacion: number;
    seguidores: number;
    educativos: number;
  };
  byStatus: {
    confirmado: number;
    pendiente: number;
    aprobado: number;
  };
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Requisitos' | 'Competencia' | 'Inscripción';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
