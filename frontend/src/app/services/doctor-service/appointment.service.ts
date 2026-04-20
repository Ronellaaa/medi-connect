import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentRecord {
  id?: string;
  patientId: number;
  patientName?: string;
  appointmentDate: string;
  reason?: string;
  status: string;
  urgencyLevel?: string;
  doctorId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8088/api/appointments';

  constructor(private http: HttpClient) {}

  getAllAppointments(): Observable<AppointmentRecord[]> {
    return this.http.get<AppointmentRecord[]>(this.apiUrl);
  }

  getAppointmentById(id: string): Observable<AppointmentRecord> {
    return this.http.get<AppointmentRecord>(`${this.apiUrl}/${id}`);
  }

  createAppointment(payload: any): Observable<AppointmentRecord> {
    return this.http.post<AppointmentRecord>(this.apiUrl, payload);
  }

  updateAppointment(id: string, payload: any): Observable<AppointmentRecord> {
    return this.http.patch<AppointmentRecord>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAppointmentsByDoctor(doctorId: number): Observable<AppointmentRecord[]> {
    return this.http.get<AppointmentRecord[]>(`${this.apiUrl}/doctors/${doctorId}`);
  }

  acceptAppointment(id: string): Observable<AppointmentRecord> {
    return this.http.patch<AppointmentRecord>(`${this.apiUrl}/status/${id}?status=CONFIRMED`, {});
  }

  rejectAppointment(id: string): Observable<AppointmentRecord> {
    return this.http.patch<AppointmentRecord>(`${this.apiUrl}/status/${id}?status=CANCELED`, {});
  }
}
