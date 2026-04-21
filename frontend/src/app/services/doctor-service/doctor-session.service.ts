// import { Injectable } from '@angular/core';
// import { Doctor } from './doctor.service';

// const DOCTOR_ID_KEY = 'currentDoctorId';
// const DOCTOR_EMAIL_KEY = 'currentDoctorEmail';
// const DOCTOR_TOKEN_KEY = 'currentDoctorToken';
// const DOCTOR_PROFILE_KEY = 'currentDoctorProfile';
// const AUTH_ROLE_KEY = 'currentAuthRole';
// const AUTH_USER_ID_KEY = 'currentAuthUserId';
// const AUTH_PROFILE_ID_KEY = 'currentAuthProfileId';

// @Injectable({
//   providedIn: 'root'
// })
// export class DoctorSessionService {
//   setCurrentDoctor(
//     id: number,
//     email: string,
//     token?: string,
//     doctor?: Doctor,
//     role: string = 'DOCTOR',
//     userId?: number,
//     profileId?: number
//   ): void {
//     localStorage.setItem(DOCTOR_ID_KEY, String(id));
//     localStorage.setItem(DOCTOR_EMAIL_KEY, email);
//     localStorage.setItem(AUTH_ROLE_KEY, role);
//     if (token) {
//       localStorage.setItem(DOCTOR_TOKEN_KEY, token);
//     }
//     if (userId != null) {
//       localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
//     }
//     if (profileId != null) {
//       localStorage.setItem(AUTH_PROFILE_ID_KEY, String(profileId));
//     }
//     if (doctor) {
//       localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(doctor));
//     }
//   }

//   setAuthSession(email: string, role: string, token?: string, userId?: number, profileId?: number): void {
//     localStorage.setItem(DOCTOR_EMAIL_KEY, email);
//     localStorage.setItem(AUTH_ROLE_KEY, role);
//     if (token) {
//       localStorage.setItem(DOCTOR_TOKEN_KEY, token);
//     }
//     if (userId != null) {
//       localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
//     }
//     if (profileId != null) {
//       localStorage.setItem(AUTH_PROFILE_ID_KEY, String(profileId));
//     }
//   }

//   getCurrentDoctorId(): number | null {
//     const value = localStorage.getItem(DOCTOR_ID_KEY);
//     if (value) {
//       const parsed = Number(value);
//       return Number.isNaN(parsed) ? null : parsed;
//     }

//     return this.getCurrentProfileId();
//   }

//   getCurrentDoctorEmail(): string | null {
//     return localStorage.getItem(DOCTOR_EMAIL_KEY);
//   }

//   getToken(): string | null {
//     return localStorage.getItem(DOCTOR_TOKEN_KEY);
//   }

//   getCurrentRole(): string | null {
//     return localStorage.getItem(AUTH_ROLE_KEY);
//   }

//   getCurrentUserId(): number | null {
//     const value = localStorage.getItem(AUTH_USER_ID_KEY);
//     if (!value) {
//       return null;
//     }

//     const parsed = Number(value);
//     return Number.isNaN(parsed) ? null : parsed;
//   }

//   getCurrentProfileId(): number | null {
//     const value = localStorage.getItem(AUTH_PROFILE_ID_KEY);
//     if (!value) {
//       return null;
//     }

//     const parsed = Number(value);
//     return Number.isNaN(parsed) ? null : parsed;
//   }

//   getCurrentDoctorProfile(): Doctor | null {
//     const value = localStorage.getItem(DOCTOR_PROFILE_KEY);
//     if (!value) {
//       return null;
//     }

//     try {
//       return JSON.parse(value) as Doctor;
//     } catch {
//       localStorage.removeItem(DOCTOR_PROFILE_KEY);
//       return null;
//     }
//   }

//   setDoctorProfile(doctor: Doctor): void {
//     localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(doctor));
//   }

//   clear(): void {
//     localStorage.removeItem(DOCTOR_ID_KEY);
//     localStorage.removeItem(DOCTOR_EMAIL_KEY);
//     localStorage.removeItem(DOCTOR_TOKEN_KEY);
//     localStorage.removeItem(DOCTOR_PROFILE_KEY);
//     localStorage.removeItem(AUTH_ROLE_KEY);
//     localStorage.removeItem(AUTH_USER_ID_KEY);
//     localStorage.removeItem(AUTH_PROFILE_ID_KEY);
//     localStorage.removeItem('currentUser');
//     localStorage.removeItem('token');
//   }
// }

import { Injectable } from '@angular/core';
import { Doctor } from './doctor.service';

const AUTH_EMAIL_KEY = 'currentAuthEmail';
const AUTH_TOKEN_KEY = 'currentAuthToken';
const AUTH_ROLE_KEY = 'currentAuthRole';
const AUTH_USER_ID_KEY = 'currentAuthUserId';
const AUTH_PROFILE_ID_KEY = 'currentAuthProfileId';

const DOCTOR_ID_KEY = 'currentDoctorId';
const DOCTOR_PROFILE_KEY = 'currentDoctorProfile';
const LEGACY_DOCTOR_EMAIL_KEY = 'currentDoctorEmail';
const LEGACY_DOCTOR_TOKEN_KEY = 'currentDoctorToken';

@Injectable({
  providedIn: 'root',
})
export class DoctorSessionService {
  setCurrentDoctor(
    id: number,
    email: string,
    token?: string,
    doctor?: Doctor,
    role: string = 'DOCTOR',
    userId?: number,
    profileId?: number,
  ): void {
    this.setStoredValue(DOCTOR_ID_KEY, String(id));
    this.setStoredValue(AUTH_EMAIL_KEY, email);
    this.setStoredValue(AUTH_ROLE_KEY, role);

    if (token) {
      this.setStoredValue(AUTH_TOKEN_KEY, token);
    }

    if (userId != null) {
      this.setStoredValue(AUTH_USER_ID_KEY, String(userId));
    }

    if (profileId != null) {
      this.setStoredValue(AUTH_PROFILE_ID_KEY, String(profileId));
    }

    if (doctor) {
      this.setStoredValue(DOCTOR_PROFILE_KEY, JSON.stringify(doctor));
    }
  }

  setAuthSession(
    email: string,
    role: string,
    token?: string,
    userId?: number,
    profileId?: number,
  ): void {
    this.setStoredValue(AUTH_EMAIL_KEY, email);
    this.setStoredValue(AUTH_ROLE_KEY, role);

    if (token) {
      this.setStoredValue(AUTH_TOKEN_KEY, token);
    }

    if (userId != null) {
      this.setStoredValue(AUTH_USER_ID_KEY, String(userId));
    }

    if (profileId != null) {
      this.setStoredValue(AUTH_PROFILE_ID_KEY, String(profileId));
    }
  }

  getCurrentDoctorId(): number | null {
    const role = this.getCurrentRole();

    if (role !== 'DOCTOR') {
      return null;
    }

    const doctorId = this.parseNumber(this.getStoredValue(DOCTOR_ID_KEY));
    if (doctorId != null) {
      return doctorId;
    }

    const doctorProfile = this.getCurrentDoctorProfile();
    if (doctorProfile?.id != null) {
      this.setStoredValue(DOCTOR_ID_KEY, String(doctorProfile.id));
      return doctorProfile.id;
    }

    const profileId = this.getCurrentProfileId();
    if (profileId != null) {
      this.setStoredValue(DOCTOR_ID_KEY, String(profileId));
      return profileId;
    }

    return null;
  }

  getCurrentDoctorEmail(): string | null {
    return this.getStoredValue(AUTH_EMAIL_KEY, LEGACY_DOCTOR_EMAIL_KEY);
  }

  getToken(): string | null {
    return this.getStoredValue(AUTH_TOKEN_KEY, LEGACY_DOCTOR_TOKEN_KEY);
  }

  getCurrentRole(): string | null {
    return this.getStoredValue(AUTH_ROLE_KEY);
  }

  getCurrentUserId(): number | null {
    return this.parseNumber(this.getStoredValue(AUTH_USER_ID_KEY));
  }

  getCurrentProfileId(): number | null {
    return this.parseNumber(this.getStoredValue(AUTH_PROFILE_ID_KEY));
  }

  getCurrentDoctorProfile(): Doctor | null {
    const value = this.getStoredValue(DOCTOR_PROFILE_KEY);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as Doctor;
    } catch {
      sessionStorage.removeItem(DOCTOR_PROFILE_KEY);
      localStorage.removeItem(DOCTOR_PROFILE_KEY);
      return null;
    }
  }

  setDoctorProfile(doctor: Doctor): void {
    this.setStoredValue(DOCTOR_PROFILE_KEY, JSON.stringify(doctor));
  }

  private getStoredValue(primaryKey: string, legacyKey?: string): string | null {
    const sessionValue = sessionStorage.getItem(primaryKey);
    if (sessionValue) {
      return sessionValue;
    }

    const primaryValue = localStorage.getItem(primaryKey);
    if (primaryValue) {
      sessionStorage.setItem(primaryKey, primaryValue);
      return primaryValue;
    }

    if (!legacyKey) {
      return null;
    }

    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue) {
      this.setStoredValue(primaryKey, legacyValue);
      return legacyValue;
    }

    return null;
  }

  private setStoredValue(key: string, value: string): void {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  }

  private parseNumber(value: string | null): number | null {
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  clear(): void {
    sessionStorage.removeItem(AUTH_EMAIL_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_ROLE_KEY);
    sessionStorage.removeItem(AUTH_USER_ID_KEY);
    sessionStorage.removeItem(AUTH_PROFILE_ID_KEY);

    sessionStorage.removeItem(DOCTOR_ID_KEY);
    sessionStorage.removeItem(DOCTOR_PROFILE_KEY);
    sessionStorage.removeItem(LEGACY_DOCTOR_EMAIL_KEY);
    sessionStorage.removeItem(LEGACY_DOCTOR_TOKEN_KEY);

    localStorage.removeItem(AUTH_EMAIL_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_PROFILE_ID_KEY);

    localStorage.removeItem(DOCTOR_ID_KEY);
    localStorage.removeItem(DOCTOR_PROFILE_KEY);
    localStorage.removeItem(LEGACY_DOCTOR_EMAIL_KEY);
    localStorage.removeItem(LEGACY_DOCTOR_TOKEN_KEY);

    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }
}
