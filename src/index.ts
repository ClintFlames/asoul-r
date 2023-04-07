import { Client, Events, GatewayIntentBits, ActivityType, Collection, REST, Routes } from "discord.js";
import { ICommand } from "./types/ICommand";
import { EClient } from "./types/EClient";
import { readdir } from "fs";
import path from "path";
import { IConfig } from "./types/IConfig";

const config:IConfig = require(path.join(__dirname, "..", "config.js"));

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as EClient;

client.cmdList = new Collection();
client.btnList = new Collection();

client.once(Events.ClientReady, () => {
	if (!client.user) throw new Error(`"Client.user" is empty.`);
	console.log("Online as " + client.user.tag);
	let iStat = 0;
	
	const statusFun = () => {
		// !Useless return but ts returns error
		if (!client.user) return;
		client.user.setActivity(config.statusList[iStat++]);
		if (iStat == config.statusList.length) iStat = 0;
	}

	if (!config.statusList.length) return;
	statusFun();
	setInterval(statusFun, config.statusSwitchInterval * 1000);
});

// Handling interactions
client.on(Events.InteractionCreate, async inter => {
	if (inter.isChatInputCommand()) {
		const fun = client.cmdList.get(inter.commandName);
		if (!fun) return;
		try {
			await fun(inter);
		} catch (e) {
			console.log(`Error at command "${inter.commandName}", e:${e}`);
		}
	} else if (inter.isButton()) {
		const [cmd, act] = inter.customId.split("@");
		const btnFun = client.btnList.get(cmd);
		if (!btnFun) return;
		try {
			await btnFun({ act, inter });
		} catch (e) {
			console.log(`Error at button "${inter.customId}", e:${e}`);
		}
	}
});

// Setting up commands and their buttons
readdir(path.join(__dirname, "cmd"), "utf-8", (e, fileList) => {
	if (e) throw e;
	const restBody = [];
	for (let file of fileList) {
		if (!file.endsWith(".js")) continue;
		const cmd:ICommand = require(path.join(__dirname, "cmd", file));
		file = file.slice(0, -3);
		restBody.push(cmd.data.toJSON());
		client.cmdList.set(file, cmd.fun);
		if (cmd.btnFun) client.btnList.set(file, cmd.btnFun);
	}

	// Sending commands to discord to add it
	new REST({ version: "10" }).setToken(config.token).put(
		Routes.applicationCommands(config.applicationId),
		{ body: restBody }
	);
})

client.login(config.token);