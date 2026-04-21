import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AppointmentApiService, AppointmentsPayload } from '../../services/appointment.service';
import { DoctorSessionService } from '../../services/doctor-service/doctor-session.service';
import { PatientService } from '../../services/patient.service';

type CalendarDay = {
  dateNumber: number;
  isoDate: string | null;
  isCurrentMonth: boolean;
  isHighlighted: boolean;
  isActive: boolean;
};

@Component({
  selector: 'app-patient-appoinment-dashboard',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './patient-appoinment-dashboard.html',
  styleUrl: './patient-appoinment-dashboard.css',
})
export class PatientAppoinmentDashboard {
  private appointmentApi = inject(AppointmentApiService);
  private sessionService = inject(DoctorSessionService);
  private patientService = inject(PatientService);
  private router = inject(Router);

  protected readonly patientId = this.sessionService.getCurrentProfileId();
  protected patientName = 'Patient';
  protected readonly profileTag = 'Patient Dashboard';

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly appointments = signal<AppointmentsPayload[]>([]);
  protected readonly allAppointments = signal<AppointmentsPayload[]>([]);
  protected readonly selectedDate = signal('');
  protected readonly calendarCursor = signal(new Date());
  protected readonly cancelPending = signal(false);

  protected showCancelModal = false;
  protected appointmentToCancel: AppointmentsPayload | null = null;

  protected readonly highlightedDates = computed(() => {
    return Array.from(
      new Set(
        this.appointments()
          .map((appointment) => appointment.appointmentDate.slice(0, 10))
          .sort((left, right) => left.localeCompare(right)),
      ),
    );
  });

  protected readonly calendarMonthLabel = computed(() => {
    return this.calendarCursor().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const highlightedSet = new Set(this.highlightedDates());
    const selectedDate = this.selectedDate();
    const cursor = this.calendarCursor();
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar: CalendarDay[] = [];

    for (let index = 0; index < startWeekday; index += 1) {
      calendar.push({
        dateNumber: 0,
        isoDate: null,
        isCurrentMonth: false,
        isHighlighted: false,
        isActive: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendar.push({
        dateNumber: day,
        isoDate,
        isCurrentMonth: true,
        isHighlighted: highlightedSet.has(isoDate),
        isActive: selectedDate === isoDate,
      });
    }

    return calendar;
  });

  protected readonly filteredAppointments = computed(() => {
    const selected = this.selectedDate();
    const appointments = this.appointments();
    return selected
      ? appointments.filter((appointment) => appointment.appointmentDate.startsWith(selected))
      : appointments;
  });

  constructor() {
    this.loadPatientProfile();
    this.loadAppointments();
  }

  protected selectDate(isoDate: string): void {
    this.selectedDate.set(isoDate);
  }

  protected goToPreviousMonth(): void {
    const current = this.calendarCursor();
    this.calendarCursor.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  protected goToNextMonth(): void {
    const current = this.calendarCursor();
    this.calendarCursor.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  protected formatDate(appointmentDate: string): string {
    return new Date(appointmentDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected formatTime(appointmentDate: string): string {
    return new Date(appointmentDate).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  protected formatAmount(amount?: number): string {
    if (amount == null) {
      return 'Pending';
    }

    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected openMeeting(appointment: AppointmentsPayload): void {
    if (appointment.status !== 'CONFIRMED' || appointment.liveStatus === 'COMPLETED' || !appointment.meetingUrl) {
      return;
    }

    window.open(appointment.meetingUrl, '_blank', 'noopener,noreferrer');
  }

  protected viewPrescription(appointment: AppointmentsPayload): void {
    if ((appointment.liveStatus || '').toUpperCase() !== 'COMPLETED' || !appointment.id) {
      return;
    }

    this.router.navigate(['/patient/prescriptions'], {
      queryParams: {
        appointmentId: appointment.id,
      },
    });
  }

  protected formatSelectedDayLabel(): string {
    const selected = this.selectedDate();
    if (!selected) {
      return 'No date selected';
    }

    return new Date(`${selected}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    });
  }

  protected trackByAppointmentId(_index: number, appointment: AppointmentsPayload): string {
    return appointment.id ?? `${appointment.patientId}-${appointment.doctorId}-${appointment.appointmentDate}`;
  }

  protected getQueueToken(appointment: AppointmentsPayload): number | null {
    return appointment.queueToken ?? null;
  }

  protected getQueueMessage(appointment: AppointmentsPayload): string {
    const status = (appointment.status || '').toUpperCase();
    const liveStatus = (appointment.liveStatus || '').toUpperCase();

    if (status === 'CANCELLED' || status === 'CANCELED') {
      return 'This appointment has been cancelled.';
    }
    if (status !== 'CONFIRMED') {
      return 'Waiting for payment and confirmation.';
    }
    if (liveStatus === 'COMPLETED') {
      return 'Your appointment is completed.';
    }
    if (liveStatus === 'ONGOING') {
      return 'It is your turn now.';
    }

    const token = this.getQueueToken(appointment);
    const currentServing = this.getCurrentServingToken(appointment);

    if (token == null) {
      return 'Queue token will be assigned after confirmation.';
    }
    if (currentServing == null) {
      const nextToken = this.getNextQueueToken(appointment);
      if (nextToken != null && token === nextToken) {
        return 'You are first in line.';
      }

      return `There are patients ahead of you. Your token is ${token}.`;
    }
    if (token === currentServing + 1) {
      return 'You are next.';
    }
    if (token <= currentServing) {
      return 'The queue has moved past your token. Please check with the clinic.';
    }
    return `Currently serving token ${currentServing}. Your token is ${token}.`;
  }

  protected openCancelModal(appointment: AppointmentsPayload): void {
    this.appointmentToCancel = appointment;
    this.showCancelModal = true;
  }

  protected closeCancelModal(): void {
    this.showCancelModal = false;
    this.appointmentToCancel = null;
    this.cancelPending.set(false);
  }

  protected confirmCancelAppointment(): void {
    if (!this.appointmentToCancel || this.cancelPending()) {
      return;
    }

    const appointmentId = this.appointmentToCancel.id;
    if (!appointmentId) {
      this.cancelPending.set(false);
      return;
    }
    this.cancelPending.set(true);

    this.appointmentApi.cancelAppointment(appointmentId).subscribe({
      next: () => {
        this.appointments.update((appointments) =>
          appointments.filter((appointment) => appointment.id !== appointmentId),
        );
        this.syncSelectedDateAfterMutation();
        this.closeCancelModal();
      },
      error: (error: unknown) => {
        console.error('Error cancelling appointment', error);
        this.cancelPending.set(false);
      },
    });
  }

  private loadAppointments(): void {
    if (!this.patientId) {
      this.errorMessage.set('Patient session not found. Please log in again.');
      this.loading.set(false);
      return;
    }

    this.appointmentApi.getAllAppointments().subscribe({
      next: (appointments) => {
        const sortedAppointments = [...appointments].sort((left, right) =>
          left.appointmentDate.localeCompare(right.appointmentDate),
        );
        this.allAppointments.set(sortedAppointments);

        const patientAppointments = sortedAppointments.filter(
          (appointment) => appointment.patientId === this.patientId,
        );

        this.appointments.set(patientAppointments);
        if (patientAppointments[0]?.patientName) {
          this.patientName = patientAppointments[0].patientName;
        }
        const firstDate = patientAppointments[0]?.appointmentDate.slice(0, 10) ?? '';
        this.selectedDate.set(firstDate);
        this.syncCalendarCursor(firstDate);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load patient appointments right now.');
        this.loading.set(false);
      },
    });
  }

  private loadPatientProfile(): void {
    this.patientService.getProfile().subscribe({
      next: (profile) => {
        const firstName = profile?.firstName ?? '';
        const lastName = profile?.lastName ?? '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
          this.patientName = fullName;
        }
      },
      error: () => {
        // Fall back to appointment patientName when profile fetch is unavailable.
      },
    });
  }

  private syncSelectedDateAfterMutation(): void {
    const appointments = this.appointments();
    const currentSelectedDate = this.selectedDate();
    const hasAppointmentsForSelectedDate = appointments.some((appointment) =>
      appointment.appointmentDate.startsWith(currentSelectedDate),
    );

    if (hasAppointmentsForSelectedDate) {
      return;
    }

    const nextDate = appointments[0]?.appointmentDate.slice(0, 10) ?? '';
    this.selectedDate.set(nextDate);
    this.syncCalendarCursor(nextDate);
  }

  private syncCalendarCursor(isoDate: string): void {
    if (!isoDate) {
      return;
    }

    const dateObject = new Date(`${isoDate}T00:00:00`);
    this.calendarCursor.set(new Date(dateObject.getFullYear(), dateObject.getMonth(), 1));
  }

  private getCurrentServingToken(appointment: AppointmentsPayload): number | null {
    const ongoingAppointment = this.getQueueAppointments(appointment)
      .find((item) => (item.liveStatus || '').toUpperCase() === 'ONGOING');

    return ongoingAppointment?.queueToken ?? null;
  }

  private getNextQueueToken(appointment: AppointmentsPayload): number | null {
    const queueAppointments = this.getQueueAppointments(appointment);
    const nextWaitingAppointment = queueAppointments.find((item) => {
      const liveStatus = (item.liveStatus || '').toUpperCase();
      return liveStatus !== 'COMPLETED' && liveStatus !== 'CANCELLED';
    });

    return nextWaitingAppointment?.queueToken ?? null;
  }

  private getQueueAppointments(appointment: AppointmentsPayload): AppointmentsPayload[] {
    return this.allAppointments()
      .filter((item) => item.doctorId === appointment.doctorId)
      .filter((item) => item.appointmentDate.slice(0, 10) === appointment.appointmentDate.slice(0, 10))
      .filter((item) => (item.status || '').toUpperCase() === 'CONFIRMED')
      .sort((left, right) => left.appointmentDate.localeCompare(right.appointmentDate));
  }
}
