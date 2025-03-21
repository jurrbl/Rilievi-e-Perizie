import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRoutingProviders } from '../src/app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [appRoutingProviders]
}).catch(err => console.error(err));
