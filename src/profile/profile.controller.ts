import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller( 'profile' )
export class ProfileController {
  constructor ( private readonly profileService: ProfileService ) { }

  @Post()
  @Auth( ValidRoles.user )
  create ( @Body() createProfileDto: CreateProfileDto, @GetUser() user: User ) {
    return this.profileService.create( createProfileDto, user );
  }

  @Get()
  @Auth( ValidRoles.admin )
  findAll () {
    return this.profileService.findAll();
  }

  @Get( '/user' )
  @Auth( ValidRoles.user )
  findOne ( @GetUser() user: User ) {
    return this.profileService.findOne( user );
  }

  @Patch()
  @Auth( ValidRoles.user )
  update ( @GetUser() user: User, @Body() updateProfileDto: UpdateProfileDto ) {
    return this.profileService.update( user, updateProfileDto );
  }

  @Delete()
  @Auth( ValidRoles.user )
  remove ( @GetUser() user: User ) {
    return this.profileService.remove( user );
  }
}
