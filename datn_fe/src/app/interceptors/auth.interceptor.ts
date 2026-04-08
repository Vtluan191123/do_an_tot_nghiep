import { HttpInterceptorFn } from '@angular/common/http';
import {inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // URLs that don't need authentication token
  const skipTokenUrls = ['/login', '/register', '/dashboard'];

  // Check if request URL should skip token
  const shouldSkipToken = skipTokenUrls.some(url => req.url.includes(url));

  // If URL should skip token or is browser check fails, proceed without token
  if (shouldSkipToken || !isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Get token from localStorage
  let token = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  // If token exists, add it to request headers
  if (token) {
    const cloneRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloneRequest);
  }

  return next(req);
};
