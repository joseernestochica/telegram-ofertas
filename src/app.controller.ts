import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
	constructor (
		@InjectDataSource()
		private dataSource: DataSource,
	) { }

	@Get()
	getHello (): string {
		return 'Hello World!';
	}

	@Get( 'health' )
	async getHealth (): Promise<{ status: string; timestamp: string; database: string }> {
		let dbStatus = 'unknown';

		try {
			// Verificar conexión a la base de datos
			await this.dataSource.query( 'SELECT 1' );
			dbStatus = 'connected';
		} catch ( error ) {
			dbStatus = 'disconnected';
		}

		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: dbStatus,
		};
	}
} 