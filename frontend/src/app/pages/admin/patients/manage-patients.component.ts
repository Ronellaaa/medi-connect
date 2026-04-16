import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.services';

@Component({
  standalone: true,
  selector: 'app-patients',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-patients.component.html',
  styleUrls: ['./manage-patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  isLoading = false;
  searchTerm = '';
  selectedPatient: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.adminService.getAllPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load patients');
        this.isLoading = false;
      }
    });
  }

  filterPatients(): void {
    if (!this.searchTerm) {
      this.filteredPatients = this.patients;
    } else {
      this.filteredPatients = this.patients.filter(p =>
        p.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  viewPatient(patient: any): void {
    this.selectedPatient = patient;
  }

  togglePatientStatus(patient: any): void {
    const action = patient.enabled ? 'disable' : 'enable';
    if (confirm(`Are you sure you want to ${action} this patient?`)) {
      if (patient.enabled) {
        this.adminService.disablePatient(patient.id).subscribe({
          next: () => {
            patient.enabled = false;
            this.showSuccess('Patient disabled');
          },
          error: () => this.showError('Action failed')
        });
      } else {
        this.adminService.enablePatient(patient.id).subscribe({
          next: () => {
            patient.enabled = true;
            this.showSuccess('Patient enabled');
          },
          error: () => this.showError('Action failed')
        });
      }
    }
  }

  deletePatient(patient: any): void {
    if (confirm(`Delete patient ${patient.firstName} ${patient.lastName}? This action cannot be undone.`)) {
      this.adminService.deletePatient(patient.id).subscribe({
        next: () => {
          this.showSuccess('Patient deleted');
          this.loadPatients();
        },
        error: () => this.showError('Delete failed')
      });
    }
  }

  closeModal(): void {
    this.selectedPatient = null;
  }

  private showError(message: string): void {
    console.error(message);
  }

  private showSuccess(message: string): void {
    console.log(message);
  }
}
