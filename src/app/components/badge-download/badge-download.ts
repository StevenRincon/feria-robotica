import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Registration } from '../../models/registration.model';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-badge-download',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="escarapelas" class="relative border-y border-[#00f3ff]/20 bg-[#080b12] py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto mb-12 max-w-3xl text-center">
          <div class="mb-4 inline-flex items-center gap-2 border border-[#00f3ff]/30 bg-[#00f3ff]/10 px-3 py-1 text-xs font-mono font-bold uppercase text-[#00f3ff]">
            <mat-icon class="text-sm">badge</mat-icon> ACREDITACIÓN DE PARTICIPANTES
          </div>
          <h2 class="text-4xl font-black uppercase text-white sm:text-5xl">DESCARGA DE <span class="text-[#00f3ff]">ESCARAPELAS</span></h2>
          <p class="mt-4 text-sm leading-relaxed text-gray-300 sm:text-base">
            Consulta los equipos con el código institucional y descarga las escarapelas de sus estudiantes en un solo PDF.
          </p>
        </div>

        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div class="border border-[#00f3ff]/25 bg-[#0d111b] p-6 sm:p-8">
            <label for="institution-code" class="mb-2 block text-xs font-mono font-bold uppercase text-gray-300">
              Código DANE / NIT del colegio
            </label>
            <div class="flex flex-col gap-3 sm:flex-row">
              <input
                id="institution-code"
                type="text"
                inputmode="numeric"
                maxlength="12"
                autocomplete="off"
                [value]="institutionCode()"
                (input)="updateInstitutionCode($event)"
                (keydown.enter)="searchInstitution()"
                placeholder="12 dígitos"
                class="min-w-0 flex-1 border border-[#00f3ff]/30 bg-[#080b12] px-4 py-3 font-mono text-white outline-none placeholder:text-gray-600 focus:border-[#00f3ff]"
              />
              <button
                type="button"
                (click)="searchInstitution()"
                [disabled]="isLoading() || institutionCode().length !== 12"
                class="flex items-center justify-center gap-2 bg-[#00d9e8] px-5 py-3 text-sm font-black uppercase text-[#061018] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
                <mat-icon>{{ isLoading() ? 'hourglass_top' : 'search' }}</mat-icon>
                {{ isLoading() ? 'Buscando' : 'Buscar' }}
              </button>
            </div>

            <p class="mt-3 text-xs leading-relaxed text-gray-500">Ingresa los 12 dígitos del código registrado en la inscripción.</p>

            @if (errorMessage()) {
              <p role="alert" class="mt-4 border-l-2 border-amber-400 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{{ errorMessage() }}</p>
            }

            @if (registrations().length > 0) {
              <div class="mt-8 border-t border-white/10 pt-6">
                <p class="text-xs leading-relaxed text-gray-400">
                  La plantilla incluye el diseño oficial. Se generará una escarapela por estudiante con su documento y el número de inscripción de su proyecto.
                </p>

                <button
                  type="button"
                  (click)="downloadBadges()"
                  [disabled]="isGenerating()"
                  class="mt-6 flex w-full items-center justify-center gap-2 border border-[#00f3ff] bg-[#00f3ff] px-5 py-3 text-sm font-black uppercase text-[#061018] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
                  <mat-icon>{{ isGenerating() ? 'hourglass_top' : 'picture_as_pdf' }}</mat-icon>
                  {{ isGenerating() ? 'Generando PDF' : 'Descargar escarapelas PDF' }}
                </button>
                @if (badgeError()) {
                  <p role="alert" class="mt-3 text-xs text-amber-300">{{ badgeError() }}</p>
                }
              </div>
            }
          </div>

          <div aria-live="polite">
            @if (registrations().length > 0) {
              <div class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#00f3ff]/20 pb-4">
                <div>
                  <p class="font-mono text-xs uppercase text-[#00f3ff]">{{ studentCount() }} estudiantes</p>
                  <h3 class="mt-1 text-xl font-black uppercase text-white">{{ registrations()[0].institution || 'Equipos registrados' }}</h3>
                </div>
                <p class="font-mono text-xs text-gray-500">{{ registrations().length }} proyectos</p>
              </div>
              <div class="divide-y divide-white/10">
                @for (registration of registrations(); track registration.id) {
                  @for (member of registration.members; track member.id) {
                    @if (member.role === 'Líder / Capitán' || member.role === 'Integrante') {
                      <article class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div class="min-w-0">
                          <h4 class="truncate font-bold text-white">{{ member.fullName }}</h4>
                          <p class="mt-1 text-xs text-gray-400">{{ registration.projectTitle }} · Inscripción: {{ registration.code }}</p>
                        </div>
                        <span class="shrink-0 font-mono text-[10px] uppercase text-gray-500">{{ registration.categoryName }}</span>
                      </article>
                    }
                  }
                }
              </div>
            } @else if (!isLoading()) {
              <div class="flex min-h-52 items-center justify-center border border-dashed border-white/15 px-6 text-center">
                <p class="max-w-sm text-sm leading-relaxed text-gray-500">Ingresa el código institucional para consultar los proyectos y estudiantes inscritos.</p>
              </div>
            } @else {
              <div class="flex min-h-52 items-center justify-center border border-white/10 text-sm font-mono uppercase text-[#00f3ff]">Consultando inscripciones...</div>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class BadgeDownloadComponent {
  private registrationService = inject(RegistrationService);

  institutionCode = signal('');
  registrations = signal<Registration[]>([]);
  students = computed(() => this.registrations().flatMap(registration =>
    registration.members
      .filter(member => member.role === 'Líder / Capitán' || member.role === 'Integrante')
      .map(member => ({ registration, member }))
  ));
  errorMessage = signal('');
  badgeError = signal('');
  isLoading = signal(false);
  isGenerating = signal(false);

  studentCount(): number {
    return this.students().length;
  }

  updateInstitutionCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 12);
    input.value = value;
    this.institutionCode.set(value);
    this.errorMessage.set('');
    this.registrations.set([]);
  }

  searchInstitution(): void {
    const institutionNit = this.institutionCode();
    if (!/^\d{12}$/.test(institutionNit)) {
      this.errorMessage.set('El código institucional debe tener exactamente 12 dígitos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.registrations.set([]);
    this.badgeError.set('');

    this.registrationService.searchCertificates({ institutionNit }).subscribe({
      next: registrations => {
        this.registrations.set(registrations);
        this.isLoading.set(false);
        if (registrations.length === 0) this.errorMessage.set('No encontramos proyectos inscritos con ese código institucional.');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No fue posible consultar las inscripciones. Intenta nuevamente.');
      }
    });
  }

  async downloadBadges(): Promise<void> {
    const students = this.students();
    if (students.length === 0) {
      this.badgeError.set('No hay estudiantes registrados para generar las escarapelas.');
      return;
    }

    this.isGenerating.set(true);
    this.badgeError.set('');
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const badgeWidth = 100;
      const badgeHeight = 120;
      const positions = [
        [5.3, 15], [110.6, 15], [5.3, 141.4], [110.6, 141.4]
      ];
      const template = await this.loadBadgeTemplate();

      students.forEach(({ registration, member }, index) => {
        if (index > 0 && index % positions.length === 0) pdf.addPage();
        const [x, y] = positions[index % positions.length];
        this.drawBadge(pdf, x, y, badgeWidth, badgeHeight, registration, member.fullName, member.documentId, template);
      });

      pdf.save(`Escarapelas_Feria_Robotica_Nobsa_${this.institutionCode()}.pdf`);
    } catch (error) {
      console.error('Error generando las escarapelas:', error);
      this.badgeError.set('No fue posible generar el PDF. Verifica tu conexión e intenta nuevamente.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  private async loadBadgeTemplate(): Promise<string> {
    const response = await fetch('/escarapela-plantilla.jpg');
    if (!response.ok) {
      throw new Error(`No fue posible cargar la plantilla de escarapela (${response.status}).`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('La plantilla de escarapela no produjo una imagen válida.'));
      };
      reader.onerror = () => reject(new Error('No fue posible leer la plantilla de escarapela.'));
      reader.readAsDataURL(blob);
    });
  }

  private drawBadge(
    pdf: import('jspdf').jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    registration: Registration,
    studentName: string,
    studentDocument: string,
    template: string
  ): void {
    pdf.addImage(template, 'JPEG', x, y, width, height);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#111111');

    const name = studentName.trim();
    let nameFontSize = 11;
    pdf.setFontSize(nameFontSize);
    while (nameFontSize > 6 && pdf.getTextWidth(name) > 40) {
      nameFontSize -= 0.5;
      pdf.setFontSize(nameFontSize);
    }
    pdf.text(name, x + 22.5, y + 56.3, { align: 'center', maxWidth: 42 });

    pdf.setFontSize(9);
    pdf.text(studentDocument, x + 20, y + 82.4, { align: 'center', maxWidth: 37 });

    pdf.setFontSize(5.5);
    pdf.setTextColor('#17333d');
    pdf.text(`Inscripción: ${registration.code}`, x + 22, y + 87.6, { align: 'center', maxWidth: 40 });
  }
}
