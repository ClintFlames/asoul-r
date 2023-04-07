import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";

const command:ICommand = {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Displays uptime")
		.setNameLocalization("ru", "аптайм")
		.setDescriptionLocalization("ru", "Отображает время безотказной работы"),
	fun: async (inter) => {
		const time = {
			ms: inter.client.uptime,
			s : 0,
			m : 0,
			h : 0
		}
		time.ms -= (time.s = Math.floor(time.ms / 1000)) * 1000;
		time.s  -= (time.m = Math.floor(time.s  / 60  )) * 60;
		time.m  -= (time.h = Math.floor(time.m  / 24  )) * 24;

		const embed = new EmbedBuilder()
			.setColor(0x66FF66)
			.setTimestamp(Date.now())
			.setFooter({ text: inter.user.tag, iconURL: inter.user.displayAvatarURL({ size: 32 }) });
		
		if (inter.locale == Locale.Russian) {
			embed.setTitle("Время безотказной работы");
			const fieldList:APIEmbedField[] = [];
			if (time.h) fieldList.push({ name: "Часов:", value: time.h + "", inline: true });
			if (time.m) fieldList.push({ name: "Минут:", value: time.m + "", inline: true });
			if (time.s) fieldList.push({ name: "Секунд:", value: time.s + "", inline: true });
			fieldList.push({ name: "Миллисекунд:", value: time.ms + "", inline: true });
			embed.addFields(fieldList);
		} else {
			embed.setTitle("Uptime")
			const fieldList:APIEmbedField[] = [];
			if (time.h) fieldList.push({ name: "Hours:", value: time.h + "", inline: true });
			if (time.m) fieldList.push({ name: "Minutes:", value: time.m + "", inline: true });
			if (time.s) fieldList.push({ name: "Seconds:", value: time.s + "", inline: true });
			fieldList.push({ name: "Milliseconds:", value: time.ms + "", inline: true });
			embed.addFields(fieldList);
		}

		inter.reply({ embeds: [embed] });
	}
}

module.exports = command;