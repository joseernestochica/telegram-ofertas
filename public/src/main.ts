import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig, INITIALIZATION_TOKEN } from './app/app.config';
import { inject, runInInjectionContext } from '@angular/core';

bootstrapApplication( AppComponent, appConfig )
  .then( appRef => {
    runInInjectionContext( appRef.injector, () => {
      const initProvider = inject( INITIALIZATION_TOKEN );
      return initProvider();
    } );
  } )
  .catch( err => console.error( err ) );
