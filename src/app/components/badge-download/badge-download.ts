import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Registration } from '../../models/registration.model';
import { RegistrationService } from '../../services/registration.service';

interface BadgeLogo {
  name: string;
  dataUrl: string;
}

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
                <h3 class="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-[#00f3ff]">Logos para la escarapela</h3>
                <div class="grid gap-4 sm:grid-cols-2">
                  <label class="flex min-h-24 cursor-pointer items-center gap-3 border border-white/10 bg-[#080b12] p-3 transition-colors hover:border-[#00f3ff]/50">
                    @if (schoolLogo(); as logo) {
                      <img [src]="logo.dataUrl" [alt]="logo.name" class="h-14 w-14 shrink-0 object-contain" />
                    } @else {
                      <span class="flex h-14 w-14 shrink-0 items-center justify-center bg-white/5 text-gray-500"><mat-icon>school</mat-icon></span>
                    }
                    <span class="min-w-0">
                      <span class="block text-xs font-bold uppercase text-white">Logo del colegio</span>
                      <span class="mt-1 block truncate text-[11px] text-gray-500">{{ schoolLogo()?.name || 'Seleccionar imagen' }}</span>
                    </span>
                    <input class="sr-only" type="file" accept="image/png,image/jpeg" (change)="selectLogo($event, 'school')" />
                  </label>

                  <label class="flex min-h-24 cursor-pointer items-center gap-3 border border-white/10 bg-[#080b12] p-3 transition-colors hover:border-[#00f3ff]/50">
                    @if (municipalLogo(); as logo) {
                      <img [src]="logo.dataUrl" [alt]="logo.name" class="h-14 w-14 shrink-0 object-contain" />
                    } @else {
                      <span class="flex h-14 w-14 shrink-0 items-center justify-center bg-white/5 text-gray-500"><mat-icon>account_balance</mat-icon></span>
                    }
                    <span class="min-w-0">
                      <span class="block text-xs font-bold uppercase text-white">Logo de la Alcaldía</span>
                      <span class="mt-1 block truncate text-[11px] text-gray-500">{{ municipalLogo()?.name || 'Seleccionar imagen' }}</span>
                    </span>
                    <input class="sr-only" type="file" accept="image/png,image/jpeg" (change)="selectLogo($event, 'municipal')" />
                  </label>
                </div>
                <p class="mt-3 text-[11px] text-gray-500">Formatos PNG o JPG. Los logos se usan solo para generar este PDF.</p>

                <button
                  type="button"
                  (click)="downloadBadges()"
                  [disabled]="!schoolLogo() || !municipalLogo() || isGenerating()"
                  class="mt-6 flex w-full items-center justify-center gap-2 border border-[#00f3ff] bg-[#00f3ff] px-5 py-3 text-sm font-black uppercase text-[#061018] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
                  <mat-icon>{{ isGenerating() ? 'hourglass_top' : 'picture_as_pdf' }}</mat-icon>
                  {{ isGenerating() ? 'Generando PDF' : 'Descargar escarapelas PDF' }}
                </button>
                @if (logoError()) {
                  <p role="alert" class="mt-3 text-xs text-amber-300">{{ logoError() }}</p>
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
                    <article class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div class="min-w-0">
                        <h4 class="truncate font-bold text-white">{{ member.fullName }}</h4>
                        <p class="mt-1 text-xs text-gray-400">{{ registration.projectTitle }}</p>
                      </div>
                      <span class="shrink-0 font-mono text-[10px] uppercase text-gray-500">{{ registration.categoryName }}</span>
                    </article>
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
  schoolLogo = signal<BadgeLogo | null>(null);
  municipalLogo = signal<BadgeLogo | null>(null);
  errorMessage = signal('');
  logoError = signal('');
  isLoading = signal(false);
  isGenerating = signal(false);

  studentCount(): number {
    return this.registrations().reduce((total, registration) => total + registration.members.length, 0);
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
    this.schoolLogo.set(null);
    this.municipalLogo.set(null);
    this.logoError.set('');

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

  selectLogo(event: Event, type: 'school' | 'municipal'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.logoError.set('Selecciona un archivo PNG o JPG.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const logo = { name: file.name, dataUrl: reader.result };
      if (type === 'school') this.schoolLogo.set(logo);
      else this.municipalLogo.set(logo);
      this.logoError.set('');
    };
    reader.onerror = () => this.logoError.set('No fue posible leer la imagen seleccionada.');
    reader.readAsDataURL(file);
  }

  async downloadBadges(): Promise<void> {
    const schoolLogo = this.schoolLogo();
    const municipalLogo = this.municipalLogo();
    if (!schoolLogo || !municipalLogo) return;

    this.isGenerating.set(true);
    this.logoError.set('');
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const badgeWidth = 88;
      const badgeHeight = 126;
      const positions = [
        [15, 9], [112.9, 9], [15, 144.4], [112.9, 144.4]
      ];
      const students = this.registrations().flatMap(registration =>
        registration.members.map(member => ({ registration, member }))
      );

      students.forEach(({ registration, member }, index) => {
        if (index > 0 && index % positions.length === 0) pdf.addPage();
        const [x, y] = positions[index % positions.length];
        this.drawBadge(pdf, x, y, badgeWidth, badgeHeight, registration, member.fullName, schoolLogo.dataUrl, municipalLogo.dataUrl);
      });

      pdf.save(`Escarapelas_Feria_Robotica_Nobsa_${this.institutionCode()}.pdf`);
    } catch (error) {
      console.error('Error generando las escarapelas:', error);
      this.logoError.set('No fue posible generar el PDF. Verifica que ambos logos sean imágenes válidas.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  private drawBadge(
    pdf: import('jspdf').jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    registration: Registration,
    studentName: string,
    schoolLogo: string,
    municipalLogo: string
  ): void {
    pdf.setFillColor('#07111c');
    pdf.roundedRect(x, y, width, height, 2, 2, 'F');
    pdf.setDrawColor('#00d9ff');
    pdf.setLineWidth(0.8);
    pdf.roundedRect(x + 1.5, y + 1.5, width - 3, height - 3, 1.5, 1.5, 'S');
    pdf.setFillColor('#00d9ff');
    pdf.rect(x + 2, y + 2, width - 4, 5, 'F');

    pdf.setTextColor('#07111c');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.text('III CONCURSO Y MUESTRA DE', x + width / 2, y + 5.5, { align: 'center' });

    this.addContainedImage(pdf, schoolLogo, x + 6, y + 11, 18, 16);
    this.addContainedImage(pdf, municipalLogo, x + width - 24, y + 11, 18, 16);

    pdf.setTextColor('#00d9ff');
    pdf.setFontSize(20);
    pdf.text('ROBÓTICA', x + width / 2, y + 35, { align: 'center' });
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(7);
    pdf.text('I.E. TÉCNICA DE NAZARETH · NOBSA', x + width / 2, y + 41, { align: 'center' });

    pdf.setDrawColor('#d6a735');
    pdf.setLineWidth(0.5);
    pdf.line(x + 10, y + 46, x + width - 10, y + 46);

    pdf.setTextColor('#d6a735');
    pdf.setFontSize(7);
    pdf.text('PARTICIPANTE', x + width / 2, y + 53, { align: 'center' });
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(16);
    const nameLines = pdf.splitTextToSize(studentName, width - 16).slice(0, 2);
    pdf.text(nameLines, x + width / 2, y + 63, { align: 'center', lineHeightFactor: 1.08 });

    const projectY = y + (nameLines.length > 1 ? 77 : 68);
    pdf.setTextColor('#00d9ff');
    pdf.setFontSize(7);
    pdf.text('PROYECTO', x + width / 2, projectY, { align: 'center' });
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(10);
    const projectLines = pdf.splitTextToSize(registration.projectTitle, width - 16).slice(0, 3);
    pdf.text(projectLines, x + width / 2, projectY + 7, { align: 'center', lineHeightFactor: 1.1 });

    const detailY = projectY + 8 + projectLines.length * 4.5;
    pdf.setTextColor('#a9bcc9');
    pdf.setFontSize(7);
    const categoryLines = pdf.splitTextToSize(registration.categoryName, width - 16).slice(0, 2);
    pdf.text(categoryLines, x + width / 2, detailY, { align: 'center', lineHeightFactor: 1.1 });
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(8);
    pdf.text(registration.institution || 'Institución educativa', x + width / 2, y + height - 15, {
      align: 'center',
      maxWidth: width - 14
    });
    pdf.setTextColor('#00d9ff');
    pdf.setFontSize(6.5);
    pdf.text('NOBSA · BOYACÁ · 6 NOVIEMBRE 2026', x + width / 2, y + height - 8, { align: 'center' });
  }

  private addContainedImage(pdf: import('jspdf').jsPDF, dataUrl: string, x: number, y: number, maxWidth: number, maxHeight: number): void {
    const properties = pdf.getImageProperties(dataUrl);
    const scale = Math.min(maxWidth / properties.width, maxHeight / properties.height);
    const width = properties.width * scale;
    const height = properties.height * scale;
    const format = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    pdf.addImage(dataUrl, format, x + (maxWidth - width) / 2, y + (maxHeight - height) / 2, width, height);
  }
}
