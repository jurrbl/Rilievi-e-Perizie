import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isOpen = false;
  isDropdownOpen = false;

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

  toggleDropdown(event: Event) {
    event.stopPropagation(); 
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
