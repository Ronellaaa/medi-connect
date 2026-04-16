import { Routes } from '@angular/router';


import { Appoinments } from './pages/appoinments/appoinments';
import { AppointmentBooking } from './pages/appointment-booking/appointment-booking';
import { AppointmentResults } from './pages/appointment-results/appointment-results';
import { DoctorAppoinmentDashboard } from './pages/doctor-appoinment-dashboard/doctor-appoinment-dashboard';
import { PatientAppoinmentDashboard } from './pages/patient-appoinment-dashboard/patient-appoinment-dashboard';

//doctor
import { DashboardComponent1 } from './pages/doctors/dashboard/dashboard';
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

//payments
import { Payments } from './pages/payments/payments';

//patients
import { DashboardComponent } from './pages/patients/dashboard/dashboard.component';
import { ProfileComponent } from './pages/patients/profile/profile.component';
import { ReportsComponent } from './pages/patients/reports/reports.component';
import { PrescriptionsComponent } from './pages/patients/prescriptions/prescriptions.component';


import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { PatientsComponent } from './pages/admin/patients/manage-patients.component';
import { StatsComponent } from './pages/admin/stats/stats.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'appointments',
  //   pathMatch: 'full',
  // },
  { path: '', 
    component: Home },
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

  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'dashboard', redirectTo: 'doctors/dashboard', pathMatch: 'full' },
  { path: 'doctors', redirectTo: 'doctors/dashboard', pathMatch: 'full' },
  { path: 'doctors/dashboard', component: DoctorLanding },
  { path: 'doctors/insights', component: DashboardComponent1 },
  { path: 'doctors/profile', component: DoctorProfileComponent },
  { path: 'doctors/appointments', component: DoctorAppointmentsPageComponent },
  { path: 'doctors/availability', component: DoctorAvailabilityPageComponent },
  { path: 'doctors/prescription', component: DoctorPrescriptionPageComponent },
  { path: 'doctors/reports', component: DoctorReportsPageComponent },
  { path: 'doctors/team', component: DoctorsComponent },

  // { path: '', pathMatch: 'full', redirectTo: 'payments' },
  { path: 'payments', component: Payments },
  { path: 'payment/success', component: Payments, data: { state: 'success' } },
  { path: 'payment/cancel', component: Payments, data: { state: 'cancel' } },

  { path: '**', redirectTo: 'home' },
  
  { path: 'patients', redirectTo: 'patient/dashboard', pathMatch: 'full' },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },

  // Patient
  { path: 'patient/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'patient/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'patient/reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'patient/prescriptions', component: PrescriptionsComponent, canActivate: [AuthGuard] },
  { path: 'patient/appointments', component: Appoinments, canActivate: [AuthGuard] },

  // Admin
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/patients', component: PatientsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/stats', component: StatsComponent, canActivate: [AuthGuard, AdminGuard] },

//  { path: '**', redirectTo: 'login' }


 

];

