import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth/auth.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';

import { provideLottieOptions } from 'ngx-lottie';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
              provideRouter(routes), 
              provideAnimationsAsync(), 
              provideHttpClient(
                withInterceptors([authInterceptor]),
              ), 
              provideAnimationsAsync(),
              provideLottieOptions({
                player: () => import('lottie-web'),
              }),
              ConfirmationService, 
              MessageService]
};
