import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../../services/doctor-service/dashboard.service';
import { AppointmentService, AppointmentRecord } from '../../../services/doctor-service/appointment.service';
import { DoctorService } from '../../../services/doctor-service/doctor.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';

import { gsap } from 'gsap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  
  dashboardData: DashboardSummary = {
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
    rejectedAppointments: 0,
    highUrgencyAppointments: 0,
    totalPrescriptions: 0,
    totalReports: 0,
    totalAvailabilitySlots: 0
  };

  recentAppointments: {
    patientName: string;
    reason: string;
    urgencyLevel: string;
    time: string;
    status: string;
  }[] = [];

  doctorName = 'Doctor';
  currentDate = new Date();
  timer: any;

  constructor(
    private dashboardService: DashboardService,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private sessionService: DoctorSessionService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecentAppointments();
    this.loadDoctorName();

    this.timer = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  ngAfterViewInit(): void {
    this.initAnimations();
  }

  loadDashboard(): void {
    this.dashboardService.getDashboardSummary().subscribe({
      next: (res) => {
        if(res){
          this.dashboardData = res;
        }
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
      }
    });
  }

  loadRecentAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.recentAppointments = appointments.slice(0, 5).map((item) => ({
          patientName: `Patient #${item.patientId}`,
          reason: item.reason || 'Consultation',
          urgencyLevel: item.urgencyLevel || 'LOW',
          time: item.appointmentTime ? item.appointmentTime.slice(0, 5) : 'N/A',
          status: item.status || 'PENDING'
        }));
      },
      error: (err) => {
        console.error('Error loading recent appointments', err);
      }
    });
  }

  loadDoctorName(): void {
    const doctorId = this.sessionService.getCurrentDoctorId();
    if (doctorId) {
      this.doctorService.getDoctorById(doctorId).subscribe({
        next: (doctor) => {
          this.doctorName = doctor.fullName || 'Doctor';
        },
        error: () => {}
      });
    }
  }

  getUrgencyClass(level: string): string {
    if (level === 'HIGH') return 'u-high';
    if (level === 'MEDIUM') return 'u-med';
    return 'u-low';
  }

  initAnimations(): void {
    const q = gsap.utils.selector(this.el.nativeElement);

    // Sidebar Items staggered
    gsap.from(q('.sidebar-item'), {
      opacity: 0,
      x: -20,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    });

    // Content fade in and up
    gsap.from(q('.fade-up'), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2
    });

    // Cinematic Light floating animations
    const ambientLights = q('.ambient-light');
    ambientLights.forEach((light) => {
      gsap.to(light, {
        y: 'random(-50, 50)',
        x: 'random(-50, 50)',
        duration: 'random(6, 12)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Hologram core hovering
    gsap.to(q('.holo-core'), {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}