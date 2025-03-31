declare var gapi: any;

import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser,
} from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeGoogleAuth();
    }
  }

  toggleForm() {
    if (this.isBrowser) {
      setTimeout(() => {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.classList.toggle('sign-up-mode');
        }
      }, 50);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email } = this.loginForm.value;
      if (email === 'admin@test.com') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      console.log('Registrazione completata', this.registerForm.value);
      this.toggleForm();
    }
  }

  initializeGoogleAuth() {
    const checkGapiInterval = setInterval(() => {
      if (typeof gapi !== 'undefined' && gapi?.load) {
        clearInterval(checkGapiInterval);
  
        gapi.load('auth2', () => {
          const auth2 = gapi.auth2.init({
            client_id:
              '494287917430-rtudqvlh033mrc90rq767q35puaj22tl.apps.googleusercontent.com',
            cookie_policy: 'single_host_origin',
          });
  
          const element = document.querySelector('.google-btn');
          if (element) {
            auth2.attachClickHandler(
              element,
              {},
              (googleUser: any) => {
                const profile = googleUser.getBasicProfile();
                console.log('✅ Google Login Success:', {
                  id: profile.getId(),
                  name: profile.getName(),
                  email: profile.getEmail(),
                });
  
                window.location.href = `http://localhost:3000/api/auth/google`;
              },
              (error: any) => {
                console.error('❌ Google Login Failed', error);
              }
            );
          }
        });
      }
    }, 200); // controlla ogni 200ms finché gapi è caricato
  }
  
}
