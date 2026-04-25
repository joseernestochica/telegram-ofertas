import { Horoscope, Gender, GenderPreference, Occupation, Interest, School, LookFor } from '../../profile/entities';

export const horoscopeSeed: Partial<Horoscope>[] = [
	{ name: 'Aries' },
	{ name: 'Tauro' },
	{ name: 'Géminis' },
	{ name: 'Cáncer' },
	{ name: 'Leo' },
	{ name: 'Virgo' },
	{ name: 'Libra' },
	{ name: 'Escorpio' },
	{ name: 'Sagitario' },
	{ name: 'Capricornio' },
	{ name: 'Acuario' },
	{ name: 'Piscis' }
];

export const genderSeed: Partial<Gender>[] = [
	{ name: 'Hombre' },
	{ name: 'Mujer' },
	{ name: 'No binario' },
	{ name: 'Género fluido' },
	{ name: 'Transgénero' },
	{ name: 'Otro' }
];

export const genderPreferenceSeed: Partial<GenderPreference>[] = [
	{ name: 'Hombres' },
	{ name: 'Mujeres' },
	{ name: 'Todos' },
	{ name: 'No binarios' }
];

export const occupationSeed: Partial<Occupation>[] = [
	{ name: 'Estudiante' },
	{ name: 'Ingeniero' },
	{ name: 'Médico' },
	{ name: 'Abogado' },
	{ name: 'Artista' },
	{ name: 'Emprendedor' },
	{ name: 'Profesor' },
	{ name: 'Diseñador' },
	{ name: 'Marketing' },
	{ name: 'Finanzas' },
	{ name: 'Tecnología' },
	{ name: 'Salud' },
	{ name: 'Educación' },
	{ name: 'Gobierno' },
	{ name: 'Ventas' },
	{ name: 'Deportista' },
	{ name: 'Otro' }
];

export const interestSeed: Partial<Interest>[] = [
	// Estilo de Vida
	{ name: 'Fotografía' },
	{ name: 'Yoga' },
	{ name: 'Cocina' },
	{ name: 'Correr' },
	{ name: 'Senderismo' },
	{ name: 'Gimnasio' },
	{ name: 'Ciclismo' },
	{ name: 'Viajar' },
	{ name: 'Vegetariano' },
	{ name: 'Vegano' },

	// Pasiones
	{ name: 'Arte' },
	{ name: 'Música' },
	{ name: 'Cine' },
	{ name: 'Lectura' },
	{ name: 'Escritura' },
	{ name: 'Teatro' },
	{ name: 'Danza' },

	// Deportes
	{ name: 'Fútbol' },
	{ name: 'Baloncesto' },
	{ name: 'Tenis' },
	{ name: 'Natación' },
	{ name: 'Volleyball' },

	// Social
	{ name: 'Café' },
	{ name: 'Karaoke' },
	{ name: 'Videojuegos' },
	{ name: 'Fiesta' },
	{ name: 'Vino' },
	{ name: 'Cerveza' },

	// Creatividad
	{ name: 'Pintura' },
	{ name: 'Fotografía Digital' },
	{ name: 'DIY' },
	{ name: 'Jardinería' },

	// Mascotas
	{ name: 'Perros' },
	{ name: 'Gatos' },

	// Otros
	{ name: 'Emprendimiento' },
	{ name: 'Tecnología' },
	{ name: 'Idiomas' },
	{ name: 'Voluntariado' },
	{ name: 'Meditación' },
	{ name: 'Astrología' }
];

export const schoolSeed: Partial<School>[] = [
	{ name: 'Universidad' },
	{ name: 'Licenciatura' },
	{ name: 'ESO' },
	{ name: 'Formación Profesional' },
	{ name: 'Doctorado' },
	{ name: 'Posgrado' },
	{ name: 'Master' },
	{ name: 'Otro' }
];

export const lookForSeed: Partial<LookFor>[] = [
	{ name: 'Relación estable.' },
	{ name: 'Relación para ya veremos.' },
	{ name: 'Rollos pero ya veremos.' },
	{ name: 'Rollos cortos.' },
	{ name: 'Hacer amigos.' },
	{ name: 'Aún no lo tengo claro.' }
]; 