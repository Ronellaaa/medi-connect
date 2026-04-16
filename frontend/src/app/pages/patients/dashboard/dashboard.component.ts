import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { ReportService } from '../../../services/report.service';
import { PrescriptionService } from '../../../services/prescription.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  patientData: any = null;
  stats = {
    totalReports: 0,
    totalPrescriptions: 0,
    upcomingAppointments: 0
  };
  recentReports: any[] = [];
  recentPrescriptions: any[] = [];

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private reportService: ReportService,
    private prescriptionService: PrescriptionService
  ) {}

  ngOnInit(): void {
    this.loadPatientData();
    this.loadStats();
  }

  loadPatientData(): void {
    this.patientService.getProfile().subscribe({
      next: (data) => {
        this.patientData = data;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadStats(): void {
    this.reportService.getMyReports().subscribe({
      next: (reports) => {
        this.recentReports = reports.slice(0, 3);
        this.stats.totalReports = reports.length;
      },
      error: () => {}
    });

    this.prescriptionService.getMyPrescriptions().subscribe({
      next: (prescriptions) => {
        this.recentPrescriptions = prescriptions.slice(0, 3);
        this.stats.totalPrescriptions = prescriptions.length;
      },
      error: () => {}
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  logout(): void {
    this.authService.logout();
  }
}
