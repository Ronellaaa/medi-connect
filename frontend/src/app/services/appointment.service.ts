import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';



export interface AppointmentsPayload {
  id?: string;
  slotId?: string;
  patientId: number;
  patientName: string;
  patientEmail?: string;
  patientphoneNumber: string;
  patientAge: number;
  doctorId: number;
  doctorEmail?: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentEndDate?: string;
  status?: string;
  liveStatus?: 'WAITING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  queueToken?: number;
  paymentStatus?: string;
  paymentId?: string;
  paymentAmount?: number;
  paidAt?: string;
  meetingUrl?: string;
}

export interface SlotRecord {
  id: string;
  doctorId: number;
  availabilityDate: string;
  slotStart: string;
  slotEnd: string;
  slotDuration: number;
  hospitalOrClinic: string;
  consultationType: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED';
}

@Injectable({
  providedIn: 'root',
})

export class AppointmentApiService{

  private http = inject(HttpClient);
  private apiUrl ='http://localhost:8088/api/appointments';
  private slotApiUrl ='http://localhost:8088/api/slots';

  createAppointment(appointment: AppointmentsPayload) {
  return this.http.post<AppointmentsPayload>(this.apiUrl, appointment);
}

  getAvailableSlots(doctorId: number, availabilityDate: string): Observable<SlotRecord[]> {
    return this.http.get<SlotRecord[]>(
      `${this.slotApiUrl}/available?doctorId=${doctorId}&availabilityDate=${availabilityDate}`
    );
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

  getAppointmentsByPatientId(patientId: number): Observable<AppointmentsPayload[]> {
    return this.http.get<AppointmentsPayload[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  updateLiveStatus(id: string, liveStatus: 'WAITING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED') {
    return this.http.patch<AppointmentsPayload>(`${this.apiUrl}/${id}/live-status?liveStatus=${liveStatus}`, {});
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
