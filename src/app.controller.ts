import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetResponse } from './common/interfaces/get-response.interface';
import { buildGetResponse } from './common/utils/get-response.util';

@Controller()
export class AppController {
	constructor (
		@InjectDataSource()
		private dataSource: DataSource,
	) { }

	@Get()
	getHello (): GetResponse<string> {
		return buildGetResponse( 'Hello World!' );
	}

	@Get( 'health' )
	async getHealth (): Promise<GetResponse<{ status: string; timestamp: string; database: string }>> {
		let dbStatus = 'unknown';

		try {
			await this.dataSource.query( 'SELECT 1' );
			dbStatus = 'connected';
		} catch {
			dbStatus = 'disconnected';
		}

		return buildGetResponse( {
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: dbStatus,
		} );
	}
}
