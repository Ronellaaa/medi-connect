import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DoctorService } from '../../../services/doctor-service/doctor.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';
import { AuthService } from '../../../services/auth/auth.service';
import {
  DashboardService,
  DashboardSummary,
} from '../../../services/doctor-service/dashboard.service';
import { AppointmentService } from '../../../services/doctor-service/appointment.service';

interface SidebarItem {
  name: string;
  icon: string;
  route: string;
  active?: boolean;
  badge?: string;
}

interface Appointment {
  patientName: string;
  issue: string;
  time: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  avatar: string;
}

interface DashboardCard {
  label: string;
  icon: string;
  route: string;
}

interface InsightBubble {
  title: string;
  value: string;
  top: string;
  left: string;
  size: string;
}

@Component({
  selector: 'app-doctor-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class DoctorLanding implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('backgroundVideo') backgroundVideo?: ElementRef<HTMLVideoElement>;

  sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: 'fas fa-th-large', route: '/doctors/dashboard', active: true },
    { name: 'Profile', icon: 'fas fa-user-circle', route: '/doctors/profile' },
    { name: 'Doctors', icon: 'fas fa-user-md', route: '/doctors/team' },
    { name: 'Appointments', icon: 'fas fa-calendar-alt', route: '/appointments/doctor-dashboard' },
    {
      name: 'Availability',
      icon: 'fas fa-clock',
      route: '/doctors/availability',
      badge: '2',
    },
    { name: 'Prescription', icon: 'fas fa-file-prescription', route: '/doctors/prescription' },
    { name: 'Reports', icon: 'fas fa-chart-pie', route: '/doctors/reports' },
  ];

  dashboardCards: DashboardCard[] = [
    { label: 'Profile', icon: 'assets/login/d2.png', route: '/doctors/profile' },
    { label: 'Appointments', icon: 'assets/login/g.png', route: '/doctors/appointments' },
    { label: 'Prescription', icon: 'assets/login/f1.png', route: '/doctors/prescription' },
    { label: 'Reports', icon: 'assets/login/d0.png', route: '/doctors/reports' },
    { label: 'Dashboard', icon: 'assets/login/h.png', route: '/doctors/dashboard' },
  ];

  blueSlides: InsightBubble[][] = [];

  recentAppointments: Appointment[] = [
    {
      patientName: 'Nethmi Perera',
      issue: 'Chest pain and breathing issue',
      time: '10:30 AM',
      priority: 'HIGH',
      avatar: 'https://i.pravatar.cc/100?img=32',
    },
    {
      patientName: 'Kavindu Silva',
      issue: 'Fever and headache',
      time: '11:15 AM',
      priority: 'MEDIUM',
      avatar: 'https://i.pravatar.cc/100?img=14',
    },
  ];

  cardCenterIndex = 2;
  blueCenterIndex = 0;

  private cardTimer: any;
  private blueTimer: any;
  private doctorId: number | null = null;

  doctorName = 'Doctor';
  doctorSpecialty = 'Specialty not added';
  doctorEmail = 'doctor@mediconnect.com';
  doctorIdLabel = 'DR-0000';
  dashboardData: DashboardSummary = {
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
    rejectedAppointments: 0,
    highUrgencyAppointments: 0,
    totalPrescriptions: 0,
    totalReports: 0,
    totalAvailabilitySlots: 0,
  };
  todayCases = 0;

  constructor(
    private doctorService: DoctorService,
    private sessionService: DoctorSessionService,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.doctorId = this.sessionService.getCurrentDoctorId();
    this.loadDoctorIdentity();
    this.loadDashboardSummary();
    this.loadAppointments();
  }

  ngAfterViewInit(): void {
    this.muteBackgroundVideo();

    this.cardTimer = setInterval(() => {
      this.nextCard();
    }, 2200);

    this.blueTimer = setInterval(() => {
      this.nextBlueSlide();
    }, 2600);
  }

  ngOnDestroy(): void {
    if (this.cardTimer) {
      clearInterval(this.cardTimer);
    }
    if (this.blueTimer) {
      clearInterval(this.blueTimer);
    }
  }

  nextCard(): void {
    this.cardCenterIndex = (this.cardCenterIndex + 1) % this.dashboardCards.length;
  }

  prevCard(): void {
    this.cardCenterIndex =
      (this.cardCenterIndex - 1 + this.dashboardCards.length) % this.dashboardCards.length;
  }

  nextBlueSlide(): void {
    this.blueCenterIndex = (this.blueCenterIndex + 1) % this.blueSlides.length;
  }

  prevBlueSlide(): void {
    this.blueCenterIndex =
      (this.blueCenterIndex - 1 + this.blueSlides.length) % this.blueSlides.length;
  }

  getCardPositionClass(index: number): string {
    const total = this.dashboardCards.length;
    const offset = (index - this.cardCenterIndex + total) % total;

    if (offset === 0) return 'card-pos-center';
    if (offset === 1) return 'card-pos-right-1';
    if (offset === 2) return 'card-pos-right-2';
    if (offset === total - 1) return 'card-pos-left-1';
    return 'card-pos-left-2';
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-400';
      case 'MEDIUM':
        return 'bg-green-100 text-green-500';
      default:
        return 'bg-blue-100 text-blue-500';
    }
  }

  muteBackgroundVideo(): void {
    const video = this.backgroundVideo?.nativeElement;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  logout(): void {
    this.sessionService.clear();
    this.authService.logout();
  }

  private loadDoctorIdentity(): void {
    const cachedDoctor = this.sessionService.getCurrentDoctorProfile();
    if (cachedDoctor) {
      this.applyDoctorIdentity(
        cachedDoctor.fullName,
        cachedDoctor.email,
        cachedDoctor.mainSpecialization,
        cachedDoctor.id,
      );
    }

    if (!this.doctorId) {
      return;
    }

    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        this.sessionService.setDoctorProfile(doctor);
        this.applyDoctorIdentity(
          doctor.fullName,
          doctor.email,
          doctor.mainSpecialization,
          doctor.id,
        );
      },
      error: (err) => {
        console.error('Failed to load landing doctor identity', err);
      },
    });
  }

  private applyDoctorIdentity(
    name?: string,
    email?: string,
    specialization?: string,
    id?: number,
  ): void {
    if (name) {
      this.doctorName = name;
    }
    if (email) {
      this.doctorEmail = email;
    }
    if (specialization) {
      this.doctorSpecialty = specialization;
    }
    if (id) {
      this.doctorIdLabel = `DR-${String(id).padStart(4, '0')}`;
    }
  }

  private loadDashboardSummary(): void {
    this.dashboardService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.dashboardData = summary;
        this.rebuildBlueSlides();
      },
      error: (err) => {
        console.error('Failed to load landing dashboard summary', err);
        this.rebuildBlueSlides();
      },
    });
  }

  private loadAppointments(): void {
    const request$ = this.doctorId
      ? this.appointmentService.getAppointmentsByDoctor(this.doctorId)
      : this.appointmentService.getAllAppointments();

    request$.subscribe({
      next: (appointments) => {
        const today = new Date().toISOString().slice(0, 10);
        this.todayCases = appointments.filter((item) => (item.appointmentDate || '').slice(0, 10) === today).length;

        this.recentAppointments = appointments.slice(0, 2).map((item, index) => ({
          patientName: item.patientName || `Patient #${item.patientId}`,
          issue: item.reason || 'General consultation',
          time: item.appointmentDate ? item.appointmentDate.slice(11, 16) : 'N/A',
          priority: (item.urgencyLevel || 'LOW').toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW',
          avatar: `https://i.pravatar.cc/100?img=${index === 0 ? 32 : 14}`,
        }));

        this.rebuildBlueSlides();
      },
      error: (err) => {
        console.error('Failed to load landing appointments', err);
        this.rebuildBlueSlides();
      },
    });
  }

  private rebuildBlueSlides(): void {
    this.blueSlides = [
      [
        {
          title: 'Total Pending',
          value: this.formatStat(this.dashboardData.pendingAppointments),
          top: '15%',
          left: '62%',
          size: '72px',
        },
        {
          title: 'Today Cases',
          value: this.formatStat(this.todayCases),
          top: '50%',
          left: '30%',
          size: '82px',
        },
        {
          title: 'Appointments',
          value: this.formatStat(this.dashboardData.totalAppointments),
          top: '40%',
          left: '55%',
          size: '100px',
        },
        {
          title: 'Reports',
          value: this.formatStat(this.dashboardData.totalReports),
          top: '25%',
          left: '35%',
          size: '66px',
        },
      ],
      [
        {
          title: 'Critical',
          value: this.formatStat(this.dashboardData.highUrgencyAppointments),
          top: '15%',
          left: '62%',
          size: '72px',
        },
        {
          title: 'Accepted',
          value: this.formatStat(this.dashboardData.acceptedAppointments),
          top: '50%',
          left: '30%',
          size: '82px',
        },
        {
          title: 'Prescriptions',
          value: this.formatStat(this.dashboardData.totalPrescriptions),
          top: '40%',
          left: '55%',
          size: '100px',
        },
        {
          title: 'Doctors',
          value: this.formatStat(this.dashboardData.totalDoctors),
          top: '25%',
          left: '35%',
          size: '66px',
        },
      ],
      [
        {
          title: 'Rejected',
          value: this.formatStat(this.dashboardData.rejectedAppointments),
          top: '15%',
          left: '62%',
          size: '72px',
        },
        {
          title: 'Available',
          value: this.formatStat(this.dashboardData.totalAvailabilitySlots),
          top: '50%',
          left: '30%',
          size: '82px',
        },
        {
          title: 'Queue',
          value: this.formatStat(this.dashboardData.pendingAppointments + this.todayCases),
          top: '40%',
          left: '55%',
          size: '100px',
        },
        {
          title: 'Visits',
          value: this.formatStat(this.dashboardData.totalAppointments),
          top: '25%',
          left: '35%',
          size: '66px',
        },
      ],
    ];

    if (this.blueCenterIndex >= this.blueSlides.length) {
      this.blueCenterIndex = 0;
    }
  }

  private formatStat(value: number): string {
    return String(value).padStart(2, '0');
  }
}
