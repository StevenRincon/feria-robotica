import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-info',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="evento" class="py-20 relative bg-[#05060a] border-y border-[#00f3ff]/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Section Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">info</mat-icon> INFORMACIÓN OFICIAL DEL EVENTO
          </div>

          <h2 class="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            NOBSA: INNOVACIÓN Y <span class="text-transparent stroke-cyan">TECNOLOGÍA</span>
          </h2>

          <p class="text-gray-300 text-sm sm:text-base leading-relaxed font-sans">
            El municipio de Nobsa abre sus puertas para promover la ciencia, la ingeniería mecatrónica y la automatización en las nuevas generaciones de Boyacá y Colombia.
          </p>
        </div>

        <!-- 3 Objectives Cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-16">
          <div class="bg-[#11141d] border border-[#00f3ff]/30 p-6 relative hover:border-[#00f3ff] transition-all">
            <div class="w-12 h-12 border border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center mb-4">
              <mat-icon class="text-2xl">psychology</mat-icon>
            </div>
            <h3 class="text-lg font-black text-white uppercase tracking-wide mb-2">Talento STEM</h3>
            <p class="text-xs text-gray-400 leading-relaxed font-sans">
              Impulsar competencias en ciencia, tecnología, ingeniería y matemáticas entre niños, jóvenes y estudiantes universitarios.
            </p>
          </div>

          <div class="bg-[#11141d] border border-[#00f3ff]/30 p-6 relative hover:border-[#00f3ff] transition-all">
            <div class="w-12 h-12 border border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center mb-4">
              <mat-icon class="text-2xl">precision_manufacturing</mat-icon>
            </div>
            <h3 class="text-lg font-black text-white uppercase tracking-wide mb-2">Soluciones Automatizadas</h3>
            <p class="text-xs text-gray-400 leading-relaxed font-sans">
              Promover prototipos con impacto directo en el sector agroindustrial, ambiental e industrial del departamento de Boyacá.
            </p>
          </div>

          <div class="bg-[#11141d] border border-[#00f3ff]/30 p-6 relative hover:border-[#00f3ff] transition-all">
            <div class="w-12 h-12 border border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center mb-4">
              <mat-icon class="text-2xl">diversity_3</mat-icon>
            </div>
            <h3 class="text-lg font-black text-white uppercase tracking-wide mb-2">Red Colaborativa</h3>
            <p class="text-xs text-gray-400 leading-relaxed font-sans">
              Crear una red conectada entre instituciones educativas, SENA, universidades y semilleros de robótica de todo el país.
            </p>
          </div>
        </div>

        <!-- Interactive Schedule & Venue Tabs -->
        <div class="bg-[#0a0c14] border border-[#00f3ff]/30 p-6 sm:p-8">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-[#00f3ff]/20">
            <div>
              <h3 class="font-black text-2xl text-white uppercase tracking-tight">CRONOGRAMA DE ACTIVIDADES</h3>
              <p class="text-xs font-mono text-[#00f3ff] mt-1">VIERNES 6 DE NOVIEMBRE DE 2026 // COLISEO DE NAZARETH</p>
            </div>

            <!-- Day Selector -->
            <div class="flex items-center gap-2 bg-[#11141d] p-1 border border-[#00f3ff]/30">
              <button 
                (click)="activeDay.set(1)"
                [class.bg-[#00f3ff]]="activeDay() === 1"
                [class.text-black]="activeDay() === 1"
                [class.text-gray-300]="activeDay() !== 1"
                type="button" 
                class="px-4 py-2 font-mono text-xs font-bold uppercase transition-all">
                Jornada de la mañana
              </button>

              <button 
                (click)="activeDay.set(2)"
                [class.bg-[#00f3ff]]="activeDay() === 2"
                [class.text-black]="activeDay() === 2"
                [class.text-gray-300]="activeDay() !== 2"
                type="button" 
                class="px-4 py-2 font-mono text-xs font-bold uppercase transition-all">
                Jornada de la tarde
              </button>
            </div>
          </div>

          <!-- Day 1 Schedule Items -->
          @if (activeDay() === 1) {
            <div class="p-8 text-center bg-[#11141d] border border-[#00f3ff]/20 animate-fadeIn">
              <p class="text-sm font-mono font-bold text-[#00f3ff] uppercase tracking-widest">Disponible próximamente</p>
              </div>
          }

          <!-- Day 2 Schedule Items -->
          @if (activeDay() === 2) {
            <div class="p-8 text-center bg-[#11141d] border border-[#00f3ff]/20 animate-fadeIn">
              <p class="text-sm font-mono font-bold text-[#00f3ff] uppercase tracking-widest">Disponible próximamente</p>
            </div>
          }

        </div>

      </div>
    </section>
  `
})
export class EventInfoComponent {
  activeDay = signal<number>(1);
}
