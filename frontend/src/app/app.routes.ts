import { Routes } from '@angular/router';

import { Payments } from './pages/payments/payments';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'payments' },
  { path: 'payments', component: Payments },
  { path: 'payment/success', component: Payments, data: { state: 'success' } },
  { path: 'payment/cancel', component: Payments, data: { state: 'cancel' } },
  { path: '**', redirectTo: 'payments' }
];
