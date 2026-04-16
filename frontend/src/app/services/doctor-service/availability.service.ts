import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvailabilityRecord {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  hospitalOrClinic: string;
  consultationType: string;
  available: boolean;
  doctor?: {
    id?: number;
    fullName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityDataService {
  private apiUrl = '/doctor-api/availability';

  constructor(private http: HttpClient) {}

  getAllAvailability(): Observable<AvailabilityRecord[]> {
    return this.http.get<AvailabilityRecord[]>(this.apiUrl);
  }

  getAvailabilityById(id: number): Observable<AvailabilityRecord> {
    return this.http.get<AvailabilityRecord>(`${this.apiUrl}/${id}`);
  }

  createAvailability(payload: any): Observable<AvailabilityRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.post<AvailabilityRecord>(this.apiUrl, payload);
  }

  updateAvailability(id: number, payload: any): Observable<AvailabilityRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.patch<AvailabilityRecord>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
