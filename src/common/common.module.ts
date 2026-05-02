import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { HandleErrorService } from './services/handle-error.service';

@Module( {
	providers: [ HandleErrorService, ApiKeyGuard ],
	exports: [ HandleErrorService, ApiKeyGuard ],
} )
export class CommonModule { }
