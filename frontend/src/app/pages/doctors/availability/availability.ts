import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvailabilityDataService, AvailabilityRecord } from '../../../services/doctor-service/availability.service';
import { DoctorSessionService } from '../../../services/doctor-service/doctor-session.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-doctor-availability-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './availability.html',
  styleUrl: './availability.css'
})
export class DoctorAvailabilityPageComponent implements OnInit, AfterViewInit {
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('lungShell') lungShell!: ElementRef;
  @ViewChild('boardShell') boardShell!: ElementRef;
  @ViewChild('pinNoteRef') pinNoteRef?: ElementRef;
  @ViewChildren('pocketRef') pocketRefs!: QueryList<ElementRef>;

  navItems = [
    { label: 'Dashboard', route: '/doctors/dashboard', icon: '⌂' },
    { label: 'Profile', route: '/doctors/profile', icon: '👤' },
    { label: 'Doctors', route: '/doctors/team', icon: '🩺' },
    { label: 'Availability', route: '/doctors/availability', icon: '⏱' },
    { label: 'Appointments', route: '/doctors/appointments', icon: '📅' },
    { label: 'Prescription', route: '/doctors/prescription', icon: '💊' },
    { label: 'Reports', route: '/doctors/reports', icon: '📄' }
  ];

  stats = [
    { label: 'Open slots', value: '0' },
    { label: 'Booked slots', value: '0' },
    { label: 'Break periods', value: '0' },
    { label: 'Telehealth windows', value: '0' }
  ];

  rawRecords: AvailabilityRecord[] = [];

  slots: {
    id: number;
    day: string;
    detail: string;
    status: string;
    tone: string;
    record: AvailabilityRecord;
    pocketColor: string;
    shortType: string;
  }[] = [];

  isSaving = false;
  isEditMode = false;
  currentRecordId: number | null = null;
  doctorId: number | null = null;
  statusMessage = '';
  selectedSlot: any = null;

  formData: any = {
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    hospitalOrClinic: '',
    consultationType: '',
    available: true
  };

  pocketPalette = [
    'pocket-yellow',
    'pocket-peach',
    'pocket-lilac',
    'pocket-pink',
    'pocket-mint',
    'pocket-sky'
  ];

  constructor(
    private availabilityService: AvailabilityDataService,
    private sessionService: DoctorSessionService
  ) {}

  ngOnInit(): void {
    this.doctorId = this.sessionService.getCurrentDoctorId();
    this.loadAvailability();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.runIntroAnimation();
      this.setupBoardParallax();
      this.setupPocketHoverEffects();
    }, 100);
  }

  loadAvailability(): void {
    const request$ = this.doctorId
      ? this.availabilityService.getAvailabilityByDoctor(this.doctorId)
      : this.availabilityService.getAllAvailability();

    request$.subscribe({
      next: (records) => {
        this.rawRecords = records;
        this.stats = this.buildStats(records);

        this.slots = records.map((item, index) => ({
          id: item.id!,
          day: item.dayOfWeek || 'Day not set',
          detail: `${this.formatTime(item.startTime)} - ${this.formatTime(item.endTime)}`,
          status: this.getStatus(item),
          tone: this.getTone(item),
          record: item,
          pocketColor: this.pocketPalette[index % this.pocketPalette.length],
          shortType: this.getShortType(item.consultationType || '')
        }));

        if (this.slots.length > 0) {
          const stillExists = this.selectedSlot
            ? this.slots.find((slot) => slot.id === this.selectedSlot.id)
            : null;

          this.selectedSlot = stillExists || this.slots[0];
        } else {
          this.selectedSlot = null;
        }

        setTimeout(() => {
          this.animatePocketList();
          this.setupPocketHoverEffects();
          this.animatePinNote();
        }, 80);
      },
      error: (err) => {
        console.error('Failed to load availability', err);
      }
    });
  }

  selectPocket(slot: any): void {
    this.selectedSlot = slot;

    const selectedIndex = this.slots.findIndex((item) => item.id === slot.id);
    const selectedEl = this.pocketRefs?.toArray()?.[selectedIndex]?.nativeElement;

    if (selectedEl) {
      gsap.fromTo(
        selectedEl,
        { scale: 0.96, rotate: -3, y: 10 },
        {
          scale: 1.06,
          rotate: 0,
          y: -10,
          duration: 0.35,
          ease: 'back.out(2)'
        }
      );
    }

    setTimeout(() => this.animatePinNote(), 40);
  }

  openAddMode(): void {
    this.statusMessage = '';
    this.isEditMode = false;
    this.currentRecordId = null;
    this.formData = {
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      hospitalOrClinic: '',
      consultationType: '',
      available: true
    };

    if (this.lungShell) {
      gsap.fromTo(
        this.lungShell.nativeElement,
        { scale: 0.985, y: 8 },
        { scale: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }

  fillFormFromSelected(): void {
    if (!this.selectedSlot) return;
    this.isEditMode = true;
    this.currentRecordId = this.selectedSlot.id;
    this.formData = { ...this.selectedSlot.record };
    this.statusMessage = '';

    if (this.lungShell) {
      gsap.fromTo(
        this.lungShell.nativeElement,
        { x: -18, opacity: 0.85 },
        { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  saveSlot(): void {
    this.statusMessage = '';

    if (!this.doctorId) {
      this.statusMessage = 'Please log in again to save availability.';
      return;
    }

    if (!this.formData.dayOfWeek || !this.formData.startTime || !this.formData.endTime) {
      this.statusMessage = 'Day, start time, and end time are required.';
      return;
    }

    this.isSaving = true;
    const payload = { ...this.formData, doctorId: this.doctorId };

    if (this.isEditMode && this.currentRecordId) {
      this.availabilityService.updateAvailability(this.currentRecordId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.openAddMode();
          this.loadAvailability();
        },
        error: (err) => {
          console.error('Failed to update availability', err);
          this.statusMessage = 'Could not update slot.';
          this.isSaving = false;
        }
      });
    } else {
      this.availabilityService.createAvailability(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.openAddMode();
          this.loadAvailability();
        },
        error: (err) => {
          console.error('Failed to create availability', err);
          this.statusMessage = 'Could not save slot.';
          this.isSaving = false;
        }
      });
    }
  }

  deleteSelectedSlot(): void {
    if (!this.selectedSlot?.id) return;

    if (confirm('Are you sure you want to delete this slot?')) {
      this.availabilityService.deleteAvailability(this.selectedSlot.id).subscribe({
        next: () => {
          this.openAddMode();
          this.loadAvailability();
        },
        error: (err) => {
          console.error('Failed to delete slot', err);
        }
      });
    }
  }

  private runIntroAnimation(): void {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.topbar', {
      y: -30,
      opacity: 0,
      duration: 0.7
    })
      .from(
        '.availability-hero',
        {
          y: 40,
          opacity: 0,
          duration: 0.8
        },
        '-=0.35'
      )
      .from(
        '.hero-stat',
        {
          y: 24,
          opacity: 0,
          stagger: 0.12,
          duration: 0.5
        },
        '-=0.4'
      )
      .from(
        '.lung-form-shell',
        {
          x: -40,
          opacity: 0,
          duration: 0.8
        },
        '-=0.35'
      )
      .from(
        '.pocket-board',
        {
          x: 40,
          opacity: 0,
          duration: 0.8
        },
        '-=0.65'
      );

    gsap.to('.hero-stat', {
      y: -8,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2
    });
  }

  private animatePocketList(): void {
    if (!this.pocketRefs || this.pocketRefs.length === 0) return;

    gsap.fromTo(
      this.pocketRefs.map((ref) => ref.nativeElement),
      {
        opacity: 0,
        y: 30,
        rotation: () => gsap.utils.random(-6, 6)
      },
      {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.7)'
      }
    );
  }

  private animatePinNote(): void {
    if (!this.pinNoteRef) return;

    gsap.fromTo(
      this.pinNoteRef.nativeElement,
      { opacity: 0, y: 24, rotateX: -12, transformOrigin: 'top center' },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.5, ease: 'power3.out' }
    );
  }

  private setupBoardParallax(): void {
    if (!this.boardShell) return;

    const board = this.boardShell.nativeElement;

    board.addEventListener('mousemove', (event: MouseEvent) => {
      const rect = board.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * 6;
      const rotateX = ((y / rect.height) - 0.5) * -6;

      gsap.to(board, {
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformOrigin: 'center center',
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    board.addEventListener('mouseleave', () => {
      gsap.to(board, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power3.out'
      });
    });
  }

  private setupPocketHoverEffects(): void {
    if (!this.pocketRefs || this.pocketRefs.length === 0) return;

    this.pocketRefs.forEach((ref) => {
      const card = ref.nativeElement;

      card.onmousemove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 14;
        const rotateX = ((y / rect.height) - 0.5) * -14;

        gsap.to(card, {
          rotateX,
          rotateY,
          y: -8,
          scale: 1.03,
          duration: 0.25,
          ease: 'power2.out',
          transformPerspective: 900
        });
      };

      card.onmouseleave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: 'power3.out'
        });
      };
    });
  }

  private buildStats(records: AvailabilityRecord[]) {
    return [
      { label: 'Open slots', value: String(records.filter((item) => item.available).length) },
      { label: 'Booked slots', value: String(records.filter((item) => !item.available).length) },
      { label: 'Break periods', value: String(records.filter((item) => (item.consultationType || '').toUpperCase() === 'BREAK').length) },
      { label: 'Telehealth windows', value: String(records.filter((item) => (item.consultationType || '').toUpperCase().includes('ONLINE')).length) }
    ];
  }

  private getStatus(item: AvailabilityRecord): string {
    if ((item.consultationType || '').toUpperCase().includes('ONLINE')) return 'Telehealth';
    return item.available ? 'Open' : 'Busy';
  }

  private getTone(item: AvailabilityRecord): string {
    if ((item.consultationType || '').toUpperCase().includes('ONLINE')) return 'blue';
    return item.available ? 'green' : 'orange';
  }

  private formatTime(value: string): string {
    return value ? value.slice(0, 5) : 'N/A';
  }

  private getShortType(type: string): string {
    const clean = type.trim();
    if (!clean) return 'General';
    if (clean.toUpperCase().includes('ONLINE')) return 'Online';
    if (clean.toUpperCase().includes('BREAK')) return 'Break';
    return clean;
  }

  get availabilityRate(): string {
    const open = Number(this.stats[0]?.value || 0);
    const booked = Number(this.stats[1]?.value || 0);
    const total = open + booked;

    if (!total) return '0%';
    return `${Math.round((open / total) * 100)}%`;
  }
}
