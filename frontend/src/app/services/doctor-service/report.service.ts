import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportRecord {
  id?: number;
  patientId: number;
  reportName: string;
  reportType: string;
  reportUrl: string;
  notes: string;
  uploadedDate: string;
  doctor?: {
    id?: number;
    fullName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportDataService {
  private apiUrl = 'http://localhost:8083/api/reports';

  constructor(private http: HttpClient) {}

  getAllReports(): Observable<ReportRecord[]> {
    return this.http.get<ReportRecord[]>(this.apiUrl);
  }

  getReportById(id: number): Observable<ReportRecord> {
    return this.http.get<ReportRecord>(`${this.apiUrl}/${id}`);
  }

  createReport(payload: any): Observable<ReportRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.post<ReportRecord>(this.apiUrl, payload);
  }

  updateReport(id: number, payload: any): Observable<ReportRecord> {
    if (payload.doctorId) {
      payload.doctor = { id: payload.doctorId };
      delete payload.doctorId;
    }
    return this.http.patch<ReportRecord>(`${this.apiUrl}/${id}`, payload);
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
