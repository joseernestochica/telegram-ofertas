import { Controller, Get } from '@nestjs/common';
import { ProfileService } from '../profile.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller( 'profile-options' )
export class ProfileOptionsController {
	constructor ( private readonly profileService: ProfileService ) { }

	@Get( 'horoscopes' )
	@Auth( ValidRoles.user )
	findAllHoroscopes () {
		return this.profileService.findAllHoroscopes();
	}

	@Get( 'genders' )
	@Auth( ValidRoles.user )
	findAllGenders () {
		return this.profileService.findAllGenders();
	}

	@Get( 'gender-preferences' )
	@Auth( ValidRoles.user )
	findAllGenderPreferences () {
		return this.profileService.findAllGenderPreferences();
	}

	@Get( 'occupations' )
	@Auth( ValidRoles.user )
	findAllOccupations () {
		return this.profileService.findAllOccupations();
	}

	@Get( 'interests' )
	@Auth( ValidRoles.user )
	findAllInterests () {
		return this.profileService.findAllInterests();
	}

	@Get( 'schools' )
	@Auth( ValidRoles.user )
	findAllSchools () {
		return this.profileService.findAllSchools();
	}

	@Get( 'look-fors' )
	@Auth( ValidRoles.user )
	findAllLookFors () {
		return this.profileService.findAllLookFors();
	}
} 