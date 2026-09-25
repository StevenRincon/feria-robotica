import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from '../../services/registration.service';
import { Registration, RegistrationStatus } from '../../models/registration.model';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="admin" class="py-20 relative bg-[#05060a] border-t border-[#00f3ff]/20">
      @if (!isAuthenticated()) {
          <div class="max-w-md mx-auto bg-[#11141d] border-2 border-[#00f3ff]/40 p-6 sm:p-8">
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-14 h-14 border border-[#00f3ff]/40 bg-[#00f3ff]/10 text-[#00f3ff] mb-4">
                <mat-icon>lock</mat-icon>
              </div>
              <h2 class="text-2xl font-black text-white uppercase tracking-tight">Acceso administrativo</h2>
              <p class="text-xs text-gray-400 font-mono mt-2 uppercase">Ingresa la contraseña para consultar los proyectos inscritos.</p>
            </div>

            <form (ngSubmit)="authenticate()" class="space-y-4">
              <div>
                <label for="adminPassword" class="block text-xs font-mono font-bold text-gray-300 mb-2 uppercase">Contraseña</label>
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  [(ngModel)]="password"
                  autocomplete="current-password"
                  class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white focus:outline-none focus:border-[#00f3ff] text-sm font-mono"
                  placeholder="Ingresa la contraseña" />
              </div>

              @if (authenticationError()) {
                <p class="text-xs text-rose-400 font-mono">Contraseña incorrecta.</p>
              }

              <button type="submit" class="cyber-button-primary w-full py-3 text-xs flex items-center justify-center gap-2">
                <mat-icon class="text-sm">login</mat-icon>
                <span>INGRESAR AL PANEL</span>
              </button>
            </form>
          </div>
      } @else {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest mb-2">
              <mat-icon class="text-sm">admin_panel_settings</mat-icon> PANEL DE ADMINISTRACIÓN
            </div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">
              GESTIÓN E INSCRIPCIONES EN <span class="text-[#00f3ff]">TIEMPO REAL</span>
            </h2>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button 
              (click)="exportToCsv()"
              type="button" 
              class="px-4 py-2.5 bg-[#11141d] border border-[#00f3ff]/40 text-gray-200 hover:text-white hover:border-[#00f3ff] text-xs font-mono font-bold uppercase transition-all flex items-center gap-2">
              <mat-icon class="text-[#00f3ff] text-sm">download</mat-icon> EXPORTAR EXCEL/CSV
            </button>

            <button 
              (click)="exportToJson()"
              type="button" 
              class="px-4 py-2.5 bg-[#11141d] border border-[#00f3ff]/40 text-gray-200 hover:text-white hover:border-[#00f3ff] text-xs font-mono font-bold uppercase transition-all flex items-center gap-2">
              <mat-icon class="text-[#00f3ff] text-sm">code</mat-icon> RESPALDAR JSON
            </button>
          </div>
        </div>

        <!-- KPI Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="p-5 bg-[#11141d] border border-[#00f3ff]/30">
            <div class="text-xs font-mono font-bold text-gray-400 uppercase">Equipos Inscritos</div>
            <div class="font-mono font-black text-4xl text-[#00f3ff] mt-2">{{ stats()?.totalTeams || 0 }}</div>
            <div class="text-[10px] font-mono text-gray-500 mt-1 uppercase">Sistemas registrados</div>
          </div>

          <div class="p-5 bg-[#11141d] border border-[#00f3ff]/30">
            <div class="text-xs font-mono font-bold text-gray-400 uppercase">Total Participantes</div>
            <div class="font-mono font-black text-4xl text-emerald-400 mt-2">{{ stats()?.totalParticipants || 0 }}</div>
            <div class="text-[10px] font-mono text-gray-500 mt-1 uppercase">Estudiantes y tutores</div>
          </div>

          <div class="p-5 bg-[#11141d] border border-[#00f3ff]/30">
            <div class="text-xs font-mono font-bold text-gray-400 uppercase">Municipios</div>
            <div class="font-mono font-black text-4xl text-amber-400 mt-2">{{ stats()?.totalMunicipalities || 0 }}</div>
            <div class="text-[10px] font-mono text-gray-500 mt-1 uppercase">Representación Boyacá</div>
          </div>

          <div class="p-5 bg-[#11141d] border border-[#00f3ff]/30">
            <div class="text-xs font-mono font-bold text-gray-400 uppercase">Aprobados</div>
            <div class="font-mono font-black text-4xl text-sky-400 mt-2">{{ stats()?.byStatus?.aprobado || 0 }}</div>
            <div class="text-[10px] font-mono text-gray-500 mt-1 uppercase">Escarapelas activas</div>
          </div>
        </div>

        <!-- Search & Category Filters -->
        <div class="bg-[#11141d] p-4 sm:p-6 border border-[#00f3ff]/30 mb-6">
          <div class="grid sm:grid-cols-3 gap-4">
            
            <div class="relative sm:col-span-2">
              <mat-icon class="absolute left-3.5 top-3 text-gray-400">search</mat-icon>
              <input 
                type="text" 
                [(ngModel)]="searchFilter" 
                (ngModelChange)="onFilterChange()"
                placeholder="FILTRAR POR EQUIPO, PROYECTO, COLEGIO O LÍDER..."
                class="w-full pl-10 pr-4 py-2.5 bg-[#05060a] border border-[#00f3ff]/30 text-white text-xs font-mono uppercase placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]" />
            </div>

            <div>
              <select 
                [(ngModel)]="categoryFilter" 
                (ngModelChange)="onFilterChange()"
                class="w-full px-4 py-2.5 bg-[#05060a] border border-[#00f3ff]/30 text-white text-xs font-mono focus:outline-none focus:border-[#00f3ff]">
                <option value="all">Todas las Categorías</option>
                <option value="automatizacion">Automatización Electrónica</option>
                <option value="seguidores">Seguidores de Línea</option>
                <option value="educativos">Proyectos para primaria</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Registrations Data Table -->
        <div class="bg-[#11141d] border border-[#00f3ff]/30">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-[#05060a] text-gray-400 font-bold uppercase tracking-wider border-b border-[#00f3ff]/30">
                <tr>
                  <th class="p-4">Código / Fecha</th>
                  <th class="p-4">Equipo / Proyecto</th>
                  <th class="p-4">Categoría</th>
                  <th class="p-4">Institución & Ciudad</th>
                  <th class="p-4">Líder & Contacto</th>
                  <th class="p-4">Estado</th>
                  <th class="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#00f3ff]/10 text-gray-200">
                @for (item of registrations(); track item.id) {
                  <tr class="hover:bg-[#05060a]/50 transition-colors">
                    
                    <td class="p-4">
                      <div class="font-bold text-[#00f3ff]">{{ item.code }}</div>
                      <div class="text-[10px] text-gray-500">{{ item.createdAt | date:'shortDate' }}</div>
                    </td>

                    <td class="p-4 max-w-xs">
                      <div class="font-bold text-white uppercase">{{ item.teamName }}</div>
                      <div class="text-[11px] text-gray-400 truncate uppercase">{{ item.projectTitle }}</div>
                    </td>

                    <td class="p-4">
                      <span class="px-2 py-1 bg-[#05060a] text-[#00f3ff] border border-[#00f3ff]/30 text-[10px] font-bold uppercase">
                        {{ item.categoryName }}
                      </span>
                    </td>

                    <td class="p-4">
                      <div class="font-bold text-gray-200 uppercase">{{ item.institution }}</div>
                      <div class="text-[11px] text-gray-400 uppercase">{{ item.city }}, {{ item.department }}</div>
                    </td>

                    <td class="p-4">
                      <div class="font-bold text-gray-200 uppercase">{{ item.leaderName }}</div>
                      <div class="text-[10px] text-gray-400">{{ item.leaderEmail }}</div>
                      <div class="text-[10px] text-[#00f3ff]">{{ item.leaderPhone }}</div>
                    </td>

                    <td class="p-4">
                      <select 
                        [ngModel]="item.status" 
                        (ngModelChange)="updateStatus(item.id, $event)"
                        class="px-2.5 py-1 bg-[#05060a] border border-[#00f3ff]/30 text-[10px] font-mono font-bold uppercase focus:outline-none"
                        [class.text-emerald-400]="item.status === 'Aprobado'"
                        [class.text-amber-400]="item.status === 'En revisión'"
                        [class.text-[#00f3ff]]="item.status === 'Confirmado'">
                        <option value="Confirmado">Confirmado</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Aprobado">Aprobado</option>
                      </select>
                    </td>

                    <td class="p-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button 
                          (click)="openDetailModal(item)"
                          type="button" 
                          title="Ver detalle"
                          class="p-1.5 text-[#00f3ff] hover:bg-[#00f3ff]/10">
                          <mat-icon class="text-base">visibility</mat-icon>
                        </button>

                        <button 
                          (click)="deleteItem(item.id)"
                          type="button" 
                          title="Eliminar"
                          class="p-1.5 text-rose-400 hover:bg-rose-500/10">
                          <mat-icon class="text-base">delete</mat-icon>
                        </button>
                      </div>
                    </td>

                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-8 text-center text-gray-400 text-xs font-mono uppercase">
                      No hay inscripciones registradas con los filtros seleccionados.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detail Modal Drawer -->
        @if (selectedDetail()) {
          <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-[#11141d] p-6 sm:p-8 max-w-2xl w-full border-2 border-[#00f3ff] space-y-4 max-h-[90vh] overflow-y-auto">
              
              <div class="flex items-center justify-between pb-4 border-b border-[#00f3ff]/30">
                <div>
                  <span class="text-xs font-mono text-[#00f3ff] font-bold uppercase">{{ selectedDetail()?.code }}</span>
                  <h3 class="text-2xl font-black text-white uppercase">{{ selectedDetail()?.teamName }}</h3>
                </div>

                <button (click)="selectedDetail.set(null)" type="button" class="p-2 text-gray-400 hover:text-white">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <div class="space-y-3 text-xs font-mono text-gray-300">
                <div><strong class="text-white uppercase">Proyecto:</strong> {{ selectedDetail()?.projectTitle }}</div>
                <div><strong class="text-white uppercase">Categoría:</strong> {{ selectedDetail()?.categoryName }}</div>
                <div><strong class="text-white uppercase">Institución:</strong> {{ selectedDetail()?.institution }} ({{ selectedDetail()?.institutionType }})</div>
                <div><strong class="text-white uppercase">Ubicación:</strong> {{ selectedDetail()?.city }}, {{ selectedDetail()?.department }}</div>
                
                <div class="pt-3 border-t border-[#00f3ff]/20">
                  <strong class="text-[#00f3ff] uppercase">Descripción del Proyecto:</strong>
                  <p class="mt-1 text-gray-300 leading-relaxed bg-[#05060a] p-3 border border-[#00f3ff]/30 font-sans">
                    {{ selectedDetail()?.projectDescription }}
                  </p>
                </div>

                @if (selectedDetail()?.technicalSpecs) {
                  <div><strong class="text-white uppercase">Especificaciones Técnicas:</strong> {{ selectedDetail()?.technicalSpecs }}</div>
                }

                @if (selectedDetail()?.spaceRequirements) {
                  <div><strong class="text-white uppercase">Requerimientos de Espacio/Energía:</strong> {{ selectedDetail()?.spaceRequirements }}</div>
                }

                <div class="pt-3 border-t border-[#00f3ff]/20">
                  <strong class="text-[#00f3ff] uppercase">Integrantes del Equipo:</strong>
                  <div class="mt-2 space-y-1">
                    @for (m of selectedDetail()?.members; track m.id) {
                      <div class="p-2 bg-[#05060a] border border-[#00f3ff]/20 flex items-center justify-between">
                        <span class="uppercase">{{ m.fullName }} ({{ m.role }})</span>
                        <span class="text-gray-400">DOC: {{ m.documentId }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4 border-t border-[#00f3ff]/20">
                <button 
                  (click)="selectedDetail.set(null)" 
                  type="button" 
                  class="px-5 py-2.5 bg-[#05060a] hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase transition-colors">
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        }

      </div>
      }
    </section>
  `
})
export class AdminPanelComponent implements OnDestroy {
  private readonly testPassword = 'T1cN0b54';
  private readonly sessionDurationMs = 3 * 60 * 1000;
  private sessionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  regService = inject(RegistrationService);

  registrations = this.regService.registrations;
  stats = this.regService.stats;

  searchFilter = '';
  categoryFilter = 'all';
  password = '';
  isAuthenticated = signal(false);
  authenticationError = signal(false);
  selectedDetail = signal<Registration | null>(null);

  authenticate(): void {
    this.isAuthenticated.set(this.password === this.testPassword);
    this.authenticationError.set(!this.isAuthenticated());
    if (this.isAuthenticated()) {
      this.password = '';
      this.clearSessionTimeout();
      this.sessionTimeoutId = setTimeout(() => {
        this.isAuthenticated.set(false);
        this.selectedDetail.set(null);
        this.sessionTimeoutId = null;
      }, this.sessionDurationMs);
      this.regService.loadRegistrations(this.categoryFilter, this.searchFilter).subscribe();
      this.regService.loadStats().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.clearSessionTimeout();
  }

  private clearSessionTimeout(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
  }

  onFilterChange(): void {
    this.regService.loadRegistrations(this.categoryFilter, this.searchFilter).subscribe();
  }

  updateStatus(id: string, status: RegistrationStatus): void {
    this.regService.updateStatus(id, status).subscribe({
      error: error => console.error('Error actualizando estado:', error)
    });
  }

  deleteItem(id: string): void {
    if (confirm('¿Estás seguro de eliminar este registro de inscripción?')) {
      this.regService.deleteRegistration(id).subscribe({
        error: error => console.error('Error eliminando inscripción:', error)
      });
    }
  }

  openDetailModal(item: Registration): void {
    this.selectedDetail.set(item);
  }

  exportToCsv(): void {
    this.regService.exportToCsv(this.registrations());
  }

  exportToJson(): void {
    this.regService.exportToJson(this.registrations());
  }
}
