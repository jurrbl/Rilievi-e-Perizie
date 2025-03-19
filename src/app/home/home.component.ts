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
  isOpen = false;
  isDropdownOpen = false;

  // Toggle apertura/chiusura sidebar
  toggleSidebar() {
    this.isOpen = !this.isOpen;
    const sidebar = document.querySelector('.sidebar');

    if (sidebar) {
      if (this.isOpen) {
        sidebar.classList.add('open');
        sidebar.classList.remove('close');
      } else {
        sidebar.classList.add('close');
        sidebar.classList.remove('open');
      }
    }
  }


  // Toggle apertura/chiusura dropdown
  toggleDropdown(event: Event) {
    event.stopPropagation(); // Evita chiusure accidentali della sidebar
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Chiudi sidebar cliccando fuori
  @HostListener('document:click', ['$event'])
  closeSidebar(event: Event) {
    const sidebar = document.querySelector('.sidebar');
    if (this.isOpen && sidebar && !sidebar.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }
}
