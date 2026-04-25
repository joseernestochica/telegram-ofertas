import { createQueryBuilder } from 'src/common/helpers';
import { CreateUserDto, LoginUserDto, UpdateRefreshTokenDto, UpdateUserDto } from './dto';
import { GetParams, GetResponse } from 'src/common/interfaces';
import { GetParamsDto } from 'src/common/dto';
import { HandleErrorService } from 'src/common/services';
import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from './entities';
import { Repository, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

interface LoginResponse {
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message: string;
  statusCode: number;
}

@Injectable()
export class AuthService {

  constructor (

    @InjectRepository( RefreshToken )
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
    private readonly handleErrorService: HandleErrorService,
    private readonly jwtService: JwtService

  ) { }

  private getJwtToken ( payload: JwtPayload ): string {

    return this.jwtService.sign( payload );

  }

  private async createRefreshToken ( user: User, ip: string ): Promise<string> {

    try {

      await this.refreshTokenRepository.delete( { user: user } );
      const refreshTokenUid = uuidv4();

      const refreshTokenBody: RefreshToken = {
        user: user,
        token: refreshTokenUid,
        created: new Date(),
        expires: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ),
        ip
      };

      const refreshToken = this.refreshTokenRepository.create( refreshTokenBody as Object );
      await this.refreshTokenRepository.save( refreshToken );
      return refreshTokenUid;

    } catch ( error ) {
      this.handleErrorService.handleDBException( error );
    }

  }

  private async findInStartUpdateHash ( idTelegram: number, hash: string ): Promise<User | null> {

    const user = await this.userRepository.findOne( { where: { idTelegram } } );
    if ( !user ) { return null; }

    user.hash = hash;
    user.updatedAt = new Date();

    return await this.userRepository.save( user );


  }

  async create ( createUserDto: CreateUserDto, hash = '' ): Promise<User> {

    try {

      const idTelegram = createUserDto.idTelegram;

      const userDb = await this.findInStartUpdateHash( idTelegram, hash );
      if ( userDb ) { return userDb; }

      const user = this.userRepository.create( createUserDto );
      user.hash = hash;
      await this.userRepository.save( user );

      return {
        ...user,
      };

    }
    catch ( error ) {
      this.handleErrorService.handleDBException( error );
    }

  }

  async findAll ( getParamsDto: GetParamsDto ): Promise<GetResponse<User>> {

    const getParams: GetParams = {};
    getParams.page = getParamsDto.page || 1;
    getParams.limit = getParamsDto.limit || 10;
    getParams.sort = { column: getParamsDto.sortColumn || 'id', direction: getParamsDto.sortDirection || 'DESC' };
    getParams.select = getParamsDto.select && getParamsDto.select !== '' ? getParamsDto.select.split( '|' ) : [];
    getParams.search = getParamsDto.search && getParamsDto.search.trim() !== '' ? getParamsDto.search.trim() : undefined;

    if ( getParams.search ) {
      getParams.where = {
        query: `user.username LIKE :s 
          OR user.email LIKE :s
          OR user.firstName LIKE :s
          OR user.lastName LIKE :s`,
        params: {
          s: `%${ getParams.search }%`,
        }
      };
    }

    getParams.andWhere = [];
    if ( getParamsDto.sgStr1 && getParamsDto.sgStr1.trim() !== '' ) {
      getParams.andWhere.push( { field: 'username', value: getParamsDto.sgStr1.trim() } );
    }
    if ( getParamsDto.sgStr2 && getParamsDto.sgStr2.trim() !== '' ) {
      getParams.andWhere.push( { field: 'firstName', value: getParamsDto.sgStr2.trim() } );
    }
    if ( getParamsDto.sgInt1 ) {
      getParams.andWhere.push( { field: 'isBoot', value: getParamsDto.sgInt1 === 1 ? true : false } );
    }

    // Agregamos la relación de imágenes
    getParams.relations = [ 'images' ];

    const getResponse = await createQueryBuilder<User>( this.userRepository, getParams, 'user' );
    if ( !getResponse || ( getResponse.data as User[] ).length === 0 ) {
      this.handleErrorService.handleNotFoundException( 'Users not found' );
    }

    getResponse.message = 'Users list';
    getResponse.statusCode = 200;

    return getResponse;

  }

  async findOne ( id: string ): Promise<GetResponse<User>> {

    const user = await this.userRepository.findOne( { where: { id } } );

    if ( !user ) {
      this.handleErrorService.handleNotFoundException( 'User not found' );
    }

    return {
      data: user as User,
      message: 'User found',
      statusCode: 200
    };

  }

  async login ( loginUserDto: LoginUserDto, ip?: string, isHashed = false ): Promise<GetResponse<any>> {

    const { hash } = loginUserDto;

    const user = await this.userRepository.findOne( {
      where: { hash },
      select: [ 'id', 'roles' ]
    } );

    if ( !user ) {
      this.handleErrorService.handleUnautorizedException( 'User not found (hash)' );
    }

    const refreshTokenUid = await this.createRefreshToken( user, ip );

    return {
      data: {
        user: { ...user, roles: user.roles },
        token: this.getJwtToken( { id: user.id } ),
        refreshToken: refreshTokenUid
      },
      message: 'User logged in',
      statusCode: 201
    };

  }

  async checkAuthStatus ( user: User ) {

    delete user.hash;

    return {
      data: user,
      message: 'User logged in',
      statusCode: 200
    };

  }

  async refreshToken ( updateTokenDto: UpdateRefreshTokenDto ): Promise<any> {

    const { refreshToken, userId, ip } = updateTokenDto;

    const userDb = await this.findOne( userId );

    const count = await this.refreshTokenRepository.count( {
      where: {
        user: { id: ( userDb.data as User ).id },
        token: refreshToken,
        expires: MoreThan( new Date() )
      }
    } );

    if ( count === 0 ) {
      throw new NotAcceptableException( 'no-refresh-token' );
    }

    return await this.login( userDb.data as LoginUserDto, ip, true );

  }

  async update ( id: string, updateUserDto: UpdateUserDto ): Promise<GetResponse<User>> {

    try {

      // Buscar el usuario
      const user = ( await this.findOne( id ) ).data as User;

      if ( !user )
        throw new NotFoundException( `Usuario con ID ${ id } no encontrado` );

      // Actualizar el usuario
      const updatedUser = await this.userRepository.preload( {
        id,
        ...updateUserDto
      } );

      // Guardar los cambios
      await this.userRepository.save( updatedUser );

      return {
        data: updatedUser,
        message: 'Usuario actualizado correctamente',
        statusCode: 200
      };

    } catch ( error ) {
      this.handleErrorService.handleDBException( error );
    }
  }

  async deleteUserHard ( id: string ): Promise<GetResponse<User>> {

    try {

      const user = ( await this.findOne( id ) ).data as User;

      if ( !user ) {
        throw new NotFoundException( `Usuario con ID ${ id } no encontrado` );
      }

      // Eliminar el usuario definitivamente
      await this.userRepository.remove( user );

      return {
        data: user,
        message: 'Usuario eliminado permanentemente',
        statusCode: 200
      };

    } catch ( error ) {
      this.handleErrorService.handleDBException( error );
    }
  }

  async deleteRefreshToken ( id: string, token: string ): Promise<GetResponse<any>> {

    try {

      await this.refreshTokenRepository.delete( { user: { id }, token } );

      return {
        message: 'Refresh token deleted',
        statusCode: 200
      };

    } catch ( error ) {
      this.handleErrorService.handleDBException( error );
    }

  }

  async findByTelegramId ( idTelegram: number ): Promise<GetResponse<User>> {

    const user = await this.userRepository.findOne( {
      where: { idTelegram },
      relations: [ 'images' ]  // Mantenemos la misma relación que usamos en findAll
    } );

    if ( !user ) {
      this.handleErrorService.handleNotFoundException( 'Usuario no encontrado' );
    }

    return {
      data: user,
      message: 'Usuario encontrado',
      statusCode: 200
    };

  }

  async findHashByTelegramId ( idTelegram: number ): Promise<GetResponse<{ hash: string }>> {

    const user = await this.userRepository.findOne( {
      where: { idTelegram },
      select: [ 'id', 'hash' ] // Incluimos el id que necesita TypeORM
    } );

    if ( !user ) {
      this.handleErrorService.handleNotFoundException( 'Usuario no encontrado' );
    }

    return {
      data: { hash: user.hash }, // Solo retornamos el hash
      message: 'Hash encontrado',
      statusCode: 200
    };
  }

  async updateUserActive ( hash: string ): Promise<GetResponse<User>> {

    const user = await this.userRepository.findOne( { where: { hash }, select: [ 'id', 'isActive' ] } );
    if ( !user ) {
      this.handleErrorService.handleNotFoundException( 'Usuario no encontrado' );
    }

    user.isActive = true;
    await this.userRepository.save( user );


    return {
      data: user,
      message: 'Usuario activado correctamente',
      statusCode: 200
    };

  }

}
