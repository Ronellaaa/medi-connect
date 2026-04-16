import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Doctor, DoctorService } from '../../services/doctor-service/doctor.service';

@Component({
  selector: 'app-appoinments',
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './appoinments.html',
  styleUrls: ['./appoinments.css'],
})
export class Appoinments implements OnInit {
  private router = inject(Router);
  private doctorService = inject(DoctorService);

  doctor = '';
  specialty = '';
  hospital = '';
  date = '';

  doctors: Doctor[] = [];

  filteredDoctorNames: string[] = [];
  filteredSpecialties: string[] = [];
  filteredHospitals: string[] = [];

  showDoctorSuggestions = false;
  showSpecialtySuggestions = false;
  showHospitalSuggestions = false;

  ngOnInit(): void {
    this.loadDoctors();
  }
  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (error) => {
        console.error('Failed to load doctors', error);
      },
    });
  }

  onDoctorInput(): void {
    const query = this.doctor.trim().toLowerCase();

    this.filteredDoctorNames = [
      ...new Set(
        this.doctors.map((d) => d.fullName).filter((name) => name.toLowerCase().includes(query)),
      ),
    ];

    this.showDoctorSuggestions = true;
  }

  onSpecialtyInput(): void {
    const query = this.specialty.trim().toLowerCase();

    this.filteredSpecialties = [
      ...new Set(
        this.doctors
          .map((d) => d.mainSpecialization)
          .filter((value) => value.toLowerCase().includes(query)),
      ),
    ];

    this.showSpecialtySuggestions = true;
  }

  onHospitalInput(): void {
    const query = this.hospital.trim().toLowerCase();

    this.filteredHospitals = [
      ...new Set(
        this.doctors
          .map((d) => d.clinic || '')
          .filter((value) => value && value.toLowerCase().includes(query)),
      ),
    ];

    this.showHospitalSuggestions = true;
  }

  selectDoctor(name: string): void {
    this.doctor = name;
    this.showDoctorSuggestions = false;
  }

  selectSpecialty(value: string): void {
    this.specialty = value;
    this.showSpecialtySuggestions = false;
  }

  selectHospital(value: string): void {
    this.hospital = value;
    this.showHospitalSuggestions = false;
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showDoctorSuggestions = false;
      this.showSpecialtySuggestions = false;
      this.showHospitalSuggestions = false;
    }, 150);
  }

  searchAppointments(): void {
    this.router.navigate(['/appointments/results'], {
      queryParams: {
        doctor: this.doctor || null,
        specialty: this.specialty || null,
        hospital: this.hospital || null,
        date: this.date || null,
      },
    });
  }
}
