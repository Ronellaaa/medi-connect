// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { DoctorSessionService } from '../doctor-service/doctor-session.service';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const session = inject(DoctorSessionService);
//   const token = session.getToken();

//   if (!token) {
//     return next(req);
//   }

//   const authReq = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`
//     }
//   });

//   return next(authReq);
// };
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DoctorSessionService } from '../doctor-service/doctor-session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(DoctorSessionService);
  const token = session.getToken();

  const isAuthRequest =
    req.url.endsWith('/api/auth/login') ||
    req.url.endsWith('/api/auth/register');

  const isPublicDoctorLookup =
    req.method === 'GET' &&
    (req.url.endsWith('/api/doctors') ||
     req.url.endsWith('/api/availability'));

  if (isAuthRequest || isPublicDoctorLookup || !token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
}