import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './modules/auth/services/auth.guard';

export const routes: Routes = [
	{
		path: 'app',
		component: MainLayoutComponent,
		children: [
			{
				path: 'home',
				loadComponent: () => import( './modules/home/home.component' ).then( m => m.HomeComponent ),
				canActivate: [ AuthGuard ]
			},
			{
				path: 'profile',
				loadChildren: () => import( './profile/profile.routes' ).then( m => m.PROFILE_ROUTES ),
				canActivate: [ AuthGuard ]
			}
		]
	},
	{
		path: '',
		loadComponent: () => import( './modules/auth/components/login/login.component' ).then( m => m.LoginComponent )
	},
	{
		path: 'error',
		loadComponent: () => import( './modules/error/components/error-page/error-page.component' ).then( m => m.ErrorPageComponent )
	},
	{
		path: '**',
		redirectTo: 'error'
	}
];
