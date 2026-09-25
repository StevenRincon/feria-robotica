import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationService } from '../../services/registration.service';
import { CategoryId, Registration } from '../../models/registration.model';

@Component({
  selector: 'app-registration-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="inscripcion" class="py-20 relative bg-[#05060a]">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">how_to_reg</mat-icon> FORMULARIO OFICIAL DE INSCRIPCIÓN
          </div>

          <h2 class="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            REGISTRO DE <span class="text-[#00f3ff]">PARTICIPANTES</span>
          </h2>

          <p class="text-gray-300 text-sm sm:text-base font-sans">
            Diligencia el formulario a continuación con los datos de tu equipo y proyecto. Recibirás tu credencial digital QR de acreditación.
          </p>
        </div>

        <!-- Success Modal / Confirmation View -->
        @if (createdRegistration()) {
          <div #badgeContainer class="bg-[#0a0c14] p-6 sm:p-10 border-2 border-[#00f3ff] max-w-2xl mx-auto animate-fadeIn relative">
            
            <div class="flex items-center justify-between pb-6 border-b border-[#00f3ff]/30">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 border border-emerald-400 bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div>
                  <h3 class="font-black text-xl text-white uppercase tracking-wider">¡INSCRIPCIÓN EXITOSA!</h3>
                  <p class="text-xs font-mono text-emerald-400 font-bold uppercase">Acreditación Oficial Generada</p>
                </div>
              </div>

              <span class="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 uppercase">
                {{ createdRegistration()?.status }}
              </span>
            </div>

            <!-- Digital Credential Badge Body -->
            <div class="my-6 p-6 bg-[#11141d] border border-[#00f3ff]/40 relative">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
                <!-- Details -->
                <div class="space-y-3 text-center sm:text-left">
                  <div class="inline-block px-2.5 py-1 bg-[#00f3ff] text-black text-xs font-mono font-black uppercase">
                    CÓDIGO: {{ createdRegistration()?.code }}
                  </div>

                  <h4 class="text-2xl font-black text-white uppercase tracking-wide">{{ createdRegistration()?.teamName }}</h4>
                  <p class="text-xs text-[#00f3ff] font-mono font-bold uppercase">{{ createdRegistration()?.projectTitle }}</p>

                  <div class="space-y-1 text-xs text-gray-300 pt-3 border-t border-[#00f3ff]/20 font-mono">
                    <div><strong class="text-white uppercase">Categoría:</strong> {{ createdRegistration()?.categoryName }}</div>
                    <div><strong class="text-white uppercase">Institución:</strong> {{ createdRegistration()?.institution }}</div>
                    <div><strong class="text-white uppercase">Líder:</strong> {{ createdRegistration()?.leaderName }} (DOC: {{ createdRegistration()?.leaderDoc }})</div>
                    <div><strong class="text-white uppercase">Ubicación:</strong> {{ createdRegistration()?.city }}, {{ createdRegistration()?.department }}</div>
                  </div>
                </div>

                <!-- Simulated Printable QR Badge -->
                <div class="shrink-0 flex flex-col items-center gap-2 bg-[#05060a] p-4 border border-[#00f3ff]/30">
                  <div class="w-32 h-32 bg-white p-2 flex items-center justify-center">
                    <!-- Clean SVG QR Code Representation -->
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
                      <rect x="70" y="85" width="15" height="8" fill="#000000"/>
                    </svg>
                  </div>
                  <span class="text-[10px] font-mono font-bold text-[#00f3ff] uppercase">NOBSA ROBÓTICA 2026</span>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <button 
                (click)="printBadge()" 
                type="button"
                class="cyber-button-primary w-full py-3.5 text-xs flex items-center justify-center gap-2">
                <mat-icon>print</mat-icon> IMPRIMIR / DESCARGAR CREDENCIAL
              </button>

              <button 
                (click)="resetForm()" 
                type="button"
                class="w-full py-3.5 text-xs font-mono font-bold uppercase bg-[#11141d] text-gray-300 hover:text-white hover:bg-slate-800 border border-[#00f3ff]/30 transition-colors flex items-center justify-center gap-2">
                <mat-icon>add_circle_outline</mat-icon> INSCRIBIR OTRO EQUIPO
              </button>
            </div>

          </div>
        } @else {
          <!-- Main Form Container -->
          <div class="bg-[#11141d] border border-[#00f3ff]/30 p-6 sm:p-10">
            
            <!-- Step Indicators -->
            <div class="flex items-center justify-between mb-8 pb-6 border-b border-[#00f3ff]/20 text-xs font-mono font-bold uppercase tracking-wider">
              <button 
                (click)="currentStep.set(1)"
                [class.text-[#00f3ff]]="currentStep() === 1"
                [class.text-gray-500]="currentStep() !== 1"
                class="flex items-center gap-2 focus:outline-none">
                <span [class.bg-[#00f3ff]]="currentStep() === 1" [class.text-black]="currentStep() === 1" [class.bg-[#05060a]]="currentStep() !== 1" [class.border]="currentStep() !== 1" [class.border-[#00f3ff]/30]="currentStep() !== 1" class="w-6 h-6 flex items-center justify-center">1</span>
                <span>Categoría e Institución</span>
              </button>

              <div class="h-0.5 w-12 bg-[#00f3ff]/20 hidden sm:block"></div>

              <button 
                (click)="currentStep.set(2)"
                [class.text-[#00f3ff]]="currentStep() === 2"
                [class.text-gray-500]="currentStep() !== 2"
                class="flex items-center gap-2 focus:outline-none">
                <span [class.bg-[#00f3ff]]="currentStep() === 2" [class.text-black]="currentStep() === 2" [class.bg-[#05060a]]="currentStep() !== 2" [class.border]="currentStep() !== 2" [class.border-[#00f3ff]/30]="currentStep() !== 2" class="w-6 h-6 flex items-center justify-center">2</span>
                <span>Participantes</span>
              </button>

              <div class="h-0.5 w-12 bg-[#00f3ff]/20 hidden sm:block"></div>

              <button 
                (click)="currentStep.set(3)"
                [class.text-[#00f3ff]]="currentStep() === 3"
                [class.text-gray-500]="currentStep() !== 3"
                class="flex items-center gap-2 focus:outline-none">
                <span [class.bg-[#00f3ff]]="currentStep() === 3" [class.text-black]="currentStep() === 3" [class.bg-[#05060a]]="currentStep() !== 3" [class.border]="currentStep() !== 3" [class.border-[#00f3ff]/30]="currentStep() !== 3" class="w-6 h-6 flex items-center justify-center">3</span>
                <span>Detalles del Proyecto</span>
              </button>
            </div>

            <form [formGroup]="regForm" (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- STEP 1: CATEGORY & INSTITUTION -->
              @if (currentStep() === 1) {
                <div class="space-y-6 animate-fadeIn">
                  
                  <!-- Select Category -->
                  <div>
                    <span class="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-2">
                      SELECCIONA LA CATEGORÍA DE INSCRIPCIÓN <span class="text-[#00f3ff]">*</span>
                    </span>

                    <div class="grid sm:grid-cols-3 gap-4">
                      @for (cat of categories; track cat.id) {
                        <label 
                          [class.border-[#00f3ff]]="f['category'].value === cat.id"
                          [class.bg-[#00f3ff]/10]="f['category'].value === cat.id"
                          [class.border-[#00f3ff]/20]="f['category'].value !== cat.id"
                          class="p-4 bg-[#05060a] border cursor-pointer transition-all flex flex-col justify-between hover:border-[#00f3ff]">
                          <input 
                            type="radio" 
                            formControlName="category" 
                            [value]="cat.id" 
                            class="sr-only" />
                          <div>
                            <div class="flex items-center justify-between mb-2">
                              <mat-icon class="text-[#00f3ff] text-xl">{{ cat.icon }}</mat-icon>
                              @if (f['category'].value === cat.id) {
                                <mat-icon class="text-[#00f3ff] text-sm">check_circle</mat-icon>
                              }
                            </div>
                            <div class="font-bold text-sm text-white uppercase font-mono">{{ cat.title }}</div>
                            <p class="text-[11px] text-gray-400 mt-1 font-sans">{{ cat.shortDesc }}</p>
                          </div>
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Team Name & Institution -->
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label for="teamName" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">NOMBRE DEL EQUIPO / ROBOT <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="teamName"
                        type="text" 
                        formControlName="teamName" 
                        placeholder="EJ. AGROBOT NOBSA"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono transition-colors" />
                      @if (f['teamName'].touched && f['teamName'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">El nombre del equipo es requerido (mín. 3 caracteres).</p>
                      }
                    </div>

                    <div>
                      <label for="projectTitle" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">NOMBRE DEL PROYECTO <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="projectTitle"
                        type="text" 
                        formControlName="projectTitle" 
                        placeholder="EJ. INVERNADERO AUTOMATIZADO CON ESP32"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono transition-colors" />
                      @if (f['projectTitle'].touched && f['projectTitle'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">El título del proyecto es requerido.</p>
                      }
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label for="institutionType" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">TIPO DE INSTITUCIÓN <span class="text-[#00f3ff]">*</span></label>
                      <select 
                        id="institutionType"
                        formControlName="institutionType"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white focus:outline-none focus:border-[#00f3ff] text-xs font-mono">
                        <option value="Colegio / I.E.">Colegio / I.E.</option>
                        <option value="Universidad / SENA">Universidad / SENA</option>
                        <option value="Club / Independiente">Club de Robótica / Independiente</option>
                        <option value="Empresa / StartUp">Empresa / StartUp</option>
                      </select>
                    </div>

                    <div>
                      <label for="institution" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">INSTITUCIÓN <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="institution"
                        type="text" 
                        formControlName="institution" 
                        placeholder="EJ. I.E. TÉCNICO INDUSTRIAL DE NOBSA"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                      @if (f['institution'].touched && f['institution'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">Nombre de institución requerido.</p>
                      }
                    </div>

                    <div>
                      <label for="city" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">MUNICIPIO / CIUDAD <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="city"
                        type="text" 
                        formControlName="city" 
                        placeholder="EJ. NOBSA, SOGAMOSO..."
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                    </div>
                  </div>

                  <div class="flex justify-end pt-4">
                    <button 
                      (click)="goToStep(2)"
                      type="button" 
                      class="cyber-button-primary px-6 py-3 text-xs flex items-center gap-2">
                      <span>SIGUIENTE: DATOS DE INTEGRANTES</span>
                      <mat-icon class="text-sm">arrow_forward</mat-icon>
                    </button>
                  </div>

                </div>
              }

              <!-- STEP 2: PARTICIPANTS & MENTOR -->
              @if (currentStep() === 2) {
                <div class="space-y-6 animate-fadeIn">
                  
                  <div class="bg-[#05060a] p-4 border border-[#00f3ff]/30 text-xs text-[#00f3ff] font-mono">
                    <strong class="font-bold">DATOS DEL LÍDER DEL EQUIPO:</strong> Se enviará la confirmación y acreditación al correo registrado.
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label for="leaderName" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">NOMBRE COMPLETO DEL LÍDER <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="leaderName"
                        type="text" 
                        formControlName="leaderName" 
                        placeholder="EJ. SANTIAGO VARGAS"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                      @if (f['leaderName'].touched && f['leaderName'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">Nombre del líder es requerido.</p>
                      }
                    </div>

                    <div>
                      <label for="leaderDoc" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">DOCUMENTO DE IDENTIDAD <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="leaderDoc"
                        type="text" 
                        formControlName="leaderDoc" 
                        inputmode="numeric"
                        placeholder="C.C. O T.I. NÚMERO"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                      @if (f['leaderDoc'].touched && f['leaderDoc'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">Ingresa un documento numérico.</p>
                      }
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label for="leaderEmail" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">CORREO ELECTRÓNICO <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="leaderEmail"
                        type="email" 
                        formControlName="leaderEmail" 
                        placeholder="CORREO@EJEMPLO.COM"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                      @if (f['leaderEmail'].touched && f['leaderEmail'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">Ingresa un correo válido con formato usuario&#64;dominio.com.</p>
                      }
                    </div>

                    <div>
                      <label for="leaderPhone" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">TELÉFONO DE CONTACTO <span class="text-[#00f3ff]">*</span></label>
                      <input 
                        id="leaderPhone"
                        type="tel" 
                        formControlName="leaderPhone" 
                        inputmode="numeric"
                        maxlength="10"
                        placeholder="EJ. 3101234567"
                        class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                      @if (f['leaderPhone'].touched && f['leaderPhone'].invalid) {
                        <p class="text-xs text-rose-400 mt-1 font-mono">El celular debe tener exactamente 10 dígitos.</p>
                      }
                    </div>
                  </div>

                  <div class="pt-4 border-t border-[#00f3ff]/20">
                    <h4 class="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-4">DOCENTE / PROFESOR <span class="text-[#00f3ff]">*</span></h4>
                    <div class="grid sm:grid-cols-2 gap-4">
                      <div>
                        <input type="text" formControlName="mentorName" placeholder="Nombre completo del docente o profesor" class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 text-xs font-mono" />
                        @if (f['mentorName'].touched && f['mentorName'].invalid) {
                          <p class="text-xs text-rose-400 mt-1 font-mono">El nombre del docente es obligatorio.</p>
                        }
                      </div>
                      <div>
                        <input type="text" inputmode="numeric" formControlName="mentorDoc" placeholder="Documento del docente o profesor" class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 text-xs font-mono" />
                        @if (f['mentorDoc'].touched && f['mentorDoc'].invalid) {
                          <p class="text-xs text-rose-400 mt-1 font-mono">El documento debe ser numérico.</p>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Additional Members -->
                  <div class="pt-4 border-t border-[#00f3ff]/20">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">INTEGRANTES ADICIONALES</h4>
                      <button 
                        (click)="addMember()"
                        type="button" 
                        [disabled]="membersArray.length >= 1"
                        class="px-3 py-1.5 bg-[#05060a] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1">
                        <mat-icon class="text-sm">add</mat-icon> AGREGAR INTEGRANTE
                      </button>
                    </div>

                    <div formArrayName="members" class="space-y-3">
                      @for (m of membersArray.controls; track $index) {
                        <div [formGroupName]="$index" class="p-3 bg-[#05060a] border border-[#00f3ff]/20 flex items-center justify-between gap-3">
                          <div class="grid grid-cols-2 gap-3 flex-1">
                            <input 
                              type="text" 
                              formControlName="fullName" 
                              placeholder="Nombre integrante"
                              class="px-3 py-2 bg-[#11141d] border border-[#00f3ff]/30 text-white text-xs font-mono" />
                            
                            <input 
                              type="text" 
                              formControlName="documentId" 
                              inputmode="numeric"
                              placeholder="Documento numérico"
                              class="px-3 py-2 bg-[#11141d] border border-[#00f3ff]/30 text-white text-xs font-mono" />
                          </div>

                          <button 
                            (click)="removeMember($index)"
                            type="button" 
                            class="p-2 text-rose-400 hover:bg-rose-500/10">
                            <mat-icon class="text-sm">delete</mat-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Navigation Buttons -->
                  <div class="flex items-center justify-between pt-4">
                    <button 
                      (click)="currentStep.set(1)"
                      type="button" 
                      class="px-5 py-3 font-mono text-xs font-bold uppercase bg-[#05060a] text-gray-300 hover:text-white border border-[#00f3ff]/30">
                      Anterior
                    </button>

                    <button 
                      (click)="goToStep(3)"
                      type="button" 
                      class="cyber-button-primary px-6 py-3 text-xs flex items-center gap-2">
                      <span>SIGUIENTE: DETALLES DEL PROYECTO</span>
                      <mat-icon class="text-sm">arrow_forward</mat-icon>
                    </button>
                  </div>

                </div>
              }

              <!-- STEP 3: PROJECT DETAILS & CONFIRMATION -->
              @if (currentStep() === 3) {
                <div class="space-y-6 animate-fadeIn">
                  
                  <div>
                    <label for="projectDescription" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">DESCRIPCIÓN DEL PROYECTO / PROTOTIPO <span class="text-[#00f3ff]">*</span></label>
                    <textarea 
                      id="projectDescription"
                      formControlName="projectDescription" 
                      rows="4" 
                      placeholder="Explica brevemente el objetivo, funcionamiento y componentes principales de tu robot o proyecto..."
                      class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono"></textarea>
                    @if (f['projectDescription'].touched && f['projectDescription'].invalid) {
                      <p class="text-xs text-rose-400 mt-1 font-mono">Escribe una breve descripción del proyecto (mín. 15 caracteres).</p>
                    }
                  </div>

                  <div>
                    <label for="technicalSpecs" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">ESPECIFICACIONES TÉCNICAS (HARDWARE / SENSORES)</label>
                    <input 
                      id="technicalSpecs"
                      type="text" 
                      formControlName="technicalSpecs" 
                      placeholder="EJ. ESP32, SENSORES INFRARROJOS QTR-8A, MOTORES N20..."
                      class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                  </div>

                  <div>
                    <label for="spaceRequirements" class="block text-xs font-mono font-bold text-gray-300 mb-1 uppercase">REQUERIMIENTOS DE ESPACIO Y ENERGÍA</label>
                    <input 
                      id="spaceRequirements"
                      type="text" 
                      formControlName="spaceRequirements" 
                      placeholder="EJ. PUNTO DE TOMA 110V 10A, ESPACIO MESA 1.5M..."
                      class="w-full px-4 py-3 bg-[#05060a] border border-[#00f3ff]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff] text-xs font-mono" />
                  </div>

                  <!-- Terms acceptance -->
                  <div class="p-4 bg-[#05060a] border border-[#00f3ff]/30 flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      formControlName="acceptTerms" 
                      id="acceptTerms"
                      class="mt-1 bg-[#11141d] border-[#00f3ff]/40 text-[#00f3ff] focus:ring-[#00f3ff]" />
                    <label for="acceptTerms" class="text-xs text-gray-300 leading-relaxed cursor-pointer font-sans">
                      Acepto el reglamento oficial de la Feria de Robótica del Municipio de Nobsa 2026 y autorizo el uso de datos personales exclusivamente para fines de acreditación y organización del evento.
                    </label>
                  </div>
                  @if (f['acceptTerms'].touched && f['acceptTerms'].invalid) {
                    <p class="text-xs text-rose-400 font-mono">Debes aceptar los términos y reglamento para continuar.</p>
                  }

                  <!-- Navigation & Submit -->
                  <div class="flex items-center justify-between pt-4">
                    <button 
                      (click)="currentStep.set(2)"
                      type="button" 
                      class="px-5 py-3 font-mono text-xs font-bold uppercase bg-[#05060a] text-gray-300 hover:text-white border border-[#00f3ff]/30">
                      Anterior
                    </button>

                    <button 
                      [disabled]="regForm.invalid || isSubmitting()"
                      type="submit" 
                      class="cyber-button-primary px-8 py-4 text-xs flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
                      @if (isSubmitting()) {
                        <mat-icon class="animate-spin text-sm">sync</mat-icon>
                        <span>PROCESANDO REGISTRO...</span>
                      } @else {
                        <mat-icon class="text-sm">verified</mat-icon>
                        <span>FINALIZAR INSCRIPCIÓN</span>
                      }
                    </button>
                  </div>

                </div>
              }

            </form>

          </div>
        }

      </div>
    </section>
  `
})
export class RegistrationFormComponent {
  regService = inject(RegistrationService);
  fb = inject(FormBuilder);

  @ViewChild('badgeContainer') badgeContainer!: ElementRef;

  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  createdRegistration = this.regService.currentRegistrationResult;
  categories = this.regService.categories;

  regForm = this.fb.group({
    category: ['automatizacion' as CategoryId, Validators.required],
    teamName: ['', [Validators.required, Validators.minLength(3)]],
    projectTitle: ['', Validators.required],
    institutionType: ['Colegio / I.E.', Validators.required],
    institution: ['', Validators.required],
    city: ['Nobsa', Validators.required],
    department: ['Boyacá'],
    leaderName: ['', Validators.required],
    leaderDoc: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    leaderEmail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)]],
    leaderPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    mentorName: ['', Validators.required],
    mentorDoc: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    members: this.fb.array([]),
    projectDescription: ['', [Validators.required, Validators.minLength(15)]],
    technicalSpecs: [''],
    spaceRequirements: [''],
    acceptTerms: [true, Validators.requiredTrue]
  });

  get f() {
    return this.regForm.controls;
  }

  get membersArray(): FormArray {
    return this.regForm.get('members') as FormArray;
  }

  constructor() {
    // Sync preselected category signal
    const selectedCat = this.regService.selectedCategoryForForm();
    if (selectedCat) {
      this.regForm.patchValue({ category: selectedCat });
    }
  }

  addMember(): void {
    if (this.membersArray.length >= 1) return;
    this.membersArray.push(
      this.fb.group({
        fullName: ['', Validators.required],
        documentId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        role: ['Integrante']
      })
    );
  }

  removeMember(index: number): void {
    this.membersArray.removeAt(index);
  }

  goToStep(step: number): void {
    if (step === 2) {
      if (this.f['teamName'].invalid || this.f['projectTitle'].invalid || this.f['institution'].invalid) {
        this.f['teamName'].markAsTouched();
        this.f['projectTitle'].markAsTouched();
        this.f['institution'].markAsTouched();
        return;
      }
    }
    if (step === 3) {
      if (this.f['leaderName'].invalid || this.f['leaderDoc'].invalid || this.f['leaderEmail'].invalid || this.f['leaderPhone'].invalid || this.f['mentorName'].invalid || this.f['mentorDoc'].invalid) {
        this.f['leaderName'].markAsTouched();
        this.f['leaderDoc'].markAsTouched();
        this.f['leaderEmail'].markAsTouched();
        this.f['leaderPhone'].markAsTouched();
        this.f['mentorName'].markAsTouched();
        this.f['mentorDoc'].markAsTouched();
        return;
      }
    }
    this.currentStep.set(step);
  }

  onSubmit(): void {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.regForm.value;

    this.regService.createRegistration(formValue as Partial<Registration>).subscribe({
      next: () => {
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error creating registration:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  printBadge(): void {
    window.print();
  }

  resetForm(): void {
    this.regService.currentRegistrationResult.set(null);
    this.regForm.reset({
      category: 'automatizacion',
      institutionType: 'Colegio / I.E.',
      city: 'Nobsa',
      department: 'Boyacá',
      acceptTerms: true
    });
    this.membersArray.clear();
    this.currentStep.set(1);
  }
}
