import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appointment-results',
  imports: [MatIconModule, RouterLink],
  templateUrl: './appointment-results.html',
  styleUrl: './appointment-results.css',
})
export class AppointmentResults {}
