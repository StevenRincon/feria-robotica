import type { Registration, RegistrationStats } from '../app/models/registration.model';

export function getParticipantDocumentIds(registrations: Registration[]): Set<string> {
  const participantDocuments = new Set<string>();

  registrations.forEach(registration => {
    for (const member of registration.members || []) {
      const documentId = member.documentId.trim();
      if (!documentId) continue;

      if (member.role === 'Líder / Capitán' || member.role === 'Integrante' || member.role === 'Docente / Profesor') {
        participantDocuments.add(documentId);
      }
    }

    const mentorDoc = registration.mentorDoc?.trim();
    if (mentorDoc) participantDocuments.add(mentorDoc);
  });

  return participantDocuments;
}

export function calculateRegistrationStats(registrations: Registration[]): RegistrationStats {
  const studentDocuments = new Set<string>();
  const teacherDocuments = new Set<string>();
  const participantDocuments = getParticipantDocumentIds(registrations);
  const municipalities = new Set<string>();
  const byCategory: RegistrationStats['byCategory'] = {
    automatizacion: 0,
    seguidores: 0,
    educativos: 0
  };
  const byStatus: RegistrationStats['byStatus'] = {
    confirmado: 0,
    pendiente: 0,
    aprobado: 0
  };

  registrations.forEach(registration => {
    for (const member of registration.members || []) {
      const documentId = member.documentId.trim();
      if (!documentId) continue;

      if (member.role === 'Líder / Capitán' || member.role === 'Integrante') {
        studentDocuments.add(documentId);
      } else if (member.role === 'Docente / Profesor') {
        teacherDocuments.add(documentId);
      }
    }

    const mentorDoc = registration.mentorDoc?.trim();
    if (mentorDoc) {
      teacherDocuments.add(mentorDoc);
    }

    municipalities.add(registration.city.toLowerCase().trim());
    byCategory[registration.category]++;
    if (registration.status === 'Aprobado') byStatus.aprobado++;
    else if (registration.status === 'Confirmado') byStatus.confirmado++;
    else byStatus.pendiente++;
  });

  return {
    totalTeams: registrations.length,
    totalParticipants: participantDocuments.size,
    totalStudents: studentDocuments.size,
    totalTeachers: teacherDocuments.size,
    totalMunicipalities: municipalities.size,
    byCategory,
    byStatus
  };
}
