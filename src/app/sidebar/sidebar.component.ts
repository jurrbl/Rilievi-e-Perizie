import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() mobileOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  open = false;
  animate = true;

  username: string = '';
  profilePicture: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.username = user.username || user.googleUsername || '';
    this.profilePicture = user.profilePicture || '';
  }

  setOpen(value: boolean) {
    this.open = value;
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
