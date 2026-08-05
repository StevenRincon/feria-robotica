import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from '../../services/registration.service';
import { Registration } from '../../models/registration.model';

@Component({
  selector: 'app-badge-lookup',
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="acreditacion" class="py-20 relative bg-[#05060a] border-t border-[#00f3ff]/20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">badge</mat-icon> CONSULTAR ACREDITACIÓN Y QR
          </div>

          <h2 class="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            CONSULTA TU <span class="text-[#00f3ff]">CREDENCIAL DIGITAL</span>
          </h2>

          <p class="text-gray-300 text-xs sm:text-sm font-sans">
            Ingresa tu Código de Inscripción (ej. NOBSA-ROB-2026-A812), Documento de Identidad del líder o correo electrónico para descargar tu pase oficial de entrada.
          </p>
        </div>

        <!-- Search Input Bar -->
        <div class="bg-[#11141d] p-4 sm:p-6 border border-[#00f3ff]/30 mb-8">
          <div class="flex flex-col sm:flex-row items-center gap-3">
            <div class="relative w-full">
              <mat-icon class="absolute left-4 top-3.5 text-gray-400 text-lg">search</mat-icon>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="searchBadge()"
                placeholder="INGRESA CÓDIGO (NOBSA-ROB-2026-...) O DOCUMENTO..."
                class="w-full pl-11 pr-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono font-bold tracking-wider uppercase" />
            </div>

            <button 
              (click)="searchBadge()" 
              [disabled]="loading() || !searchQuery().trim()"
              type="button" 
              class="cyber-button-primary w-full sm:w-auto px-6 py-3 text-xs flex items-center justify-center gap-2 shrink-0">
              @if (loading()) {
                <mat-icon class="animate-spin text-sm">sync</mat-icon>
              } @else {
                <mat-icon class="text-sm">qr_code_2</mat-icon>
              }
              <span>BUSCAR ACREDITACIÓN</span>
            </button>
          </div>

          @if (errorMessage()) {
            <p class="text-xs text-rose-400 mt-3 text-center font-mono font-bold">{{ errorMessage() }}</p>
          }
        </div>

        <!-- Found Registration Card Badge -->
        @if (foundRegistration()) {
          <div class="bg-[#11141d] p-6 sm:p-8 border-2 border-[#00f3ff] animate-fadeIn">
            
            <div class="flex items-center justify-between pb-4 border-b border-[#00f3ff]/20 mb-6">
              <span class="text-xs font-mono font-bold px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 uppercase">
                Acreditación Válida • Feria Robótica Nobsa
              </span>

              <span [class.text-emerald-400]="foundRegistration()?.status === 'Aprobado'" class="text-xs font-mono font-bold uppercase">
                ESTADO: {{ foundRegistration()?.status }}
              </span>
            </div>

            <div class="grid sm:grid-cols-3 gap-6 items-center">
              
              <!-- Details Left -->
              <div class="sm:col-span-2 space-y-3">
                <div class="text-xs font-mono font-bold text-gray-400 uppercase">
                  CÓDIGO OFICIAL DE REGISTRO
                </div>
                <div class="font-mono font-black text-2xl text-[#00f3ff] tracking-wider uppercase">
                  {{ foundRegistration()?.code }}
                </div>

                <h3 class="text-xl font-black text-white uppercase tracking-wide">{{ foundRegistration()?.teamName }}</h3>
                <p class="text-xs text-[#00f3ff] font-mono font-bold uppercase">{{ foundRegistration()?.projectTitle }}</p>

                <div class="grid grid-cols-2 gap-2 text-xs text-gray-300 pt-3 border-t border-[#00f3ff]/20 font-mono">
                  <div><strong class="text-white uppercase">Categoría:</strong> {{ foundRegistration()?.categoryName }}</div>
                  <div><strong class="text-white uppercase">Institución:</strong> {{ foundRegistration()?.institution }}</div>
                  <div><strong class="text-white uppercase">Líder:</strong> {{ foundRegistration()?.leaderName }}</div>
                  <div><strong class="text-white uppercase">Municipio:</strong> {{ foundRegistration()?.city }}, {{ foundRegistration()?.department }}</div>
                </div>
              </div>

              <!-- Right: Printable QR Badge -->
              <div class="flex flex-col items-center justify-center p-4 bg-[#05060a] border border-[#00f3ff]/30 text-center">
                <div class="w-32 h-32 bg-white p-2 flex items-center justify-center mb-2">
                  <svg viewBox="0 0 100 100" class="w-full h-full text-black">
                    <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                    <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" fill="#000000"/>
                    <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" fill="#000000"/>
                    <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" fill="#000000"/>
                    <rect x="45" y="10" width="8" height="8" fill="#000000"/>
                    <rect x="45" y="25" width="8" height="8" fill="#000000"/>
                    <rect x="45" y="45" width="12" height="12" fill="#000000"/>
                    <rect x="65" y="50" width="10" height="10" fill="#000000"/>
                    <rect x="80" y="60" width="10" height="20" fill="#000000"/>
                    <rect x="55" y="70" width="20" height="10" fill="#000000"/>
                  </svg>
                </div>
                <span class="text-[10px] font-mono font-bold text-[#00f3ff] uppercase">PASE NOBSA 2026</span>
                <button 
                  (click)="printBadge()" 
                  type="button" 
                  class="mt-3 px-4 py-2 bg-[#11141d] hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff]/40 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1">
                  <mat-icon class="text-sm">print</mat-icon> IMPRIMIR
                </button>
              </div>

            </div>

          </div>
        }

      </div>
    </section>
  `
})
export class BadgeLookupComponent {
  regService = inject(RegistrationService);

  searchQuery = signal<string>('NOBSA-ROB-2026-A812');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  foundRegistration = signal<Registration | null>(null);

  searchBadge(): void {
    const query = this.searchQuery().trim();
    if (!query) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.regService.getRegistrationByCodeOrDoc(query).subscribe({
      next: (reg) => {
        this.loading.set(false);
        if (reg) {
          this.foundRegistration.set(reg);
        } else {
          this.foundRegistration.set(null);
          this.errorMessage.set('No se encontró ninguna inscripción con el código o documento ingresado. Por favor verifica los datos.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.foundRegistration.set(null);
        this.errorMessage.set('No se encontró ninguna inscripción con el código o documento ingresado.');
      }
    });
  }

  printBadge(): void {
    window.print();
  }
}
