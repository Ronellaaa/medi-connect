import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DoctorSessionService } from '../services/doctor-service/doctor-session.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private sessionService: DoctorSessionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (
      this.sessionService.getToken() &&
      this.sessionService.getCurrentRole() === 'ADMIN'
    ) {
      return true;
    }

    this.router.navigate(['/patient/dashboard']);
    return false;
  }
}
