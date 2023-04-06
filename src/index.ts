import { Client, Events, GatewayIntentBits, ActivityType, Collection, REST, Routes } from "discord.js";
import { ICommand } from "./type/ICommand";
import { EClient } from "./type/EClient";
import { readFile, readdir } from "fs";
import path from "path";
import { token, applicationId as appId } from "./config.json";

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as EClient;

client.cmdList = new Collection();
client.btnList = new Collection();

client.once(Events.ClientReady, () => {
	if (!client.user) throw new Error(`"Client.user" is empty.`);
	console.log("Online as " + client.user.tag);
	client.user.setActivity({
		name: "снова жив",
		type: ActivityType.Playing
	});
});

client.on(Events.InteractionCreate, async inter => {
	if (inter.isChatInputCommand()) {
		const cmd = client.cmdList.get(inter.commandName);
		if (!cmd) return;
		try {
			await cmd(inter);
		} catch (e) {
			console.log(`Error at command "${inter.commandName}", e:${e}`);
		}
	} else if (inter.isButton()) {
		const [cmd, act] = inter.customId.split("@");
		const btn = client.btnList.get(cmd);
		if (!btn) return;
		try {
			btn(inter, act);
		} catch (e) {
			console.log(`Error at button "${inter.customId}", e:${e}`);
		}
	}
});

// Reading and setting up commands and buttons
readdir(path.join(__dirname, "cmd"), "utf-8", (e, fileList) => {
	if (e) throw e;

	const restData = [];

	for (const file of fileList) {
		if (!file.endsWith(".js")) continue;
		const cmd:ICommand = require(path.join(__dirname, "cmd", file));
		restData.push(cmd.data.toJSON());
		client.cmdList.set(file.slice(0, -3), cmd.run);
		if (cmd.btnrun) client.btnList.set(file.slice(0, -3), cmd.btnrun);
	}

	// Sending commands to discord to add it
	new REST({ version: "10" }).setToken(token).put(
		Routes.applicationCommands(appId),
		{ body: restData }
	);
})

client.login(token);