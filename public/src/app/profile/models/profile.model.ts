
export class Profile {

	constructor (
		public bio?: string,
		public birthDate?: Date,
		public gender?: ProfileProps,
		public genderPreferences?: ProfileProps[],
		public occupation?: ProfileProps,
		public school?: ProfileProps,
		public interests?: ProfileProps[],
		public location?: ProfileLocation,
		public locationText?: string,
		public locationCountry?: string,
		public agePreferenceMin?: number,
		public agePreferenceMax?: number,
		public searchRadius?: number,
		public showMe?: boolean,
		public lookFor?: ProfileProps,
		public height?: number,
		public horoscope?: ProfileProps
	) { }

}

export class ProfileLocation {
	constructor (
		public x?: number,
		public y?: number
	) { }
}

export class ProfileProps {
	constructor (
		public id?: number,
		public name?: string
	) { }
}