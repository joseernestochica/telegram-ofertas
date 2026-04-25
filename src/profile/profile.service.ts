import { CreateProfileDto, UpdateProfileDto, LocationDto } from './dto';
import { GetParams, GetResponse } from 'src/common/interfaces';
import { HandleErrorService } from '../common/services';
import { In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, Horoscope, Gender, GenderPreference, Occupation, Interest, School, LookFor } from './entities';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities';

@Injectable()
export class ProfileService {
  constructor (
    @InjectRepository( Profile )
    private readonly profileRepository: Repository<Profile>,
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
    private readonly lookForRepository: Repository<LookFor>,
    private readonly handleErrorService: HandleErrorService
  ) { }

  // Métodos para obtener opciones de perfil
  async findAllHoroscopes (): Promise<GetResponse<Horoscope>> {

    const horoscopes = await this.horoscopeRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: horoscopes,
      total: horoscopes.length,
      message: 'Horóscopos encontrados',
      statusCode: 200
    };

  }

  async findAllGenders (): Promise<GetResponse<Gender>> {

    const genders = await this.genderRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: genders,
      total: genders.length,
      message: 'Géneros encontrados',
      statusCode: 200
    };

  }

  async findAllGenderPreferences (): Promise<GetResponse<GenderPreference>> {

    const genderPreferences = await this.genderPreferenceRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: genderPreferences,
      total: genderPreferences.length,
      message: 'Preferencias de género encontradas',
      statusCode: 200
    };

  }

  async findAllOccupations (): Promise<GetResponse<Occupation>> {

    const occupations = await this.occupationRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: occupations,
      total: occupations.length,
      message: 'Ocupaciones encontradas',
      statusCode: 200
    };

  }

  async findAllInterests (): Promise<GetResponse<Interest>> {

    const interests = await this.interestRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: interests,
      total: interests.length,
      message: 'Intereses encontrados',
      statusCode: 200
    };

  }

  async findAllSchools (): Promise<GetResponse<School>> {

    const schools = await this.schoolRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: schools,
      total: schools.length,
      message: 'Escuelas encontradas',
      statusCode: 200
    };

  }

  async findAllLookFors (): Promise<GetResponse<LookFor>> {

    const lookFors = await this.lookForRepository.find( {
      order: { name: 'ASC' }
    } );

    return {
      data: lookFors,
      total: lookFors.length,
      message: 'Búsquedas encontradas',
      statusCode: 200
    };

  }

  async create ( createProfileDto: CreateProfileDto, user: User ): Promise<GetResponse<Profile>> {

    const {
      gender,
      genderPreferences,
      occupation,
      school,
      interests,
      lookFor,
      horoscope,
      ...rest
    } = createProfileDto;

    const [ genderEntity, genderPreferenceEntities, occupationEntity, schoolEntity, interestEntities, lookForEntity, horoscopeEntity ] = await Promise.all( [
      this.genderRepository.findOne( { where: { id: gender } } ),
      this.genderPreferenceRepository.findBy( { id: In( genderPreferences ) } ),
      occupation ? this.occupationRepository.findOne( { where: { id: occupation } } ) : null,
      school ? this.schoolRepository.findOne( { where: { id: school } } ) : null,
      interests ? this.interestRepository.findBy( { id: In( interests ) } ) : [],
      this.lookForRepository.findOne( { where: { id: lookFor } } ),
      horoscope ? this.horoscopeRepository.findOne( { where: { id: horoscope } } ) : null
    ] );

    const profileData = {
      user,
      ...rest,
      gender: genderEntity,
      genderPreferences: genderPreferenceEntities,
      occupation: occupationEntity,
      school: schoolEntity,
      interests: interestEntities,
      lookFor: lookForEntity,
      horoscope: horoscopeEntity,
      location: createProfileDto.location
    };

    const profile = this.profileRepository.create( profileData );

    const savedProfile = await this.profileRepository.save( profile );

    return {
      data: savedProfile,
      message: 'Perfil creado exitosamente',
      statusCode: 201
    };

  }

  async findAll (): Promise<GetResponse<Profile>> {

    const profiles = await this.profileRepository.find( {
      relations: [ 'gender', 'genderPreferences', 'occupation', 'school', 'interests', 'lookFor', 'horoscope' ]
    } );

    return {
      data: profiles,
      total: profiles.length,
      message: 'Perfiles encontrados',
      statusCode: 200
    };

  }

  async findOne ( user: User ): Promise<GetResponse<Profile>> {

    const profile = await this.profileRepository.findOne( {
      where: { user: { id: user.id } },
      relations: [ 'gender', 'genderPreferences', 'occupation', 'school', 'interests', 'lookFor', 'horoscope' ]
    } );

    if ( !profile ) {
      this.handleErrorService.handleNotFoundException( `Perfil con usuario ID ${ user.id } no encontrado` );
    }

    return {
      data: profile,
      message: 'Perfil encontrado',
      statusCode: 200
    };

  }

  async update ( user: User, updateProfileDto: UpdateProfileDto ): Promise<GetResponse<Profile>> {

    const { data: profile } = await this.findOne( user ) as { data: Profile };

    const {
      gender,
      genderPreferences,
      occupation,
      school,
      interests,
      lookFor,
      horoscope,
      ...rest
    } = updateProfileDto;

    const [ genderEntity, genderPreferenceEntities, occupationEntity, schoolEntity, interestEntities, lookForEntity, horoscopeEntity ] = await Promise.all( [
      gender ? this.genderRepository.findOne( { where: { id: gender } } ) : null,
      genderPreferences ? this.genderPreferenceRepository.findBy( { id: In( genderPreferences ) } ) : null,
      occupation ? this.occupationRepository.findOne( { where: { id: occupation } } ) : null,
      school ? this.schoolRepository.findOne( { where: { id: school } } ) : null,
      interests ? this.interestRepository.findBy( { id: In( interests ) } ) : null,
      lookFor ? this.lookForRepository.findOne( { where: { id: lookFor } } ) : null,
      horoscope ? this.horoscopeRepository.findOne( { where: { id: horoscope } } ) : null
    ] );

    console.log( 'genderPreferences recibido:', genderPreferences );
    console.log( 'genderPreferenceEntities encontradas:', genderPreferenceEntities );
    console.log( 'genderPreferenceEntities length:', genderPreferenceEntities?.length );

    const profileData = {
      ...rest,
      ...( genderEntity && { gender: genderEntity } ),
      ...( genderPreferences !== undefined && { genderPreferences: genderPreferenceEntities || [] } ),
      ...( occupationEntity && { occupation: occupationEntity } ),
      ...( schoolEntity && { school: schoolEntity } ),
      ...( interests !== undefined && { interests: interestEntities || [] } ),
      ...( lookForEntity && { lookFor: lookForEntity } ),
      ...( horoscopeEntity && { horoscope: horoscopeEntity } ),
      ...( updateProfileDto.location && { location: updateProfileDto.location } )
    };

    console.log( 'profileData.genderPreferences:', profileData.genderPreferences );

    // Separar las relaciones many-to-many del resto de datos
    const { genderPreferences: profileDataGenderPreferences, interests: profileDataInterests, ...profileDataWithoutRelations } = profileData;

    // Actualizar el perfil sin las relaciones many-to-many
    await this.profileRepository.update(
      { user: { id: user.id } },
      profileDataWithoutRelations
    );

    // Obtener el perfil actualizado
    const updatedProfile = await this.profileRepository.findOne( {
      where: { user: { id: user.id } },
      relations: [ 'gender', 'genderPreferences', 'occupation', 'school', 'interests', 'lookFor', 'horoscope' ]
    } );

    // Actualizar manualmente las relaciones many-to-many
    if ( profileDataGenderPreferences !== undefined ) {
      updatedProfile.genderPreferences = profileDataGenderPreferences;
      await this.profileRepository.save( updatedProfile );
    }

    if ( profileDataInterests !== undefined ) {
      updatedProfile.interests = profileDataInterests;
      await this.profileRepository.save( updatedProfile );
    }

    // Obtener el perfil final con todas las relaciones actualizadas
    const savedProfile = await this.profileRepository.findOne( {
      where: { user: { id: user.id } },
      relations: [ 'gender', 'genderPreferences', 'occupation', 'school', 'interests', 'lookFor', 'horoscope' ]
    } );

    return {
      data: savedProfile,
      message: 'Perfil actualizado exitosamente',
      statusCode: 200
    };

  }

  async remove ( user: User ): Promise<GetResponse<Profile>> {

    const { data: profile } = await this.findOne( user ) as { data: Profile };
    const removedProfile = await this.profileRepository.remove( profile );

    return {
      data: removedProfile,
      message: 'Perfil eliminado exitosamente',
      statusCode: 200
    };

  }
}
