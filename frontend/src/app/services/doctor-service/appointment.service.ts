import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentRecord {
  id?: number;
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: string;
  urgencyLevel: string;
  doctor?: {
    id?: number;
    fullName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8083/api/appointments';

  constructor(private http: HttpClient) {}

  getAllAppointments(): Observable<AppointmentRecord[]> {
    return this.http.get<AppointmentRecord[]>(this.apiUrl);
  }

  getAppointmentById(id: number): Observable<AppointmentRecord> {
    return this.http.get<AppointmentRecord>(`${this.apiUrl}/${id}`);
  }

  createAppointment(payload: any): Observable<AppointmentRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.post<AppointmentRecord>(this.apiUrl, payload);
  }

  updateAppointment(id: number, payload: any): Observable<AppointmentRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.patch<AppointmentRecord>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAppointmentsByDoctor(doctorId: number): Observable<AppointmentRecord[]> {
    return this.http.get<AppointmentRecord[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  acceptAppointment(id: number): Observable<AppointmentRecord> {
    return this.http.patch<AppointmentRecord>(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectAppointment(id: number): Observable<AppointmentRecord> {
    return this.http.patch<AppointmentRecord>(`${this.apiUrl}/${id}/reject`, {});
  }
}
