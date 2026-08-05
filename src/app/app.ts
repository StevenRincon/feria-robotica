import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { EventInfoComponent } from './components/event-info/event-info';
import { CategoriesComponent } from './components/categories/categories';
import { RegistrationFormComponent } from './components/registration-form/registration-form';
import { BadgeLookupComponent } from './components/badge-lookup/badge-lookup';
import { GalleryComponent } from './components/gallery/gallery';
import { FaqComponent } from './components/faq/faq';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { FooterComponent } from './components/footer/footer';
import { AiChatWidgetComponent } from './components/ai-chat-widget/ai-chat-widget';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    NavbarComponent,
    HeroComponent,
    EventInfoComponent,
    CategoriesComponent,
    RegistrationFormComponent,
    BadgeLookupComponent,
    GalleryComponent,
    FaqComponent,
    AdminPanelComponent,
    FooterComponent,
    AiChatWidgetComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
