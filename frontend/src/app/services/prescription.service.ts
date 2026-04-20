import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrescriptionRecord } from './doctor-service/prescription.service';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private apiUrl = 'http://localhost:8083/api/prescriptions';

  constructor(private http: HttpClient) {}

    getPrescriptionsByPatient(patientId: number): Observable<PrescriptionRecord[]> {
  return this.http.get<PrescriptionRecord[]>(`${this.apiUrl}/patient/${patientId}`);
}
  
}