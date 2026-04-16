import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PrescriptionRecord {
  id?: number;
  patientId: number;
  appointmentId?: number;
  diagnosis: string;
  medicines: string;
  instructions: string;
  issuedDate: string;
  doctor?: {
    id?: number;
    fullName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionDataService {
  private apiUrl = '/doctor-api/prescriptions';

  constructor(private http: HttpClient) {}

  getAllPrescriptions(): Observable<PrescriptionRecord[]> {
    return this.http.get<PrescriptionRecord[]>(this.apiUrl);
  }

  getPrescriptionById(id: number): Observable<PrescriptionRecord> {
    return this.http.get<PrescriptionRecord>(`${this.apiUrl}/${id}`);
  }

  createPrescription(payload: any): Observable<PrescriptionRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.post<PrescriptionRecord>(this.apiUrl, payload);
  }

  updatePrescription(id: number, payload: any): Observable<PrescriptionRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.patch<PrescriptionRecord>(`${this.apiUrl}/${id}`, payload);
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPrescriptionsByDoctor(doctorId: number): Observable<PrescriptionRecord[]> {
    return this.http.get<PrescriptionRecord[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }
}
