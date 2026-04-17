import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest, UserRole } from '../../services/auth/auth.service';
import { DoctorSessionService } from '../../services/doctor-service/doctor-session.service';

interface FloatItem {
  img: string;
  x: string;
  y: string;
  delay: string;
}

interface SlideItem {
  bg: string;
  title: string;
  center: string;
  items: FloatItem[];
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo?: ElementRef<HTMLVideoElement>;
  isSubmitting = false;
  message = '';
  selectedRole: UserRole = 'DOCTOR';
  currentIndex = 0;

  private autoRotateId: any;

  // form: RegisterRequest = {
  //   fullName: '',
  //   email: '',
  //   phone: '',
  //   role: 'DOCTOR',
  //   mainSpecialization: '',
  //   additionalSpecialization: '',
  //   qualifications: '',
  //   experienceYears: 0,
  //   license: '',
  //   clinic: '',
  //   consultationFee: '',
  //   availability: '',
  //   languages: '',
  //   bio: '',
  //   password: '',


  // };

form: RegisterRequest = {

  fullName: '',
  email: '',
  phone: '',
  role: 'DOCTOR',

  // doctor fields
  mainSpecialization: '',
  additionalSpecialization: '',
  qualifications: '',
  experienceYears: 0,
  license: '',
  clinic: '',
  consultationFee: 0,
  availability: '',
  languages: '',
  bio: '',

  // patient fields
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  emergencyContact: '',

  password: '',

}

  slides: SlideItem[] = [
    {
      bg: '#transparent',
      title: 'Best Doctors',
      center: 'assets/login/d2.png',
      items: [
        { img: 'assets/login/o.png', x: '-20px', y: '-90px', delay: '0.2s' },
        { img: 'assets/login/o4.png', x: '180px', y: '-30px', delay: '0.4s' },
        { img: 'assets/login/05.png', x: '-30px', y: '140px', delay: '0.6s' },
        { img: 'assets/login/o5.png', x: '250px', y: '200px', delay: '0.8s' },
      ],
    },
    {
      bg: '#transparent',
      title: 'Best Services',
      center: 'assets/login/d3.png',
      items: [
        { img: 'assets/login/d4.jpg', x: '-40px', y: '50px', delay: '0.2s' },
        { img: 'assets/login/d6.jpg', x: '205px', y: '-35px', delay: '0.4s' },
        { img: 'assets/login/d8.jpg', x: '-45px', y: '295px', delay: '0.6s' },
        { img: 'assets/login/9.jpg', x: '255px', y: '195px', delay: '0.8s' },
      ],
    },
    {
      bg: '#transparent',
      title: '24/7 Open',
      center: 'assets/login/5.jpg',
      items: [
        { img: 'assets/login/1.jpg', x: '-30px', y: '-30px', delay: '0.2s' },
        { img: 'assets/login/2.jpg', x: '270px', y: '105px', delay: '0.4s' },
        { img: 'assets/login/3.jpg', x: '-50px', y: '230px', delay: '0.6s' },
        { img: 'assets/login/4.jpg', x: '250px', y: '300px', delay: '0.8s' },
      ],
    },
  ];

  constructor(
    private authService: AuthService,
    private sessionService: DoctorSessionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.autoRotateId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.autoRotateId) {
      clearInterval(this.autoRotateId);
    }
  }

  muteBackgroundVideo(): void {
    const video = this.backgroundVideo?.nativeElement;
    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.form.role = role;
    this.message = '';
  }

  // submit(): void {
  //   this.message = '';

  //   if (!this.form.fullName || !this.form.email || !this.form.password) {
  //     this.message = 'Full name, email, and password are required.';
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   this.form.role = this.selectedRole;

  //   this.authService.register(this.form).subscribe({
  //     next: (response) => {
  //       if (response.role === 'DOCTOR' && response.doctor?.id) {
  //         this.sessionService.setCurrentDoctor
  //           (response.doctor.id,
  //            response.doctor.email,
  //            response.token,
  //            response.doctor,
  //            response.role,
  //            response.userId);
  //         this.message = 'Signup complete. Redirecting...';
  //         this.isSubmitting = false;
  //         this.router.navigate(['/doctors/dashboard']);
  //         return;
  //       }

  //       this.sessionService.setAuthSession(response.email, response.role, response.token, response.userId);
  //       this.message = 'Signup complete. Redirecting...';
  //       this.isSubmitting = false;
  //       this.router.navigate(['/']);
  //     },
  //     error: (err) => {
  //       console.error('Signup failed', err);
  //       this.message = err?.error?.message || 'Could not create doctor account.';
  //       this.isSubmitting = false;
  //     }
  //   });
  // }

  submit(): void {
    this.message = '';

    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.message = 'Full name, email, and password are required.';
      return;
    }

    this.isSubmitting = true;
    this.form.role = this.selectedRole;

    this.authService.register(this.form).subscribe({
      next: (response) => {
        if (response.role === 'DOCTOR' && response.doctor?.id) {
          this.sessionService.setCurrentDoctor(
            response.doctor.id,
            response.doctor.email,
            response.token,
            response.doctor,
            response.role,
            response.userId,
            response.profileId ?? response.doctor.id,
          );
          this.message = 'Signup complete. Redirecting...';
          this.isSubmitting = false;
          this.router.navigate(['/doctors/dashboard']);
          return;
        }

        this.sessionService.setAuthSession(
          response.email,
          response.role,
          response.token,
          response.userId,
          response.profileId ?? undefined,
        );

        this.message = 'Signup complete. Redirecting...';
        this.isSubmitting = false;

        if (response.role === 'PATIENT') {
          this.router.navigate(['/patient/dashboard']);
          return;
        }

        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Signup failed', err);
        this.message = err?.error?.message || 'Could not create account.';
        this.isSubmitting = false;
      },
    });
  }
}
