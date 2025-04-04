import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
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
}
