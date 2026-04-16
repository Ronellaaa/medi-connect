import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.services';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    platformFees: 0
  };
  recentPatients: any[] = [];
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentPatients();
  }

  loadStats(): void {
    this.isLoading = true;
    this.adminService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load statistics');
        this.isLoading = false;
      }
    });
  }

  loadRecentPatients(): void {
    this.adminService.getAllPatients().subscribe({
      next: (data) => {
        this.recentPatients = data.slice(0, 5);
      },
      error: () => {}
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private showError(message: string): void {
    console.error(message);
  }
}
