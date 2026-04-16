import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      address: [''],
      bloodGroup: [''],
      emergencyContact: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.patientService.getProfile().subscribe({
      next: (data) => {
        this.profileForm.patchValue(data);
        this.isLoading = false;
      },
      error: () => {
        this.showError('Failed to load profile');
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile();
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.showError('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    this.patientService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.showSuccess('Profile updated successfully');
        this.isEditing = false;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Update failed');
        this.isLoading = false;
      }
    });
  }

  private showError(message: string): void {
    console.error(message);
  }

  private showSuccess(message: string): void {
    console.log(message);
  }
}
