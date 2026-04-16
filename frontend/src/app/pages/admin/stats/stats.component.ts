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
  stats: any = {};
  isLoading = false;
  patientsByMonth: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.adminService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.processPatientsByMonth();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load statistics');
        this.isLoading = false;
      }
    });
  }

  processPatientsByMonth(): void {
    if (this.stats.patientsByMonth) {
      this.patientsByMonth = Object.entries(this.stats.patientsByMonth).map(([month, count]) => ({
        month,
        count
      }));
    }
  }

  get maxCount(): number {
    return this.patientsByMonth.reduce((max, item) => Math.max(max, item.count), 0) || 1;
  }

  getBarColor(month: string): string {
    return month.toLowerCase().includes('jan') || month.toLowerCase().includes('feb')
      ? '#38bdf8'
      : '#7dd3fc';
  }

  getCompletionRate(): number {
    const completed = this.stats.completedAppointments || 0;
    const total = this.stats.totalAppointments || 1;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getAvgFee(): number {
    return this.stats.totalRevenue && this.stats.totalAppointments
      ? this.stats.totalRevenue / this.stats.totalAppointments
      : 0;
  }

  private showError(message: string): void {
    console.error(message);
  }
}
