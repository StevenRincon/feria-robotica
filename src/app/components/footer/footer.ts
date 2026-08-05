import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#05060a] border-t border-[#00f3ff]/30 pt-16 pb-12 text-gray-400 text-xs font-mono">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#00f3ff]/20">
          
          <!-- Brand & Municipal Info -->
          <div class="space-y-4 md:col-span-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#00f3ff]/10 border border-[#00f3ff]/40 flex items-center justify-center text-[#00f3ff]">
                <mat-icon>precision_manufacturing</mat-icon>
              </div>
              <div>
                <span class="font-mono font-black text-xl text-white tracking-wider uppercase">FERIA ROBÓTICA <span class="text-[#00f3ff]">NOBSA</span></span>
                <p class="text-[11px] text-gray-400 font-sans uppercase">Alcaldía Municipal de Nobsa • Boyacá, Colombia</p>
              </div>
            </div>

            <p class="text-gray-300 leading-relaxed max-w-md font-sans">
              Evento municipal de tecnología, automatización industrial y robótica educativa. Promoviendo la innovación científica y el desarrollo mecatrónico en Sugamuxi y Boyacá.
            </p>

            <div class="flex items-center gap-3 pt-2 text-gray-300">
              <span class="px-2.5 py-1 bg-[#11141d] border border-[#00f3ff]/30 font-mono text-[11px] font-bold">
                NIT: 891.801.328-9
              </span>
              <span class="px-2.5 py-1 bg-[#11141d] border border-[#00f3ff]/30 font-mono text-[11px] font-bold">
                COD. POSTAL: 152280
              </span>
            </div>
          </div>

          <!-- Contact & Sede -->
          <div class="space-y-3">
            <h4 class="font-bold text-white uppercase tracking-wider text-xs">CONTACTO & SEDE</h4>
            <ul class="space-y-2.5 text-xs">
              <li class="flex items-start gap-2">
                <mat-icon class="text-[#00f3ff] text-sm mt-0.5">location_on</mat-icon>
                <span>Centro Polideportivo Municipal, Calle 5 # 4-20, Nobsa, Boyacá</span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-[#00f3ff] text-sm">mail</mat-icon>
                <span>robotica&#64;nobsa-boyaca.gov.co</span>
              </li>
              <li class="flex items-center gap-2">
                <mat-icon class="text-[#00f3ff] text-sm">phone</mat-icon>
                <span>+57 (608) 770-1234 / 310 889 0123</span>
              </li>
            </ul>
          </div>

          <!-- Quick Navigation Links -->
          <div class="space-y-3">
            <h4 class="font-bold text-white uppercase tracking-wider text-xs">SECCIONES</h4>
            <ul class="space-y-2 uppercase">
              <li><a href="#inicio" class="hover:text-[#00f3ff] transition-colors">Inicio</a></li>
              <li><a href="#evento" class="hover:text-[#00f3ff] transition-colors">Cronograma y Objetivos</a></li>
              <li><a href="#categorias" class="hover:text-[#00f3ff] transition-colors">Categorías de Competencia</a></li>
              <li><a href="#inscripcion" class="hover:text-[#00f3ff] transition-colors">Inscripción de Proyectos</a></li>
              <li><a href="#acreditacion" class="hover:text-[#00f3ff] transition-colors">Consultar Credencial QR</a></li>
              <li><a href="#faq" class="hover:text-[#00f3ff] transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

        </div>

        <!-- Bottom Copyright Bar -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-gray-500 uppercase">
          <div>
            © 2026 ALCALDÍA MUNICIPAL DE NOBSA. TODOS LOS DERECHOS RESERVADOS.
          </div>
          <div class="text-[#00f3ff]">
            IMPULSANDO EL DESARROLLO TECNOLÓGICO DE BOYACÁ.
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {}
