// Types for weather-js module

interface IWjsLocation {
	name:string,
	lat:string,
	long:string,
	timezone:string,
	alert:string,
	degreetype:string,
	imagerelativeurl:string
}

interface IWjsCurrent {
	temperature:string,
	skycode:string,
	skytext:string,
	date:string,
	observationtime:string,
	observationpoint:string,
	feelslike:string,
	humidity:string,
	winddisplay:string,
	day:string,
	shortday:string,
	windspeed:string,
	imageUrl:string
}

interface IWjsForecast {
	low:string,
	high:string,
	skycodeday:string,
	skytextday:string,
	date:string,
	day:string,
	shortday:string,
	precip:string
}

interface IWjsOption {
	search:string,
	lang?:string,
	degreeType?:string,
	timeout?:number
}

interface IWjsModule {
	find: (
		option:IWjsOption,
		callback: (
			error:Error,
			result:[{
				location:IWjsLocation,
				current:IWjsCurrent,
				forecast:IWjsForecast[]
			}]
		) => void
	) => void
}