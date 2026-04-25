import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horoscope, Gender, GenderPreference, Occupation, Interest, School, LookFor } from '../profile/entities';
import { horoscopeSeed, genderSeed, genderPreferenceSeed, occupationSeed, interestSeed, schoolSeed, lookForSeed } from './data/profile-seed';

@Injectable()
export class SeedService {
  constructor (
    @InjectRepository( Horoscope )
    private readonly horoscopeRepository: Repository<Horoscope>,
    @InjectRepository( Gender )
    private readonly genderRepository: Repository<Gender>,
    @InjectRepository( GenderPreference )
    private readonly genderPreferenceRepository: Repository<GenderPreference>,
    @InjectRepository( Occupation )
    private readonly occupationRepository: Repository<Occupation>,
    @InjectRepository( Interest )
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository( School )
    private readonly schoolRepository: Repository<School>,
    @InjectRepository( LookFor )
    private readonly lookForRepository: Repository<LookFor>
  ) { }

  async runSeed () {
    await this.deleteTables();
    await this.insertNewData();
    return 'SEED EXECUTED';
  }

  private async deleteTables () {
    await this.horoscopeRepository.delete( {} );
    await this.genderRepository.delete( {} );
    await this.genderPreferenceRepository.delete( {} );
    await this.occupationRepository.delete( {} );
    await this.interestRepository.delete( {} );
    await this.schoolRepository.delete( {} );
    await this.lookForRepository.delete( {} );
  }

  private async insertNewData () {
    await this.horoscopeRepository.save( horoscopeSeed );
    await this.genderRepository.save( genderSeed );
    await this.genderPreferenceRepository.save( genderPreferenceSeed );
    await this.occupationRepository.save( occupationSeed );
    await this.interestRepository.save( interestSeed );
    await this.schoolRepository.save( schoolSeed );
    await this.lookForRepository.save( lookForSeed );
  }
}
