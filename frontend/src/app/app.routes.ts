import { Routes } from '@angular/router';
import { Appoinments } from './pages/appoinments/appoinments';
import { AppointmentBooking } from './pages/appointment-booking/appointment-booking';
import { AppointmentResults } from './pages/appointment-results/appointment-results';
import { DoctorAppoinmentDashboard } from './pages/doctor-appoinment-dashboard/doctor-appoinment-dashboard';
import { PatientAppoinmentDashboard } from './pages/patient-appoinment-dashboard/patient-appoinment-dashboard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'appointments',
    pathMatch: 'full',
  },
  {
    path: 'appointments',
    component: Appoinments,
  },
  {
    path: 'appointments/results',
    component: AppointmentResults,
  },
  {
    path: 'appointments/booking',
    component: AppointmentBooking,
  },
  {
    path: 'doctor-dashboard',
    component: DoctorAppoinmentDashboard,
  },
  {
    path: 'patient-dashboard',
    component: PatientAppoinmentDashboard,
  },
  {
    path: 'appoinments',
    redirectTo: 'appointments',
    pathMatch: 'full',
  },
];
