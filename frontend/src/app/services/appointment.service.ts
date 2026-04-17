import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';



export interface AppointmentsPayload {
  id?: string;
  patientId: number;
  patientName: string;
  patientEmail?: string;
  patientphoneNumber: string;
  patientAge: number;
  doctorId: number;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  status?: string;
  paymentStatus?: string;
  paymentId?: string;
  paymentAmount?: number;
  paidAt?: string;
  meetingUrl?: string;
}

@Injectable({
  providedIn: 'root',
})

export class AppointmentApiService{

  private http = inject(HttpClient);
  private apiUrl ='http://localhost:8088/api/appointments';

  createAppointment(appointment: AppointmentsPayload) {
  return this.http.post<AppointmentsPayload>(this.apiUrl, appointment);
}

  getAllAppointments(): Observable<AppointmentsPayload[]> {
    return this.http.get<AppointmentsPayload[]>(this.apiUrl);
  }
  getAppointmentsById(id: string): Observable<AppointmentsPayload> {
    return this.http.get<AppointmentsPayload>(`${this.apiUrl}/${id}`);
  }

  getAppointmentsByDoctorId(doctorId: number): Observable<AppointmentsPayload[]> {
    return this.http.get<AppointmentsPayload[]>(`${this.apiUrl}/doctors/${doctorId}`);
  }

  cancelAppointment(id: string) {
    return this.http.patch<AppointmentsPayload>(`${this.apiUrl}/status/${id}?status=CANCELLED`, {});
  }

  updateAppointment(id: string, updatedAppointment: Partial<AppointmentsPayload>) {
    return this.http.patch<AppointmentsPayload>(`${this.apiUrl}/${id}`, updatedAppointment);
  }

  cancelAppoinment(id: string) {
    return this.cancelAppointment(id);
  }

  resheduleAppoinment(id: string, updatedAppointment: Partial<AppointmentsPayload>) {
    return this.updateAppointment(id, updatedAppointment);
  }

}
