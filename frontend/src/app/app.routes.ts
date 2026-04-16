import { Routes } from '@angular/router';

import { Appoinments } from './pages/appoinments/appoinments';
import { AppointmentBooking } from './pages/appointment-booking/appointment-booking';
import { AppointmentResults } from './pages/appointment-results/appointment-results';
import { DoctorAppoinmentDashboard } from './pages/doctor-appoinment-dashboard/doctor-appoinment-dashboard';
import { PatientAppoinmentDashboard } from './pages/patient-appoinment-dashboard/patient-appoinment-dashboard';

//doctor
import { DashboardComponent } from './pages/doctors/dashboard/dashboard';
import { DoctorLanding } from './pages/doctors/landing/landing';
import { DoctorProfileComponent } from './pages/doctors/profile/profile';
import { DoctorAppointmentsPageComponent } from './pages/doctors/appointments/appointments';
import { DoctorAvailabilityPageComponent } from './pages/doctors/availability/availability';
import { DoctorPrescriptionPageComponent } from './pages/doctors/prescription/prescription';
import { DoctorReportsPageComponent } from './pages/doctors/reports/reports';
import { LoginComponent } from './pages/login/login';
import { Register } from './pages/register/register';
import { DoctorsComponent } from './pages/doctors/doctors';
import { Home } from './pages/home/home';

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
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'dashboard', redirectTo: 'doctors/dashboard', pathMatch: 'full' },
  { path: 'doctors', redirectTo: 'doctors/dashboard', pathMatch: 'full' },
  { path: 'doctors/dashboard', component: DoctorLanding },
  { path: 'doctors/insights', component: DashboardComponent },
  { path: 'doctors/profile', component: DoctorProfileComponent },
  { path: 'doctors/appointments', component: DoctorAppointmentsPageComponent },
  { path: 'doctors/availability', component: DoctorAvailabilityPageComponent },
  { path: 'doctors/prescription', component: DoctorPrescriptionPageComponent },
  { path: 'doctors/reports', component: DoctorReportsPageComponent },
  { path: 'doctors/team', component: DoctorsComponent },
];
