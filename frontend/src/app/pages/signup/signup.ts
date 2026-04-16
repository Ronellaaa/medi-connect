import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent implements OnInit, OnDestroy {
  fullName = '';
  email = '';
  phone = '';
  mainSpecialization = '';
  additionalSpecialization = '';
  qualifications = '';
  experienceYears: number | null = null;
  license = '';
  clinic = '';
  consultationFee = '';
  availability = '';
  languages = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;
  currentIndex = 0;

  private autoRotateId: any;

  slides: SlideItem[] = [
    {
      bg: '#fccbf0',
      title: 'Sweet Collection',
      center: 'assets/login/d2.png',
      items: [
        { img: 'assets/login/d2.png', x: '-20px', y: '-90px', delay: '0.2s' },
        { img: 'assets/login/d2.png', x: '180px', y: '-30px', delay: '0.4s' },
        { img: 'assets/login/d2.png', x: '-30px', y: '140px', delay: '0.6s' },
        { img: 'assets/login/d2.png', x: '250px', y: '200px', delay: '0.8s' },
      ],
    },
    {
      bg: '#ffd6ea',
      title: 'Dessert Mood',
      center: 'assets/login/d2.png',
      items: [
        { img: 'assets/login/d2.png', x: '-40px', y: '50px', delay: '0.2s' },
        { img: 'assets/login/d2.png', x: '205px', y: '-35px', delay: '0.4s' },
        { img: 'assets/login/d2.png', x: '-45px', y: '295px', delay: '0.6s' },
        { img: 'assets/login/d2.png', x: '255px', y: '195px', delay: '0.8s' },
      ],
    },
    {
      bg: '#ded4fa',
      title: 'Cute Specials',
      center: 'assets/login/d2.png',
      items: [
        { img: 'assets/login/d2.png', x: '-30px', y: '-30px', delay: '0.2s' },
        { img: 'assets/login/d2.png', x: '250px', y: '105px', delay: '0.4s' },
        { img: 'assets/login/d2.png', x: '-50px', y: '230px', delay: '0.6s' },
        { img: 'assets/login/d2.png', x: '250px', y: '300px', delay: '0.8s' },
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

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSignup(): void {
    const doctorPayload = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      mainSpecialization: this.mainSpecialization,
      additionalSpecialization: this.additionalSpecialization,
      qualifications: this.qualifications,
      experienceYears: this.experienceYears,
      license: this.license,
      clinic: this.clinic,
      consultationFee: this.consultationFee,
      availability: this.availability,
      languages: this.languages,
      password: this.password,
      confirmPassword: this.confirmPassword,
    };

    console.log('Signup clicked', doctorPayload);

    // later connect this to your backend API
  }
}