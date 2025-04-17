declare var gapi: any;

import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginEffectsService } from '../login-effects.service';
import { DataStorageService } from '../../shared/data-storage.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginEffectsService: LoginEffectsService,
    private dataStorage: DataStorageService, // ✅ INIETTA IL SERVIZIO
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeGoogleAuth();
      this.loginEffectsService.applyLoginEffects();
    }
  }

  toggleForm(event?: Event): void {
    if (event) event.preventDefault();

    if (this.isBrowser) {
      const main = document.querySelector('main');
      if (main) {
        main.classList.add('animating');
        setTimeout(() => {
          main.classList.toggle('sign-up-mode');
          main.classList.remove('animating');
        }, 100);
      }
    }
  }

  

  onSubmit(): void {
    if (this.loginForm.invalid) return;
  
    const { email, password } = this.loginForm.value;
  
    this.dataStorage.inviaRichiesta('post', '/auth/login', { email, password })?.subscribe({
      next: (res: any) => {
        console.log('✅ Login effettuato:', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
  
        if (email === 'admin@test.com') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('❌ Errore login:', err);
        alert(err.error?.message || 'Email o password errati.');
      }
    });
  }
    onRegister(): void {
    if (this.registerForm.invalid) return;
  
    const newUser = this.registerForm.value;
  
    this.dataStorage.inviaRichiesta('post', '/auth/register', newUser)?.subscribe({
      next: (res: any) => {
        console.log('✅ Utente registrato:', res);
        alert('Registrazione avvenuta con successo!');
        this.toggleForm(); // switcha al login
      },
      error: (err) => {
        console.error('❌ Errore registrazione:', err);
        alert(err.error?.message || 'Errore durante la registrazione.');
      }
    });
  }

  initializeGoogleAuth(): void {
    const interval = setInterval(() => {
      if (typeof gapi !== 'undefined' && gapi?.load) {
        clearInterval(interval);

        gapi.load('auth2', () => {
          const auth2 = gapi.auth2.init({
            client_id: '494287917430-rtudqvlh033mrc90rq767q35puaj22tl.apps.googleusercontent.com',
            cookie_policy: 'single_host_origin',
          });

          const element = document.querySelector('.google-btn');
          if (element) {
            auth2.attachClickHandler(
              element,
              {},
              (googleUser: any) => {
                const profile = googleUser.getBasicProfile();
                console.log('Google Login Success:', profile.getName(), profile.getEmail());
                window.location.href = 'http://localhost:3000/api/auth/google';
              },
              (err: any) => console.error('Google Login Failed:', err)
            );
          }
        });
      }
    }, 200);
  }
}
