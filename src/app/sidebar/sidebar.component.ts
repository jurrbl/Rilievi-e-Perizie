import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'] // Corretto! ❌ "styleUrl" → ✅ "styleUrls"
})
export class SidebarComponent {
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
}
