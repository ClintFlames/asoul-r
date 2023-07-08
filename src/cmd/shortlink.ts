import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";

const command:ICommand = {
	data: new SlashCommandBuilder()
		.setName("shortlink")
		.setDescription("Shortens the link")
		.setNameLocalization("ru", "короткаяссылка")
		.setDescriptionLocalization("ru", "Сокращает ссылку")
		.addStringOption(o => 
			o.setName("link")
				.setDescription("Link that needs to be shortened")
				.setNameLocalization("ru", "ссылка")
				.setDescriptionLocalization("ru", "Ссылка которую необходимо сократить")
				.setRequired(true)
		) as SlashCommandBuilder,
	fun: async (inter) => {
		inter.reply("<" +
			await (
				await fetch(
					"https://clck.ru/--?url=" +
					encodeURIComponent(inter.options.getString("link", true))
				)
			).text() + ">"
		);
	}
}

module.exports = command;