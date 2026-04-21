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

// Admin
import { AdminComponent } from './pages/admin/admin';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { PatientsComponent } from './pages/admin/patients/manage-patients.component';
import { StatsComponent } from './pages/admin/stats/stats.component';
import { VerifyDoctorsComponent } from './pages/admin/doctors/verify-doctors.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public Routes
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  
  // Appointments Routes
  {
    path: 'appointments',
    children: [
      { path: '', component: Appoinments },
      { path: 'results', component: AppointmentResults },
      { path: 'booking', component: AppointmentBooking },
      { path: 'doctor-dashboard', component: DoctorAppoinmentDashboard },
      { path: 'patient-dashboard', component: PatientAppoinmentDashboard },
    ]
  },
  
  // Redirect for typo
  { path: 'appoinments', redirectTo: 'appointments', pathMatch: 'full' },
  
  // Doctor Routes
  { path: 'doctors/prescription/:appointmentId', component: DoctorPrescriptionPageComponent },
  { 
    path: 'doctors', 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DoctorLanding },
      { path: 'insights', component: DashboardComponent1 },
      { path: 'profile', component: DoctorProfileComponent },
      { path: 'appointments', component: DoctorAppointmentsPageComponent },
      { path: 'availability', component: DoctorAvailabilityPageComponent },
      { path: 'prescription', component: DoctorPrescriptionPageComponent },
      { path: 'reports', component: DoctorReportsPageComponent },
      { path: 'team', component: DoctorsComponent },
    ]
  },
  
  // Payment Routes
  { path: 'payments', component: Payments },
  { path: 'payment/success', component: Payments, data: { state: 'success' } },
  { path: 'payment/cancel', component: Payments, data: { state: 'cancel' } },
  
  // Patient Routes (with AuthGuard)
  { 
    path: 'patient', 
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'prescriptions', component: PrescriptionsComponent },
      { path: 'appointments', component: Appoinments },
    ]
  },
  
  // Redirects for patient
  { path: 'patient-dashboard', redirectTo: 'patient/dashboard', pathMatch: 'full' },
  { path: 'patients', redirectTo: 'patient/dashboard', pathMatch: 'full' },
  
  // Admin Routes (with AdminComponent wrapper + guards)
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'doctors', component: VerifyDoctorsComponent },
      { path: 'stats', component: StatsComponent },
    ]
  },
  
  // Redirect for admin
  { path: 'admin-dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  
  // Default redirect for any other routes
  { path: '**', redirectTo: '' }
];
