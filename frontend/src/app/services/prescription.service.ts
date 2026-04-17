import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private apiUrl = 'http://localhost:8082/api/prescriptions';

  constructor(private http: HttpClient) {}

  getMyPrescriptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-prescriptions`);
  }

  
}