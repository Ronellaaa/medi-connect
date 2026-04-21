import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth/auth.service';
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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  selectedRole: UserRole = 'DOCTOR';
  email = '';
  password = '';
  showPassword = false;
  currentIndex = 0;
  message = '';

  private autoRotateId: any;

  constructor(
    private authService: AuthService,
    private sessionService: DoctorSessionService,
    private router: Router,
  ) {}

  slides: SlideItem[] = [
    {
      bg: '#fccbf0',
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
      bg: '#ffd6ea',
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
      bg: '#ded4fa',
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

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.message = '';
  }

  // onLogin(): void {
  //   this.message = '';

  //   if (!this.email || !this.password) {
  //     this.message = 'Enter your email and password.';
  //     return;
  //   }

  //   this.authService.login({
  //     email: this.email,
  //     password: this.password,
  //     role: this.selectedRole
  //   }).subscribe({
  //     next: (response) => {
  //       if (response.role === 'DOCTOR' && response.doctor?.id) {
  //         this.sessionService.setCurrentDoctor
  //           (response.doctor.id,
  //           response.doctor.email,
  //           response.token,
  //           response.doctor,
  //           response.role,
  //           response.userId);
  //         this.router.navigate(['/doctors/dashboard']);
  //         return;
  //       }

  //       this.sessionService.setAuthSession(response.email, response.role, response.token, response.userId);
  //       this.router.navigate(['/']);
  //     },
  //     error: (err) => {
  //       console.error('Login failed', err);
  //       this.message = err?.error?.message || 'Login failed.';
  //     }
  //   });
  // }
  onLogin(): void {
    this.message = '';

    if (!this.email || !this.password) {
      this.message = 'Enter your email and password.';
      return;
    }

    this.authService
      .login({
        email: this.email,
        password: this.password,
        role: this.selectedRole,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
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

          localStorage.setItem('user', JSON.stringify({
            email: response.email,
            role: response.role,
            firstName: 'ADMIN'
          }));

           if (response.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
            return;
          }

          if (response.role === 'PATIENT') {
            this.router.navigate(['/patient/dashboard']);
            return;
          }

          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.message = err?.error?.message || 'Login failed.';
        },
      });
  }
}
