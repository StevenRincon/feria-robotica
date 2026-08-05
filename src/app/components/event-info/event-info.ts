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
              <p class="text-xs font-mono text-[#00f3ff] mt-1">20 Y 21 DE NOVIEMBRE DE 2026 // NOBSA, BOYACÁ</p>
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
                Día 1: Viernes 20
              </button>

              <button 
                (click)="activeDay.set(2)"
                [class.bg-[#00f3ff]]="activeDay() === 2"
                [class.text-black]="activeDay() === 2"
                [class.text-gray-300]="activeDay() !== 2"
                type="button" 
                class="px-4 py-2 font-mono text-xs font-bold uppercase transition-all">
                Día 2: Sábado 21
              </button>
            </div>
          </div>

          <!-- Day 1 Schedule Items -->
          @if (activeDay() === 1) {
            <div class="space-y-4 animate-fadeIn">
              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-[#00f3ff] px-3 py-1.5 shrink-0 uppercase">
                  08:00 AM - 09:30 AM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Registro de Delegaciones y Acreditación</h4>
                  <p class="text-xs text-gray-400 mt-1">Entrega de escarapelas digitales, asignación de mesas en la zona de pit/boxes e inspección técnica inicial.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-[#00f3ff] px-3 py-1.5 shrink-0 uppercase">
                  09:30 AM - 10:30 AM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Inauguración Oficial y Conferencia de Apertura</h4>
                  <p class="text-xs text-gray-400 mt-1">Palabras del Alcalde Municipal de Nobsa y ponencia sobre "Robótica Móvil e Inteligencia Artificial en el Campo Colombiano".</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-[#00f3ff] px-3 py-1.5 shrink-0 uppercase">
                  10:30 AM - 01:00 PM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Evaluación de Proyectos de Automatización Electrónica</h4>
                  <p class="text-xs text-gray-400 mt-1">Exposición en stands ante los jurados técnicos. Evaluación de funcionamiento, esquemáticos y sustentación oral.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-[#00f3ff] px-3 py-1.5 shrink-0 uppercase">
                  02:00 PM - 05:00 PM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Muestra Interactiva de Proyectos Educativos</h4>
                  <p class="text-xs text-gray-400 mt-1">Exposición abierta a colegios invitados y comunidad general. Votación del público asistente para la mención especial.</p>
                </div>
              </div>
            </div>
          }

          <!-- Day 2 Schedule Items -->
          @if (activeDay() === 2) {
            <div class="space-y-4 animate-fadeIn">
              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-amber-400 px-3 py-1.5 shrink-0 uppercase">
                  08:30 AM - 10:00 AM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Inspección de Pista y Rondas de Prueba: Seguidores de Línea</h4>
                  <p class="text-xs text-gray-400 mt-1">Verificación de homologación de medidas de robots velocistas y calibración de sensores infrarrojos sobre la pista oficial.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-amber-400 px-3 py-1.5 shrink-0 uppercase">
                  10:00 AM - 01:00 PM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Rondas de Eliminatoria Directa y Finales de Velocistas</h4>
                  <p class="text-xs text-gray-400 mt-1">Competencia de velocidad con cronometraje electrónico de milisegundos. 3 intentos por competidor.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-[#11141d] border border-[#00f3ff]/20">
                <div class="text-xs font-mono font-bold text-black bg-amber-400 px-3 py-1.5 shrink-0 uppercase">
                  02:30 PM - 04:30 PM
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wide">Ceremonia de Premiación y Clausura Oficial</h4>
                  <p class="text-xs text-gray-400 mt-1">Entrega de trofeos, incentivos económicos, medallas y certificados oficiales firmados por la Alcaldía Municipal de Nobsa.</p>
                </div>
              </div>
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
