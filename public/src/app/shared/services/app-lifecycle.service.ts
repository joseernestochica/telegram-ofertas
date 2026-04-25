import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface AppLifecycleState {
	isVisible: boolean;
	isOnline: boolean;
	isFocused: boolean;
}

@Injectable( {
	providedIn: 'root'
} )
export class AppLifecycleService {
	private stateSubject = new BehaviorSubject<AppLifecycleState>( {
		isVisible: true,
		isOnline: navigator.onLine,
		isFocused: true
	} );

	public state$: Observable<AppLifecycleState> = this.stateSubject.asObservable();

	constructor ( private ngZone: NgZone ) {
		this.initializeLifecycleMonitoring();
	}

	private initializeLifecycleMonitoring (): void {
		// Monitorear visibilidad de la página
		const visibilityChange$ = fromEvent( document, 'visibilitychange' ).pipe(
			map( () => !document.hidden )
		);

		// Monitorear estado de conexión
		const online$ = fromEvent( window, 'online' ).pipe( map( () => true ) );
		const offline$ = fromEvent( window, 'offline' ).pipe( map( () => false ) );

		// Monitorear foco de la ventana
		const focus$ = fromEvent( window, 'focus' ).pipe( map( () => true ) );
		const blur$ = fromEvent( window, 'blur' ).pipe( map( () => false ) );

		// Combinar todos los eventos
		merge(
			visibilityChange$,
			online$,
			offline$,
			focus$,
			blur$
		).pipe(
			distinctUntilChanged()
		).subscribe( () => {
			this.updateState();
		} );

		// Estado inicial
		this.updateState();
	}

	private updateState (): void {
		this.ngZone.run( () => {
			const newState: AppLifecycleState = {
				isVisible: !document.hidden,
				isOnline: navigator.onLine,
				isFocused: document.hasFocus()
			};

			this.stateSubject.next( newState );
		} );
	}

	public getCurrentState (): AppLifecycleState {
		return this.stateSubject.value;
	}
} 