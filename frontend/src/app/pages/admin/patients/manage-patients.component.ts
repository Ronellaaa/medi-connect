import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AdminService } from '../../../services/admin.services';

@Component({
  standalone: true,
  selector: 'app-patients',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-patients.component.html',
  styleUrls: ['./manage-patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  isLoading = false;
  searchTerm = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  // View modal
  selectedPatient: any = null;
  showViewModal = false;

  // Edit modal
  showEditModal = false;
  editLoading = false;
  editError = '';
  editingPatient: any = null;
  editForm!: FormGroup;

  // Delete modal
  showDeleteModal = false;
  deleteLoading = false;
  deletingPatient: any = null;

  // Toast
  toast: { msg: string; type: 'success' | 'error' } | null = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      dateOfBirth: [''],
      gender: [''],
      enabled: [true]
    });
  }

  loadPatients(): void {
    this.isLoading = true;
    this.adminService.getAllPatients().subscribe({
      next: (data: any[]) => {
        this.patients = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.showToast('Failed to load patients', 'error');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.patients];

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.firstName || '').toLowerCase().includes(q) ||
        (p.lastName || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
      );
    }

    if (this.filterStatus === 'active') {
      list = list.filter(p => p.enabled === true);
    }
    if (this.filterStatus === 'inactive') {
      list = list.filter(p => p.enabled === false);
    }

    this.filteredPatients = [...list];
  }

  setFilter(f: 'all' | 'active' | 'inactive') {
    this.filterStatus = f;
    this.applyFilters();
  }

  // ── View ──
  viewPatient(p: any) {
    // Fetch fresh patient details from backend
    this.adminService.getPatientDetails(p.id).subscribe({
      next: (patientDetails) => {
        this.selectedPatient = patientDetails;
        this.showViewModal = true;
      },
      error: (err) => {
        console.error('Error fetching patient details:', err);
        // Fallback to the passed patient object
        this.selectedPatient = { ...p };
        this.showViewModal = true;
        this.showToast('Could not fetch latest details', 'error');
      }
    });
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedPatient = null;
  }

  // ── Edit ──
  openEdit(p: any) {
    // Fetch fresh data for editing
    this.adminService.getPatientDetails(p.id).subscribe({
      next: (patientDetails) => {
        this.editingPatient = patientDetails;
        this.editError = '';

        this.editForm.patchValue({
          firstName: patientDetails.firstName || '',
          lastName: patientDetails.lastName || '',
          phoneNumber: patientDetails.phoneNumber || '',
          dateOfBirth: patientDetails.dateOfBirth || '',
          gender: patientDetails.gender || '',
          enabled: patientDetails.enabled === true
        });

        this.showEditModal = true;
      },
      error: (err) => {
        console.error('Error fetching patient for edit:', err);
        // Fallback to passed object
        this.editingPatient = { ...p };
        this.editError = '';

        this.editForm.patchValue({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phoneNumber: p.phoneNumber || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || '',
          enabled: p.enabled === true
        });

        this.showEditModal = true;
        this.showToast('Using cached data', 'error');
      }
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingPatient = null;
    this.editForm.reset();
  }

  saveEdit() {
    if (!this.editingPatient || this.editForm.invalid) return;

    this.editLoading = true;
    this.editError = '';

    const payload = this.editForm.value;

    this.adminService.updatePatient(this.editingPatient.id, payload).subscribe({
      next: (updated: any) => {
        // Update the patient in the local array
        const index = this.patients.findIndex(p => p.id === updated.id);
        if (index !== -1) {
          this.patients[index] = { ...this.patients[index], ...updated };
        }
        
        this.applyFilters(); // Refresh filtered list
        this.editLoading = false;
        this.showEditModal = false;
        this.showToast('Patient updated successfully', 'success');
      },
      error: (err: any) => {
        this.editError = err?.error || err?.message || 'Update failed. Try again.';
        this.editLoading = false;
      }
    });
  }

  // ── Toggle status ──
  togglePatientStatus(p: any): void {
    const wasEnabled = p.enabled;
    const obs = p.enabled
      ? this.adminService.disablePatient(p.id)
      : this.adminService.enablePatient(p.id);

    obs.subscribe({
      next: () => {
        // Update the patient's status in the local array
        const patient = this.patients.find(patient => patient.id === p.id);
        if (patient) {
          patient.enabled = !wasEnabled;
        }
        this.applyFilters(); // Refresh the filtered list
        this.showToast(`Patient ${!wasEnabled ? 'enabled' : 'disabled'} successfully`, 'success');
      },
      error: (err) => {
        console.error('Status toggle error:', err);
        this.showToast('Action failed. Please try again.', 'error');
      }
    });
  }

  // ── Delete ──
  openDelete(p: any) {
    this.deletingPatient = p;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingPatient = null;
    this.deleteLoading = false;
  }

  confirmDelete() {
    if (!this.deletingPatient) return;

    this.deleteLoading = true;

    this.adminService.deletePatient(this.deletingPatient.id).subscribe({
      next: () => {
        // Remove the patient from the local array
        this.patients = this.patients.filter(p => p.id !== this.deletingPatient.id);
        this.applyFilters(); // Refresh filtered list
        
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.deletingPatient = null;
        
        this.showToast('Patient deleted successfully', 'success');
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.showToast('Delete failed. Please try again.', 'error');
        this.deleteLoading = false;
      }
    });
  }

  // ── Toast ──
  showToast(msg: string, type: 'success' | 'error') {
    this.toast = { msg, type };
    setTimeout(() => (this.toast = null), 3200);
  }

  // ── Search handler ──
  onSearchChange(): void {
    this.applyFilters();
  }

  // ── Helpers ──
  initials(p: any): string {
    if (!p) return '?';
    return `${(p.firstName || '?').charAt(0)}${(p.lastName || '').charAt(0)}`.toUpperCase();
  }

  fullName(p: any): string {
    if (!p) return '';
    return `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown';
  }

  get activeCount(): number {
    return this.patients.filter(p => p.enabled === true).length;
  }

  get inactiveCount(): number {
    return this.patients.filter(p => p.enabled === false).length;
  }
}