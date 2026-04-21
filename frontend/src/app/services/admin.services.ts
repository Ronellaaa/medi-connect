import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DoctorSessionService } from './doctor-service/doctor-session.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8082/api/admin';

  constructor(
    private http: HttpClient,
    private sessionService: DoctorSessionService
  ) {}

  private getAuthHeaders() {
    const token = this.sessionService.getToken() || localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patients`, this.getAuthHeaders());
  }

  getPatientDetails(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/patients/${patientId}`, this.getAuthHeaders());
  }

  updatePatient(patientId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${patientId}`, data, this.getAuthHeaders());
  }

  enablePatient(patientId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${patientId}/enable`, {}, this.getAuthHeaders());
  }

  disablePatient(patientId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${patientId}/disable`, {}, this.getAuthHeaders());
  }

  deletePatient(patientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patients/${patientId}`, this.getAuthHeaders());
  }

  getPlatformStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`, this.getAuthHeaders());
  }
}