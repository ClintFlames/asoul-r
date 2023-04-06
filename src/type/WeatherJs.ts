// Types for weather-js module

interface IWjsLocation {
	name:String,
	lat:String,
	long:String,
	timezone:String,
	alert:String,
	degreetype:String,
	imagerelativeurl:String
}

interface IWjsCurrent {
	temperature:String,
	skycode:String,
	skytext:String,
	date:String,
	observationtime:String,
	observationpoint:String,
	feelslike:String,
	humidity:String,
	winddisplay:String,
	day:String,
	shortday:String,
	windspeed:String,
	imageUrl:String
}

interface IWjsForecast {
	low:String,
	high:String,
	skycodeday:String,
	skytextday:String,
	date:String,
	day:String,
	shortday:String,
	precip:String
}

interface IWjsOption {
	search:String,
	lang?:String,
	degreeType?:String,
	timeout?:Number
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