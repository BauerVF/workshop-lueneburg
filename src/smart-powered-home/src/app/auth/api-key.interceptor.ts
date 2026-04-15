import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Attaches the API key to every outgoing HTTP request as an X-Api-Key header.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: { 'X-Api-Key': environment.apiKey },
  });
  return next(cloned);
};
