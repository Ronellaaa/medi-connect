import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { AppointmentApiService, AppointmentsPayload } from './appointment.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorAppoinmentDashboardService {
  private appointmentApiService = inject(AppointmentApiService);

  getDoctorAppoinments(doctorId: number) {
    return this.appointmentApiService
      .getAppointmentsByDoctorId(doctorId)
      .pipe(
        map((appointments) =>
          [...appointments].sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate)),
        ),
      );
  }
}
