import { Injectable, inject, signal } from '@angular/core';
import { ChatMessage } from '../models/registration.model';
import { RegistrationService } from './registration.service';

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  private registrationService = inject(RegistrationService);

  private readonly contactFallback = 'Esa información no aparece en las preguntas frecuentes disponibles. Para mayor información, comunícate a cualquiera de estos teléfonos: 3002906330, 3167765610 o 3204197454.';

  isOpen = signal<boolean>(false);
  loading = signal<boolean>(false);

  messages = signal<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Hola! Soy RoboNobsa AI, el asistente virtual de la Feria de Robótica Nobsa 2026. Puedo responder preguntas sobre categorías, participantes, inscripción, acreditación y servicios del evento.',
      timestamp: new Date()
    }
  ]);

  toggleChat(): void {
    this.isOpen.update(v => !v);
  }

  sendMessage(userText: string): void {
    if (!userText || !userText.trim()) return;

    const text = userText.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    this.messages.update(list => [...list, userMsg]);
    const botMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'bot',
      text: this.answerFromFaqs(text),
      timestamp: new Date()
    };
    this.messages.update(list => [...list, botMsg]);
  }

  private answerFromFaqs(question: string): string {
    const normalized = this.normalize(question);
    const includesAny = (...terms: string[]) => terms.some(term => normalized.includes(term));
    const faqAnswer = (id: string) => this.registrationService.faqs.find(faq => faq.id === id)?.answer ?? this.contactFallback;
    const categoryId = normalized.includes('primaria') || normalized.includes('educativ')
      ? 'educativos'
      : normalized.includes('bachillerato') || normalized.includes('automatizacion')
        ? 'automatizacion'
        : normalized.includes('seguidor') || normalized.includes('linea')
          ? 'seguidores'
          : null;

    if (includesAny('categorias', 'modalidades', 'tipos de competencia')) {
      return `Estas son las categorías del concurso:\n${this.registrationService.categories.map(category => `• ${category.title}`).join('\n')}`;
    }

    if (categoryId) {
      const category = this.registrationService.categories.find(item => item.id === categoryId);
      if (category) return `${category.title}: ${category.fullDesc}`;
    }

    if (includesAny('categoria', 'modalidad')) {
      return `Estas son las categorías del concurso:\n${this.registrationService.categories.map(category => `• ${category.title}`).join('\n')}`;
    }

    if (includesAny('costo', 'cuesta', 'gratis', 'gratuita', 'gratuito', 'precio', 'pago', 'cobran', 'valor de la inscripcion')) {
      return faqAnswer('f1');
    }

    if (includesAny('maximo', 'maxima', 'integrante', 'miembro', 'tamano del equipo', 'cuantos estudiantes', 'docente acompanante', 'profesor acompanante')) {
      return faqAnswer('f3');
    }

    if (includesAny('quien puede', 'quienes pueden', 'quien participa', 'quienes participan', 'puedo participar', 'participar en la feria', 'participantes')) {
      return faqAnswer('f2');
    }

    if (includesAny('acreditacion', 'credencial', 'codigo qr', 'qr', 'escanear')) {
      return faqAnswer('f5');
    }

    const asksLocation = includesAny('donde', 'lugar', 'sede', 'direccion');
    const asksDate = includesAny('fecha', 'cuando', 'que dia', 'dia del evento', 'se realiza', 'se realizara', 'cierre de inscripciones', 'fecha limite');
    if (asksLocation && asksDate) {
      return `${faqAnswer('f4')} La sede exacta no está especificada en las preguntas frecuentes. Para confirmarla, comunícate a cualquiera de estos teléfonos: 3002906330, 3167765610 o 3204197454.`;
    }
    if (asksLocation) return this.contactFallback;
    if (asksDate) return faqAnswer('f4');

    if (includesAny('refrigerio', 'almuerzo', 'alimentacion', 'comida')) {
      const answer = faqAnswer('f6');
      if (includesAny('bateria', 'recarga', 'cargar')) {
        return `${answer} La información sobre puntos de recarga no está especificada. Para confirmarla, comunícate a cualquiera de estos teléfonos: 3002906330, 3167765610 o 3204197454.`;
      }
      return answer;
    }

    if (includesAny('bateria', 'recarga', 'cargar')) return this.contactFallback;

    return this.contactFallback;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
