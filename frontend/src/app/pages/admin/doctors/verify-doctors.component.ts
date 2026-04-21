import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.services';

type VerificationFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';

@Component({
  standalone: true,
  selector: 'app-verify-doctors',
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-doctors.component.html',
  styleUrl: './verify-doctors.component.css',
})
export class VerifyDoctorsComponent implements OnInit {
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  isLoading = false;
  error = '';
  searchTerm = '';
  selectedFilter: VerificationFilter = 'ALL';
  savingDoctorId: number | null = null;

  remarksDraft: Record<number, string> = {};
  expandedDoctors: Record<number, boolean> = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.error = '';

    this.adminService.getDoctorsForVerification(this.selectedFilter).subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        for (const doctor of doctors) {
          this.remarksDraft[doctor.id] = doctor.verificationRemarks || '';
          if (this.expandedDoctors[doctor.id] == null) {
            this.expandedDoctors[doctor.id] = false;
          }
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load doctors for verification', err);
        this.error = 'Unable to load doctor verification data right now.';
        this.isLoading = false;
      },
    });
  }

  setFilter(filter: VerificationFilter): void {
    this.selectedFilter = filter;
    this.loadDoctors();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchTerm.trim().toLowerCase();
    this.filteredDoctors = this.doctors.filter((doctor) => {
      if (!query) {
        return true;
      }

      return [
        doctor.fullName,
        doctor.email,
        doctor.mainSpecialization,
        doctor.license,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }

  toggleExpanded(doctorId: number): void {
    this.expandedDoctors[doctorId] = !this.expandedDoctors[doctorId];
  }

  isExpanded(doctorId: number): boolean {
    return this.expandedDoctors[doctorId] === true;
  }

  getFilterCount(filter: VerificationFilter): number {
    if (filter === 'ALL') {
      return this.doctors.length;
    }

    return this.doctors.filter((doctor) => doctor.verificationStatus === filter).length;
  }

  submitVerification(doctor: any, status: 'VERIFIED' | 'REJECTED'): void {
    this.savingDoctorId = doctor.id;

    this.adminService
      .updateDoctorVerification(doctor.id, {
        status,
        remarks: this.remarksDraft[doctor.id] || '',
      })
      .subscribe({
        next: (updatedDoctor) => {
          const index = this.doctors.findIndex((item) => item.id === doctor.id);
          if (index !== -1) {
            this.doctors[index] = updatedDoctor;
          }
          this.applyFilters();
          this.savingDoctorId = null;
        },
        error: (err) => {
          console.error('Failed to update doctor verification', err);
          this.error = 'Could not update the doctor verification status.';
          this.savingDoctorId = null;
        },
      });
  }

  badgeClass(status: string | null | undefined): string {
    switch (status) {
      case 'VERIFIED':
        return 'status-verified';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  initials(name: string | null | undefined): string {
    if (!name) {
      return '?';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  specializationSummary(doctor: any): string {
    return doctor.mainSpecialization || 'Specialization not provided';
  }
}
