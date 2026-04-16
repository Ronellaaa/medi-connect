import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface appoinmentNotificationPayload{
  
  patientName: string;
  doctorName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8085/api/notification';

  private http = inject(HttpClient);

  sendAppointmentConfirmation(payload: appoinmentNotificationPayload){
    return this.http.post(`${this.apiUrl}/appointment-confirmation`, payload, {
      responseType: 'text'
    });

  }

  sendAppointmentCancellation(payload:  appoinmentNotificationPayload) {
    return this.http.post(`${this.apiUrl}/appointment-cancellation`, payload, {
      responseType: 'text',
    });
  }

  getAllNotifications() {
    return this.http.get(`${this.apiUrl}`);
  }

}