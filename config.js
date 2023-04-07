const { ActivityType } = require("discord.js");

module.exports = {
	// Your bot token
	token: "bot-token",
	// Application Id, NOT bot Id
	applicationId: "application-id",
	// Users who allowed to do commands eval, say and etc
	godList: [
		"your-id"
	],
	// Status switch interval in seconds (i dont recommend to do it lower 10 seconds)
	statusSwitchInterval: 10,
	statusList: [
		{
			name: "шепот прошлого",
			type: ActivityType.Listening
		},
		{
			name: "за людьми",
			type: ActivityType.Watching
		}
	]
}