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
    { label: 'Pending approval', value: '0' },
    { label: 'Completed', value: '0' },
    { label: 'Urgent cases', value: '0' }
  ];

  appointments: {
    id: number;
    patient: string;
    reason: string;
    date: string;
    time: string;
    status: string;
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
    this.appointmentService.getAllAppointments().subscribe({
      next: (records) => {
        this.stats = this.buildStats(records);
        this.appointments = records.map((item) => ({
          id: item.id!,
          patient: `Patient #${item.patientId}`,
          reason: item.reason || 'Consultation',
          date: item.appointmentDate || '',
          time: this.formatTime(item.appointmentTime),
          status: this.getStatusLabel(item),
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

  acceptAppointment(id: number): void {
    this.appointmentService.acceptAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Failed to accept appointment', err)
    });
  }

  rejectAppointment(id: number): void {
    this.appointmentService.rejectAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Failed to reject appointment', err)
    });
  }

  deleteAppointment(id: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.deleteAppointment(id).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => console.error('Failed to delete appointment', err)
      });
    }
  }

  private buildStats(appointments: AppointmentRecord[]) {
    const today = new Date().toISOString().slice(0, 10);

    return [
      { label: 'Today appointments', value: String(appointments.filter((item) => item.appointmentDate === today).length) },
      { label: 'Pending approval', value: String(appointments.filter((item) => (item.status || '').toUpperCase() === 'PENDING').length) },
      { label: 'Completed', value: String(appointments.filter((item) => (item.status || '').toUpperCase() === 'ACCEPTED').length) },
      { label: 'Urgent cases', value: String(appointments.filter((item) => (item.urgencyLevel || '').toUpperCase() === 'HIGH').length) }
    ];
  }

  private getStatusLabel(item: AppointmentRecord): string {
    const status = (item.status || '').toUpperCase();
    if (status === 'ACCEPTED') return 'Accepted';
    if (status === 'REJECTED') return 'Rejected';
    return 'Pending';
  }

  private getTone(item: AppointmentRecord): string {
    if ((item.urgencyLevel || '').toUpperCase() === 'HIGH') return 'pink';
    if ((item.status || '').toUpperCase() === 'ACCEPTED') return 'green';
    if ((item.status || '').toUpperCase() === 'REJECTED') return 'blue';
    return 'orange';
  }

  private formatTime(value: string): string {
    return value ? value.slice(0, 5) : 'Not set';
  }
}
