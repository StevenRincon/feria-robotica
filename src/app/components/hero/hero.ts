import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from '../../services/registration.service';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-hero',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="inicio" class="relative pt-8 pb-20 overflow-hidden bg-grid-pattern border-b border-[#00f3ff]/20">
      <!-- Background Ambient Glow & Circuits -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#00f3ff]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Header Eyebrow Badges & System Active Line -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#00f3ff]/20">
          <div class="text-[#00f3ff] font-mono text-xs tracking-[0.3em] uppercase flex items-center gap-2">
            <span class="w-2.5 h-2.5 bg-[#00f3ff] animate-pulse"></span> SYSTEM ACTIVE: NOBSA_ROBOTICS_V2.6
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30">
              LOCALIZACIÓN // 5.7533° N, 72.9389° W
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <mat-icon class="text-xs">verified</mat-icon> INSCRIPCIONES 100% GRATUITAS
            </span>
          </div>
        </div>

        <div class="grid lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Hero Text & CTA -->
          <div class="lg:col-span-7 space-y-6">
            
            <h1 class="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none uppercase">
              FERIA <br />
              <span class="text-transparent stroke-cyan">ROBÓTICA</span>
              <span class="block text-white text-3xl sm:text-5xl mt-2 tracking-tight">NOBSA 2026</span>
            </h1>

            <p class="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Participa en el <strong class="text-[#00f3ff]">III Concurso de robótica y automatización electrónica</strong> de la I.E. Técnica de Nazareth. Tres categorías para estudiantes de primaria y bachillerato.
            </p>

            <!-- Key Event Meta Badges -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl text-xs font-mono">
              <div class="p-3 bg-[#11141d] border border-[#00f3ff]/30 flex items-center gap-3">
                <mat-icon class="text-[#00f3ff]">calendar_month</mat-icon>
                <div>
                  <div class="font-bold text-white text-sm">6 NOVIEMBRE</div>
                  <div class="text-[#00f3ff]/70 text-[10px]">AÑO 2026</div>
                </div>
              </div>

              <div class="p-3 bg-[#11141d] border border-[#00f3ff]/30 flex items-center gap-3">
                <mat-icon class="text-[#00f3ff]">location_on</mat-icon>
                <div>
                  <div class="font-bold text-white text-sm">NOBSA, BOYACÁ</div>
                  <div class="text-[#00f3ff]/70 text-[10px]">I.E. TÉCNICA DE NAZARETH</div>
                </div>
              </div>

              <div class="p-3 bg-[#11141d] border border-[#00f3ff]/30 flex items-center gap-3 col-span-2 sm:col-span-1">
                <mat-icon class="text-[#00f3ff]">category</mat-icon>
                <div>
                  <div class="font-bold text-white text-sm">3 CATEGORÍAS</div>
                  <div class="text-[#00f3ff]/70 text-[10px]">CON REGLAMENTO</div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <a 
                href="#inscripcion" 
                (click)="scrollTo('inscripcion')"
                class="cyber-button-primary px-8 py-4 text-sm flex items-center justify-center gap-3 group">
                <mat-icon class="group-hover:translate-x-1 transition-transform">how_to_reg</mat-icon>
                <span>CONFIRMAR INSCRIPCIÓN</span>
              </a>

              <a 
                href="#categorias" 
                (click)="scrollTo('categorias')"
                class="px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest text-slate-200 bg-[#11141d] hover:bg-[#1a1f2e] border border-[#00f3ff]/30 hover:border-[#00f3ff] transition-all flex items-center justify-center gap-2">
                <mat-icon class="text-[#00f3ff]">category</mat-icon>
                <span>3 CATEGORÍAS</span>
              </a>
            </div>

          </div>

          <!-- Right: Countdown Timer & Live Stats Widget -->
          <div class="lg:col-span-5">
            <div class="bg-[#0a0c14] border border-[#00f3ff]/30 p-6 sm:p-8 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#00f3ff]/10 rounded-full blur-2xl pointer-events-none"></div>

              <!-- Header Card Title -->
              <div class="flex items-center justify-between pb-6 border-b border-[#00f3ff]/20">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 bg-[#00f3ff] animate-ping"></span>
                  <h3 class="font-mono font-bold text-sm text-white uppercase tracking-wider">CONTEO REGRESIVO</h3>
                </div>
                <span class="px-2.5 py-1 bg-[#00f3ff] text-black font-mono text-[11px] font-bold uppercase tracking-wider">
                  STATUS: OPEN
                </span>
              </div>

              <!-- Countdown Timer Grid -->
              <div class="grid grid-cols-4 gap-2 sm:gap-3 my-6 text-center">
                <div class="bg-[#11141d] p-3 sm:p-4 border border-[#00f3ff]/30">
                  <div class="font-black text-3xl sm:text-4xl text-[#00f3ff] tabular-nums">{{ time().days }}</div>
                  <div class="text-[10px] font-mono font-bold text-gray-400 uppercase mt-1">Días</div>
                </div>

                <div class="bg-[#11141d] p-3 sm:p-4 border border-[#00f3ff]/30">
                  <div class="font-black text-3xl sm:text-4xl text-[#00f3ff] tabular-nums">{{ formatZero(time().hours) }}</div>
                  <div class="text-[10px] font-mono font-bold text-gray-400 uppercase mt-1">Horas</div>
                </div>

                <div class="bg-[#11141d] p-3 sm:p-4 border border-[#00f3ff]/30">
                  <div class="font-black text-3xl sm:text-4xl text-[#00f3ff] tabular-nums">{{ formatZero(time().minutes) }}</div>
                  <div class="text-[10px] font-mono font-bold text-gray-400 uppercase mt-1">Min</div>
                </div>

                <div class="bg-[#11141d] p-3 sm:p-4 border border-[#00f3ff]/30">
                  <div class="font-black text-3xl sm:text-4xl text-amber-400 animate-pulse tabular-nums">{{ formatZero(time().seconds) }}</div>
                  <div class="text-[10px] font-mono font-bold text-gray-400 uppercase mt-1">Seg</div>
                </div>
              </div>

              <!-- Live Registration Metrics Summary -->
              <div class="mt-6 pt-6 border-t border-[#00f3ff]/20 space-y-3">
                <div class="text-xs font-mono uppercase tracking-widest text-gray-400 flex items-center justify-between">
                  <span>METRICAS_EN_VIVO</span>
                  <span class="text-[#00f3ff] flex items-center gap-1">
                    <mat-icon class="text-sm">sync</mat-icon> ONLINE
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="p-3 bg-[#11141d] border border-[#00f3ff]/20">
                    <div class="font-black text-2xl text-white">{{ stats()?.totalTeams || 4 }}</div>
                    <div class="text-[10px] font-mono text-gray-400 uppercase">Equipos</div>
                  </div>

                  <div class="p-3 bg-[#11141d] border border-[#00f3ff]/20">
                    <div class="font-black text-2xl text-[#00f3ff]">{{ stats()?.totalParticipants || 11 }}</div>
                    <div class="text-[10px] font-mono text-gray-400 uppercase">Robóticos</div>
                  </div>

                  <div class="p-3 bg-[#11141d] border border-[#00f3ff]/20">
                    <div class="font-black text-2xl text-emerald-400">{{ stats()?.totalMunicipalities || 4 }}</div>
                    <div class="text-[10px] font-mono text-gray-400 uppercase">Municipios</div>
                  </div>
                </div>
              </div>

              <!-- Location Banner -->
              <div class="mt-6 p-3 bg-[#11141d] border border-[#00f3ff]/30 flex items-center gap-3">
                <div class="p-2 border border-[#00f3ff] text-[#00f3ff]">
                  <mat-icon class="text-lg">map</mat-icon>
                </div>
                <div class="text-xs">
                  <div class="font-bold text-slate-100 uppercase font-mono">SEDE PRINCIPAL // NOBSA, BOYACÁ</div>
                  <div class="text-gray-400 text-[11px]">Centro Cultural y Polideportivo Municipal</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  `
})
export class HeroComponent implements OnInit, OnDestroy {
  regService = inject(RegistrationService);
  stats = this.regService.stats;

  targetDate = new Date('2026-11-06T08:00:00-05:00').getTime();
  time = signal<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.updateTimer();
    this.timerId = setInterval(() => this.updateTimer(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  updateTimer(): void {
    const now = new Date().getTime();
    const diff = Math.max(0, this.targetDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.time.set({ days, hours, minutes, seconds });
  }

  formatZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  scrollTo(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
