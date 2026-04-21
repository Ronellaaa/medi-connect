import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppointmentRecord, AppointmentService } from '../../../services/doctor-service/appointment.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';

@Component({
  selector: 'app-doctor-appointments-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class DoctorAppointmentsPageComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', route: '/doctors/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/doctors/profile', icon: '👤' },
    { label: 'Doctors', route: '/doctors/team', icon: '🩺' },
    { label: 'Availability', route: '/doctors/availability', icon: '⏱' },
    { label: 'Appointments', route: '/doctors/appointments', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' }
  ];

  stats = [
    { label: 'Today appointments', value: '0' },
    { label: 'Waiting queue', value: '0' },
    { label: 'Ongoing', value: '0' },
    { label: 'Completed', value: '0' }
  ];

  appointments: {
    id: string;
    patient: string;
    reason: string;
    date: string;
    time: string;
    status: string;
    liveStatus: string;
    urgency: string;
    tone: string;
    raw: AppointmentRecord;
  }[] = [];

  doctorId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private sessionService: DoctorSessionService
  ) {}

  ngOnInit(): void {
    this.doctorId = this.sessionService.getCurrentDoctorId();
    this.loadAppointments();
  }

  loadAppointments(): void {
    const request$ = this.doctorId
      ? this.appointmentService.getAppointmentsByDoctor(this.doctorId)
      : this.appointmentService.getAllAppointments();

    request$.subscribe({
      next: (records) => {
        this.stats = this.buildStats(records);
        this.appointments = records.map((item) => ({
          id: item.id!,
          patient: item.patientName || `Patient #${item.patientId}`,
          reason: item.reason || 'Consultation',
          date: this.formatDate(item.appointmentDate),
          time: this.formatTime(item.appointmentDate),
          status: this.getStatusLabel(item),
          liveStatus: this.getLiveStatusLabel(item),
          urgency: item.urgencyLevel || 'LOW',
          tone: this.getTone(item),
          raw: item
        }));
      },
      error: (err) => {
        console.error('Failed to load appointments', err);
      }
    });
  }

  acceptAppointment(id: string): void {
    this.appointmentService.acceptAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Failed to accept appointment', err)
    });
  }

  rejectAppointment(id: string): void {
    this.appointmentService.rejectAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Failed to reject appointment', err)
    });
  }

  deleteAppointment(id: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.deleteAppointment(id).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => console.error('Failed to delete appointment', err)
      });
    }
  }

  startAppointment(id: string): void {
    this.appointmentService.updateLiveStatus(id, 'ONGOING').subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Failed to start appointment', err)
    });
  }

  completeAppointment(id: string): void {
    this.appointmentService.updateLiveStatus(id, 'COMPLETED').subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Failed to complete appointment', err)
    });
  }

  private buildStats(appointments: AppointmentRecord[]) {
    const today = new Date().toISOString().slice(0, 10);

    return [
      { label: 'Today appointments', value: String(appointments.filter((item) => (item.appointmentDate || '').slice(0, 10) === today).length) },
      { label: 'Waiting queue', value: String(appointments.filter((item) => (item.liveStatus || '').toUpperCase() === 'WAITING').length) },
      { label: 'Ongoing', value: String(appointments.filter((item) => (item.liveStatus || '').toUpperCase() === 'ONGOING').length) },
      { label: 'Completed', value: String(appointments.filter((item) => (item.liveStatus || '').toUpperCase() === 'COMPLETED').length) }
    ];
  }

  private getStatusLabel(item: AppointmentRecord): string {
    const status = (item.status || '').toUpperCase();
    if (status === 'CONFIRMED') return 'Accepted';
    if (status === 'CANCELED') return 'Rejected';
    return 'Pending';
  }

  private getLiveStatusLabel(item: AppointmentRecord): string {
    const liveStatus = (item.liveStatus || '').toUpperCase();
    if (liveStatus === 'ONGOING') return 'Ongoing now';
    if (liveStatus === 'COMPLETED') return 'Completed';
    if (liveStatus === 'WAITING') return 'Waiting';
    if ((item.status || '').toUpperCase() === 'CONFIRMED') return 'Waiting';
    return 'Not in queue';
  }

  private getTone(item: AppointmentRecord): string {
    if ((item.liveStatus || '').toUpperCase() === 'ONGOING') return 'green';
    if ((item.liveStatus || '').toUpperCase() === 'COMPLETED') return 'blue';
    if ((item.urgencyLevel || '').toUpperCase() === 'HIGH') return 'pink';
    if ((item.status || '').toUpperCase() === 'CONFIRMED') return 'orange';
    if ((item.status || '').toUpperCase() === 'CANCELED') return 'blue';
    return 'orange';
  }

  private formatDate(value: string): string {
    return value ? value.slice(0, 10) : '';
  }

  private formatTime(value: string): string {
    return value ? value.slice(11, 16) : 'Not set';
  }
}
