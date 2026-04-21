import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../doctor-service/doctor.service';
import { Router } from '@angular/router';
import { DoctorSessionService } from '../doctor-service/doctor-session.service';

export type UserRole = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  mainSpecialization?: string;
  additionalSpecialization?: string;
  qualifications?: string;
  experienceYears?: number;
  license?: string;
  clinic?: string;
  consultationFee?: number;
  availability?: string;
  languages?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  userId: number;
  role: UserRole;
  profileId?: number | null;
  email: string;
  doctor?: Doctor | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionService: DoctorSessionService,
  ) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }

  getCurrentUser(): any {
    if (this.currentUser) {
      return this.currentUser;
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }

    try {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  logout(): void {
    this.sessionService.clear();
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
