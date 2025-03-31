import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  token: string | null = null;

  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    console.log('Token from URL:', this.token);

    if (this.token) {
      localStorage.setItem('token', this.token);

      // Rimuovi il token dall'URL
      const urlWithoutToken = this.route.snapshot.pathFromRoot
        .map(route => route.url.map(segment => segment.toString()).join('/'))
        .join('/');
      this.location.replaceState(urlWithoutToken);
    }
  }
}