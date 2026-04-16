import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReportDataService, ReportRecord } from '../../../services/doctor-service/report.service';

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
    { label: 'Appointments', route: '/doctors/appointments', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' }
  ];

  patients: PatientReport[] = [
    {
      id: 1,
      patientName: 'James Johnson',
      age: 42,
      gender: 'Male',
      reportType: 'Cardiology Review',
      reportId: 'MR-2026-104',
      date: '25 Jun 2026',
      status: 'Critical',
      tone: 'pink',
      diagnosis: 'Elevated cardiovascular stress indicators with irregular rhythm observation.',
      doctorNote: 'Recommend ECG follow-up, blood pressure monitoring, and immediate consultation.',
      metrics: [
        { label: 'Heart Rate', value: '72 bpm' },
        { label: 'Blood Pressure', value: '120/80 mmHg' },
        { label: 'Cholesterol', value: '180 mg/dL' },
        { label: 'Body Temp', value: '37°C' }
      ]
    },
    {
      id: 2,
      patientName: 'Amara Silva',
      age: 31,
      gender: 'Female',
      reportType: 'Blood Profile',
      reportId: 'MR-2026-105',
      date: '25 Jun 2026',
      status: 'Reviewed',
      tone: 'green',
      diagnosis: 'Blood profile within normal range with mild iron deficiency markers.',
      doctorNote: 'Advise dietary supplements and repeat CBC after two weeks.',
      metrics: [
        { label: 'Hemoglobin', value: '11.8 g/dL' },
        { label: 'WBC', value: '6700 /µL' },
        { label: 'Platelets', value: '250k' },
        { label: 'Glucose', value: '98 mg/dL' }
      ]
    },
    {
      id: 3,
      patientName: 'Nethmi Perera',
      age: 27,
      gender: 'Female',
      reportType: 'MRI Summary',
      reportId: 'MR-2026-106',
      date: '24 Jun 2026',
      status: 'Pending',
      tone: 'orange',
      diagnosis: 'Radiology summary pending final interpretation by specialist.',
      doctorNote: 'Awaiting radiologist confirmation before treatment recommendation.',
      metrics: [
        { label: 'Scan Area', value: 'Brain' },
        { label: 'Contrast', value: 'Used' },
        { label: 'Status', value: 'In Review' },
        { label: 'Priority', value: 'Normal' }
      ]
    },
    {
      id: 4,
      patientName: 'Ravindu Fernando',
      age: 54,
      gender: 'Male',
      reportType: 'CT Report',
      reportId: 'MR-2026-107',
      date: '24 Jun 2026',
      status: 'Signature',
      tone: 'blue',
      diagnosis: 'CT findings documented and awaiting consultant approval signature.',
      doctorNote: 'Review complete. Final sign-off required before archive sync.',
      metrics: [
        { label: 'Scan Type', value: 'Thorax CT' },
        { label: 'Contrast', value: 'No' },
        { label: 'Priority', value: 'High' },
        { label: 'Report Pages', value: '08' }
      ]
    }
  ];

  currentPatient: PatientReport = this.patients[0];
  turningPatient: PatientReport = this.patients[0];
  nextPatient: PatientReport | null = null;

  isFlipping = false;
  pageNumber = 16;

  constructor(private reportService: ReportDataService) {}

  ngOnInit(): void {
    this.reportService.getAllReports().subscribe({
      next: (reports) => {
        if (!reports.length) {
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

  private mapReport(item: ReportRecord, index: number): PatientReport {
    const status = this.getStatus(item);
    const tone = this.getTone(status);

    return {
      id: item.id ?? index + 1,
      patientName: `Patient #${item.patientId}`,
      age: 0,
      gender: 'Patient',
      reportType: item.reportType || 'Medical Report',
      reportId: `MR-${item.id ?? index + 1}`,
      date: item.uploadedDate || 'Date not set',
      status,
      tone,
      diagnosis: item.reportName || 'No report name available',
      doctorNote: item.notes || 'No doctor note attached yet.',
      metrics: [
        { label: 'Report Name', value: item.reportName || 'N/A' },
        { label: 'Type', value: item.reportType || 'N/A' },
        { label: 'Doctor', value: item.doctor?.fullName || 'Unassigned' },
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
}
