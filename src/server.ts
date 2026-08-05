import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import { GoogleGenAI } from '@google/genai';

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
    role: 'Líder / Capitán' | 'Integrante' | 'Tutor / Asesor';
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
    categoryName: 'Proyectos educativos en robótica',
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
  if (cat === 'educativos') return 'Proyectos educativos en robótica';
  return 'Proyecto de automatización electrónica';
}

// REST API Endpoints
app.get('/api/registrations', (req, res) => {
  const category = req.query['category'] as string;
  const search = (req.query['search'] as string || '').toLowerCase();

  let filtered = [...registrations];
  if (category && category !== 'all') {
    filtered = filtered.filter(r => r.category === category);
  }
  if (search) {
    filtered = filtered.filter(r =>
      r.teamName.toLowerCase().includes(search) ||
      r.projectTitle.toLowerCase().includes(search) ||
      r.institution.toLowerCase().includes(search) ||
      r.city.toLowerCase().includes(search) ||
      r.code.toLowerCase().includes(search) ||
      r.leaderName.toLowerCase().includes(search)
    );
  }
  return res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/registrations/:codeOrId', (req, res) => {
  const param = req.params.codeOrId.toUpperCase().trim();
  const found = registrations.find(r => 
    r.code.toUpperCase() === param || 
    r.id.toUpperCase() === param ||
    r.leaderDoc.trim() === param ||
    r.leaderEmail.toLowerCase() === param.toLowerCase()
  );

  if (!found) {
    return res.status(404).json({ success: false, message: 'Registro no encontrado con el código o documento ingresado' });
  }
  return res.json({ success: true, data: found });
});

app.post('/api/registrations', (req, res) => {
  try {
    const body = req.body;
    if (!body.teamName || !body.leaderName || !body.leaderEmail || !body.category) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para el registro.' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const catCode = body.category === 'seguidores' ? 'S' : body.category === 'educativos' ? 'E' : 'A';
    const code = `NOBSA-ROB-2026-${catCode}${randomNum}`;

    const newReg: RegistrationItem = {
      id: `reg-${Date.now()}`,
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
      members: body.members || [
        { id: 'm-leader', fullName: body.leaderName, documentId: body.leaderDoc, role: 'Líder / Capitán', email: body.leaderEmail, phone: body.leaderPhone }
      ],
      projectDescription: body.projectDescription || '',
      technicalSpecs: body.technicalSpecs || '',
      spaceRequirements: body.spaceRequirements || '',
      status: 'Confirmado'
    };

    registrations.unshift(newReg);
    return res.status(201).json({ success: true, message: 'Inscripción registrada con éxito', data: newReg });
  } catch {
    return res.status(500).json({ success: false, message: 'Error en el servidor procesando la inscripción' });
  }
});

app.put('/api/registrations/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = registrations.find(r => r.id === id || r.code === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
  }
  item.status = status;
  return res.json({ success: true, message: 'Estado actualizado correctamente', data: item });
});

app.delete('/api/registrations/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = registrations.length;
  registrations = registrations.filter(r => r.id !== id && r.code !== id);
  if (registrations.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
  }
  return res.json({ success: true, message: 'Inscripción eliminada correctamente' });
});

app.get('/api/stats', (_req, res) => {
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
      reply += "La feria cuenta con 3 categorías principales:\n1. Proyecto de automatización electrónica\n2. Seguidores de línea\n3. Proyectos educativos en robótica. ¿Sobre cuál te gustaría saber más requisitos?";
    } else if (msgLower.includes('fecha') || msgLower.includes('cuándo') || msgLower.includes('donde') || msgLower.includes('lugar')) {
      reply += "El evento se llevará a cabo los días 20 y 21 de Noviembre de 2026 en el Centro Cultural y Polideportivo Municipal de Nobsa, Boyacá, Colombia. ¡Inscripciones abiertas!";
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
export const reqHandler = createNodeRequestHandler(app);
