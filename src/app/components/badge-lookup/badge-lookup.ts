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
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">workspace_premium</mat-icon> CERTIFICADOS DE PARTICIPACIÓN
          </div>
          <h2 class="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            BUSCA TU <span class="text-[#00f3ff]">CERTIFICADO</span>
          </h2>
          <p class="text-gray-300 text-xs sm:text-sm font-sans">
            Consulta por proyecto, docente, documento o institución. Al encontrarlo podrás descargar el certificado en PDF.
          </p>
        </div>

        <div class="bg-[#11141d] p-4 sm:p-6 border border-[#00f3ff]/30 mb-8">
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input type="text" [(ngModel)]="projectQuery" placeholder="NOMBRE DEL PROYECTO O EQUIPO"
              class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono uppercase" />
            <input type="text" [(ngModel)]="teacherQuery" placeholder="NOMBRE DEL DOCENTE"
              class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono uppercase" />
            <input type="text" [(ngModel)]="teacherDocQuery" placeholder="DOCUMENTO DEL DOCENTE"
              class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono uppercase" />
            <input type="text" [(ngModel)]="institutionQuery" placeholder="COLEGIO O INSTITUCIÓN"
              class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono uppercase" />
            <select [(ngModel)]="categoryQuery" class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white focus:outline-none focus:border-[#00f3ff] text-xs font-mono uppercase">
              <option value="all">TODAS LAS CATEGORÍAS</option>
              <option value="automatizacion">AUTOMATIZACIÓN ELECTRÓNICA</option>
              <option value="seguidores">SEGUIDORES DE LÍNEA</option>
              <option value="educativos">PROYECTOS PARA PRIMARIA</option>
            </select>
            <button (click)="searchCertificates()" [disabled]="loading() || !hasSearchCriteria()" type="button"
              class="cyber-button-primary px-6 py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-40">
              @if (loading()) { <mat-icon class="animate-spin text-sm">sync</mat-icon> }
              @else { <mat-icon class="text-sm">search</mat-icon> }
              <span>BUSCAR CERTIFICADOS</span>
            </button>
          </div>
          @if (errorMessage()) {
            <p class="text-xs text-rose-400 mt-3 text-center font-mono font-bold">{{ errorMessage() }}</p>
          }
        </div>

        @if (searchPerformed()) {
          @if (certificateResults().length === 0) {
            <div class="p-8 text-center bg-[#11141d] border border-rose-500/40 text-gray-300 text-xs font-mono uppercase">
              No se encontraron proyectos con los filtros seleccionados.
            </div>
          } @else {
            <div class="space-y-4">
              @for (item of certificateResults(); track item.id) {
                <article class="bg-[#11141d] p-6 border-2 border-[#00f3ff] animate-fadeIn">
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div class="space-y-2">
                      <span class="text-[10px] font-mono font-bold text-[#00f3ff] uppercase">CERTIFICADO DE PARTICIPACIÓN • {{ item.code }}</span>
                      <h3 class="text-xl font-black text-white uppercase">{{ item.projectTitle }}</h3>
                      <p class="text-xs text-gray-300 font-mono uppercase">{{ item.categoryName }}</p>
                      <div class="grid sm:grid-cols-2 gap-x-8 gap-y-1 pt-3 border-t border-[#00f3ff]/20 text-xs text-gray-300 font-mono">
                        <span><strong class="text-white">DOCENTE:</strong> {{ item.mentorName || 'No registrado' }}</span>
                        <span><strong class="text-white">DOCUMENTO:</strong> {{ item.mentorDoc || 'No registrado' }}</span>
                        <span><strong class="text-white">INSTITUCIÓN:</strong> {{ item.institution }}</span>
                        <span><strong class="text-white">FECHA:</strong> {{ item.createdAt | date:'longDate' }}</span>
                      </div>
                    </div>
                    <button (click)="downloadCertificate(item)" [disabled]="!item.mentorDoc" type="button"
                      class="cyber-button-primary px-5 py-3 text-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-40">
                      <mat-icon class="text-sm">picture_as_pdf</mat-icon>
                      <span>DESCARGAR PDF</span>
                    </button>
                  </div>
                  <p class="text-[10px] text-gray-500 font-mono mt-4 uppercase">La contraseña del PDF es el documento del docente.</p>
                </article>
              }
            </div>
          }
        }
      </div>
    </section>
  `
})
export class BadgeLookupComponent {
    private readonly regService = inject(RegistrationService);

    projectQuery = '';
    teacherQuery = '';
    teacherDocQuery = '';
    institutionQuery = '';
    categoryQuery = 'all';
    loading = signal(false);
    errorMessage = signal('');
    searchPerformed = signal(false);
    certificateResults = signal<Registration[]>([]);

    hasSearchCriteria(): boolean {
        return Boolean(this.projectQuery.trim() || this.teacherQuery.trim() || this.teacherDocQuery.trim() || this.institutionQuery.trim() || this.categoryQuery !== 'all');
    }

    searchCertificates(): void {
        if (!this.hasSearchCriteria()) return;
        this.loading.set(true);
        this.errorMessage.set('');
        this.regService.searchCertificates({
            project: this.projectQuery,
            teacher: this.teacherQuery,
            teacherDoc: this.teacherDocQuery,
            institution: this.institutionQuery,
            category: this.categoryQuery
        }).subscribe({
            next: registrations => {
                this.loading.set(false);
                this.searchPerformed.set(true);
                this.certificateResults.set(registrations);
            },
            error: () => {
                this.loading.set(false);
                this.searchPerformed.set(true);
                this.certificateResults.set([]);
                this.errorMessage.set('No fue posible consultar los certificados en este momento.');
            }
        });
    }

    downloadCertificate(item: Registration): void {
        this.regService.downloadCertificate(item.id).subscribe({
            next: blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Certificado_${item.projectTitle.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}.pdf`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            },
            error: () => this.errorMessage.set('No fue posible generar el certificado.')
        });
    }
}
