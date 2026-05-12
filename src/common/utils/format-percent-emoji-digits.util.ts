/**
 * Dígitos matemáticos en negrita Unicode (U+1D7CE–U+1D7D7): 𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗.
 * Suelen verse más anchos que el bloque monospace (U+1D7F6).
 */
const MATH_BOLD_DIGIT_ZERO = 0x1d7ce;

/**
 * Porcentaje con esos dígitos + `%` ASCII (p. ej. 22 → `𝟐𝟐%`).
 * No incluye el signo menos.
 */
export function formatPercentAsEmojiKeycaps ( percent: number ): string {
	const n = Math.round( percent );
	const clamped = Math.max( 0, Math.min( 100, n ) );
	let out = '';
	for ( const ch of String( clamped ) ) {
		const d = ch.charCodeAt( 0 ) - 48;
		if ( d >= 0 && d <= 9 ) {
			out += String.fromCodePoint( MATH_BOLD_DIGIT_ZERO + d );
		}
	}
	return `${ out }%`;
}
