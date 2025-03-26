import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { faGauge, faMap, faFolder, faUser } from '@fortawesome/free-solid-svg-icons';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // solo se usi routing
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(routes) 
  ]
});
