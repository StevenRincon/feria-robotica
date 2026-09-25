import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  CategoryInfo,
  CategoryId,
  FaqItem,
  Registration,
  RegistrationStats,
  RegistrationStatus,
} from '../models/registration.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private http = inject(HttpClient);

  // Signals for reactive application state
  registrations = signal<Registration[]>([]);
  stats = signal<RegistrationStats | null>(null);
  loading = signal<boolean>(false);
  activeCategoryFilter = signal<CategoryId | 'all'>('all');
  selectedCategoryForForm = signal<CategoryId>('automatizacion');
  currentRegistrationResult = signal<Registration | null>(null);

  // Categories static data
  readonly categories: CategoryInfo[] = [
    {
      id: 'automatizacion',
      title: 'Automatización electrónica o Robótica para bachillerato',
      shortDesc: 'Proyectos de automatización electrónica o robótica para estudiantes de bachillerato.',
      fullDesc: 'Categoría dirigida a estudiantes de bachillerato que presenten proyectos funcionales de automatización electrónica o robótica, con una solución clara y demostrable.',
      icon: 'settings_suggest',
      badgeColor: 'from-cyan-500 to-blue-600',
      rulesUrl: 'https://drive.google.com/file/d/1HUENKtHlQCZwDXKBrvjvA-Ko0jyXRHq9/view?usp=sharing',
      rulesHighlights: [
        'Participación para estudiantes de bachillerato.',
        'El proyecto debe ser funcional y demostrable.',
        'Se debe presentar el proyecto ante el jurado.',
        'Consultar el reglamento y las especificaciones anexas.'
      ],
      specs: {
        maxTeamSize: 2,
        targetAudience: 'Estudiantes de bachillerato.',
        dimensionsOrTrack: 'Máximo 2 estudiantes y 1 docente acompañante.'
      }
    },
    {
      id: 'seguidores',
      title: 'Seguidores de Línea',
      shortDesc: 'Robots autónomos que siguen una línea en una pista de competencia.',
      fullDesc: 'Competencia para robots seguidores de línea. Consulta el reglamento anexo para conocer las características de la pista y las condiciones de participación.',
      icon: 'alt_route',
      badgeColor: 'from-amber-400 to-orange-500',
      rulesUrl: 'https://drive.google.com/file/d/1uaH3uHD7JACTWoe92Q0LhFLWD-bPPStu/view?usp=sharing',
      rulesHighlights: [
        'Robot autónomo para seguir una línea.',
        'La competencia se realizará en la pista oficial.',
        'Consultar medidas y condiciones en el reglamento.',
        'Revisar las especificaciones técnicas antes de inscribirse.'
      ],
      specs: {
        maxTeamSize: 2,
        targetAudience: 'Participantes del concurso de seguidores de línea.',
        dimensionsOrTrack: 'Máximo 2 estudiantes y 1 docente acompañante.'
      }
    },
    {
      id: 'educativos',
      title: 'Proyectos de Automatización, Electrónica o Robótica para Primaria',
      shortDesc: 'Proyectos de automatización, electrónica o robótica desarrollados para primaria.',
      fullDesc: 'Categoría para proyectos de automatización, electrónica o robótica dirigidos a estudiantes de primaria, con una propuesta clara, creativa y demostrable.',
      icon: 'school',
      badgeColor: 'from-emerald-400 to-teal-600',
      rulesUrl: 'https://drive.google.com/file/d/1szGb3hhYkVfYdFAts_XL0_24Np4Vcood/view?usp=sharing',
      rulesHighlights: [
        'Participación para estudiantes de primaria.',
        'El proyecto debe relacionarse con automatización, electrónica o robótica.',
        'Se valorará la creatividad y la explicación del proyecto.',
        'Consultar el reglamento y las especificaciones anexas.'
      ],
      specs: {
        maxTeamSize: 2,
        targetAudience: 'Estudiantes de primaria.',
        dimensionsOrTrack: 'Máximo 2 estudiantes y 1 docente acompañante.'
      }
    }
  ];

  // Static FAQs
  readonly faqs: FaqItem[] = [
    {
      id: 'f1',
      question: '¿La inscripción tiene algún costo?',
      answer: 'No. La inscripción a la Feria de Robótica Nobsa 2026 es 100% gratuita para todas las categorías e instituciones públicas y privadas.',
      category: 'General'
    },
    {
      id: 'f2',
      question: '¿Quiénes pueden participar en la Feria?',
      answer: 'Pueden participar estudiantes de primaria, secundaria, aprendices SENA, universitarios, docentes, e inventores independientes de Nobsa, Boyacá y de todo el país.',
      category: 'General'
    },
    {
      id: 'f3',
      question: '¿Cuántos integrantes pueden conformar un equipo?',
      answer: 'Cada proyecto puede inscribir máximo 2 estudiantes y 1 docente acompañante.',
      category: 'Requisitos'
    },
    {
      id: 'f4',
      question: '¿Cuál es la fecha límite de inscripción?',
      answer: 'El concurso se realizará el viernes 6 de noviembre de 2026. Consulta la organización para conocer el cierre de inscripciones.',
      category: 'Inscripción'
    },
    {
      id: 'f5',
      question: '¿Cómo obtengo mi acreditación digital?',
      answer: 'Inmediatamente después de completar el formulario, el sistema genera tu credencial con un código QR único. También puedes consultar tu acreditación en cualquier momento ingresando tu código o número de documento en el buscador.',
      category: 'Inscripción'
    },
    {
      id: 'f6',
      question: '¿Habrá alimentación y punto de recarga para baterías?',
      answer: 'Sí. Por proyecto se ofrecerá un refrigerio y almuerzo para máximo 2 estudiantes y 1 docente acompañante.',
      category: 'Competencia'
    }
  ];

  constructor() {
    this.loadRegistrations();
    this.loadStats();
  }

  loadRegistrations(category?: string, search?: string): Observable<Registration[]> {
    this.loading.set(true);
    let url = '/api/registrations';
    const params: string[] = [];

    if (category && category !== 'all') {
      params.push(`category=${category}`);
    }
    if (search && search.trim()) {
      params.push(`search=${encodeURIComponent(search.trim())}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<{ success: boolean; data: Registration[] }>(url).pipe(
      map(res => res.data || []),
      tap(data => {
        this.registrations.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error loading registrations:', err);
        this.loading.set(false);
        return of(this.registrations());
      })
    );
  }

  loadStats(): Observable<RegistrationStats | null> {
    return this.http.get<{ success: boolean; data: RegistrationStats }>('/api/stats').pipe(
      map(res => res.data),
      tap(data => this.stats.set(data)),
      catchError(err => {
        console.error('Error loading stats:', err);
        return of(null);
      })
    );
  }

  getRegistrationByCodeOrDoc(codeOrDoc: string): Observable<Registration | null> {
    this.loading.set(true);
    return this.http.get<{ success: boolean; data: Registration }>(`/api/registrations/${encodeURIComponent(codeOrDoc)}`).pipe(
      map(res => res.data),
      tap(reg => {
        this.currentRegistrationResult.set(reg);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Registration search error:', err);
        this.currentRegistrationResult.set(null);
        this.loading.set(false);
        return of(null);
      })
    );
  }

  createRegistration(data: Partial<Registration>): Observable<Registration> {
    this.loading.set(true);
    return this.http.post<{ success: boolean; data: Registration }>('/api/registrations', data).pipe(
      map(res => res.data),
      tap(newReg => {
        this.currentRegistrationResult.set(newReg);
        this.loadRegistrations();
        this.loadStats();
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        throw err;
      })
    );
  }

  updateStatus(id: string, status: RegistrationStatus): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`/api/registrations/${id}/status`, { status }).pipe(
      map(res => res.success),
      tap(() => {
        this.loadRegistrations();
        this.loadStats();
      })
    );
  }

  deleteRegistration(id: string): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`/api/registrations/${id}`).pipe(
      map(res => res.success),
      tap(() => {
        this.loadRegistrations();
        this.loadStats();
      })
    );
  }

  downloadCertificate(id: string): Observable<Blob> {
    return this.http.get(`/api/certificates/${encodeURIComponent(id)}`, { responseType: 'blob' });
  }

  exportToCsv(data: Registration[]): void {
    if (!data || data.length === 0) return;

    const headers = [
      'Código',
      'Fecha',
      'Categoría',
      'Nombre Equipo',
      'Proyecto',
      'Institución',
      'Tipo Institución',
      'Municipio',
      'Líder',
      'Documento',
      'Email',
      'Teléfono',
      'Estado'
    ];

    const rows = data.map(r => [
      r.code,
      r.createdAt.substring(0, 10),
      `"${r.categoryName}"`,
      `"${r.teamName}"`,
      `"${r.projectTitle.replace(/"/g, '""')}"`,
      `"${r.institution.replace(/"/g, '""')}"`,
      `"${r.institutionType}"`,
      `"${r.city}"`,
      `"${r.leaderName}"`,
      `"${r.leaderDoc}"`,
      `"${r.leaderEmail}"`,
      `"${r.leaderPhone}"`,
      `"${r.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Feria_Robotica_Nobsa_Inscripciones_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(data: Registration[]): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Inscripciones_Nobsa_Robotics_2026.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
