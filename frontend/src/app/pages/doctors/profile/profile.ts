import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Doctor, DoctorService } from '../../../services/doctor-service/doctor.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';

interface ProfileViewModel {
  fullName: string;
  specialty: string;
  additionalSpecialization: string;
  email: string;
  phone: string;
  license: string;
  clinic: string;
  experience: string;
  consultationFee: string;
  bio: string;
  qualification: string;
  languages: string;
  availability: string;
}

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class DoctorProfileComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', route: '/doctors/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/doctors/profile', icon: '👤' },
    { label: 'Doctors', route: '/doctors/team', icon: '🩺' },
    { label: 'Availability', route: '/doctors/availability', icon: '⏱' },
    { label: 'Appointments', route: '/doctors/appointments', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' }
  ];

  isEditMode = false;
  isSaving = false;
  isLoadingProfile = true;
  currentDoctorId: number | null = null;

  statusMessage = '';
  statusTone: 'success' | 'error' | 'info' = 'info';

  doctorProfile: ProfileViewModel = this.createEmptyProfile();
  draftProfile: ProfileViewModel = this.createEmptyProfile();

  constructor(
    private doctorService: DoctorService,
    private sessionService: DoctorSessionService
  ) {}

  ngOnInit(): void {
    this.loadCurrentDoctor();
  }

  toggleEdit(): void {
    this.statusMessage = '';
    this.statusTone = 'info';

    if (this.isLoadingProfile || !this.currentDoctorId) {
      this.statusMessage = 'Profile is still loading.';
      this.statusTone = 'error';
      return;
    }

    if (!this.isEditMode) {
      this.draftProfile = { ...this.doctorProfile };
    }

    this.isEditMode = !this.isEditMode;
  }

  cancelEdit(): void {
    this.draftProfile = { ...this.doctorProfile };
    this.isEditMode = false;
    this.statusMessage = 'Changes discarded.';
    this.statusTone = 'info';

    setTimeout(() => {
      if (this.statusTone === 'info') {
        this.statusMessage = '';
      }
    }, 2000);
  }

  saveProfile(): void {
    this.statusMessage = '';
    this.statusTone = 'info';

    if (!this.currentDoctorId) {
      this.statusMessage = 'No doctor record found to update.';
      this.statusTone = 'error';
      return;
    }

    if (!this.draftProfile.fullName.trim() || !this.draftProfile.email.trim()) {
      this.statusMessage = 'Full name and email are required.';
      this.statusTone = 'error';
      return;
    }

    this.isSaving = true;

    const years = Number.parseInt(this.draftProfile.experience, 10);
    const consultationFee = Number.parseFloat(this.draftProfile.consultationFee);

    const payload: Partial<Doctor> = {
      fullName: this.draftProfile.fullName.trim(),
      email: this.draftProfile.email.trim(),
      phone: this.draftProfile.phone.trim(),
      mainSpecialization: this.draftProfile.specialty.trim(),
      additionalSpecialization: this.draftProfile.additionalSpecialization.trim(),
      qualifications: this.draftProfile.qualification.trim(),
      experienceYears: Number.isNaN(years) ? 0 : years,
      license: this.draftProfile.license.trim(),
      clinic: this.draftProfile.clinic.trim(),
      consultationFee: Number.isNaN(consultationFee) ? 0 : consultationFee,
      availability: this.draftProfile.availability.trim(),
      languages: this.draftProfile.languages.trim(),
      bio: this.draftProfile.bio.trim()
    };

    this.doctorService.updateDoctor(this.currentDoctorId, payload).subscribe({
      next: (updated) => {
        this.applyDoctorProfile(updated);

        if (updated.id) {
          this.sessionService.setCurrentDoctor(
            updated.id,
            updated.email || this.draftProfile.email,
            this.sessionService.getToken() || undefined,
            updated
          );
        }

        this.isSaving = false;
        this.isEditMode = false;
        this.statusMessage = 'Updated successfully.';
        this.statusTone = 'success';

        setTimeout(() => {
          if (this.statusTone === 'success') {
            this.statusMessage = '';
          }
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to save doctor profile', err);
        this.isSaving = false;
        this.statusMessage = err?.error?.message || 'Update failed. Check backend and try again.';
        this.statusTone = 'error';
      }
    });
  }

  private loadCurrentDoctor(): void {
    this.isLoadingProfile = true;

    const cachedDoctor = this.sessionService.getCurrentDoctorProfile();
    const doctorId = this.sessionService.getCurrentDoctorId();

    if (cachedDoctor) {
      this.applyDoctorProfile(cachedDoctor);
      this.isLoadingProfile = false;
    }

    if (doctorId) {
      this.currentDoctorId = doctorId;

      this.doctorService.getDoctorById(doctorId).subscribe({
        next: (doctor) => {
          if (!doctor || !doctor.email) {
            this.loadDoctorByEmailFallback();
            return;
          }

          this.applyDoctorProfile(doctor);
          this.sessionService.setCurrentDoctor(
            doctor.id ?? doctorId,
            doctor.email,
            this.sessionService.getToken() || undefined,
            doctor
          );
          this.isLoadingProfile = false;
        },
        error: (err) => {
          console.error('Failed to load current doctor by id', err);
          if (!cachedDoctor) {
            this.loadDoctorByEmailFallback();
          }
        }
      });

      return;
    }

    this.loadDoctorByEmailFallback();
  }

  private loadDoctorByEmailFallback(): void {
    const email = this.sessionService.getCurrentDoctorEmail();

    if (!email) {
      this.isLoadingProfile = false;
      this.statusMessage = 'No logged-in doctor found. Please login again.';
      this.statusTone = 'error';
      return;
    }

    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        const doctor = doctors.find(
          (item) => item.email?.toLowerCase() === email.toLowerCase()
        );

        if (!doctor) {
          this.isLoadingProfile = false;
          this.statusMessage = 'Doctor profile not found for this email.';
          this.statusTone = 'error';
          return;
        }

        if (doctor.id) {
          this.currentDoctorId = doctor.id;
          this.sessionService.setCurrentDoctor(
            doctor.id,
            doctor.email,
            this.sessionService.getToken() || undefined,
            doctor
          );
        }

        this.applyDoctorProfile(doctor);
        this.isLoadingProfile = false;
      },
      error: (err) => {
        console.error('Failed to load doctor profile by email fallback', err);
        this.isLoadingProfile = false;
        this.statusMessage = 'Could not load doctor profile.';
        this.statusTone = 'error';
      }
    });
  }

  private applyDoctorProfile(doctor: Doctor): void {
    this.currentDoctorId = doctor.id ?? this.currentDoctorId;

    this.doctorProfile = {
      fullName: doctor.fullName || '',
      specialty: doctor.mainSpecialization || '',
      additionalSpecialization: doctor.additionalSpecialization || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      license: doctor.license || '',
      clinic: doctor.clinic || '',
      experience: doctor.experienceYears ? `${doctor.experienceYears}` : '',
      consultationFee:
        doctor.consultationFee != null ? `${doctor.consultationFee}` : '',
      bio: doctor.bio || '',
      qualification: doctor.qualifications || '',
      languages: doctor.languages || '',
      availability: doctor.availability || ''
    };

    this.draftProfile = { ...this.doctorProfile };
  }

  private createEmptyProfile(): ProfileViewModel {
    return {
      fullName: '',
      specialty: '',
      additionalSpecialization: '',
      email: '',
      phone: '',
      license: '',
      clinic: '',
      experience: '',
      consultationFee: '',
      bio: '',
      qualification: '',
      languages: '',
      availability: ''
    };
  }
}
