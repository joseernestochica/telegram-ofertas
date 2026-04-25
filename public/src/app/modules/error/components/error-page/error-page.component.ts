import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component( {
  selector: 'app-error-page',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
} )
export class ErrorPageComponent {

  @Input() errorMessage: string = '';

  constructor (
    private router: Router
  ) { }

  goBack (): void {
    this.router.navigate( [ '/' ] );
  }
}
