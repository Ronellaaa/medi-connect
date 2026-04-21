import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.services';
import { AuthService } from '../../../services/auth/auth.service';

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
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    platformFees: 0
  };

  recentPatients: any[] = [];
  isLoading = true;
  error = '';

  greeting = '';
  adminName = '';
  currentDate = '';

  animatedStats = {
    patients: 0,
    active: 0,
    appointments: 0,
    revenue: 0
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.firstName || user?.name || 'Admin';

    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good morning' :
                    hour < 17 ? 'Good afternoon' :
                    'Good evening';

    this.currentDate = new Date().toLocaleDateString(
      'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';

    // Load patients first
    this.adminService.getAllPatients().subscribe({
      next: (patients: any[]) => {
        // Update stats with patient data
        this.stats.totalPatients = patients.length;
        this.stats.activePatients = patients.filter((p: any) => p.enabled === true).length;
        
        // Get recent patients (last 5)
        this.recentPatients = patients.slice(-5).reverse();
        
        // Now load appointment stats
        this.adminService.getPlatformStats().subscribe({
          next: (statsData: any) => {
            this.stats = {
              ...this.stats,
              totalAppointments: statsData.totalAppointments || 0,
              completedAppointments: statsData.completedAppointments || 0,
              cancelledAppointments: statsData.cancelledAppointments || 0,
              totalRevenue: statsData.totalRevenue || 0,
              platformFees: statsData.platformFees || 0
            };
            
            this.isLoading = false;
            this.animateCounters();
          },
          error: (err) => {
            console.error('Error loading stats:', err);
            this.isLoading = false;
            this.error = 'Failed to load complete statistics';
            this.animateCounters();
          }
        });
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.isLoading = false;
        this.error = 'Failed to load dashboard data. Please check your connection.';
      }
    });
  }

  animateCounters(): void {
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;

    let step = 0;

    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);

      this.animatedStats.patients = Math.floor((this.stats.totalPatients || 0) * ease);
      this.animatedStats.active = Math.floor((this.stats.activePatients || 0) * ease);
      this.animatedStats.appointments = Math.floor((this.stats.totalAppointments || 0) * ease);
      this.animatedStats.revenue = Math.floor((this.stats.totalRevenue || 0) * ease);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);
  }

  get monthEntries(): { label: string; count: number; height: number }[] {
    const active = this.stats.activePatients || 0;
    const inactive = (this.stats.totalPatients || 0) - active;

    const data = [
      { label: 'Active', count: active },
      { label: 'Inactive', count: inactive }
    ];

    const max = Math.max(...data.map(d => d.count), 1);

    return data.map(d => ({
      label: d.label,
      count: d.count,
      height: (d.count / max) * 100
    }));
  }

  get completionRate(): number {
    const done = this.stats.completedAppointments || 0;
    const total = this.stats.totalAppointments || 1;
    return Math.round((done / total) * 100);
  }

  get inactivePatients(): number {
    return (this.stats.totalPatients || 0) - (this.stats.activePatients || 0);
  }

  formatCurrency(val: number): string {
    if (!val && val !== 0) return '$0';
    if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'k';
    return '$' + (val || 0).toFixed(0);
  }

  fullName(p: any): string {
    if (!p) return '';
    return `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown';
  }

  initials(p: any): string {
    if (!p) return '?';
    return `${(p.firstName || '?').charAt(0)}${(p.lastName || '').charAt(0)}`.toUpperCase();
  }

  viewPatient(patient: any): void {
    // Navigate to patient details or open modal
    // You can implement this based on your requirements
    console.log('View patient:', patient);
  }

  refresh(): void {
    this.loadDashboardData();
  }

  logout(): void {
    this.authService.logout();
  }
}