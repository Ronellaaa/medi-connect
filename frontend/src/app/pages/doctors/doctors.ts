import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctor-service/doctor.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './doctors.html',
  styleUrls: ['./doctors.css'],
})
export class DoctorsComponent implements OnInit, AfterViewInit {
  navItems = [
    { label: 'Dashboard', route: '/doctors/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/doctors/profile', icon: '👤' },
    { label: 'Doctors', route: '/doctors/team', icon: '🩺' },
    { label: 'Availability', route: '/doctors/availability', icon: '⏱' },
    { label: 'Appointments', route: '/doctors/appointments', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' }
  ];

  doctors: Doctor[] = [];
  showModal = false;
  isEditMode = false;
  isSaving = false;
  selectedDoctorId: number | null = null;
  statusMessage = '';
  formData: Doctor = this.getEmptyDoctor();
  
  constructor(private doctorService: DoctorService, private el: ElementRef) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (data: Doctor[]) => {
        this.doctors = data;
        setTimeout(() => this.animateCards(), 50);
      },
      error: (err: any) => console.error('Failed to load doctors:', err)
    });
  }

  ngAfterViewInit(): void {
    this.initCinematicBg();
  }

  animateCards() {
    gsap.from(this.el.nativeElement.querySelectorAll('.doctor-card'), {
      duration: 1.5,
      y: 150,
      z: -300,
      rotateX: 45,
      opacity: 0,
      stagger: 0.15,
      ease: 'expo.out'
    });
  }

  initCinematicBg() {
    // Cinematic glowing ambient light animation
    const lights = this.el.nativeElement.querySelectorAll('.orb');
    lights.forEach((light: any) => {
      gsap.to(light, {
        duration: 'random(6, 12)',
        x: 'random(-20vw, 20vw)',
        y: 'random(-20vh, 20vh)',
        scale: 'random(0.8, 1.4)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Fade in primary layout
    gsap.from(this.el.nativeElement.querySelectorAll('.fade-up'), {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }

  getAvatarInitial(name: string) {
    if (!name) return 'D';
    return name.charAt(0).toUpperCase();
  }

  openCreateModal(): void {
    this.statusMessage = '';
    this.isEditMode = false;
    this.selectedDoctorId = null;
    this.formData = this.getEmptyDoctor();
    this.showModal = true;
  }

  openEditModal(doctor: Doctor): void {
    this.statusMessage = '';
    this.isEditMode = true;
    this.selectedDoctorId = doctor.id ?? null;
    this.formData = { ...this.getEmptyDoctor(), ...doctor };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isSaving = false;
  }

  saveDoctor(): void {
    this.statusMessage = '';

    if (!this.formData.fullName || !this.formData.email) {
      this.statusMessage = 'Full name and email are required.';
      return;
    }

    this.isSaving = true;

    const request$ = this.isEditMode && this.selectedDoctorId
      ? this.doctorService.updateDoctor(this.selectedDoctorId, this.formData)
      : this.doctorService.createDoctor(this.formData);

    request$.subscribe({
      next: () => {
        this.closeModal();
        this.loadDoctors();
      },
      error: (err) => {
        console.error('Failed to save doctor', err);
        this.statusMessage = 'Could not save doctor.';
        this.isSaving = false;
      }
    });
  }

  deleteDoctor(id?: number): void {
    if (!id || !confirm('Delete this doctor?')) {
      return;
    }

    this.doctorService.deleteDoctor(id).subscribe({
      next: () => this.loadDoctors(),
      error: (err: unknown) => console.error('Failed to delete doctor', err)
    });
  }

  private getEmptyDoctor(): Doctor {
    return {
      fullName: '',
      email: '',
      phone: '',
      mainSpecialization: '',
      additionalSpecialization: '',
      qualifications: '',
      experienceYears: 0,
      license: '',
      clinic: '',
      consultationFee: 0,
      availability: '',
      languages: '',
      bio: ''
    };
  }
}
