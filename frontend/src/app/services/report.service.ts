import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8082/api/reports';

  constructor(private http: HttpClient) {}

  uploadReport(title: string, description: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getMyReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-reports`);
  }

  deleteReport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}