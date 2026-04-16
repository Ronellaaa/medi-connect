import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; //For making HTTP requests to the backend
import { Component, inject, ChangeDetectorRef, OnInit   } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router'; //For accessing route parameters and navigation

interface PaymentFormModel {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  description: string;
}

interface PaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  checkoutMethod: string;
  checkoutFormFields: Record<string, string>;
  status: string;
  amount: number;
  createdAt: string;
  message: string;
}

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.catchAppointmentId();
  }

   private catchAppointmentId(): void {
     // Way 1: Check query params (?appointmentId=xxx)
    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        this.form.appointmentId = params['appointmentId'];
        console.log('✅ Caught appointmentId from query params:', this.form.appointmentId);
      }
    });

    // Way 2: Check path params (/payment/:appointmentId)
    this.route.params.subscribe(params => {
      if (params['appointmentId']) {
        this.form.appointmentId = params['appointmentId'];
        console.log('✅ Caught appointmentId from path params:', this.form.appointmentId);
      }
    });
  }

  

  protected readonly apiUrl = 'http://localhost:8085/api/payments/initiate';
  protected readonly routeState = this.route.snapshot.data['state'] as 'success' | 'cancel' | undefined;

  protected isSubmitting = false;
  protected errorMessage = '';
  protected successMessage = this.resolveSuccessMessage();
  /*new code*/
  protected isPaymentCompleted = false; 

  protected form: PaymentFormModel = {
    appointmentId: '',
    patientId: '',
    doctorId: '',
    amount: 2500,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    description: ''
  };

  protected submitPayment(): void {
    /*--*/
    if (this.isPaymentCompleted) {  
      return;
    }
    /* --*/
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    this.http.post<PaymentResponse>(this.apiUrl, this.form).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.redirectToPayHere(response);
      },
      /*error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message
          ?? error?.error?.error
          ?? 'Unable to initiate payment. Check that the payments service is running and your request details are valid.';
      }*/

        error: (error) => {
        this.isSubmitting = false;

        console.log('=== ERROR DEBUG ===');
        console.log('Full error:', error);
        console.log('error.error:', error?.error);
        console.log('error.message:', error?.message);
        console.log('error.status:', error?.status);
        
        /*const errorMsg = error?.error?.message || '';*/

        /*---*/
        const errorMsg = error?.error?.message 
          || error?.error?.error 
          || error?.message 
          || error?.statusText
          || 'Unknown error';
  
  console.log('Extracted message:', errorMsg);
        /*--*/
        
        if (errorMsg.includes('already completed')) {
          this.errorMessage = 'Payment has already been completed for this appointment. No further payment is required.';
          this.isPaymentCompleted = true;
          console.log('✅ Error message set:', this.errorMessage);  
          console.log('✅ isPaymentCompleted:', this.isPaymentCompleted);  
        } else {
          this.errorMessage = errorMsg || 'Unable to initiate payment. Please check your details and try again.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  private redirectToPayHere(response: PaymentResponse): void {
    if (!response.checkoutUrl || !response.checkoutFormFields || Object.keys(response.checkoutFormFields).length === 0) {
      this.errorMessage = 'The backend did not return a valid PayHere checkout payload.';
      return;
    }

    const form = document.createElement('form');
    form.method = response.checkoutMethod || 'POST';
    form.action = response.checkoutUrl;
    form.style.display = 'none';

    Object.entries(response.checkoutFormFields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value ?? '';
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  private resolveSuccessMessage(): string {
    if (this.routeState === 'success') {
      return 'PayHere returned you to the success page. Your backend webhook will confirm the final payment status.';
    }

    if (this.routeState === 'cancel') {
      return 'The PayHere checkout was cancelled. You can update the details below and try again.';
    }

    return '';
  }
}
