import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Horoscope, Gender, GenderPreference, Occupation, Interest, School, LookFor } from '../profile/entities';

@Module( {
  controllers: [ SeedController ],
  providers: [ SeedService ],
  imports: [
    TypeOrmModule.forFeature( [
      Horoscope,
      Gender,
      GenderPreference,
      Occupation,
      Interest,
      School,
      LookFor
    ] ),
    AuthModule
  ],
} )
export class SeedModule { }
