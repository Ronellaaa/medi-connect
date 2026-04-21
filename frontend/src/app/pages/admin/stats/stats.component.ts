import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.services';

@Component({
  standalone: true,
  selector: 'app-stats',
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats: any = {
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    platformFees: 0,
    totalDoctors: 0,
    activeDoctors: 0,
    patientsByMonth: {}
  };
  
  isLoading = false;
  error = '';
  patientsByMonth: { month: string; label: string; count: number; height: number }[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { 
    this.loadStats(); 
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = '';
    
    this.adminService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = {
          ...this.stats,
          ...data,
          totalPatients: data.totalPatients || 0,
          activePatients: data.activePatients || 0,
          totalAppointments: data.totalAppointments || 0,
          completedAppointments: data.completedAppointments || 0,
          cancelledAppointments: data.cancelledAppointments || 0,
          totalRevenue: data.totalRevenue || 0,
          platformFees: data.platformFees || 0
        };
        
        this.processMonths();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error = 'Failed to load statistics. Please refresh the page.';
        this.isLoading = false;
      }
    });
  }

  processMonths(): void {
    if (!this.stats.patientsByMonth || Object.keys(this.stats.patientsByMonth).length === 0) {
      this.patientsByMonth = [];
      return;
    }
    
    const entries = Object.entries(this.stats.patientsByMonth as Record<string, number>)
      .sort(([a], [b]) => a.localeCompare(b));
    
    const max = Math.max(...entries.map(([, v]) => v as number), 1);
    
    this.patientsByMonth = entries.map(([month, count]) => {
      const [y, m] = month.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1);
      const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      return { 
        month, 
        label, 
        count: count as number, 
        height: Math.max(((count as number) / max) * 100, 3) 
      };
    });
  }

  get maxMonthCount(): number {
    return this.patientsByMonth.reduce((m, i) => Math.max(m, i.count), 0) || 1;
  }

  get completionRate(): number {
    const done = this.stats.completedAppointments || 0;
    const total = this.stats.totalAppointments || 1;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  get cancellationRate(): number {
    const cancelled = this.stats.cancelledAppointments || 0;
    const total = this.stats.totalAppointments || 1;
    return total > 0 ? Math.round((cancelled / total) * 100) : 0;
  }

  get avgRevenuePerAppointment(): number {
    const rev = this.stats.totalRevenue || 0;
    const total = this.stats.completedAppointments || 1;
    return total > 0 ? rev / total : 0;
  }

  get activePatientRate(): number {
    const active = this.stats.activePatients || 0;
    const total = this.stats.totalPatients || 1;
    return total > 0 ? Math.round((active / total) * 100) : 0;
  }

  get inactivePatients(): number {
    return (this.stats.totalPatients || 0) - (this.stats.activePatients || 0);
  }

  formatCurrency(v: number): string {
    if (!v && v !== 0) return '$0.00';
    return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  getAppointmentStatusEntries(): { label: string; count: number; pct: number }[] {
    if (!this.stats.appointmentsByStatus || Object.keys(this.stats.appointmentsByStatus).length === 0) {
      return [];
    }
    
    const entries = Object.entries(this.stats.appointmentsByStatus as Record<string, number>);
    const total = entries.reduce((s, [, v]) => s + (v as number), 0) || 1;
    
    return entries.map(([label, count]) => ({
      label,
      count: count as number,
      pct: Math.round(((count as number) / total) * 100)
    }));
  }

  refresh(): void {
    this.loadStats();
  }
}