import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import {
  countInstitutionCategoryRegistrations,
  findRegistrationByCodeOrDocument,
  hasDuplicateParticipantDocuments,
  registrationsCollection,
  updateRegistrationStatus,
} from './server/database';
import type { Registration, RegistrationStatus } from './app/models/registration.model';
import { createParticipationCertificate } from './server/certificate';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// Memory store for registrations
interface RegistrationItem {
  id: string;
  code: string;
  createdAt: string;
  category: 'automatizacion' | 'seguidores' | 'educativos';
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
  members: {
    id: string;
    fullName: string;
    documentId: string;
    role: 'Líder / Capitán' | 'Integrante' | 'Docente / Profesor';
    email?: string;
    phone?: string;
  }[];
  projectDescription: string;
  technicalSpecs?: string;
  spaceRequirements?: string;
  status: 'Confirmado' | 'En revisión' | 'Aprobado' | 'Pendiente';
}

let registrations: RegistrationItem[] = [
  {
    id: 'reg-001',
    code: 'NOBSA-ROB-2026-A812',
    createdAt: new Date('2026-08-01T10:30:00Z').toISOString(),
    category: 'automatizacion',
    categoryName: 'Proyecto de automatización electrónica',
    teamName: 'AgroBot Nobsa',
    projectTitle: 'Invernadero Autónomo Inteligente con Control LoRaWAN y Sensores Agro',
    institution: 'I.E. Técnico Industrial de Nobsa',
    institutionType: 'Colegio / I.E.',
    city: 'Nobsa',
    department: 'Boyacá',
    leaderName: 'Santiago Andrés Vargas',
    leaderDoc: '1002384912',
    leaderEmail: 'santiago.vargas@ietinobsa.edu.co',
    leaderPhone: '3104589211',
    mentorName: 'Ing. Mateo Restrepo',
    mentorDoc: '74128941',
    members: [
      { id: 'm1', fullName: 'Santiago Andrés Vargas', documentId: '1002384912', role: 'Líder / Capitán', email: 'santiago.vargas@ietinobsa.edu.co' },
      { id: 'm2', fullName: 'Mariana Silva Reyes', documentId: '1002981245', role: 'Integrante' },
      { id: 'm3', fullName: 'Diego Fernando Lopez', documentId: '1003491028', role: 'Integrante' }
    ],
    projectDescription: 'Sistema automatizado para la medición y control de temperatura, humedad relativa y fertirriego en invernaderos de hortalizas utilizando microcontroladores ESP32 y sensores capacitivos.',
    technicalSpecs: 'Microcontrolador ESP32-S3, relés de estado sólido, sensores SHT31, pantalla OLED 0.96", electroválvulas 12V.',
    spaceRequirements: 'Mesa de 1.5m x 1m, toma corriente 110V 10A.',
    status: 'Aprobado'
  },
  {
    id: 'reg-002',
    code: 'NOBSA-ROB-2026-S491',
    createdAt: new Date('2026-08-02T14:15:00Z').toISOString(),
    category: 'seguidores',
    categoryName: 'Seguidores de línea',
    teamName: 'SpeedRunner UPTC',
    projectTitle: 'Velocista Autónomo Pro de Alta Adherencia con Control PID',
    institution: 'Universidad Pedagógica y Tecnológica de Colombia (UPTC)',
    institutionType: 'Universidad / SENA',
    city: 'Sogamoso',
    department: 'Boyacá',
    leaderName: 'Valeria Gomez Peña',
    leaderDoc: '1018239041',
    leaderEmail: 'valeria.gomez@uptc.edu.co',
    leaderPhone: '3209841203',
    mentorName: 'Prof. Hernán Ramírez',
    mentorDoc: '19482019',
    members: [
      { id: 'm10', fullName: 'Valeria Gomez Peña', documentId: '1018239041', role: 'Líder / Capitán' },
      { id: 'm11', fullName: 'Juan David Becerra', documentId: '1019284012', role: 'Integrante' }
    ],
    projectDescription: 'Robot velocista diseñado para recorrido óptimo de pistas con curvas cerradas, usando regleta de 8 sensores infrarrojos QTR-8A y algoritmo PID optimizado con turbina de succión aerodinámica.',
    technicalSpecs: 'Procesador STM32, motores N20 1000RPM con encoder, driver TB6612FNG, batería LiPo 3S 850mAh.',
    spaceRequirements: 'Área de boxes con toma eléctrica para recarga de baterías.',
    status: 'Aprobado'
  },
  {
    id: 'reg-003',
    code: 'NOBSA-ROB-2026-E102',
    createdAt: new Date('2026-08-03T09:00:00Z').toISOString(),
    category: 'educativos',
    categoryName: 'Proyectos de automatización, electrónica o robótica para primaria',
    teamName: 'RoboKids Duitama',
    projectTitle: 'Kit Interactivo de Robótica Educativa para Escuelas Rurales',
    institution: 'Colegio Salesiano de Duitama',
    institutionType: 'Colegio / I.E.',
    city: 'Duitama',
    department: 'Boyacá',
    leaderName: 'Carlos Mario Ramos',
    leaderDoc: '1049281023',
    leaderEmail: 'cmario.ramos@salesianoduitama.edu.co',
    leaderPhone: '3158921044',
    mentorName: 'Dra. Claudia Patricia Niño',
    mentorDoc: '40192831',
    members: [
      { id: 'm20', fullName: 'Carlos Mario Ramos', documentId: '1049281023', role: 'Líder / Capitán' },
      { id: 'm21', fullName: 'Paula Andrea Camargo', documentId: '1049928192', role: 'Integrante' }
    ],
    projectDescription: 'Plataforma didáctica con módulos magnéticos para enseñar fundamentos de programación en bloque, robótica y pensamiento computacional en instituciones educativas rurales de Boyacá.',
    technicalSpecs: 'Bloques impresos en 3D con conectores magnéticos pogo-pin, tarjeta micro:bit, guía interactiva web.',
    spaceRequirements: 'Mesa de exhibición interactiva 2m x 1m.',
    status: 'Aprobado'
  },
  {
    id: 'reg-004',
    code: 'NOBSA-ROB-2026-A520',
    createdAt: new Date('2026-08-04T11:45:00Z').toISOString(),
    category: 'automatizacion',
    categoryName: 'Proyecto de automatización electrónica',
    teamName: 'EcoWatt Nobsa',
    projectTitle: 'Monitor Inteligente de Consumo Industrial e Inversor Solar',
    institution: 'SENA Centro Industrial Nobsa',
    institutionType: 'Universidad / SENA',
    city: 'Nobsa',
    department: 'Boyacá',
    leaderName: 'Lina Marcela Torres',
    leaderDoc: '1052938102',
    leaderEmail: 'lina.torres@sena.edu.co',
    leaderPhone: '3114920192',
    members: [
      { id: 'm30', fullName: 'Lina Marcela Torres', documentId: '1052938102', role: 'Líder / Capitán' },
      { id: 'm31', fullName: 'Camilo Ernesto Ruiz', documentId: '1053019283', role: 'Integrante' }
    ],
    projectDescription: 'Sistema de telemetría energética para medianas industrias metalmecánicas de Nobsa con alertas tempranas de sobrecarga e integración con energía fotovoltaica.',
    technicalSpecs: 'Sensor PZEM-004T, microcontrolador ESP32, Dashboard MQTT web.',
    spaceRequirements: 'Punto de energía 110V y conexión WiFi.',
    status: 'En revisión'
  }
];

function getCategoryName(cat: string): string {
  if (cat === 'seguidores') return 'Seguidores de línea';
  if (cat === 'educativos') return 'Proyectos de automatización, electrónica o robótica para primaria';
  return 'Automatización electrónica o Robótica para bachillerato';
}

// REST API Endpoints
app.get('/api/registrations', async (req, res) => {
  const category = req.query['category'] as string;
  const search = (req.query['search'] as string || '').toLowerCase();

  const query: Record<string, unknown> = {};
  if (category && category !== 'all') query['category'] = category;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query['$or'] = ['teamName', 'projectTitle', 'institution', 'city', 'code', 'leaderName', 'leaderDoc', 'mentorName', 'mentorDoc']
      .map(field => ({ [field]: { $regex: escapedSearch, $options: 'i' } }));
  }

  try {
    const data = await (await registrationsCollection()).find(query).sort({ createdAt: -1 }).toArray();
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error consultando inscripciones:', error);
    return res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
  }
});

app.get('/api/registrations/:codeOrId', async (req, res) => {
  try {
    const found = await findRegistrationByCodeOrDocument(req.params.codeOrId);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado con el código o documento ingresado' });
    }
    return res.json({ success: true, data: found });
  } catch (error) {
    console.error('Error consultando inscripción:', error);
    return res.status(503).json({ success: false, message: 'La base de datos no está disponible.' });
  }
});

app.get('/api/certificates/:id', async (req, res) => {
  try {
    const registration = await findRegistrationByCodeOrDocument(req.params.id);
    if (!registration) return res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
    if (!registration.mentorName || !registration.mentorDoc) return res.status(422).json({ success: false, message: 'El proyecto no tiene docente a cargo registrado.' });
    const pdf = await createParticipationCertificate(registration);
    const filename = `Certificado_${registration.projectTitle.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdf);
  } catch (error) {
    console.error('Error generando certificado:', error);
    return res.status(500).json({ success: false, message: 'No fue posible generar el certificado.' });
  }
});

app.post('/api/registrations', async (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.teamName || !body.projectTitle || !body.institution || !body.leaderName || !body.leaderDoc || !body.leaderEmail || !body.leaderPhone || !body.mentorName || !body.mentorDoc || !body.category || !body.projectDescription) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para el registro.' });
    }

    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!/^\d+$/.test(String(body.leaderDoc)) || !/^\d+$/.test(String(body.mentorDoc))) {
      return res.status(400).json({ success: false, message: 'Los documentos deben contener únicamente números.' });
    }
    if (!/^\d{10}$/.test(String(body.leaderPhone))) {
      return res.status(400).json({ success: false, message: 'El celular debe contener exactamente 10 dígitos.' });
    }
    if (!emailPattern.test(String(body.leaderEmail))) {
      return res.status(400).json({ success: false, message: 'El correo electrónico no tiene un formato válido.' });
    }

    if (!['automatizacion', 'seguidores', 'educativos'].includes(body.category)) {
      return res.status(400).json({ success: false, message: 'La categoría de inscripción no es válida.' });
    }

    const institutionCategoryCount = await countInstitutionCategoryRegistrations(body.institution, body.category);
    if (institutionCategoryCount >= 2) {
      return res.status(409).json({
        success: false,
        message: 'Esta institución ya tiene el máximo de dos proyectos inscritos en esta categoría.'
      });
    }

    const requestedMembers = Array.isArray(body.members) ? body.members : [];
    if (requestedMembers.length > 1) {
      return res.status(400).json({ success: false, message: 'Una inscripción permite máximo dos estudiantes y un profesor.' });
    }
    if (requestedMembers.some((member: { fullName?: string; documentId?: string }) => !member.fullName || !member.documentId || !/^\d+$/.test(String(member.documentId)))) {
      return res.status(400).json({ success: false, message: 'Cada estudiante debe tener nombre y documento.' });
    }

    const members = [
      { id: `member-${randomUUID()}`, fullName: body.leaderName, documentId: body.leaderDoc, role: 'Líder / Capitán' as const, email: body.leaderEmail, phone: body.leaderPhone },
      ...requestedMembers.map((member: { fullName: string; documentId: string }) => ({
        id: `member-${randomUUID()}`,
        fullName: member.fullName,
        documentId: member.documentId,
        role: 'Integrante' as const
      }))
    ];
    const participantDocuments = [body.leaderDoc, ...requestedMembers.map((member: { documentId: string }) => member.documentId), body.mentorDoc].filter(Boolean);
    if (new Set(participantDocuments).size !== participantDocuments.length) {
      return res.status(400).json({ success: false, message: 'Los documentos de los participantes deben ser diferentes.' });
    }
    if (await hasDuplicateParticipantDocuments(participantDocuments)) {
      return res.status(409).json({ success: false, message: 'Uno de los documentos ya pertenece a otra inscripción.' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const catCode = body.category === 'seguidores' ? 'S' : body.category === 'educativos' ? 'E' : 'A';
    const code = `NOBSA-ROB-2026-${catCode}${randomNum}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

    const newReg: Registration = {
      id: `reg-${randomUUID()}`,
      code,
      createdAt: new Date().toISOString(),
      category: body.category,
      categoryName: getCategoryName(body.category),
      teamName: body.teamName,
      projectTitle: body.projectTitle || 'Proyecto de Robótica',
      institution: body.institution || 'Independiente',
      institutionType: body.institutionType || 'Colegio / I.E.',
      city: body.city || 'Nobsa',
      department: body.department || 'Boyacá',
      leaderName: body.leaderName,
      leaderDoc: body.leaderDoc || '',
      leaderEmail: body.leaderEmail,
      leaderPhone: body.leaderPhone || '',
      mentorName: body.mentorName || '',
      mentorDoc: body.mentorDoc || '',
      members,
      projectDescription: body.projectDescription || '',
      technicalSpecs: body.technicalSpecs || '',
      spaceRequirements: body.spaceRequirements || '',
      status: 'Confirmado'
    };

    await (await registrationsCollection()).insertOne(newReg);
    return res.status(201).json({ success: true, message: 'Inscripción registrada con éxito', data: newReg });
  } catch (error) {
    console.error('Error guardando inscripción:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ success: false, message: 'El código de inscripción ya existe, intenta de nuevo.' });
    }
    return res.status(500).json({ success: false, message: 'Error en el servidor procesando la inscripción' });
  }
});

app.put('/api/registrations/:id/status', async (req, res) => {
  const { id } = req.params;
  const status = req.body.status as RegistrationStatus;
  if (!['Confirmado', 'En revisión', 'Aprobado', 'Pendiente'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado de inscripción no válido.' });
  }
  const item = await updateRegistrationStatus(id, status);
  if (!item) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
  return res.json({ success: true, message: 'Estado actualizado correctamente', data: item });
});

app.delete('/api/registrations/:id', async (req, res) => {
  const { id } = req.params;
  const result = await (await registrationsCollection()).deleteOne({ $or: [{ id }, { code: id }] });
  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
  }
  return res.json({ success: true, message: 'Inscripción eliminada correctamente' });
});

app.get('/api/stats', async (_req, res) => {
  const registrations = await (await registrationsCollection()).find().toArray();
  const totalTeams = registrations.length;
  let totalParticipants = 0;
  const municipalities = new Set<string>();

  const byCategory = {
    automatizacion: 0,
    seguidores: 0,
    educativos: 0
  };

  const byStatus = {
    confirmado: 0,
    pendiente: 0,
    aprobado: 0
  };

  registrations.forEach(r => {
    totalParticipants += (r.members ? r.members.length : 1);
    municipalities.add(r.city.toLowerCase().trim());
    if (r.category in byCategory) {
      byCategory[r.category]++;
    }
    if (r.status === 'Aprobado') byStatus.aprobado++;
    else if (r.status === 'Confirmado') byStatus.confirmado++;
    else byStatus.pendiente++;
  });

  res.json({
    success: true,
    data: {
      totalTeams,
      totalParticipants,
      totalMunicipalities: municipalities.size,
      byCategory,
      byStatus
    }
  });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Mensaje requerido' });
  }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const msgLower = message.toLowerCase();
    let reply = "¡Hola! Soy NobsaBot, el asistente de la Feria de Robótica Nobsa 2026. ";

    if (msgLower.includes('categor') || msgLower.includes('modalid')) {
      reply += "El concurso cuenta con 3 categorías:\n1. Seguidores de línea\n2. Automatización electrónica o Robótica para bachillerato\n3. Proyectos de automatización, electrónica o Robótica para primaria. ¿Sobre cuál te gustaría saber más requisitos?";
    } else if (msgLower.includes('fecha') || msgLower.includes('cuándo') || msgLower.includes('donde') || msgLower.includes('lugar')) {
      reply += "El III Concurso de robótica y automatización electrónica en la I.E. Técnica de Nazareth se realizará el viernes 6 de noviembre de 2026. Para inquietudes: 3002906330, 3167765610 o 3204197454.";
    } else if (msgLower.includes('requisito') || msgLower.includes('regla') || msgLower.includes('pista')) {
      reply += "Para Seguidores de Línea la pista es de fondo blanco con línea negra de 19mm. Para Automatización y Educativos se evaluará innovación, utilidad práctica y sustentación oral.";
    } else if (msgLower.includes('costo') || msgLower.includes('precio') || msgLower.includes('pago')) {
      reply += "¡La inscripción a la Feria de Robótica Nobsa 2026 es totalmente GRATUITA para colegios, universidades e investigadores!";
    } else {
      reply += "Puedes realizar tu inscripción directamente en la pestaña 'Inscripción', o consultar tu acreditación existente introduciendo tu código de registro o documento de líder.";
    }

    return res.json({ success: true, reply });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const promptText = `Eres "RoboNobsa AI", el asistente oficial inteligente de la Feria de Robótica del Municipio de Nobsa, Boyacá, Colombia (2026).
Responde de manera concisa y clara en español.
Pregunta del usuario: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    const reply = response.text || 'Disculpa, no pude procesar tu respuesta en este momento.';
    return res.json({ success: true, reply });
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    return res.json({
      success: true,
      reply: 'Hola, el servicio inteligente continúa atendiendo inquietudes básicas. Las inscripciones para la Feria de Robótica Nobsa 2026 están abiertas y son 100% gratuitas.'
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export { app };
export const reqHandler = createNodeRequestHandler(app);
