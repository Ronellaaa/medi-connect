import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReportDataService, ReportRecord } from '../../../services/doctor-service/report.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';

interface PatientReport {
  id: number;
  patientName: string;
  age: number;
  gender: string;
  reportType: string;
  reportId: string;
  date: string;
  status: 'Critical' | 'Reviewed' | 'Pending' | 'Signature';
  tone: 'pink' | 'green' | 'orange' | 'blue';
  diagnosis: string;
  doctorNote: string;
  metrics: { label: string; value: string }[];
}

@Component({
  selector: 'app-doctor-reports-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class DoctorReportsPageComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', route: '/doctors/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/doctors/profile', icon: '👤' },
    { label: 'Doctors', route: '/doctors/team', icon: '🩺' },
    { label: 'Availability', route: '/doctors/availability', icon: '⏱' },
    { label: 'Appointments', route: '/appointments/doctor-dashboard', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' }
  ];

  patients: PatientReport[] = [];

  currentPatient: PatientReport = this.createEmptyReport();
  turningPatient: PatientReport = this.createEmptyReport();
  nextPatient: PatientReport | null = null;

  isFlipping = false;
  pageNumber = 16;

  constructor(
    private reportService: ReportDataService,
    private sessionService: DoctorSessionService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getRelevantReports().subscribe({
      next: (reports) => {
        if (!reports.length) {
          this.patients = [];
          this.currentPatient = this.createEmptyReport();
          this.turningPatient = this.currentPatient;
          return;
        }

        this.patients = reports.map((item, index) => this.mapReport(item, index));
        this.currentPatient = this.patients[0];
        this.turningPatient = this.patients[0];
        this.nextPatient = null;
      },
      error: (err) => {
        console.error('Failed to load reports', err);
      }
    });
  }

  selectPatient(patient: PatientReport): void {
    if (this.isFlipping || patient.id === this.currentPatient.id) return;

    this.isFlipping = true;
    this.nextPatient = patient;
    this.turningPatient = this.currentPatient;

    setTimeout(() => {
      if (this.nextPatient) {
        this.currentPatient = this.nextPatient;
        this.pageNumber += 2;
      }
    }, 420);

    setTimeout(() => {
      this.turningPatient = this.currentPatient;
      this.nextPatient = null;
      this.isFlipping = false;
    }, 950);
  }

  get statusClass(): string {
    return this.currentPatient.tone;
  }

  get turningStatusClass(): string {
    return this.turningPatient.tone;
  }

  get leftPageNumber(): number {
    return this.pageNumber;
  }

  get rightPageNumber(): number {
    return this.pageNumber + 1;
  }

  private createEmptyReport(): PatientReport {
    return {
      id: 0,
      patientName: 'No reports available',
      age: 0,
      gender: 'Patient',
      reportType: 'Medical Report',
      reportId: 'MR-0000',
      date: 'Date not set',
      status: 'Pending',
      tone: 'orange',
      diagnosis: 'No uploaded patient reports are available for your appointment queue yet.',
      doctorNote: 'Reports uploaded by relevant patients will appear here automatically.',
      metrics: [
        { label: 'Report Name', value: 'N/A' },
        { label: 'Type', value: 'N/A' },
        { label: 'Patient', value: 'N/A' },
        { label: 'Link', value: 'Pending' }
      ]
    };
  }

  private mapReport(item: ReportRecord, index: number): PatientReport {
    const status = this.getStatus(item);
    const tone = this.getTone(status);

    return {
      id: item.id ?? index + 1,
      patientName: item.patientName || `Patient #${item.patientId}`,
      age: item.age ?? 0,
      gender: item.gender || 'Patient',
      reportType: item.reportType || 'Medical Report',
      reportId: `MR-${item.id ?? index + 1}`,
      date: this.formatDisplayDate(item.uploadedDate),
      status,
      tone,
      diagnosis: item.reportName || 'No report name available',
      doctorNote: item.notes || 'No doctor note attached yet.',
      metrics: [
        { label: 'Report Name', value: item.reportName || 'N/A' },
        { label: 'Type', value: item.reportType || 'N/A' },
        { label: 'Patient', value: item.patientName || `Patient #${item.patientId}` },
        { label: 'Link', value: item.reportUrl ? 'Available' : 'Pending' }
      ]
    };
  }

  private getStatus(item: ReportRecord): 'Critical' | 'Reviewed' | 'Pending' | 'Signature' {
    const notes = (item.notes || '').toLowerCase();

    if (notes.includes('critical')) return 'Critical';
    if (notes.includes('signature')) return 'Signature';
    if (!item.reportUrl) return 'Pending';
    return 'Reviewed';
  }

  private getTone(status: 'Critical' | 'Reviewed' | 'Pending' | 'Signature'): 'pink' | 'green' | 'orange' | 'blue' {
    if (status === 'Critical') return 'pink';
    if (status === 'Reviewed') return 'green';
    if (status === 'Pending') return 'orange';
    return 'blue';
  }

  private formatDisplayDate(value?: string): string {
    if (!value) {
      return 'Date not set';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
