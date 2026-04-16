import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { AppointmentApiService } from './appointment.service';

@Injectable({
  providedIn: 'root',
})
export class PatientAppoinmentDashboardService {
  private appointmentApiService = inject(AppointmentApiService);

  getPatientAppoinments(patientId: number) {
    return this.appointmentApiService.getAllAppointments().pipe(
      map((appointments) =>
        appointments
          .filter((appointment) => appointment.patientId === patientId)
          .sort((left, right) => left.appointmentDate.localeCompare(right.appointmentDate)),
      ),
    );
  }

  
}
