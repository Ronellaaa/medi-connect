import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppointmentsPayload } from '../../services/appointment.service';
import { DoctorAppoinmentDashboardService } from '../../services/doctor-appoinment-dashboard.service';

type CalendarDay = {
  dateNumber: number;
  isoDate: string | null;
  isCurrentMonth: boolean;
  isHighlighted: boolean;
  isActive: boolean;
};

@Component({
  selector: 'app-doctor-appoinment-dashboard',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './doctor-appoinment-dashboard.html',
  styleUrl: './doctor-appoinment-dashboard.css',
})
export class DoctorAppoinmentDashboard {
  private doctorAppoinmentDashboardService = inject(DoctorAppoinmentDashboardService);

  protected readonly doctorId = 101;
  protected readonly doctorName = 'Dr. John Smith';
  protected readonly specialty = 'Cardiologist';

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly appointments = signal<AppointmentsPayload[]>([]);
  protected readonly selectedDate = signal('');
  protected readonly calendarCursor = signal(new Date());

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
    const highlightedDates = this.highlightedDates();
    const highlightedSet = new Set(highlightedDates);
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
      const date = new Date(`${isoDate}T00:00:00`);
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

  protected readonly appointmentNotice = computed(() => {
    const count = this.filteredAppointments().length;
    if (count === 0) {
      return 'No appointments scheduled for the selected date.';
    }
    if (count === 1) {
      return 'You have 1 appointment on this date.';
    }
    return `You have ${count} appointments on this date.`;
  });

  constructor() {
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

  private loadAppointments(): void {
    this.doctorAppoinmentDashboardService.getDoctorAppoinments(this.doctorId).subscribe({
      next: (appointments) => {
        const sortedAppointments = [...appointments].sort((left, right) =>
          left.appointmentDate.localeCompare(right.appointmentDate),
        );
        this.appointments.set(sortedAppointments);
        const firstDate = sortedAppointments[0]?.appointmentDate.slice(0, 10) ?? '';
        this.selectedDate.set(firstDate);
        if (firstDate) {
          const firstDateObject = new Date(`${firstDate}T00:00:00`);
          this.calendarCursor.set(new Date(firstDateObject.getFullYear(), firstDateObject.getMonth(), 1));
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load doctor appointments right now.');
        this.loading.set(false);
      },
    });
  }
}
