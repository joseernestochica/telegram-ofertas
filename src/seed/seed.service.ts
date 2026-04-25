import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {

	async runSeed (): Promise<{ ok: boolean }> {
		return { ok: true };
	}
}
