import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isOpen = false;
  isDropdownOpen = false;

  // Toggle apertura/chiusura sidebar
  toggleSidebar() {
    this.isOpen = !this.isOpen;
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
