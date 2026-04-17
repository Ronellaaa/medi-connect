import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { Doctor, DoctorService } from '../../services/doctor-service/doctor.service';
import {
  AvailabilityDataService,
  AvailabilityRecord,
} from '../../services/doctor-service/availability.service';

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
  private availabilityService = inject(AvailabilityDataService);
  private cdr = inject(ChangeDetectorRef);

  doctorIdQuery: number | null = null;
  doctorQuery = '';
  specialtyQuery = '';
  hospitalQuery = '';
  dateQuery = '';

  selectedDoctor: Doctor | null = null;
  doctorAvailability: AvailabilityRecord[] = [];
  loading = true;
  loadError = '';

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.doctorIdQuery = params['doctorId'] ? Number(params['doctorId']) : null;
      this.doctorQuery = params['doctor'] ?? '';
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
        email: '',
        phone: '',
        mainSpecialization: this.specialtyQuery || '',
        additionalSpecialization: '',
        qualifications: '',
        experienceYears: 0,
        clinic: this.hospitalQuery || '',
        bio: '',
      };
      this.loadDoctorAvailability(this.doctorIdQuery);
      return;
    }

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        const matchedDoctor =
          doctors.find((doctor) => {
            const matchesDoctor =
              !this.doctorQuery ||
              doctor.fullName.toLowerCase().includes(this.doctorQuery.toLowerCase());
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
          this.cdr.detectChanges();
          return;
        }

        this.selectedDoctor = matchedDoctor;
        this.loadDoctorAvailability(matchedDoctor.id);
      },
      error: () => {
        this.loadError = 'Could not load doctor results.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadDoctorAvailability(doctorId: number): void {
    this.availabilityService.getAvailabilityByDoctor(doctorId).pipe(timeout(8000)).subscribe({
      next: (records) => {
        this.doctorAvailability = this.filterAvailability(records);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = `Could not load availability from /api/availability/doctor/${doctorId}.`;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private filterAvailability(records: AvailabilityRecord[]): AvailabilityRecord[] {
    const dayFilter = this.dateQuery ? this.toDayOfWeek(this.dateQuery) : '';

    return records.filter((record) => {
      const matchesDay = !dayFilter || record.dayOfWeek?.toUpperCase() === dayFilter;

      return record.available && matchesDay;
    });
  }

  private toDayOfWeek(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  }

  bookDoctor(doctor: Doctor): void {
    this.router.navigate(['/appointments/booking'], {
      queryParams: {
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        specialty: doctor.mainSpecialization,
        hospital: doctor.clinic ?? '',
        date: this.dateQuery || '',
        fee: doctor.consultationFee ?? '',
      },
    });
  }

  formatAvailability(record: AvailabilityRecord): string {
    return `${record.dayOfWeek} · ${record.startTime.slice(0, 5)} - ${record.endTime.slice(0, 5)}`;
  }
}
