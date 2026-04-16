import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  uploadTitle = '';
  uploadDescription = '';
  showUploadModal = false;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportService.getMyReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load reports');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.showError('File size must be less than 10MB');
        return;
      }
      this.selectedFile = file;
    }
  }

  uploadReport(): void {
    if (!this.selectedFile || !this.uploadTitle) {
      this.showError('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    this.reportService.uploadReport(this.uploadTitle, this.uploadDescription, this.selectedFile).subscribe({
      next: () => {
        this.showSuccess('Report uploaded successfully');
        this.showUploadModal = false;
        this.uploadTitle = '';
        this.uploadDescription = '';
        this.selectedFile = null;
        this.loadReports();
        this.isLoading = false;
      },
      error: () => {
        this.showError('Upload failed');
        this.isLoading = false;
      }
    });
  }

  deleteReport(id: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.deleteReport(id).subscribe({
        next: () => {
          this.showSuccess('Report deleted');
          this.loadReports();
        },
        error: () => {
          this.showError('Delete failed');
        }
      });
    }
  }

  downloadReport(filePath: string): void {
    window.open(filePath, '_blank');
  }

  closeModal(): void {
    this.showUploadModal = false;
  }

  private showError(message: string): void {
    console.error(message);
  }

  private showSuccess(message: string): void {
    console.log(message);
  }
}
