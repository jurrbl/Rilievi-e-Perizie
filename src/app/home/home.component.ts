import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component'; // ✅ Importa la sidebar

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass, NgIf, RouterModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
 
}
