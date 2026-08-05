import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AiAssistantService } from '../../services/ai-assistant.service';

@Component({
  selector: 'app-ai-chat-widget',
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating Trigger Button (When Drawer Closed) -->
    @if (!aiService.isOpen()) {
      <button 
        (click)="aiService.toggleChat()"
        type="button"
        class="fixed bottom-6 right-6 z-50 p-4 rounded-2xl cyber-button-primary shadow-2xl flex items-center gap-3 group focus:outline-none"
        title="Pregunta al Asistente IA NobsaBot">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
        </span>
        <mat-icon class="text-2xl group-hover:rotate-12 transition-transform">smart_toy</mat-icon>
        <span class="hidden sm:inline font-display font-bold text-xs tracking-wider">Asistente RoboNobsa</span>
      </button>
    }

    <!-- Chat Drawer / Modal Window -->
    @if (aiService.isOpen()) {
      <div class="fixed bottom-4 right-4 z-50 w-full max-w-md bg-[#080d1a] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-fadeIn">
        
        <!-- Header -->
        <div class="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div>
              <h3 class="font-display font-bold text-sm text-white flex items-center gap-2">
                RoboNobsa AI
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              </h3>
              <p class="text-[11px] text-slate-400">Asistente Virtual • Feria Robótica Nobsa</p>
            </div>
          </div>

          <button 
            (click)="aiService.toggleChat()" 
            type="button" 
            class="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Chat Conversation Messages Area -->
        <div #chatContainer class="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          
          @for (msg of aiService.messages(); track msg.id) {
            <div 
              [class.justify-end]="msg.sender === 'user'" 
              [class.justify-start]="msg.sender === 'bot'" 
              class="flex items-start gap-2">
              
              @if (msg.sender === 'bot') {
                <div class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-sm mt-1">
                  <mat-icon class="text-xs">smart_toy</mat-icon>
                </div>
              }

              <div 
                [class.bg-cyan-600]="msg.sender === 'user'" 
                [class.text-black]="msg.sender === 'user'" 
                [class.font-semibold]="msg.sender === 'user'"
                [class.bg-slate-900]="msg.sender === 'bot'" 
                [class.text-slate-200]="msg.sender === 'bot'"
                [class.border-slate-800]="msg.sender === 'bot'"
                class="max-w-[80%] p-3 rounded-2xl border leading-relaxed whitespace-pre-wrap">
                {{ msg.text }}
              </div>

            </div>
          }

          @if (aiService.loading()) {
            <div class="flex items-center gap-2 text-cyan-400 text-xs italic p-2">
              <mat-icon class="animate-spin text-sm">sync</mat-icon>
              <span>RoboNobsa está pensando...</span>
            </div>
          }

        </div>

        <!-- Quick Prompt Chips -->
        <div class="px-3 py-2 bg-[#060a14] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button 
            (click)="sendQuickPrompt('¿Cuáles son las categorías de competencia?')" 
            type="button" 
            class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 hover:border-cyan-400 shrink-0">
            Categorías
          </button>

          <button 
            (click)="sendQuickPrompt('¿Dónde y cuándo es el evento?')" 
            type="button" 
            class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 hover:border-cyan-400 shrink-0">
            Fechas y Lugar
          </button>

          <button 
            (click)="sendQuickPrompt('¿Tiene algún costo la inscripción?')" 
            type="button" 
            class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 hover:border-cyan-400 shrink-0">
            ¿Es Gratis?
          </button>
        </div>

        <!-- Input Bar -->
        <div class="p-3 bg-slate-900 border-t border-slate-800">
          <form (ngSubmit)="sendUserMessage()" class="flex items-center gap-2">
            <input 
              type="text" 
              [(ngModel)]="userInput" 
              name="userInput"
              placeholder="Escribe tu pregunta sobre la feria..." 
              class="flex-1 px-3 py-2 rounded-xl bg-[#080d1a] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400" />
            
            <button 
              type="submit" 
              [disabled]="!userInput.trim() || aiService.loading()"
              class="p-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-bold disabled:opacity-40">
              <mat-icon class="text-sm">send</mat-icon>
            </button>
          </form>
        </div>

      </div>
    }
  `
})
export class AiChatWidgetComponent {
  aiService = inject(AiAssistantService);
  userInput = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  sendUserMessage(): void {
    if (!this.userInput || !this.userInput.trim()) return;
    const text = this.userInput;
    this.userInput = '';
    this.aiService.sendMessage(text);
    this.scrollToBottom();
  }

  sendQuickPrompt(promptText: string): void {
    this.aiService.sendMessage(promptText);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 150);
  }
}
