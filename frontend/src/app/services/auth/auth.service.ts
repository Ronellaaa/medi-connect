import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../doctor-service/doctor.service';

export type UserRole = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  mainSpecialization: string;
  additionalSpecialization: string;
  qualifications: string;
  experienceYears: number;
  license?: string;
  clinic?: string;
  consultationFee?: string;
  availability?: string;
  languages?: string;
  bio: string;
  password: string;
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
  private apiUrl = '/auth-api/auth';

  constructor(private http: HttpClient) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }
}
