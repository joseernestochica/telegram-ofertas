import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from './primeng.module';
import { RouterModule } from '@angular/router';

@NgModule( {
	imports: [
		CommonModule,
		ReactiveFormsModule,
		PrimeNgModule,
		RouterModule
	],
	exports: [
		CommonModule,
		ReactiveFormsModule,
		PrimeNgModule,
		RouterModule
	]
} )
export class SharedModule { } 