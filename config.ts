import { ActivityType } from "discord.js";
import { IConfig } from "./src/types/IConfig";

export const config:IConfig = {
	// Your bot token
	token: "bot token",
	// Application Id, NOT bot Id
	applicationId: "application id",
	// Users who allowed to do commands eval, say and etc
	godList: [
		"user id"
	],
	// Status switch interval in seconds (i dont recommend to do it lower 10 seconds)
	statusSwitchInterval: 10,
	statusList: [
		{
			name: "listening example",
			type: ActivityType.Listening
		},
		{
			name: "watching example",
			type: ActivityType.Watching
		}
	]
}