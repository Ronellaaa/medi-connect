import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { AppointmentApiService, AppointmentsPayload } from '../../../services/appointment.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  uploadTitle = '';
  uploadDescription = '';
  selectedAppointmentId = '';
  appointments: AppointmentsPayload[] = [];
  showUploadModal = false;

  constructor(
    private reportService: ReportService,
    private appointmentApi: AppointmentApiService,
    private sessionService: DoctorSessionService
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.loadAppointments();
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportService.getMyReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load reports');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.showError('File size must be less than 10MB');
        return;
      }
      this.selectedFile = file;
    }
  }

  uploadReport(): void {
    if (!this.selectedFile || !this.uploadTitle || !this.selectedAppointmentId) {
      this.showError('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    this.reportService.uploadReport(
      this.selectedAppointmentId,
      this.uploadTitle,
      this.uploadDescription,
      this.selectedFile
    ).subscribe({
      next: () => {
        this.showSuccess('Report uploaded successfully');
        this.showUploadModal = false;
        this.uploadTitle = '';
        this.uploadDescription = '';
        this.selectedAppointmentId = '';
        this.selectedFile = null;
        this.loadReports();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Upload failed');
        this.isLoading = false;
      }
    });
  }

  deleteReport(id: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.deleteReport(id).subscribe({
        next: () => {
          this.showSuccess('Report deleted');
          this.loadReports();
        },
        error: () => {
          this.showError('Delete failed');
        }
      });
    }
  }

  downloadReport(filePath: string): void {
    window.open(filePath, '_blank');
  }

  closeModal(): void {
    this.showUploadModal = false;
  }

  private loadAppointments(): void {
    const patientId = this.sessionService.getCurrentProfileId();
    if (!patientId) {
      return;
    }

    this.appointmentApi.getAppointmentsByPatientId(patientId).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
      },
      error: () => {
        this.appointments = [];
      }
    });
  }

  private showError(message: string): void {
    console.error(message);
  }

  private showSuccess(message: string): void {
    console.log(message);
  }
}
