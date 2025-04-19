import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() mobileOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  open = false;
  animate = true;
  isDropdownOpen = false;

  username: string = '';
  profilePicture: string = '';

  constructor(private authService: AuthService, private router : Router) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.username = user.username || user.googleUsername || '';
    this.profilePicture = user.profilePicture || '';
  }

  setOpen(value: boolean) {
    this.open = value;
  }

  logout() {
    this.authService.logout();
    // Optional: redirect dopo logout
    this.router.navigate(['/login']); // oppure altro path se preferisci
  }

toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

  toggleMobileSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar() {
    this.mobileOpen = false;
    this.close.emit();
  }
  
    logout() {
      this.authService.logout();
    }
}
