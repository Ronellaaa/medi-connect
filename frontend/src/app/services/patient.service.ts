import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  email: string;
  condition: string;
  nextAppointment: string;
  status: 'Pending' | 'Active' | 'Completed';
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = 'http://localhost:8082/api/patients';
  private patients = signal<Patient[]>([]);
  private nextId = 1;

  constructor(private http: HttpClient) {}

  getPatients(): Patient[] {
    return this.patients();
  }

  addPatient(patient: Omit<Patient, 'id'>): void {
    this.patients.set([...this.patients(), { id: this.nextId++, ...patient }]);
  }

  removePatient(id: number): void {
    this.patients.set(this.patients().filter((p) => p.id !== id));
  }

  updateStatus(id: number, status: Patient['status']): void {
    this.patients.set(
      this.patients().map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/reports/my-reports`);
  }

  getPrescriptions(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/prescriptions/my-prescriptions`);
  }
}
