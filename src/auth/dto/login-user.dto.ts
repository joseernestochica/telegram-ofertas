import { IsNotEmpty, IsUUID } from 'class-validator';


export class LoginUserDto {

	@IsUUID()
	@IsNotEmpty()
	readonly hash: string;

}