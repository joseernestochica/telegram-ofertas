import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppLifecycleService } from './shared/services/app-lifecycle.service';

@Component( {
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
} )
export class AppComponent implements OnInit {
  title = 'front';

  constructor ( private appLifecycle: AppLifecycleService ) { }

  ngOnInit (): void {
    // Suscribirse al estado del ciclo de vida de la aplicación
    this.appLifecycle.state$.subscribe( state => {
      console.log( 'Estado de la aplicación:', state );
    } );
  }
}
