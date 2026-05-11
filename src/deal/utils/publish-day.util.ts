/** Inicio del día en UTC (límite diario de publicaciones; ajusta TZ del servidor o amplía a timezone fija si hace falta). */
export function startOfUtcDay ( now: Date = new Date() ): Date {
	return new Date( Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
		0,
		0,
		0,
		0,
	) );
}
