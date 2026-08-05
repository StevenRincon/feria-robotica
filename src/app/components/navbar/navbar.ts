import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AiAssistantService } from '../../services/ai-assistant.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 bg-[#05060a]/95 backdrop-blur-md border-b border-[#00f3ff]/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Logo & Brand -->
          <a href="#inicio" (click)="scrollTo('inicio')" class="flex items-center gap-3 group focus:outline-none">
            <div class="w-10 h-10 border border-[#00f3ff] bg-[#11141d] flex items-center justify-center text-[#00f3ff]">
              <mat-icon class="group-hover:scale-110 transition-transform duration-300">precision_manufacturing</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-xl tracking-tight text-white uppercase">FERIA<span class="text-[#00f3ff]">ROBÓTICA</span></span>
                <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30">V2.6</span>
              </div>
              <p class="text-[10px] font-mono text-gray-400 tracking-widest uppercase flex items-center gap-1">
                NOBSA // BOYACÁ
              </p>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            <a href="#inicio" (click)="scrollTo('inicio')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">Inicio</a>
            <a href="#evento" (click)="scrollTo('evento')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">Evento</a>
            <a href="#categorias" (click)="scrollTo('categorias')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">Categorías</a>
            <a href="#inscripcion" (click)="scrollTo('inscripcion')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">Inscripción</a>
            <a href="#acreditacion" (click)="scrollTo('acreditacion')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">Acreditación</a>
            <a href="#galeria" (click)="scrollTo('galeria')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">Muestra</a>
            <a href="#faq" (click)="scrollTo('faq')" class="px-3 py-2 text-gray-300 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors">FAQ</a>
            <a href="#admin" (click)="scrollTo('admin')" class="px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1 font-bold">
              <mat-icon class="text-sm">admin_panel_settings</mat-icon> Admin
            </a>
          </nav>

          <!-- Action Buttons -->
          <div class="hidden sm:flex items-center gap-3">
            <!-- AI Bot Assistant Toggle -->
            <button 
              (click)="aiService.toggleChat()" 
              type="button"
              class="relative px-3.5 py-2.5 bg-[#11141d] border border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:border-[#00f3ff] transition-all flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase"
              title="Pregunta al Asistente IA de la Feria">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full bg-[#00f3ff] opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 bg-[#00f3ff]"></span>
              </span>
              <mat-icon class="text-sm">smart_toy</mat-icon>
              <span>NOBSABOT IA</span>
            </button>

            <!-- Primary Registration CTA -->
            <a 
              href="#inscripcion" 
              (click)="scrollTo('inscripcion')"
              class="cyber-button-primary px-5 py-2.5 text-xs flex items-center gap-2 group">
              <mat-icon class="text-sm group-hover:rotate-12 transition-transform">app_registration</mat-icon>
              <span>INSCRIBIRSE</span>
            </a>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <div class="flex lg:hidden items-center gap-2">
            <button 
              (click)="aiService.toggleChat()" 
              type="button"
              class="p-2 bg-[#11141d] text-[#00f3ff] border border-[#00f3ff]/30">
              <mat-icon>smart_toy</mat-icon>
            </button>

            <button 
              (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              type="button"
              class="p-2 text-gray-300 hover:text-white hover:bg-slate-800 focus:outline-none">
              <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (mobileMenuOpen()) {
        <div class="lg:hidden bg-[#0a0c14] border-b border-[#00f3ff]/30 px-4 pt-2 pb-6 space-y-2 font-mono text-xs uppercase tracking-wider">
          <a href="#inicio" (click)="scrollTo('inicio')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">Inicio</a>
          <a href="#evento" (click)="scrollTo('evento')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">El Evento</a>
          <a href="#categorias" (click)="scrollTo('categorias')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">Categorías de Competencia</a>
          <a href="#inscripcion" (click)="scrollTo('inscripcion')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">Formulario de Inscripción</a>
          <a href="#acreditacion" (click)="scrollTo('acreditacion')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">Buscar mi Acreditación / QR</a>
          <a href="#galeria" (click)="scrollTo('galeria')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">Muestra Robótica</a>
          <a href="#faq" (click)="scrollTo('faq')" class="block px-3 py-2.5 text-gray-200 hover:bg-[#00f3ff]/10 hover:text-[#00f3ff]">Preguntas Frecuentes</a>
          <a href="#admin" (click)="scrollTo('admin')" class="block px-3 py-2.5 text-amber-400 hover:bg-amber-500/10">Panel de Administración</a>
          
          <div class="pt-4 flex flex-col gap-2">
            <a href="#inscripcion" (click)="scrollTo('inscripcion')" class="w-full text-center cyber-button-primary py-3 text-xs flex items-center justify-center gap-2">
              <mat-icon>app_registration</mat-icon> INSCRIPCIÓN GRATUITA
            </a>
          </div>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  aiService = inject(AiAssistantService);
  mobileMenuOpen = signal<boolean>(false);

  scrollTo(elementId: string): void {
    this.mobileMenuOpen.set(false);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
