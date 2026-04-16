import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentApiService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { DoctorSessionService } from '../../services/doctor-service/doctor-session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-booking',
  imports: [MatIconModule, RouterLink, FormsModule, CommonModule],
  templateUrl: './appointment-booking.html',
  styleUrl: './appointment-booking.css',
})
export class AppointmentBooking {
  private appointmentApi = inject(AppointmentApiService);
  private notificationApi = inject(NotificationService);
  private sessionService = inject(DoctorSessionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  fullName = '';
  mobileNumber = '';
  age = 0;
  email = '';
  selectedDate = '';
  selectedTime = '10:00';
  showSuccessModal = false;
  successModalText = 'Please check your email for the appointment details.';

  selectedDoctorId: number | null = null;
  selectedDoctorName = '';
  selectedSpecialty = '';
  selectedHospital = '';
  consultationFee = '';

  isSubmitting = false;

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.selectedDoctorId = params['doctorId'] ? Number(params['doctorId']) : null;
      this.selectedDoctorName = params['doctorName'] ?? '';
      this.selectedSpecialty = params['specialty'] ?? '';
      this.selectedHospital = params['hospital'] ?? '';
      this.selectedDate = params['date'] ?? '';
      this.consultationFee = params['fee'] ?? '';
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/payments'], {
      queryParams: {
        appointmentId: this.latestAppointmentId,
        patientId: this.sessionService.getCurrentProfileId(),
        doctorId: this.selectedDoctorId,
      },
    });
  }

  private latestAppointmentId = '';

  confirmBooking(): void {
    if (this.isSubmitting) {
      return;
    }

    const patientId = this.sessionService.getCurrentProfileId();

    if (!patientId) {
      alert('Please log in again as a patient.');
      return;
    }

    if (!this.selectedDoctorId) {
      alert('Doctor information is missing.');
      return;
    }

    if (!this.selectedDate || !this.selectedTime) {
      alert('Please select date and time.');
      return;
    }

    const appointmentDate = `${this.selectedDate}T${this.selectedTime}:00`;

    if (this.age < 0 || this.age == null) {
      alert('Please enter a valid age!');
      return;
    }

    if (!this.mobileNumber || this.mobileNumber.length !== 10) {
      alert('Please enter a valid mobile number!');
      return;
    }

    const formattedPhone = `+94${this.mobileNumber.substring(1)}`;

    if (this.fullName.trim() === '') {
      alert('Please enter your name!');
      return;
    }

    if (this.email.trim() === '' || !this.email.includes('@')) {
      alert('Please enter a valid email address!');
      return;
    }

    this.isSubmitting = true;

    const appointmentPayload = {
      id: '',
      patientId,
      patientName: this.fullName,
      patientphoneNumber: this.mobileNumber,
      patientAge: this.age,
      doctorId: this.selectedDoctorId,
      doctorName: this.selectedDoctorName,
      specialty: this.selectedSpecialty,
      appointmentDate,
    };

    this.appointmentApi.createAppointment(appointmentPayload).subscribe({
      next: (response) => {
        this.latestAppointmentId = response.id;
        this.showSuccessModal = true;
        this.successModalText = 'Appointment confirmed. Continue to payment.';

        const notificationPayload = {
          appointmentId: response.id,
          patientName: this.fullName,
          doctorName: this.selectedDoctorName,
          patientPhone: formattedPhone,
          patientEmail: this.email,
          appointmentDate,
        };

        this.notificationApi.sendAppointmentConfirmation(notificationPayload).subscribe({
          next: () => {
            this.isSubmitting = false;
          },
          error: () => {
            this.isSubmitting = false;
          },
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating appointment', error);
      },
    });
  }
}
