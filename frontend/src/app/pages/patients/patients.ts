import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient, PatientService } from '../../services/patient.service';

@Component({
  standalone: true,
  selector: 'app-patients',
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrls: ['./patients.css'],
})
export class Patients {
  searchQuery = '';
  selectedPatient: Patient | null = null;
  newPatient: Omit<Patient, 'id'> = {
    name: '',
    age: 0,
    gender: 'Female',
    phone: '',
    email: '',
    condition: 'General consultation',
    nextAppointment: '',
    status: 'Pending',
  };

  constructor(private readonly patientService: PatientService) {}

  get filteredPatients(): Patient[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.patientService.getPatients().filter((patient) => {
      return (
        query.length === 0 ||
        patient.name.toLowerCase().includes(query) ||
        patient.condition.toLowerCase().includes(query) ||
        patient.status.toLowerCase().includes(query)
      );
    });
  }

  get totalPatients(): number {
    return this.patientService.getPatients().length;
  }

  get activeAppointments(): number {
    return this.patientService.getPatients().filter((patient) => patient.status !== 'Completed').length;
  }

  selectPatient(patient: Patient) {
    this.selectedPatient = patient;
  }

  addPatient() {
    const patient = this.newPatient;
    if (!patient.name || !patient.email || !patient.phone) {
      return;
    }

    this.patientService.addPatient(patient);
    this.selectedPatient = null;
    this.searchQuery = '';
    this.newPatient = {
      name: '',
      age: 0,
      gender: 'Female',
      phone: '',
      email: '',
      condition: 'General consultation',
      nextAppointment: '',
      status: 'Pending',
    };
  }

  removePatient(patient: Patient) {
    this.patientService.removePatient(patient.id);
    if (this.selectedPatient?.id === patient.id) {
      this.selectedPatient = null;
    }
  }

  updateStatus(patient: Patient, status: Patient['status']) {
    this.patientService.updateStatus(patient.id, status);
    if (this.selectedPatient?.id === patient.id) {
      this.selectedPatient = { ...patient, status };
    }
  }
}
