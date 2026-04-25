export interface Location {
	countries?: Country[];
}

export interface Country {
	name: string;
	isoCode: string;
	flag: string;
	phonecode: string;
	currency: string;
	latitude: string;
	longitude: string;
	timezones: Timezone[];
}

export interface Timezone {
	zoneName: string;
	gmtOffset: number;
	gmtOffsetName: string;
	abbreviation: string;
	tzName: string;
}