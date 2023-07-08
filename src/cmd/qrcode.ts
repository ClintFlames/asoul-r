import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";

const command:ICommand = {
	data: new SlashCommandBuilder()
		.setName("qrcode")
		.setDescription("Generates QR code from text or link")
		.setNameLocalization("ru", "qrкод")
		.setDescriptionLocalization("ru", "Создает QR код из текста или ссылки")
		.addStringOption(o => 
			o.setName("text")
				.setDescription("Text  that needs to be converted into a QR code")
				.setNameLocalization("ru", "текст")
				.setDescriptionLocalization("ru", "Текст который нужно преобразовать в QR код")
				.setRequired(true)
		) as SlashCommandBuilder,
	fun: async (inter) => {
		try {
			inter.reply({ files: [{
				name: "qrcode.png",
				attachment: await require("qrcode").toBuffer(inter.options.getString("text", true), { errorCorrectionLevel: "H" })
			}]});
		} catch (err) {
			let errtext = "";
			const errres = inter.locale == Locale.Russian ? [
				"Произошла ошибка",
				"Произошла неизвестная ошибка",
				"Количество данных слишком большое для хранения в QR коде"
			] : [
				"An error has occurred",
				"An unknown error has occurred",
				"The amount of data is too large to be stored in the QR code"
			];

			if (err instanceof Error) errtext = err.message; else if (typeof err == "string") errtext = err;

			const embed = new EmbedBuilder()
				.setColor(0xFF6666)
				.setTimestamp(Date.now())
				.setFooter({ text: inter.user.tag, iconURL: inter.user.displayAvatarURL({ size: 32 }) });

			if (errtext == "The amount of data is too big to be stored in a QR Code") {
				embed
					.setTitle(errres[0])
					.setDescription(errres[2])
			} else {
				embed
					.setTitle(errres[1])
					.setDescription(errtext)
			}
			inter.reply({ embeds: [embed] });
		}
	}
}

module.exports = command;