import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { AppointmentApiService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
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
  private router = inject(Router);

  fullName = '';
  mobileNumber = '';
  age = 0;
  email = '';
  selectedDate = '2026-04-25';
  selectedTime = '10:00';
  showSuccessModal = false;
  successModalText = 'Please check your email for the appointment details.';

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/appointments']);
  }
  isSubmitting = false;
  confirmBooking() {
    if (this.isSubmitting) {
      return;
    }

    const appointmentDate = `${this.selectedDate}T${this.selectedTime}:00`;

    if (this.age < 0 || this.age == null) {
      alert('Please enter a valid age!');
      return;
    }
    if (this.mobileNumber.length != 10 || this.mobileNumber == null) {
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
      patientId: 1,
      patientName: this.fullName,
      patientphoneNumber: this.mobileNumber,
      patientAge: this.age,
      doctorId: 101,
      doctorName: 'Dr. John Smith',
      specialty: 'Cardiologist',
      appointmentDate,
    };

    this.appointmentApi.createAppointment(appointmentPayload).subscribe({
      next: (response) => {
        this.showSuccessModal = true;
        this.successModalText = 'Please check your email for the appointment details.';

        const notificationPayload = {
          appointmentId: response.id,
          patientName: this.fullName,
          doctorName: 'Dr. John Smith',
          patientPhone: formattedPhone,
          patientEmail: this.email,
          appointmentDate,
        };
        console.log('Appointment created successfully', response);
        this.notificationApi.sendAppointmentConfirmation(notificationPayload).subscribe({
          next: () => {
            this.isSubmitting = false;
          },
          error: () => {
            this.successModalText = 'Appointment confirmed. The email notice could not be verified from the app, so please check your inbox or spam folder.';
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
