import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DoctorSessionService } from '../doctor-service/doctor-session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(DoctorSessionService);
  const token = session.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
