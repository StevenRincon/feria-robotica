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
      title: 'Proyecto de Automatización Electrónica',
      shortDesc: 'Sistemas inteligentes, control industrial, domótica, IoT y agrotecnología.',
      fullDesc: 'Diseñado para prototipos funcionales que integren sensores, microcontroladores, actuadores y lógica de control electrónica para solucionar problemas reales en la industria, campo o ciudad.',
      icon: 'settings_suggest',
      badgeColor: 'from-cyan-500 to-blue-600',
      prizes: ['1er Lugar: $3,000,000 COP + Trofeo + Kit de Desarrollo', '2do Lugar: $1,500,000 COP + Medalla', '3er Lugar: $800,000 COP'],
      rulesHighlights: [
        'Prototipos funcionales operativos durante la evaluación.',
        'Mantenimiento de consumo eléctrico seguro (Máximo 110V 15A).',
        'Presentación oral de 10 minutos ante jurado técnico.',
        'Documentación técnica básica disponible en físico/digital.'
      ],
      specs: {
        maxTeamSize: 4,
        targetAudience: 'Estudiantes de secundaria, universitarios, aprendices SENA e independientes.',
        dimensionsOrTrack: 'Espacio de mesa asignado: 1.5m x 1.0m'
      }
    },
    {
      id: 'seguidores',
      title: 'Seguidores de Línea',
      shortDesc: 'Robots autónomos de alta velocidad y precisión sobre pistas de contraste.',
      fullDesc: 'Competencia en pista cerrada de fondo blanco con línea negra. Los robots velocistas deben completar el circuito de curvas y rectas en el menor tiempo registrado autónomamente.',
      icon: 'alt_route',
      badgeColor: 'from-amber-400 to-orange-500',
      prizes: ['1er Lugar: $2,500,000 COP + Trofeo de Velocidad', '2do Lugar: $1,200,000 COP + Medalla', '3er Lugar: $600,000 COP'],
      rulesHighlights: [
        'Ancho de línea negra: 19 mm ± 1 mm sobre fondo blanco.',
        'Dimensiones del robot: Máximo 25cm de largo x 25cm de ancho sin límite de peso.',
        'Autonomía total: Sin ningún tipo de control remoto o comunicación inalámbrica.',
        '3 intentos por equipo; se registrará la mejor vuelta válida.'
      ],
      specs: {
        maxTeamSize: 3,
        targetAudience: 'Clubes de robótica, estudiantes de colegio y universitarios.',
        dimensionsOrTrack: 'Pista de MDF laminada 4m x 2.5m con curvas de radio min 15cm.'
      }
    },
    {
      id: 'educativos',
      title: 'Proyectos Educativos en Robótica',
      shortDesc: 'Kits pedagógicos, robots didácticos y experiencias STEM e inclusivas.',
      fullDesc: 'Iniciativas enfocadas en la enseñanza de programación, electrónica y pensamiento computacional, desarrolladas para escuelas, instituciones o proyectos de impacto social.',
      icon: 'school',
      badgeColor: 'from-emerald-400 to-teal-600',
      prizes: ['1er Lugar: $2,000,000 COP + Kit de Aula STEM', '2do Lugar: $1,000,000 COP + Reconocimiento', '3er Lugar: $500,000 COP'],
      rulesHighlights: [
        'Enfoque metodológico claro y aplicación en entornos educativos.',
        'Demostración interactiva abierta al público asistente.',
        'Evaluación de creatividad, accesibilidad y facilidad de uso.',
        'Permitido uso de plataformas libres (Arduino, Micro:bit, LEGO, Raspberry, Scratch).'
      ],
      specs: {
        maxTeamSize: 5,
        targetAudience: 'Docentes, estudiantes de primaria/bachillerato, semilleros de investigación.',
        dimensionsOrTrack: 'Stand de exhibición en la zona de feria interactiva.'
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
      answer: 'Según la categoría: Automatización hasta 4 integrantes, Seguidores de línea hasta 3 integrantes, y Proyectos Educativos hasta 5 integrantes. Todos los equipos pueden inscribir 1 mentor/tutor.',
      category: 'Requisitos'
    },
    {
      id: 'f4',
      question: '¿Cuál es la fecha límite de inscripción?',
      answer: 'Las inscripciones estarán abiertas hasta el 12 de Noviembre de 2026 a las 11:59 PM o hasta agotar los cupos máximos por categoría.',
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
      answer: 'Sí. El recinto del Centro Cultural y Polideportivo Municipal de Nobsa contará con zona de pit/boxes equipada con tomas eléctricas de 110V y estación de hidratación para participantes.',
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
