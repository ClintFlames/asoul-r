import { ActivityOptions } from "discord.js"

export interface IConfig {
	token: string,
	applicationId: string,
	godList: string[],
	statusSwitchInterval: number,
	statusList: ActivityOptions[],
	coasdb: {
		url: string,
		adminList: string[]
	}
}
