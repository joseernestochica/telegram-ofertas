import { IsBoolean, IsOptional } from 'class-validator';

export class DealPreviewBodyDto {

	/** Simula el banner que la competencia añade al editar el mensaje cuando la oferta ya no aplica. */
	@IsOptional()
	@IsBoolean()
	showExpiredBanner?: boolean;
}
