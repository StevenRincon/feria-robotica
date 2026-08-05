import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="faq" class="py-20 relative bg-[#05060a] border-t border-[#00f3ff]/20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">help_outline</mat-icon> PREGUNTAS FRECUENTES
          </div>

          <h2 class="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            RESUELVE TUS <span class="text-[#00f3ff]">INQUIETUDES</span>
          </h2>

          <p class="text-gray-300 text-xs sm:text-sm font-sans">
            Encuentra respuestas rápidas sobre requerimientos, reglas de pista, horarios y acreditación.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-8">
          <mat-icon class="absolute left-4 top-3.5 text-gray-400">search</mat-icon>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="BUSCAR PREGUNTA O TEMA (EJ. COSTO, INTEGRANTES, PISTA)..."
            class="w-full pl-11 pr-4 py-3 bg-[#11141d] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono uppercase font-bold" />
        </div>

        <!-- FAQ Accordion List -->
        <div class="space-y-4">
          @for (faq of filteredFaqs(); track faq.id) {
            <div class="bg-[#11141d] border border-[#00f3ff]/30">
              <button 
                (click)="toggleFaq(faq.id)" 
                type="button" 
                class="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-sm sm:text-base text-white hover:text-[#00f3ff] transition-colors focus:outline-none uppercase">
                <span class="flex items-center gap-3">
                  <span class="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#05060a] text-[#00f3ff] border border-[#00f3ff]/30">
                    {{ faq.category }}
                  </span>
                  <span>{{ faq.question }}</span>
                </span>
                
                <mat-icon class="text-[#00f3ff] transition-transform duration-300" [class.rotate-180]="openFaqId() === faq.id">
                  expand_more
                </mat-icon>
              </button>

              @if (openFaqId() === faq.id) {
                <div class="px-5 pb-5 pt-2 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-[#00f3ff]/20 bg-[#05060a] font-sans animate-fadeIn">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>

      </div>
    </section>
  `
})
export class FaqComponent {
  regService = inject(RegistrationService);
  faqs = this.regService.faqs;

  searchTerm = signal<string>('');
  openFaqId = signal<string | null>('f1');

  toggleFaq(id: string): void {
    if (this.openFaqId() === id) {
      this.openFaqId.set(null);
    } else {
      this.openFaqId.set(id);
    }
  }

  filteredFaqs() {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.faqs;
    return this.faqs.filter(f =>
      f.question.toLowerCase().includes(term) ||
      f.answer.toLowerCase().includes(term) ||
      f.category.toLowerCase().includes(term)
    );
  }
}
