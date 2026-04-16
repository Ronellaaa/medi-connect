import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Doctor, DoctorService } from '../../services/doctor-service/doctor.service';

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

  doctorQuery = '';
  specialtyQuery = '';
  hospitalQuery = '';
  dateQuery = '';

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  loading = true;

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.doctorQuery = params['doctor'] ?? '';
      this.specialtyQuery = params['specialty'] ?? '';
      this.hospitalQuery = params['hospital'] ?? '';
      this.dateQuery = params['date'] ?? '';
      this.loadDoctors();
    });
  }

  loadDoctors(): void {
    this.loading = true;

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = doctors.filter((doctor) => {
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
        });

        this.loading = false;
      },
      error: () => {
        this.filteredDoctors = [];
        this.loading = false;
      },
    });
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
}
