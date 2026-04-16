import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patients`);
  }

  getPatientDetails(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/patients/${patientId}`);
  }

  updatePatient(patientId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${patientId}`, data);
  }

  enablePatient(patientId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${patientId}/enable`, {});
  }

  disablePatient(patientId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${patientId}/disable`, {});
  }

  deletePatient(patientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patients/${patientId}`);
  }

  getPlatformStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`);
  }
}