import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Doctor, DoctorService } from '../../services/doctor-service/doctor.service';
import {
  AvailabilityDataService,
  AvailabilityRecord,
} from '../../services/doctor-service/availability.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-appoinments',
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './appoinments.html',
  styleUrls: ['./appoinments.css'],
})
export class Appoinments implements OnInit {
  private router = inject(Router);
  private doctorService = inject(DoctorService);
  private availabilityService = inject(AvailabilityDataService);
  private patientService = inject(PatientService);

  doctor = '';
  doctorSearch = '';
  specialty = '';
  hospital = '';
  date = '';
  selectedDoctorId: number | null = null;

  doctors: Doctor[] = [];
  availableDoctors: Doctor[] = [];
  availabilityRecords: AvailabilityRecord[] = [];
  filteredDoctorOptions: Doctor[] = [];

  filteredSpecialties: string[] = [];
  filteredHospitals: string[] = [];

  patientDisplayName = '';
  loadingDoctors = false;
  loadingAvailability = false;
  showDoctorSuggestions = false;

  ngOnInit(): void {
    this.loadPatientProfile();
    this.loadDoctors();
    this.loadAvailability();
  }

  loadPatientProfile(): void {
    this.patientService.getProfile().subscribe({
      next: (profile) => {
        const firstName = profile?.firstName ?? '';
        const lastName = profile?.lastName ?? '';
        this.patientDisplayName = `${firstName} ${lastName}`.trim();
      },
      error: () => {
        this.patientDisplayName = '';
      },
    });
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.loadingDoctors = false;
        this.applyDoctorFilters();
      },
      error: (error) => {
        console.error('Failed to load doctors', error);
        this.loadingDoctors = false;
      },
    });
  }

  loadAvailability(): void {
    this.loadingAvailability = true;
    this.availabilityService.getAllAvailability().subscribe({
      next: (records) => {
        this.availabilityRecords = records.filter((record) => record.available);
        this.loadingAvailability = false;
        this.applyDoctorFilters();
      },
      error: (error) => {
        console.error('Failed to load availability', error);
        this.availabilityRecords = [];
        this.loadingAvailability = false;
        this.applyDoctorFilters();
      },
    });
  }

  onDateChange(): void {
    this.selectedDoctorId = null;
    this.doctor = '';
    this.doctorSearch = '';
    this.showDoctorSuggestions = false;
    this.applyDoctorFilters();
  }

  onSpecialtyChange(): void {
    this.selectedDoctorId = null;
    this.doctor = '';
    this.doctorSearch = '';
    this.showDoctorSuggestions = false;
    this.applyDoctorFilters();
  }

  onHospitalChange(): void {
    this.selectedDoctorId = null;
    this.doctor = '';
    this.doctorSearch = '';
    this.showDoctorSuggestions = false;
    this.applyDoctorFilters();
  }

  onDoctorSearchChange(): void {
    this.selectedDoctorId = null;
    this.doctor = '';
    this.applyDoctorFilters();
    this.showDoctorSuggestions = true;
  }

  onDoctorFocus(): void {
    this.applyDoctorFilters();
    this.showDoctorSuggestions = true;
  }

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctorId = doctor.id ?? null;
    this.doctor = doctor.fullName;
    this.doctorSearch = doctor.fullName;
    this.specialty = doctor.mainSpecialization;
    this.hospital = doctor.clinic ?? '';
    this.showDoctorSuggestions = false;
    this.applyDoctorFilters();
  }

  hideDoctorSuggestions(): void {
    setTimeout(() => {
      this.showDoctorSuggestions = false;
    }, 150);
  }

  goBackToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }

  searchAppointments(): void {
    const selectedDoctor = this.availableDoctors.find((item) => item.id === this.selectedDoctorId);

    this.router.navigate(['/appointments/results'], {
      queryParams: {
        doctorId: selectedDoctor?.id ?? null,
        doctor: (selectedDoctor?.fullName ?? this.doctor) || null,
        specialty: this.specialty || null,
        hospital: this.hospital || null,
        date: this.date || null,
      },
    });
  }

  private applyDoctorFilters(): void {
    const availableDoctorIds = this.getAvailableDoctorIdsForDate();

    this.availableDoctors = this.doctors.filter((doctor) => {
      const doctorId = doctor.id ?? 0;
      const matchesAvailability = !this.date || availableDoctorIds.has(doctorId);
      const matchesDoctorSearch =
        !this.doctorSearch ||
        doctor.fullName.toLowerCase().includes(this.doctorSearch.toLowerCase());
      const matchesSpecialty =
        !this.specialty ||
        doctor.mainSpecialization.toLowerCase() === this.specialty.toLowerCase();
      const matchesHospital =
        !this.hospital || (doctor.clinic ?? '').toLowerCase() === this.hospital.toLowerCase();

      return matchesAvailability && matchesDoctorSearch && matchesSpecialty && matchesHospital;
    });

    this.filteredDoctorOptions = [...this.availableDoctors];

    this.filteredSpecialties = [
      ...new Set(
        this.doctors
          .filter((doctor) => !this.date || availableDoctorIds.has(doctor.id ?? 0))
          .map((doctor) => doctor.mainSpecialization)
          .filter(Boolean),
      ),
    ].sort((left, right) => left.localeCompare(right));

    this.filteredHospitals = [
      ...new Set(
        this.doctors
          .filter((doctor) => !this.date || availableDoctorIds.has(doctor.id ?? 0))
          .map((doctor) => doctor.clinic || '')
          .filter(Boolean),
      ),
    ].sort((left, right) => left.localeCompare(right));
  }

  private getAvailableDoctorIdsForDate(): Set<number> {
    if (!this.date) {
      return new Set(
        this.availabilityRecords.map((record) => record.doctor?.id).filter((id): id is number => !!id),
      );
    }

    return new Set(
      this.availabilityRecords
        .filter((record) => record.availabilityDate === this.date)
        .map((record) => record.doctor?.id)
        .filter((id): id is number => !!id),
    );
  }
}
