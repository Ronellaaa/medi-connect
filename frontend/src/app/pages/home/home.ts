import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Draggable, InertiaPlugin);

interface OrbitImage {
  src: string;
  label: string;
}

interface StoryPanel {
  code: string;
  title: string;
  text: string;
  stat1: string;
  stat2: string;
  revealTitle: string;
  revealText: string;
  color: 'purple' | 'blue' | 'red';
  image: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  metric: string;
  accent: string;
  theme: 'orchid' | 'sage' | 'amber';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('orbitRing', { static: true }) orbitRing!: ElementRef<HTMLDivElement>;
  @ViewChild('panelStage', { static: false }) panelStage?: ElementRef<HTMLDivElement>;
  @ViewChild('galleryRail', { static: false }) galleryRail?: ElementRef<HTMLDivElement>;

  orbitImages: OrbitImage[] = [
    { src: 'assets/videos/1.png', label: 'Best doctors' },
    { src: 'assets/videos/2.png', label: 'Expert surgeons' },
    { src: 'assets/videos/3.jpg', label: 'Modern equipment' },
    { src: 'assets/videos/4.jpg', label: '24/7 support' },
    { src: 'assets/videos/5.jpg', label: 'Affordable care' },
    { src: 'assets/videos/6.jpg', label: 'Quality care' },
    { src: 'assets/videos/7.jpg', label: 'Experienced staff' },
    { src: 'assets/videos/8.jpg', label: 'Compassionate service' },
  ];

  showcaseImages: OrbitImage[] = [
    { src: 'assets/videos/1.png', label: 'Best doctors' },
    { src: 'assets/videos/2.png', label: 'Expert surgeons' },
    { src: 'assets/videos/3.jpg', label: 'Modern equipment' },
    { src: 'assets/videos/4.jpg', label: '24/7 support' },
    { src: 'assets/videos/5.jpg', label: 'Affordable care' },
    { src: 'assets/videos/6.jpg', label: 'Quality care' },
    { src: 'assets/videos/7.jpg', label: 'Experienced staff' },
    { src: 'assets/videos/8.jpg', label: 'Compassionate service' },
    { src: 'assets/videos/1.png', label: 'Best doctors' },
    { src: 'assets/videos/2.png', label: 'Expert surgeons' },
    { src: 'assets/videos/3.jpg', label: 'Modern equipment' },
    { src: 'assets/videos/4.jpg', label: '24/7 support' },
    { src: 'assets/videos/5.jpg', label: 'Affordable care' },
    { src: 'assets/videos/6.jpg', label: 'Quality care' },
    { src: 'assets/videos/7.jpg', label: 'Experienced staff' },
    { src: 'assets/videos/8.jpg', label: 'Compassionate service' },
  ];

  storyPanels: StoryPanel[] = [
  {
    code: 'S1',
    title: 'Find Doctors',
    text: 'Browse specialists and discover the right consultant.',
    stat1: '120+ Doctors',
    stat2: 'Live Search',
    revealTitle: 'Specialist Matching',
    revealText: 'Compare profiles, hospitals, fees, and real-time availability.',
    color: 'purple',
    image: 'assets/login/d33.png',
  },
  {
    code: 'S2',
    title: 'Channel Instantly',
    text: 'Book appointments with a smooth guided flow.',
    stat1: 'Fast Booking',
    stat2: 'Secure Flow',
    revealTitle: 'Smart Appointment Flow',
    revealText: 'Select doctor, date, time, and hospital in one elegant journey.',
    color: 'blue',
    image: 'assets/login/d33.png',
  },
  {
    code: 'S3',
    title: 'Medical Reports',
    text: 'Keep patient documents connected to the care flow.',
    stat1: 'PDF Ready',
    stat2: 'Linked Records',
    revealTitle: 'Connected Reports',
    revealText: 'Reports stay visible for doctors and linked to appointments.',
    color: 'red',
    image: 'assets/login/d33.png',
  },
  {
    code: 'S4',
    title: 'Digital Prescriptions',
    text: 'Doctors can issue and patients can access them instantly.',
    stat1: 'Instant View',
    stat2: 'Doctor Ready',
    revealTitle: 'Prescription Access',
    revealText: 'Prescriptions appear in a clean digital format after consultation.',
    color: 'purple',
    image: 'assets/login/d33.png',
  },
  {
    code: 'S5',
    title: 'Follow-up Care',
    text: 'Continue the patient journey without breaking the experience.',
    stat1: 'Care Timeline',
    stat2: 'Next Steps',
    revealTitle: 'Recovery Journey',
    revealText: 'Follow-ups, reminders, and future visits stay beautifully connected.',
    color: 'blue',
    image: 'assets/login/d33.png',
  },
];

  testimonials: Testimonial[] = [
    {
      quote: 'Booking a specialist felt calm and premium instead of stressful. Every step looked clear, polished, and easy to trust.',
      name: 'Nethmi Perera',
      role: 'Patient Experience',
      metric: '2 min booking',
      accent: 'Rose Quartz',
      theme: 'orchid',
    },
    {
      quote: 'The handoff from appointment to prescription feels seamless. It finally feels like one connected care journey.',
      name: 'Dr. A. Fernando',
      role: 'Consultant Physician',
      metric: 'Care flow synced',
      accent: 'Sage Signal',
      theme: 'sage',
    },
    {
      quote: 'Reports, reminders, and follow-up visibility are beautifully organized. Patients notice the difference immediately.',
      name: 'M. Senanayake',
      role: 'Hospital Operations',
      metric: 'Premium support',
      accent: 'Velvet Glow',
      theme: 'amber',
    },
  ];

  activeStoryPanel = 2;
  activeTestimonial = 0;

  get selectedTestimonial(): Testimonial {
    return this.testimonials[this.activeTestimonial];
  }

  selectTestimonial(index: number): void {
    this.activeTestimonial = index;
  }

  private smoother?: ScrollSmoother;
  private orbitTween?: gsap.core.Tween;
  private orbitDraggable?: Draggable[];
  private galleryDraggable?: Draggable[];
  private galleryAutoTween?: gsap.core.Timeline;
  private storyLoopTimeline?: gsap.core.Timeline;
  private hoverCleanups: Array<() => void> = [];

  private resizeHandler = () => {
    this.rebuildOrbit();
    this.rebuildStoryPanels();
    this.initGalleryShowcase();
  };

  private loadHandler = () => {
    ScrollTrigger.refresh();
    this.rebuildOrbit();
    this.rebuildStoryPanels();
    this.initGalleryShowcase();
  };

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.initSmoother();
      this.initOrbit();
      this.initIntroAnimation();
      this.initScrollAnimations();
      this.initStoryPanelLoop();
      this.initGalleryShowcase();

      setTimeout(() => {
        ScrollTrigger.refresh();
        this.rebuildOrbit();
        this.rebuildStoryPanels();
      }, 250);

      window.addEventListener('resize', this.resizeHandler);
      window.addEventListener('load', this.loadHandler);

      const imgs = Array.from(document.images);
      if (imgs.length) {
        let loaded = 0;

        imgs.forEach((img) => {
          if (img.complete) {
            loaded++;
          } else {
            img.addEventListener(
              'load',
              () => {
                loaded++;
                if (loaded >= imgs.length) {
                  ScrollTrigger.refresh();
                  this.rebuildOrbit();
                  this.rebuildStoryPanels();
                }
              },
              { once: true }
            );
          }
        });

        if (loaded >= imgs.length) {
          ScrollTrigger.refresh();
          this.rebuildOrbit();
          this.rebuildStoryPanels();
        }
      }
    });
  }

  private initSmoother(): void {
    this.smoother?.kill();

    this.smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.15,
      effects: true,
      smoothTouch: 0.1,
    });
  }

  private initOrbit(): void {
    const ring = this.orbitRing.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>('.orbit-card', ring);
    const total = cards.length;
    const radius = window.innerWidth < 768 ? 190 : 395;

    gsap.killTweensOf(ring);

    gsap.set(ring, {
      transformOrigin: '50% 50%',
      rotation: 0,
    });

    cards.forEach((card, i) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      gsap.set(card, {
        left: '50%',
        top: '50%',
        x,
        y,
        xPercent: -50,
        yPercent: -50,
        rotation: gsap.utils.random(-18, 18),
        zIndex: 1,
      });

      const onEnter = () => {
        gsap.to(card, {
          scale: 1.12,
          y: y - 8,
          zIndex: 20,
          duration: 0.35,
          ease: 'power3.out',
        });
      };

      const onLeave = () => {
        gsap.to(card, {
          scale: 1,
          y,
          zIndex: 1,
          duration: 0.35,
          ease: 'power3.out',
        });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      this.hoverCleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    this.orbitTween?.kill();
    this.orbitTween = gsap.to(ring, {
      rotation: 360,
      duration: 34,
      ease: 'none',
      repeat: -1,
    });

    this.orbitDraggable?.forEach((d) => d.kill());
    this.orbitDraggable = Draggable.create(ring, {
      type: 'rotation',
      inertia: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress: () => this.orbitTween?.pause(),
      onDragStart: () => gsap.set(ring, { cursor: 'grabbing' }),
      onDragEnd: function () {
        if (!(this as Draggable).isThrowing) {
          gsap.set(ring, { cursor: 'grab' });
          (window as any).__orbitTween?.play?.();
        }
      },
      onThrowComplete: () => {
        gsap.set(ring, { cursor: 'grab' });
        this.orbitTween?.play();
      },
    });

    (window as any).__orbitTween = this.orbitTween;
  }

  private initGalleryShowcase(): void {
    if (!this.galleryRail) return;

    const rail = this.galleryRail.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>('.showcase-card', rail);

    if (!cards.length) return;

    this.galleryDraggable?.forEach((d) => d.kill());
    this.galleryAutoTween?.kill();
    gsap.killTweensOf(rail);
    gsap.set(rail, { x: 0, rotation: 0 });

    const isMobile = window.innerWidth < 760;
    const positions = isMobile
      ? [
          { x: -250, y: 18, scale: 0.58, opacity: 0.12, rotate: -20, zIndex: 1 },
          { x: -168, y: 8, scale: 0.72, opacity: 0.28, rotate: -14, zIndex: 2 },
          { x: -88, y: 0, scale: 0.88, opacity: 0.62, rotate: -8, zIndex: 4 },
          { x: 0, y: -10, scale: 1.05, opacity: 1, rotate: 0, zIndex: 8 },
          { x: 88, y: 0, scale: 0.88, opacity: 0.62, rotate: 8, zIndex: 4 },
          { x: 168, y: 8, scale: 0.72, opacity: 0.28, rotate: 14, zIndex: 2 },
          { x: 250, y: 18, scale: 0.58, opacity: 0.12, rotate: 20, zIndex: 1 },
        ]
      : [
          { x: -420, y: 26, scale: 0.52, opacity: 0.1, rotate: -22, zIndex: 1 },
          { x: -286, y: 12, scale: 0.68, opacity: 0.24, rotate: -15, zIndex: 2 },
          { x: -150, y: 0, scale: 0.86, opacity: 0.62, rotate: -9, zIndex: 4 },
          { x: 0, y: -16, scale: 1.1, opacity: 1, rotate: 0, zIndex: 8 },
          { x: 150, y: 0, scale: 0.86, opacity: 0.62, rotate: 9, zIndex: 4 },
          { x: 286, y: 12, scale: 0.68, opacity: 0.24, rotate: 15, zIndex: 2 },
          { x: 420, y: 26, scale: 0.52, opacity: 0.1, rotate: 22, zIndex: 1 },
        ];

    const applyLayout = (startIndex: number, duration = 0.9) => {
      cards.forEach((card, index) => {
        const relative = (index - startIndex + cards.length) % cards.length;
        const slot = positions[relative];
        const hidden =
          relative >= positions.length
            ? {
                x: positions[positions.length - 1].x + 120,
                y: 34,
                scale: 0.4,
                opacity: 0,
                rotate: 26,
                zIndex: 0,
              }
            : slot;

        gsap.to(card, {
          x: hidden.x,
          y: hidden.y,
          scale: hidden.scale,
          opacity: hidden.opacity,
          rotation: hidden.rotate,
          zIndex: hidden.zIndex,
          duration,
          ease: 'power3.inOut',
        });
      });
    };

    gsap.set(cards, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%',
    });

    let startIndex = 0;
    applyLayout(startIndex, 0.01);

    this.galleryAutoTween = gsap.timeline({ repeat: -1, repeatDelay: 0.1 });

    for (let step = 0; step < cards.length * 10; step++) {
      this.galleryAutoTween
        .add(() => applyLayout(startIndex, 0.95))
        .to({}, { duration: 1.1 })
        .add(() => {
          startIndex = (startIndex + 1) % cards.length;
        });
    }
  }

private initStoryPanelLoop(): void {
  if (!this.panelStage) return;

  const panels = gsap.utils.toArray<HTMLElement>(
    '.channel-panel',
    this.panelStage.nativeElement
  );

  if (!panels.length) return;

  this.storyLoopTimeline?.kill();
  gsap.killTweensOf(panels);

const positions = [
  { x: -300, y: 30, scale: 0.68, opacity: 0.05, zIndex: 1 },
  { x: -90, y: 16, scale: 0.82, opacity: 0.18, zIndex: 2 },
  { x: 140, y: 0, scale: 1.06, opacity: 1, zIndex: 6 },
  { x: 390, y: 16, scale: 0.82, opacity: 0.18, zIndex: 2 },
  { x: 620, y: 30, scale: 0.68, opacity: 0.05, zIndex: 1 },
];

  const getCenterPanelIndex = (startIndex: number) =>
    (startIndex + 2) % panels.length;

  const applyLayout = (startIndex: number, duration = 1) => {
    const centerPanelIndex = getCenterPanelIndex(startIndex);

    panels.forEach((panel, i) => {
      const relative = (i - startIndex + panels.length) % panels.length;
      const slot = positions[relative];

      panel.classList.remove('panel-open');

      gsap.to(panel, {
        x: slot.x,
        y: slot.y,
        scale: slot.scale,
        opacity: slot.opacity,
        zIndex: slot.zIndex,
        duration,
        ease: 'power3.inOut',
      });

      panel.classList.toggle('is-active', i === centerPanelIndex);
    });

    this.activeStoryPanel = centerPanelIndex;
  };

  gsap.set(panels, {
    transformOrigin: '50% 50%',
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0,
  });

  let startIndex = 0;
  applyLayout(startIndex, 0.01);

  this.storyLoopTimeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.15,
  });

  for (let step = 0; step < 60; step++) {
    this.storyLoopTimeline
      .add(() => {
        applyLayout(startIndex, 1.05);
      })
      .to({}, { duration: 1.05 })
      .add(() => {
        const centerPanelIndex = getCenterPanelIndex(startIndex);
        panels[centerPanelIndex].classList.add('panel-open');
      })
      .to({}, { duration: 1.35 })
      .add(() => {
        const centerPanelIndex = getCenterPanelIndex(startIndex);
        panels[centerPanelIndex].classList.remove('panel-open');
      })
      .to({}, { duration: 0.45 })
      .add(() => {
        startIndex = (startIndex + 1) % panels.length;
      });
  }
}
  private rebuildStoryPanels(): void {
    this.storyLoopTimeline?.kill();

    const panels = gsap.utils.toArray<HTMLElement>('.channel-panel');
    panels.forEach((panel) => panel.classList.remove('panel-open'));

    this.initStoryPanelLoop();
  }

  private rebuildOrbit(): void {
    this.hoverCleanups.forEach((fn) => fn());
    this.hoverCleanups = [];
    this.initOrbit();
    ScrollTrigger.refresh();
  }

  private initIntroAnimation(): void {
    gsap.from('.hero-center > *', {
      y: 40,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.orbit-card', {
      scale: 0.82,
      opacity: 0,
      duration: 1.1,
      stagger: 0.06,
      ease: 'power3.out',
      delay: 0.2,
      clearProps: 'opacity',
    });

    gsap.to('.hero-pulse', {
      scale: 1.16,
      opacity: 0.95,
      duration: 3.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    gsap.to('.hero-side-chip', {
      y: '-=12',
      duration: 2.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.2,
    });
  }

  private initScrollAnimations(): void {
    gsap.to('.hero-orbit', {
      scale: 0.97,
      opacity: 0.94,
      scrollTrigger: {
        trigger: '.hero-orbit',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    gsap.to('.bg-blur.blur-1', {
      y: -60,
      x: 30,
      scrollTrigger: {
        trigger: '.page-shell',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    gsap.to('.bg-blur.blur-2', {
      y: 80,
      x: -40,
      scrollTrigger: {
        trigger: '.page-shell',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    gsap.to('.bg-blur.blur-3', {
      y: -40,
      x: -20,
      scrollTrigger: {
        trigger: '.page-shell',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('load', this.loadHandler);

    this.hoverCleanups.forEach((fn) => fn());
    this.orbitDraggable?.forEach((d) => d.kill());
    this.galleryDraggable?.forEach((d) => d.kill());
    this.galleryAutoTween?.kill();
    this.orbitTween?.kill();
    this.storyLoopTimeline?.kill();
    this.smoother?.kill();

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
