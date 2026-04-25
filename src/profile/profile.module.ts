import { CommonModule } from 'src/common/common.module';
import { Module } from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileOptionsController } from './controllers/profile-options.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities';
import { Horoscope, Gender, GenderPreference, Occupation, Interest, School, LookFor } from './entities';

@Module( {
  imports: [
    TypeOrmModule.forFeature( [
      Profile,
      User,
      Horoscope,
      Gender,
      GenderPreference,
      Occupation,
      Interest,
      School,
      LookFor
    ] ),
    CommonModule,
  ],
  controllers: [ ProfileController, ProfileOptionsController ],
  providers: [ ProfileService ],
  exports: [ TypeOrmModule, ProfileService ]
} )
export class ProfileModule { }
