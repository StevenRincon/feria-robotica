import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface PrototypeCard {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  institution: string;
  image: string;
  description: string;
  techTags: string[];
}

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="galeria" class="py-20 relative bg-[#05060a]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <mat-icon class="text-sm">photo_library</mat-icon> GALERÍA Y MUESTRA TÉCNICA
          </div>

          <h2 class="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            PROTOTIPOS Y <span class="text-[#00f3ff]">TECNOLOGÍA</span>
          </h2>

          <p class="text-gray-300 text-sm sm:text-base font-sans">
            Conoce proyectos de ediciones anteriores e inspiraciones técnicas desarrolladas por estudiantes e investigadores en Boyacá.
          </p>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex flex-wrap items-center justify-center gap-2 mb-10 font-mono text-xs font-bold uppercase">
          <button 
            (click)="filterCategory.set('all')"
            [class.bg-[#00f3ff]]="filterCategory() === 'all'"
            [class.text-black]="filterCategory() === 'all'"
            [class.text-gray-300]="filterCategory() !== 'all'"
            [class.bg-[#11141d]]="filterCategory() !== 'all'"
            [class.border-[#00f3ff]/30]="filterCategory() !== 'all'"
            type="button" 
            class="px-5 py-2.5 border transition-all">
            Todos los Prototipos
          </button>

          <button 
            (click)="filterCategory.set('automatizacion')"
            [class.bg-[#00f3ff]]="filterCategory() === 'automatizacion'"
            [class.text-black]="filterCategory() === 'automatizacion'"
            [class.text-gray-300]="filterCategory() !== 'automatizacion'"
            [class.bg-[#11141d]]="filterCategory() !== 'automatizacion'"
            [class.border-[#00f3ff]/30]="filterCategory() !== 'automatizacion'"
            type="button" 
            class="px-5 py-2.5 border transition-all">
            Automatización
          </button>

          <button 
            (click)="filterCategory.set('seguidores')"
            [class.bg-[#00f3ff]]="filterCategory() === 'seguidores'"
            [class.text-black]="filterCategory() === 'seguidores'"
            [class.text-gray-300]="filterCategory() !== 'seguidores'"
            [class.bg-[#11141d]]="filterCategory() !== 'seguidores'"
            [class.border-[#00f3ff]/30]="filterCategory() !== 'seguidores'"
            type="button" 
            class="px-5 py-2.5 border transition-all">
            Seguidores de Línea
          </button>

          <button 
            (click)="filterCategory.set('educativos')"
            [class.bg-[#00f3ff]]="filterCategory() === 'educativos'"
            [class.text-black]="filterCategory() === 'educativos'"
            [class.text-gray-300]="filterCategory() !== 'educativos'"
            [class.bg-[#11141d]]="filterCategory() !== 'educativos'"
            [class.border-[#00f3ff]/30]="filterCategory() !== 'educativos'"
            type="button" 
            class="px-5 py-2.5 border transition-all">
            Proyectos para primaria
          </button>
        </div>

        <!-- Prototypes Grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of filteredPrototypes(); track item.id) {
            <div class="bg-[#11141d] border border-[#00f3ff]/30 group hover:border-[#00f3ff] transition-all duration-300 flex flex-col justify-between">
              
              <!-- Image Banner with Referral Policy -->
              <div>
                <div class="relative h-48 overflow-hidden bg-[#05060a]">
                  <img 
                    [src]="item.image" 
                    [alt]="item.title"
                    referrerpolicy="no-referrer"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#11141d] via-transparent to-transparent"></div>
                  
                  <span class="absolute top-3 left-3 px-2.5 py-1 bg-[#05060a]/90 text-[#00f3ff] font-mono font-bold text-[10px] uppercase border border-[#00f3ff]/40">
                    {{ item.categoryName }}
                  </span>
                </div>

                <!-- Content -->
                <div class="p-6 space-y-3">
                  <h3 class="font-black text-white text-lg uppercase tracking-wide group-hover:text-[#00f3ff] transition-colors">
                    {{ item.title }}
                  </h3>

                  <p class="text-xs text-gray-300 leading-relaxed font-sans">
                    {{ item.description }}
                  </p>

                  <div class="text-xs text-gray-400 font-mono">
                    <strong class="text-white uppercase">Institución:</strong> {{ item.institution }}
                  </div>
                </div>
              </div>

              <div class="p-6 pt-0">
                <div class="flex flex-wrap gap-1.5 pt-3 border-t border-[#00f3ff]/20">
                  @for (tag of item.techTags; track tag) {
                    <span class="px-2 py-1 text-[10px] font-mono font-bold uppercase bg-[#05060a] text-[#00f3ff] border border-[#00f3ff]/30">
                      {{ tag }}
                    </span>
                  }
                </div>
              </div>

            </div>
          }
        </div>

      </div>
    </section>
  `
})
export class GalleryComponent {
  filterCategory = signal<string>('all');

  prototypes: PrototypeCard[] = [
    {
      id: 'p1',
      title: 'Invernadero Inteligente LoRaWAN',
      category: 'automatizacion',
      categoryName: 'Automatización Electrónica',
      institution: 'I.E. Técnico Industrial de Nobsa',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      description: 'Monitoreo de microclima para hortalizas en Nobsa con telemetría en tiempo real y fertirriego programado.',
      techTags: ['ESP32', 'LoRaWAN', 'Sensores SHT31', 'OLED']
    },
    {
      id: 'p2',
      title: 'Robot Velocista PID Pro',
      category: 'seguidores',
      categoryName: 'Seguidores de Línea',
      institution: 'UPTC Sogamoso',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
      description: 'Robot autónomo de carrera con turbina de succión aerodinámica y regleta infrarroja de 8 sensores.',
      techTags: ['STM32', 'Control PID', 'QTR-8A', 'Batería LiPo 3S']
    },
    {
      id: 'p3',
      title: 'Kit Didáctico STEM Modular',
      category: 'educativos',
      categoryName: 'Proyectos para primaria',
      institution: 'Colegio Salesiano Duitama',
      image: 'https://images.unsplash.com/photo-1561144212-6b3a32f63f53?auto=format&fit=crop&w=600&q=80',
      description: 'Plataforma educativa con bloques impresos en 3D para la enseñanza de programación gráfica en escuelas rural de Boyacá.',
      techTags: ['Micro:bit', 'Impresión 3D', 'Scratch', 'Pogo Pins']
    },
    {
      id: 'p4',
      title: 'Monitor Energético Metalmecánico',
      category: 'automatizacion',
      categoryName: 'Automatización Electrónica',
      institution: 'SENA Centro Industrial Nobsa',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      description: 'Sistema de telemetría de consumo de energía industrial e integración fotovoltaica.',
      techTags: ['PZEM-004T', 'MQTT', 'Node-RED', 'ESP32']
    },
    {
      id: 'p5',
      title: 'Seguidor de Línea Turbina Turbo-1',
      category: 'seguidores',
      categoryName: 'Seguidores de Línea',
      institution: 'Club de Robótica Tunja',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=600&q=80',
      description: 'Chasis ultra ligero de fibra de carbono para máxima velocidad en circuitos cerrados.',
      techTags: ['Fibra de Carbono', 'Motores N20', 'Driver TB6612']
    },
    {
      id: 'p6',
      title: 'Brazo Robótico Articulado 4DOF',
      category: 'educativos',
      categoryName: 'Proyectos para primaria',
      institution: 'Universidad Santo Tomás Tunja',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      description: 'Manipulador didáctico para enseñanza de cinemática inversa y visión por computador.',
      techTags: ['Servomotores', 'OpenCV', 'Python', 'Arduino']
    }
  ];

  filteredPrototypes() {
    const cat = this.filterCategory();
    if (cat === 'all') return this.prototypes;
    return this.prototypes.filter(p => p.category === cat);
  }
}
