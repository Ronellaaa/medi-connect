import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { DoctorService } from '../../../services/doctor-service/doctor.service';
import {
  PrescriptionDataService,
  PrescriptionRecord,
} from '../../../services/doctor-service/prescription.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';

interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
}

interface PrescriptionTemplate {
  id: number;
  title: string;
  subtitle: string;
  color: 'violet' | 'green' | 'white';
  amount: string;
  diagnosis: string;
  note: string;
  medicines: PrescriptionMedicine[];
}

interface DiaryForm {
  patientName: string;
  age: string;
  diagnosis: string;
  title: string;
  doctorName: string;
  issuedAt: string;
  note: string;
  medicines: PrescriptionMedicine[];
}

interface IssuedPrescription {
  idText: string;
  patientName: string;
  diagnosis: string;
  title: string;
  issuedDate: string;
  notePreview: string;
  raw: PrescriptionRecord;
}

@Component({
  selector: 'app-doctor-prescription-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './prescription.html',
  styleUrls: ['./prescription.css'],
})
export class DoctorPrescriptionPageComponent implements OnInit, AfterViewInit {
  @ViewChild('issuedStripScroller') issuedStripScroller?: ElementRef<HTMLDivElement>;

  navItems = [
    { label: 'Dashboard', route: '/doctors/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/doctors/profile', icon: '👤' },
    { label: 'Doctors', route: '/doctors/team', icon: '🩺' },
    { label: 'Availability', route: '/doctors/availability', icon: '⏱' },
    { label: 'Appointments', route: '/appointments/doctor-dashboard', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' },
  ];

  templates: PrescriptionTemplate[] = [
    {
      id: 1,
      title: 'Fever',
      subtitle: 'Quick Template',
      color: 'violet',
      amount: '01',
      diagnosis: 'Fever / Viral Symptoms',
      note: 'Reusable template for fever and body pain cases.',
      medicines: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet 3 times daily', duration: '3 days' },
        { name: 'ORS / Fluids', dosage: 'Drink well', duration: 'As advised' },
        { name: 'Rest', dosage: 'Home rest', duration: '2 - 3 days' },
      ],
    },
    {
      id: 2,
      title: 'Cold',
      subtitle: 'Saved Template',
      color: 'green',
      amount: '02',
      diagnosis: 'Common Cold',
      note: 'Reusable template for sneezing, cough, and sore throat.',
      medicines: [
        { name: 'Cetirizine 10mg', dosage: '1 tablet at night', duration: '5 days' },
        { name: 'Steam Inhalation', dosage: 'Twice daily', duration: '5 days' },
        { name: 'Warm Fluids', dosage: 'Drink warm water', duration: 'As advised' },
      ],
    },
    {
      id: 3,
      title: 'Gastritis',
      subtitle: 'Standard Template',
      color: 'white',
      amount: '03',
      diagnosis: 'Gastritis / Acidity',
      note: 'Reusable template for acidity and stomach discomfort.',
      medicines: [
        { name: 'Omeprazole 20mg', dosage: 'Before breakfast', duration: '7 days' },
        { name: 'Antacid Syrup', dosage: '10ml when needed', duration: '5 days' },
        { name: 'Diet Advice', dosage: 'Avoid spicy food', duration: 'As advised' },
      ],
    },
  ];

  selectedTemplate: PrescriptionTemplate = this.templates[2];
  activeTemplateIndex = 2;

  showConfirmModal = false;
  isTearing = false;
  validationMessage = '';
  isEditingIssued = false;
  selectedPrescriptionId: number | null = null;

  issuedPrescriptions: IssuedPrescription[] = [];
  canScrollIssuedLeft = false;
  canScrollIssuedRight = false;
  issuedLoadMessage = '';

  diaryForm: DiaryForm = this.createEmptyDiaryForm();

private doctorId: number | null = null;
selectedAppointmentId: string | null = null;
private route = inject(ActivatedRoute);
  constructor(
    private prescriptionService: PrescriptionDataService,
    private doctorService: DoctorService,
    private sessionService: DoctorSessionService,
  ) {}


  // ngOnInit(): void {
  //   this.doctorId = this.sessionService.getCurrentDoctorId();
  // console.log('doctorId from session:', this.doctorId);
  // console.log('token from session:', this.sessionService.getToken());
  //   if (this.doctorId) {
  //     this.doctorService.getDoctorById(this.doctorId).subscribe({
  //       next: (doctor) => {
  //         this.diaryForm.doctorName = doctor.fullName || '';
  //       },
  //       error: (err) => {
  //         console.error('Failed to load doctor name', err);
  //       }
  //     });
  //   }

  //   this.loadIssuedPrescriptions();
  // }




  
  // ngOnInit(): void {
  //   const role = this.sessionService.getCurrentRole();

  //   if (role !== 'DOCTOR') {
  //     this.validationMessage = 'Only doctors can access prescriptions.';
  //     this.issuedLoadMessage = 'Access denied.';
  //     return;
  //   }

  //   this.doctorId = this.sessionService.getCurrentDoctorId();
    

  //   console.log('doctorId from session:', this.doctorId);
  //   console.log('token from session:', this.sessionService.getToken());

  //   if (this.doctorId) {
  //     this.doctorService.getDoctorById(this.doctorId).subscribe({
  //       next: (doctor) => {
  //         this.diaryForm.doctorName = doctor.fullName || '';
  //       },
  //       error: (err) => {
  //         console.error('Failed to load doctor name', err);
  //       },
  //     });
  //   }

  //   this.loadIssuedPrescriptions();
  // }

  ngOnInit(): void {
const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
this.selectedAppointmentId = appointmentId;

  const role = this.sessionService.getCurrentRole();

  if (role !== 'DOCTOR') {
    this.validationMessage = 'Only doctors can access prescriptions.';
    this.issuedLoadMessage = 'Access denied.';
    return;
  }

  this.doctorId = this.sessionService.getCurrentDoctorId();

  console.log('doctorId from session:', this.doctorId);
  console.log('selected appointment id:', this.selectedAppointmentId);

  if (this.doctorId) {
    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        this.diaryForm.doctorName = doctor.fullName || '';
      },
      error: (err) => {
        console.error('Failed to load doctor name', err);
      },
    });
  }

  this.loadIssuedPrescriptions();
}

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateIssuedScrollState());
  }

  private createEmptyDiaryForm(): DiaryForm {
    return {
      patientName: '',
      age: '',
      diagnosis: '',
      title: '',
      doctorName: '',
      issuedAt: '',
      note: '',
      medicines: [
        { name: '', dosage: '', duration: '' },
        { name: '', dosage: '', duration: '' },
        { name: '', dosage: '', duration: '' },
      ],
    };
  }

  selectTemplate(index: number): void {
    this.activeTemplateIndex = index;
    this.selectedTemplate = this.templates[index];
  }

selectAppointment(appointment: any): void {
  this.selectedAppointmentId = appointment.id;
}


  getCardPosition(index: number): string {
    if (index === this.activeTemplateIndex) return 'card-top';

    const others = this.templates.map((_, i) => i).filter((i) => i !== this.activeTemplateIndex);

    if (index === others[0]) return 'card-middle';
    return 'card-bottom';
  }

  applyTemplateToDiary(): void {
    this.diaryForm.diagnosis = this.selectedTemplate.diagnosis;
    this.diaryForm.title = `${this.selectedTemplate.title} Prescription`;
    this.diaryForm.note = this.selectedTemplate.note;
    this.diaryForm.medicines = this.selectedTemplate.medicines.map((med) => ({ ...med }));
  }

  issuePrescription(): void {
    this.validationMessage = '';

    if (!this.isDiaryValid()) {
      this.validationMessage =
        'Please fill the required diary fields before issuing the prescription.';
      return;
    }

    this.isTearing = true;

    setTimeout(() => {
      this.isTearing = false;
      this.showConfirmModal = true;
    }, 650);
  }

  confirmIssue(): void {
    const role = this.sessionService.getCurrentRole();

    if (role !== 'DOCTOR') {
      this.validationMessage = 'Only doctors can issue prescriptions.';
      this.showConfirmModal = false;
      return;
    }

    if (!this.doctorId) {
      this.validationMessage = 'Doctor record is required before issuing a prescription.';
      this.showConfirmModal = false;
      return;
    }

    const payload = this.buildPrescriptionPayload();
    console.log('FINAL PAYLOAD:', payload); // 👈 ADD HERE
    const request$ =
      this.isEditingIssued && this.selectedPrescriptionId
        ? this.prescriptionService.updatePrescription(this.selectedPrescriptionId, payload)
        : this.prescriptionService.createPrescription(payload);

    request$.subscribe({
      next: () => {
        this.showConfirmModal = false;
        this.validationMessage = '';
        this.resetDiaryForm();
        this.loadIssuedPrescriptions();
      },
      error: (err) => {
        console.error('Failed to save prescription', err);
        this.validationMessage = this.isEditingIssued
          ? 'Could not update prescription in doctor-service.'
          : 'Could not issue prescription to doctor-service.';
        this.showConfirmModal = false;
      },
    });
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  saveDraft(): void {
    this.validationMessage = 'Draft saved locally.';
    setTimeout(() => {
      this.validationMessage = '';
    }, 1800);
  }

  selectIssuedPrescription(item: IssuedPrescription): void {
    this.isEditingIssued = true;
    this.selectedPrescriptionId = item.raw.id ?? null;
    this.validationMessage = '';

    this.diaryForm = {
      patientName: `Patient #${item.raw.patientId}`,
      age: this.diaryForm.age,
      diagnosis: item.raw.diagnosis || '',
      title: item.title === 'Prescription details' ? '' : item.title,
      doctorName: this.diaryForm.doctorName,
      issuedAt: item.raw.issuedDate || '',
      note: item.raw.instructions || '',
      medicines: this.parseMedicines(item.raw.medicines),
    };
  }

  deleteSelectedPrescription(): void {
    if (!this.selectedPrescriptionId || !confirm('Delete this prescription?')) {
      return;
    }

    this.prescriptionService.deletePrescription(this.selectedPrescriptionId).subscribe({
      next: () => {
        this.validationMessage = 'Prescription deleted.';
        this.resetDiaryForm();
        this.loadIssuedPrescriptions();
      },
      error: (err) => {
        console.error('Failed to delete prescription', err);
        this.validationMessage = 'Could not delete prescription.';
      },
    });
  }

  clearSelectedPrescription(): void {
    this.resetDiaryForm();
    this.validationMessage = '';
  }

  scrollIssued(direction: 'left' | 'right'): void {
    const container = this.issuedStripScroller?.nativeElement;
    if (!container) {
      return;
    }

    const amount = Math.max(260, Math.floor(container.clientWidth * 0.65));
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });

    setTimeout(() => this.updateIssuedScrollState(), 280);
  }

  onIssuedScroll(): void {
    this.updateIssuedScrollState();
  }

  private isDiaryValid(): boolean {
    const hasBasicFields =
      this.diaryForm.patientName.trim() !== '' &&
      this.diaryForm.age.trim() !== '' &&
      this.diaryForm.diagnosis.trim() !== '' &&
      this.diaryForm.title.trim() !== '' &&
      this.diaryForm.doctorName.trim() !== '' &&
      this.diaryForm.issuedAt.trim() !== '' &&
      this.diaryForm.note.trim() !== '';

    const hasOneMedicine = this.diaryForm.medicines.some(
      (med) => med.name.trim() !== '' && med.dosage.trim() !== '' && med.duration.trim() !== '',
    );

    return hasBasicFields && hasOneMedicine;
  }

  private loadIssuedPrescriptions(): void {
    this.issuedLoadMessage = '';

    const role = this.sessionService.getCurrentRole();

    if (role !== 'DOCTOR') {
      this.issuedPrescriptions = [];
      this.issuedLoadMessage = 'Only doctors can view prescriptions.';
      return;
    }

    if (!this.doctorId) {
      this.issuedPrescriptions = [];
      this.issuedLoadMessage = 'Doctor session not found.';
      return;
    }

    this.prescriptionService.getPrescriptionsByDoctor(this.doctorId).subscribe({
      next: (records) => {
        this.issuedPrescriptions = records.length
          ? records.map((item) => ({
              idText: item.id ? `RX-${item.id}` : 'RX',
              patientName: `Patient #${item.patientId}`,
              diagnosis: this.displayDiagnosis(item),
              title: this.displayTitle(item),
              issuedDate: item.issuedDate || 'No date',
              notePreview: this.notePreview(item.instructions),
              raw: item,
            }))
          : [];
        queueMicrotask(() => this.updateIssuedScrollState());
      },
      error: (err) => {
        console.error('Failed to load issued prescriptions', err);
        this.issuedPrescriptions = [];
        this.issuedLoadMessage =
          err?.status === 401 || err?.status === 403
            ? 'Issued prescriptions could not load because the doctor session is not authorized.'
            : 'Issued prescriptions could not be loaded from doctor-service.';
        this.updateIssuedScrollState();
      },
    });
  }

  private firstMedicine(value: string): string {
    if (!value) {
      return 'Prescription';
    }

    return value.split(',')[0].trim();
  }

  private displayDiagnosis(item: PrescriptionRecord): string {
    const diagnosis = item.diagnosis?.trim();
    if (diagnosis) {
      return diagnosis;
    }

    const firstMedicine = this.firstMedicine(item.medicines);
    if (firstMedicine && firstMedicine !== 'Prescription') {
      const nameOnly = firstMedicine.split('|')[0]?.trim();
      return nameOnly ? `${nameOnly} Plan` : 'General Prescription';
    }

    return 'General Prescription';
  }

  private displayTitle(item: PrescriptionRecord): string {
    const diagnosis = item.diagnosis?.trim();
    if (diagnosis) {
      return diagnosis.length > 42 ? `${diagnosis.slice(0, 42).trim()}...` : diagnosis;
    }

    const firstMedicine = this.firstMedicine(item.medicines);
    if (firstMedicine && firstMedicine !== 'Prescription') {
      return firstMedicine;
    }

    const instructions = item.instructions?.trim();
    if (instructions) {
      return instructions.length > 42 ? `${instructions.slice(0, 42).trim()}...` : instructions;
    }

    return 'Prescription details';
  }

  private notePreview(value: string): string {
    if (!value) {
      return 'No extra instructions added.';
    }

    return value.length > 72 ? `${value.slice(0, 72).trim()}...` : value;
  }

  private updateIssuedScrollState(): void {
    const container = this.issuedStripScroller?.nativeElement;
    if (!container) {
      this.canScrollIssuedLeft = false;
      this.canScrollIssuedRight = false;
      return;
    }

    this.canScrollIssuedLeft = container.scrollLeft > 8;
    this.canScrollIssuedRight =
      container.scrollLeft + container.clientWidth < container.scrollWidth - 8;
  }

  private buildPrescriptionPayload(): PrescriptionRecord {
    return {
       patientId: undefined, // ❌ don't guess patient
       appointmentId: this.selectedAppointmentId ?? undefined,

      diagnosis: this.diaryForm.diagnosis,
      medicines: this.diaryForm.medicines
        .filter((med) => med.name.trim() !== '')
        .map((med) => `${med.name} | ${med.dosage} | ${med.duration}`)
        .join(', '),
      instructions: this.diaryForm.note,
      issuedDate:
        this.diaryForm.issuedAt && /^\d{4}-\d{2}-\d{2}$/.test(this.diaryForm.issuedAt)
          ? this.diaryForm.issuedAt
          : new Date().toISOString().slice(0, 10),
      doctor: {
        id: this.doctorId ?? undefined,
      },
    };
  }

  private parseMedicines(value: string): PrescriptionMedicine[] {
    const parsed = (value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [name = '', dosage = '', duration = ''] = entry.split('|').map((part) => part.trim());
        return { name, dosage, duration };
      });

    while (parsed.length < 3) {
      parsed.push({ name: '', dosage: '', duration: '' });
    }

    return parsed.slice(0, 3);
  }

  private extractPatientId(value: string): number {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      return Date.now();
    }

    return Number(digits);
  }

  private resetDiaryForm(): void {
    const doctorName = this.diaryForm.doctorName;
    this.diaryForm = this.createEmptyDiaryForm();
    this.diaryForm.doctorName = doctorName;
    this.isEditingIssued = false;
    this.selectedPrescriptionId = null;
  }
}
