import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { RippleModule } from 'primeng/ripple';
import { PasswordModule } from 'primeng/password';

const PRIME_MODULES = [
	ButtonModule,
	CalendarModule,
	CardModule,
	CheckboxModule,
	DialogModule,
	DockModule,
	DropdownModule,
	ImageModule,
	InputNumberModule,
	InputTextModule,
	MultiSelectModule,
	TableModule,
	TabMenuModule,
	TextareaModule,
	ToastModule,
	TooltipModule,
	DatePickerModule,
	RadioButtonModule,
	SelectModule,
	SliderModule,
	AutoCompleteModule,
	RippleModule,
	PasswordModule
];

@NgModule( {
	imports: [ ...PRIME_MODULES ],
	exports: [ ...PRIME_MODULES ]
} )
export class PrimeNgModule { } 