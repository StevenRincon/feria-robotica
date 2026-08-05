import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage } from '../models/registration.model';

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  private http = inject(HttpClient);

  isOpen = signal<boolean>(false);
  loading = signal<boolean>(false);

  messages = signal<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Hola! Soy RoboNobsa AI, el asistente virtual oficial de la Feria de Robótica Nobsa 2026. ¿En qué puedo ayudarte hoy sobre categorías, reglamentos o inscripciones?',
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
    this.loading.set(true);

    this.http.post<{ success: boolean; reply: string }>('/api/chat', { message: text }).subscribe({
      next: (res) => {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: res.reply || 'Respuesta procesada correctamente.',
          timestamp: new Date()
        };
        this.messages.update(list => [...list, botMsg]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Chat AI error:', err);
        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: 'Las inscripciones continúan abiertas de forma 100% gratuita. Puedes consultar cualquier duda sobre las categorías en la sección de preguntas frecuentes.',
          timestamp: new Date()
        };
        this.messages.update(list => [...list, botMsg]);
        this.loading.set(false);
      }
    });
  }
}
