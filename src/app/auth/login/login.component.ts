import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginEffectsService } from '../login-effects.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;
  registerForm : FormGroup;
  isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginEffects: LoginEffectsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loginEffects.applyLoginEffects();
    }
  }

  toggleForm() {
    if (this.isBrowser) {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.classList.toggle('sign-up-mode');
      }
    }
  }
  

  onSubmit() {
    if (this.loginForm.valid) {
      const { email } = this.loginForm.value;
      if (email === 'admin@test.com') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/user']);
      }
    }
  }

  loginWithGoogle() {
    // Implementa il login con Google
  }


  onRegister(){}
}
