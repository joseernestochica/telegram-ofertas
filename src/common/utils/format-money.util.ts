/** Formato precio tipo ES (54,03) sin símbolo € en el número. */
export function formatMoneyEUR ( amount: number ): string {
	return new Intl.NumberFormat( 'es-ES', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	} ).format( amount );
}

/** Enteros con separador de miles (ES), p. ej. clics u opiniones. */
export function formatIntegerEs ( n: number ): string {
	return new Intl.NumberFormat( 'es-ES', {
		maximumFractionDigits: 0,
	} ).format( n );
}

/** Ej. 587 → "587", 1200 → "1,2k" (valoraciones tipo Amazon). */
export function formatReviewCountEs ( n: number ): string {
	if ( n < 1000 ) {
		return formatIntegerEs( n );
	}
	const k = n / 1000;
	if ( k >= 10 ) {
		return `${ Math.round( k ) }k`;
	}
	return `${ k.toFixed( 1 ).replace( '.', ',' ) }k`;
}
