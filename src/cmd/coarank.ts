import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";

const command: ICommand = {
	data: new SlashCommandBuilder()
		.setName("coarank")
		.setDescription("Displays player rank in Curse of Aros")
		.addStringOption(o =>
			o.setName("name")
				.setDescription("Player in game name")
				.setRequired(false)
		)
		.addUserOption(o =>
			o.setName("user")
				.setDescription("Player discord account")
				.setRequired(false)
		) as SlashCommandBuilder,
	fun: async (inter) => {
		await inter.deferReply();
		const url = config.coasdb.url;
		const apiInfo = await (await fetch(url)).json();
		const embed = new EmbedBuilder()
			.setFooter({ text: "Next update" })
			.setTimestamp(apiInfo.next_update);

		const name = inter.options.getString("name", false);
		const user = inter.options.getUser("user", false);

		if (name && user) {
			embed.setColor(0xff6666)
				.setTitle("Please select only 1 option.")
			return inter.editReply({ embeds: [embed] });
		}

		let player: any = null;

		// Get by name option
		if (name) player = await (await fetch(url + "/user/" + name)).json();
		// Get by user option
		else if (user) player = await (await fetch(url + "/user/discord/" + user.id)).json();
		// Else use current user
		else player = await (await fetch(url + "/user/discord/" + inter.user.id)).json();

		if (player.error != undefined || player.length == 0) {
			embed.setColor(0xff6666);
			if (name) embed.setTitle(`Player "${name}" was not found.`);
			else if (user) embed.setTitle(`User "${user.username}" doesn't have linked game profile.`);
			else embed.setTitle(`You doesn't have linked your game profile.`);

			return inter.editReply({ embeds: [embed] });
		}

		inter.editReply("```\n" +
			JSON.stringify(player, null, 2) + "\n" +
			JSON.stringify(apiInfo, null, 2)
			+ "\n```");
	}
}

module.exports = command;
