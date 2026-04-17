import { Injectable } from '@angular/core';
import { Doctor } from './doctor.service';

const DOCTOR_ID_KEY = 'currentDoctorId';
const DOCTOR_EMAIL_KEY = 'currentDoctorEmail';
const DOCTOR_TOKEN_KEY = 'currentDoctorToken';
const DOCTOR_PROFILE_KEY = 'currentDoctorProfile';
const AUTH_ROLE_KEY = 'currentAuthRole';
const AUTH_USER_ID_KEY = 'currentAuthUserId';
const AUTH_PROFILE_ID_KEY = 'currentAuthProfileId';

@Injectable({
  providedIn: 'root'
})
export class DoctorSessionService {
  setCurrentDoctor(
    id: number,
    email: string,
    token?: string,
    doctor?: Doctor,
    role: string = 'DOCTOR',
    userId?: number,
    profileId?: number
  ): void {
    localStorage.setItem(DOCTOR_ID_KEY, String(id));
    localStorage.setItem(DOCTOR_EMAIL_KEY, email);
    localStorage.setItem(AUTH_ROLE_KEY, role);
    if (token) {
      localStorage.setItem(DOCTOR_TOKEN_KEY, token);
    }
    if (userId != null) {
      localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
    }
    if (profileId != null) {
      localStorage.setItem(AUTH_PROFILE_ID_KEY, String(profileId));
    }
    if (doctor) {
      localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(doctor));
    }
  }

  setAuthSession(email: string, role: string, token?: string, userId?: number, profileId?: number): void {
    localStorage.setItem(DOCTOR_EMAIL_KEY, email);
    localStorage.setItem(AUTH_ROLE_KEY, role);
    if (token) {
      localStorage.setItem(DOCTOR_TOKEN_KEY, token);
    }
    if (userId != null) {
      localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
    }
    if (profileId != null) {
      localStorage.setItem(AUTH_PROFILE_ID_KEY, String(profileId));
    }
  }

  getCurrentDoctorId(): number | null {
    const value = localStorage.getItem(DOCTOR_ID_KEY);
    if (value) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return this.getCurrentProfileId();
  }

  getCurrentDoctorEmail(): string | null {
    return localStorage.getItem(DOCTOR_EMAIL_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(DOCTOR_TOKEN_KEY);
  }

  getCurrentRole(): string | null {
    return localStorage.getItem(AUTH_ROLE_KEY);
  }

  getCurrentUserId(): number | null {
    const value = localStorage.getItem(AUTH_USER_ID_KEY);
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  getCurrentProfileId(): number | null {
    const value = localStorage.getItem(AUTH_PROFILE_ID_KEY);
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  getCurrentDoctorProfile(): Doctor | null {
    const value = localStorage.getItem(DOCTOR_PROFILE_KEY);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as Doctor;
    } catch {
      localStorage.removeItem(DOCTOR_PROFILE_KEY);
      return null;
    }
  }

  setDoctorProfile(doctor: Doctor): void {
    localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(doctor));
  }

  clear(): void {
    localStorage.removeItem(DOCTOR_ID_KEY);
    localStorage.removeItem(DOCTOR_EMAIL_KEY);
    localStorage.removeItem(DOCTOR_TOKEN_KEY);
    localStorage.removeItem(DOCTOR_PROFILE_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_PROFILE_ID_KEY);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }
}
