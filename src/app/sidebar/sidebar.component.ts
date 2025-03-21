import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isOpen = false;

  @ViewChild('sidebar') sidebar!: ElementRef;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    if (this.sidebar) {
      if (this.isOpen) {
        this.sidebar.nativeElement.classList.add('open');
        this.sidebar.nativeElement.classList.remove('close');
      } else {
        this.sidebar.nativeElement.classList.add('close');
        this.sidebar.nativeElement.classList.remove('open');
      }
    }
  }
}
