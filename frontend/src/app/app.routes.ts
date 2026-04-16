import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { DashboardComponent } from './pages/patients/dashboard/dashboard.component';
import { ProfileComponent } from './pages/patients/profile/profile.component';
import { ReportsComponent } from './pages/patients/reports/reports.component';
import { PrescriptionsComponent } from './pages/patients/prescriptions/prescriptions.component';
import { Appoinments } from './pages/appoinments/appoinments';

import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { PatientsComponent } from './pages/admin/patients/manage-patients.component';
import { StatsComponent } from './pages/admin/stats/stats.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
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

  { path: '**', redirectTo: 'login' }
];