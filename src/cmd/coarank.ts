import { APIEmbedField, ActionRowBuilder, EmbedBuilder, Locale, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";
import { CoaPrettier } from "../types/CoaPrettier";

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
		let apiInfo: any = null;
		try {
			apiInfo = await (await fetch(url)).json();
		} catch (e) {
			const embed = new EmbedBuilder()
				.setTitle("Sorry, can't reach api. Try again later.")
				.setColor(0xff6666)
				.setTimestamp();
			return inter.editReply({ embeds: [embed] });
		}

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
		let guild = null;
		let guildIconURL = null;
		if (player.guild_id) guild = await (await fetch(url + "/guild/" + player.guild_id)).json();
		try {
			if (guild?.discord_server?.id) guildIconURL = (
				await inter.client.guilds.fetch(guild.discord_server.id)
			).iconURL({ size: 64 });
		} catch (e) { }

		// If found player if one
		if (player.length == 1 || !Array.isArray(player)) return inter.editReply({
			embeds: [(await CoaPrettier.playerToEmbed(
				player.length == 1 ? player[0] : player,
				guild,
				guildIconURL
			))[0]]
		});

		// If more than 1 user
		embed.setColor(0xffff66)
			.setDescription(`**More than one user found for <@${user?.id || inter.user.id}>.**`);
		const select = new StringSelectMenuBuilder()
			.setCustomId("coarank")
			.setPlaceholder("Select player");

		for (const p of player) select.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(p.name)
				.setValue(p._id)
		)

		const row = new ActionRowBuilder<StringSelectMenuBuilder>()
			.addComponents(select);

		await inter.editReply({
			embeds: [embed],
			components: [row],
		});
	},
	sltFun: async (inter) => {
		await inter.deferReply();
		const url = config.coasdb.url;
		const id = inter.values[0];

		const player = await (await fetch(url + "/user/" + id)).json();
		let guild = null;
		let guildIconURL = null;
		if (player.guild_id) guild = await (await fetch(url + "/guild/" + player.guild_id)).json();
		try {
			if (guild?.discord_server?.id) guildIconURL = (
				await inter.client.guilds.fetch(guild.discord_server.id)
			).iconURL({ size: 128 });
		} catch (e) { }

		inter.editReply({
			embeds: [(await CoaPrettier.playerToEmbed(
				player,
				guild,
				guildIconURL
			))[0]]
		});
	}
}

module.exports = command;
