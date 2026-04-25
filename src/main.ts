import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap () {
  const logger = new Logger( 'Bootstrap' );

  try {
    // Debug: Log database environment variables
    logger.log( 'Database Environment Variables:' );
    logger.log( `DB_HOST: ${ process.env.DB_HOST }` );
    logger.log( `DB_PORT: ${ process.env.DB_PORT }` );
    logger.log( `DB_USER: ${ process.env.DB_USER }` );
    logger.log( `DB_NAME: ${ process.env.DB_NAME }` );
    logger.log( `STAGE: ${ process.env.STAGE }` );
    logger.log( `PORT: ${ process.env.PORT }` );

    const app = await NestFactory.create( AppModule );

    app.setGlobalPrefix( 'api' );

    // Configuración de CORS
    app.enableCors( {
      // origin: process.env.STAGE === 'prod' ? true : 'http://localhost:4205',
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    } );

    app.useGlobalPipes(
      new ValidationPipe( {
        whitelist: true,
        forbidNonWhitelisted: true,
      } )
    );

    const config = new DocumentBuilder()
      .setTitle( 'Contenedor Nest - PostgreSQL' )
      .setDescription( 'Contenedor a partir de cual generar Backend con Nest y PostgreSQL' )
      .setVersion( '1.0' )
      .build();
    const documentFactory = () => SwaggerModule.createDocument( app, config );
    SwaggerModule.setup( 'api', app, documentFactory );

    const port = process.env.PORT || 3000;
    await app.listen( port );
    logger.log( `Application is running on port: ${ port }` );
    logger.log( `Health check available at: http://localhost:${ port }/health` );

  } catch ( error ) {
    logger.error( 'Failed to start application:', error );
    process.exit( 1 );
  }
}
bootstrap();
