import { ApplicationConfig, inject, makeEnvironmentProviders, InjectionToken } from '@angular/core';
import { AuthService } from './modules/auth/services/auth.service';
import { es } from 'primelocale/es.json';
import { LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { provideRouter, withViewTransitions } from '@angular/router';
import { refreshTokenInterceptor } from './modules/auth/services/refresh-token.interceptor';
import { routes } from './app.routes';
import { MyPreset } from './theme-present';
export const INITIALIZATION_TOKEN = new InjectionToken<() => Promise<any>>( 'INITIALIZATION' );

const initializationProvider = makeEnvironmentProviders( [
  {
    provide: INITIALIZATION_TOKEN,
    useFactory: () => {
      const authService = inject( AuthService );
      return () => authService.getUserByToken();
    }
  }
] );

const initialConfig: ApplicationConfig = {
  providers: [
    provideRouter( routes, withViewTransitions() ),
    provideAnimationsAsync(),
    providePrimeNG( {
      theme: {
        preset: MyPreset
      },
      translation: es
    } ),
    provideHttpClient(
      withInterceptors( [ refreshTokenInterceptor ] )
    ),
    {
      provide: LOCALE_ID,
      useValue: 'es'
    },
    initializationProvider
  ]
};

export const appConfig = initialConfig;