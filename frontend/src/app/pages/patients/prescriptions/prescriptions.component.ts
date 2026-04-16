import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionService } from '../../../services/prescription.service';

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

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.prescriptionService.getMyPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load prescriptions');
        this.isLoading = false;
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

  isExpiringSoon(validUntil: string | Date): boolean {
    const expiryDate = new Date(validUntil);
    const now = new Date();
    const diffDays = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  parseMedications(medications: string | Array<any>): Array<{ name: string; dosage: string }> {
    if (!medications) {
      return [];
    }

    if (typeof medications === 'string') {
      try {
        const parsed = JSON.parse(medications);
        return Array.isArray(parsed)
          ? parsed.map((med) => ({ name: med.name || med.medication || '', dosage: med.dosage || '' }))
          : [];
      } catch {
        return medications.split(',').map((item) => {
          const [name, dosage] = item.split(':').map((part) => part.trim());
          return { name: name || item, dosage: dosage || '' };
        });
      }
    }

    if (Array.isArray(medications)) {
      return medications.map((med) => ({ name: med.name || med.medication || '', dosage: med.dosage || '' }));
    }

    return [];
  }

  parseMedicationsDetailed(medications: string | Array<any>): Array<any> {
    if (!medications) {
      return [];
    }

    if (typeof medications === 'string') {
      try {
        const parsed = JSON.parse(medications);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return medications.split(',').map((item) => {
          const [name, dosage, frequency, duration] = item.split(':').map((part) => part.trim());
          return {
            name: name || item,
            dosage: dosage || '',
            frequency: frequency || '',
            duration: duration || ''
          };
        });
      }
    }

    if (Array.isArray(medications)) {
      return medications;
    }

    return [];
  }

  private showError(message: string): void {
    console.error(message);
  }
}
