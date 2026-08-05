import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from '../../services/registration.service';
import { CategoryId } from '../../models/registration.model';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="categorias" class="py-20 relative bg-[#05060a]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">sports_esports</mat-icon> MODALIDADES OFICIALES
          </div>

          <h2 class="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            CATEGORÍAS DE <span class="text-[#00f3ff]">COMPETENCIA</span>
          </h2>

          <p class="text-gray-300 text-sm sm:text-base leading-relaxed font-sans">
            Explora las tres líneas de innovación tecnológica aprobadas para la Feria de Robótica Nobsa. Selecciona la categoría de tu interés e inscribe a tu equipo.
          </p>
        </div>

        <!-- 3 Category Cards Grid -->
        <div class="grid md:grid-cols-3 gap-8">
          @for (cat of categories; track cat.id) {
            <div class="bg-[#11141d] border border-[#00f3ff]/30 p-6 sm:p-8 flex flex-col justify-between relative group hover:border-[#00f3ff] transition-all duration-300">
              
              <!-- Top Header Icon & Category Badge -->
              <div>
                <div class="flex items-center justify-between mb-6">
                  <div class="w-12 h-12 border border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center">
                    <mat-icon class="text-2xl">{{ cat.icon }}</mat-icon>
                  </div>

                  <span class="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#05060a] text-[#00f3ff] border border-[#00f3ff]/30 uppercase">
                    MAX {{ cat.specs.maxTeamSize }} INTEGRANTES
                  </span>
                </div>

                <h3 class="text-xl font-black text-white uppercase tracking-wide mb-3 group-hover:text-[#00f3ff] transition-colors">
                  {{ cat.title }}
                </h3>

                <p class="text-sm text-gray-400 mb-6 leading-relaxed font-sans">
                  {{ cat.fullDesc }}
                </p>

                <!-- Technical Specs Box -->
                <div class="bg-[#05060a] p-4 border border-[#00f3ff]/20 mb-6 space-y-2 text-xs font-mono">
                  <div class="flex items-start gap-2 text-gray-300">
                    <mat-icon class="text-[#00f3ff] text-base shrink-0 mt-0.5">group</mat-icon>
                    <span><strong class="text-white">PÚBLICO:</strong> {{ cat.specs.targetAudience }}</span>
                  </div>
                  <div class="flex items-start gap-2 text-gray-300">
                    <mat-icon class="text-amber-400 text-base shrink-0 mt-0.5">straighten</mat-icon>
                    <span><strong class="text-white">ESPECIFICACIONES:</strong> {{ cat.specs.dimensionsOrTrack }}</span>
                  </div>
                </div>

                <!-- Rules Highlights -->
                <div class="space-y-2 mb-6 font-sans">
                  <h4 class="text-xs font-mono font-bold text-[#00f3ff] uppercase tracking-wider flex items-center gap-1">
                    <mat-icon class="text-sm text-[#00f3ff]">check_circle_outline</mat-icon> ASPECTOS CLAVE DE EVALUACIÓN
                  </h4>
                  <ul class="space-y-1.5 text-xs text-gray-300">
                    @for (rule of cat.rulesHighlights; track rule) {
                      <li class="flex items-start gap-2">
                        <span class="text-[#00f3ff] font-bold">•</span>
                        <span>{{ rule }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <!-- Prizes -->
                <div class="bg-amber-500/10 border border-amber-500/30 p-3.5 mb-6">
                  <h4 class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <mat-icon class="text-sm text-amber-400">emoji_events</mat-icon> PREMIACIÓN OFICIAL
                  </h4>
                  <div class="space-y-1 text-xs text-gray-200 font-mono font-bold">
                    @for (prize of cat.prizes; track prize) {
                      <div class="flex items-center justify-between">
                        <span>{{ prize }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <button 
                (click)="selectCategoryAndRegister(cat.id)"
                type="button"
                class="w-full py-3.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#05060a] hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff]/40 hover:border-[#00f3ff] transition-all flex items-center justify-center gap-2">
                <mat-icon class="text-sm">how_to_reg</mat-icon>
                <span>INSCRIBIR EN {{ cat.title }}</span>
              </button>

            </div>
          }
        </div>

      </div>
    </section>
  `
})
export class CategoriesComponent {
  regService = inject(RegistrationService);
  categories = this.regService.categories;

  selectCategoryAndRegister(id: CategoryId): void {
    this.regService.selectedCategoryForForm.set(id);
    const formElement = document.getElementById('inscripcion');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
