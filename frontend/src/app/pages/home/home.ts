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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('orbitRing', { static: true }) orbitRing!: ElementRef<HTMLDivElement>;

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

  private smoother?: ScrollSmoother;
  private orbitTween?: gsap.core.Tween;
  private orbitDraggable?: Draggable[];
  private hoverCleanups: Array<() => void> = [];
  private resizeHandler = () => this.rebuildOrbit();
  private loadHandler = () => {
    ScrollTrigger.refresh();
    this.rebuildOrbit();
  };

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.initSmoother();
      this.initOrbit();
      this.initIntroAnimation();
      this.initScrollAnimations();

      setTimeout(() => {
        ScrollTrigger.refresh();
        this.rebuildOrbit();
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
                }
              },
              { once: true }
            );
          }
        });

        if (loaded >= imgs.length) {
          ScrollTrigger.refresh();
          this.rebuildOrbit();
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
          // @ts-ignore
          (window as any).__orbitTween?.play?.();
        }
      },
      onThrowComplete: () => {
        gsap.set(ring, { cursor: 'grab' });
        this.orbitTween?.play();
      },
    });

    // expose for onDragEnd fallback
    // @ts-ignore
    (window as any).__orbitTween = this.orbitTween;
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
    this.orbitTween?.kill();
    this.smoother?.kill();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}