import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionService } from '../../../services/prescription.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-prescriptions',
  imports: [CommonModule],
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: any[] = [];
  isLoading = false;
  selectedPrescription: any = null;
  errorMessage = '';

  constructor(
    private prescriptionService: PrescriptionService,
    private sessionService: DoctorSessionService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const patientId = this.sessionService.getCurrentProfileId();
    console.log('Patient ID from session:', patientId);

    if (!patientId) {
      this.errorMessage = 'Patient session not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.prescriptionService
      .getPrescriptionsByPatient(patientId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          console.log('Prescriptions response:', data);
          this.prescriptions = Array.isArray(data) ? data : [];
        },
        error: (err) => {
          console.error('Failed to load prescriptions', err);
          this.errorMessage = 'Failed to load prescriptions.';
          this.prescriptions = [];
        }
      });
  }

  viewDetails(prescription: any): void {
    this.selectedPrescription = prescription;
  }

  closeModal(): void {
    this.selectedPrescription = null;
  }

  printPrescription(): void {
    window.print();
  }

  parseMedications(medicines: string | Array<any>): Array<{ name: string; dosage: string }> {
    if (!medicines) return [];

    if (typeof medicines === 'string') {
      return medicines.split(',').map((item) => {
        const [name, dosage] = item.split('|').map((part) => part.trim());
        return {
          name: name || '',
          dosage: dosage || ''
        };
      });
    }

    if (Array.isArray(medicines)) {
      return medicines.map((med) => ({
        name: med.name || '',
        dosage: med.dosage || ''
      }));
    }

    return [];
  }

  parseMedicationsDetailed(medicines: string | Array<any>): Array<any> {
    if (!medicines) return [];

    if (typeof medicines === 'string') {
      return medicines.split(',').map((item) => {
        const [name, dosage, duration] = item.split('|').map((part) => part.trim());
        return {
          name: name || '',
          dosage: dosage || '',
          frequency: 'As prescribed',
          duration: duration || ''
        };
      });
    }

    if (Array.isArray(medicines)) {
      return medicines;
    }

    return [];
  }
}