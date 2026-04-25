import { IsString, IsOptional, IsDate, IsArray, IsNumber, IsBoolean, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export interface Point {
	x: number; // longitud
	y: number; // latitud
}

export class LocationDto {
	@IsNumber()
	@Min( -180 )
	@Max( 180 )
	x: number;

	@IsNumber()
	@Min( -90 )
	@Max( 90 )
	y: number;
}

export class CreateProfileDto {
	@IsString()
	@IsOptional()
	bio?: string;

	@IsDate()
	@Type( () => Date )
	birthDate: Date;

	@IsUUID()
	gender: string;

	@IsArray()
	@IsUUID( '4', { each: true } )
	genderPreferences: string[];

	@IsUUID()
	@IsOptional()
	occupation?: string;

	@IsUUID()
	@IsOptional()
	school?: string;

	@IsArray()
	@IsUUID( '4', { each: true } )
	@IsOptional()
	interests?: string[];

	@Type( () => LocationDto )
	@IsOptional()
	location?: LocationDto;

	@IsString()
	@IsOptional()
	locationText?: string;

	@IsString()
	@IsOptional()
	locationCountry?: string;

	@IsNumber()
	@Min( 18 )
	@Max( 100 )
	@IsOptional()
	agePreferenceMin?: number;

	@IsNumber()
	@Min( 18 )
	@Max( 100 )
	@IsOptional()
	agePreferenceMax?: number;

	@IsNumber()
	@Min( 1 )
	@Max( 1000 )
	@IsOptional()
	searchRadius?: number;

	@IsBoolean()
	@IsOptional()
	showMe?: boolean;

	@IsUUID()
	lookFor: string;

	@IsNumber()
	@Min( 50 )
	@Max( 300 )
	@IsOptional()
	height?: number;

	@IsUUID()
	@IsOptional()
	horoscope?: string;
}
