import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  acceptedAppointments: number;
  rejectedAppointments: number;
  highUrgencyAppointments: number;
  totalPrescriptions: number;
  totalReports: number;
  totalAvailabilitySlots: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8083/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.apiUrl);
  }
}
