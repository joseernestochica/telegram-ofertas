import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsNumber, IsBoolean, IsOptional } from 'class-validator';


export class CreateUserDto {

	@IsString()
	@IsNotEmpty()
	readonly firstName: string

	@IsNumber()
	@IsNotEmpty()
	readonly idTelegram: number;

	@IsString()
	@IsNotEmpty()
	readonly username: string;

	@IsString()
	@IsOptional()
	readonly lastName?: string;

	@IsString()
	@IsOptional()
	readonly languageCode?: string;

	@IsString( { each: true } )
	@IsOptional()
	readonly roles?: string[];

	@IsBoolean()
	@IsOptional()
	readonly isActive?: boolean;

	@IsString()
	@IsOptional()
	hash?: string;

	@IsEmail()
	@IsOptional()
	readonly email?: string;

	@IsNotEmpty()
	@IsBoolean()
	readonly isBot?: boolean;


}