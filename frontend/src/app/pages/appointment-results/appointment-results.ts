import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { Doctor, DoctorService } from '../../services/doctor-service/doctor.service';
import { AppointmentApiService, SlotRecord } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-results',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './appointment-results.html',
  styleUrl: './appointment-results.css',
})
export class AppointmentResults {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private doctorService = inject(DoctorService);
  private appointmentApi = inject(AppointmentApiService);
  private cdr = inject(ChangeDetectorRef);

  doctorIdQuery: number | null = null;
  doctorQuery = '';
  doctorEmailQuery = '';
  specialtyQuery = '';
  hospitalQuery = '';
  dateQuery = '';

  selectedDoctor: Doctor | null = null;
  doctorAvailability: SlotRecord[] = [];
  loading = true;
  loadError = '';

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.doctorIdQuery = params['doctorId'] ? Number(params['doctorId']) : null;
      this.doctorQuery = params['doctor'] ?? '';
      this.doctorEmailQuery = params['doctorEmail'] ?? '';
      this.specialtyQuery = params['specialty'] ?? '';
      this.hospitalQuery = params['hospital'] ?? '';
      this.dateQuery = params['date'] ?? '';
      this.loadResults();
    });
  }

  loadResults(): void {
    this.loading = true;
    this.loadError = '';
    this.selectedDoctor = null;
    this.doctorAvailability = [];

    if (this.doctorIdQuery) {
      this.selectedDoctor = {
        id: this.doctorIdQuery,
        fullName: this.doctorQuery || 'Selected doctor',
        email: this.doctorEmailQuery||'',
        phone: '',
        mainSpecialization: this.specialtyQuery || '',
        additionalSpecialization: '',
        qualifications: '',
        experienceYears: 0,
        clinic: this.hospitalQuery || '',
        bio: '',
      };
      this.loadDoctorDetails(this.doctorIdQuery);
      this.loadDoctorAvailability(this.doctorIdQuery, this.dateQuery);
      return;
    }

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        const matchedDoctor =
          doctors.find((doctor) => {
            const matchesDoctor =
              !this.doctorQuery ||
              doctor.fullName.toLowerCase().includes(this.doctorQuery.toLowerCase());
            const matchesDoctorEmail =
              !this.doctorEmailQuery ||
              doctor.email.toLowerCase().includes(this.doctorEmailQuery.toLowerCase());
            const matchesSpecialty =
              !this.specialtyQuery ||
              doctor.mainSpecialization.toLowerCase().includes(this.specialtyQuery.toLowerCase());
            const matchesHospital =
              !this.hospitalQuery ||
              (doctor.clinic ?? '').toLowerCase().includes(this.hospitalQuery.toLowerCase());

            return matchesDoctor && matchesSpecialty && matchesHospital;
          }) ?? null;

        if (!matchedDoctor?.id) {
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        this.selectedDoctor = matchedDoctor;
        this.loadDoctorAvailability(matchedDoctor.id, this.dateQuery);
      },
      error: () => {
        this.loadError = 'Could not load doctor results.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadDoctorDetails(doctorId: number): void {
    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (doctor) => {
        this.selectedDoctor = doctor;
        this.cdr.markForCheck();
      },
      error: () => {
        // Keep the query-param fallback doctor data if the details request fails.
      },
    });
  }

  private loadDoctorAvailability(doctorId: number, availabilityDate: string): void {
    if (!availabilityDate) {
      this.doctorAvailability = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.appointmentApi.getAvailableSlots(doctorId, availabilityDate).pipe(timeout(8000)).subscribe({
      next: (records) => {
        this.doctorAvailability = records;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = `Could not load available slots from /api/slots/available for doctor ${doctorId}.`;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  bookDoctor(doctor: Doctor, slot: SlotRecord): void {
    const slotStart = new Date(slot.slotStart);
    const slotEnd = new Date(slot.slotEnd);

    this.router.navigate(['/appointments/booking'], {
      queryParams: {
        slotId: slot.id,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        doctorEmail: doctor.email ?? '',
        specialty: doctor.mainSpecialization,
        hospital: slot.hospitalOrClinic || doctor.clinic || '',
        date: slot.availabilityDate || this.dateQuery || '',
        startTime: this.formatTime(slotStart),
        endTime: this.formatTime(slotEnd),
        fee: doctor.consultationFee ?? '',
      },
    });
  }

  formatAvailability(record: SlotRecord): string {
    const dateLabel = this.formatDate(record.availabilityDate);
    const slotStart = new Date(record.slotStart);
    const slotEnd = new Date(record.slotEnd);
    return `${dateLabel} · ${this.formatTime(slotStart)} - ${this.formatTime(slotEnd)}`;
  }

  private formatDate(value?: string): string {
    if (!value) {
      return 'Date not set';
    }

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private formatTime(value: Date): string {
    if (Number.isNaN(value.getTime())) {
      return 'N/A';
    }

    return value.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
