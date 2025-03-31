import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  open = false;
  animate = true;
  name = "";

  username : any = "";

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.username = this.authService.getUser().username; // ✅ prende automaticamente username o googleUsername
    /* let userKey = Object.values(this.username)[2]
    console.log('👤 Utenpreaoodsakodte:', porcodio); */
  }


  setOpen(value: boolean) {
    this.open = value;
  }
}
