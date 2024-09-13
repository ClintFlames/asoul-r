import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, CommandInteractionOptionResolver, EmbedBuilder, InteractionResponse, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";

const wdata: Collection<string, {
	pageList: EmbedBuilder[],
	curPage: number,
	msg: InteractionResponse,
	btnList: ActionRowBuilder<ButtonBuilder>,
	timeout: NodeJS.Timeout
}> = new Collection();

const command: ICommand = {
	data: new SlashCommandBuilder()
		.setName("weather")
		.setDescription("Returns weather in specified city")
		.setNameLocalization("ru", "погода")
		.setDescriptionLocalization("ru", "Возвращает погоду в указанном городе")
		.addStringOption(o =>
			o.setName("city")
				.setDescription("City where you want to get the weather")
				.setNameLocalization("ru", "город")
				.setDescriptionLocalization("ru", "Город откуда вы хотите получить погоду")
				.setRequired(true)
		) as SlashCommandBuilder
	,
	fun: async (inter) => {
		const pageList: EmbedBuilder[] = [];
		const wjs: IWjsModule = require("weather-js");

		const reply = await inter.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0xFFFF66)
					.setTitle(inter.locale == Locale.Russian ? "Загрузка" : "Loading")
					.setTimestamp(Date.now())
					.setFooter({ text: inter.user.tag, iconURL: inter.user.displayAvatarURL({ size: 32 }) })
			]
		});

		wjs.find({
			search: inter.options.getString("city", true),
			lang: inter.locale == Locale.Russian ? "ru-RU" : "en-US",
			degreeType: "C"
		}, async (e, res) => {
			if (e) {
				inter.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(0xFF4444)
							.setTitle(inter.locale == Locale.Russian ? "Ошибка" : "Error")
							.setDescription(inter.locale == Locale.Russian ? "Попробуйте снова позже" : "Try again later")
							.setTimestamp(Date.now())
							.setFooter({ text: inter.user.tag, iconURL: inter.user.displayAvatarURL({ size: 32 }) })
					]
				});
				return console.log(new Error("Unable get weather : " + inter.options.getString("city", true)));
			}
			let currentDate = new Date();
			currentDate = new Date(currentDate.getTime() - (currentDate.getTime() % 86400000))

			// Delete forecast for previous and current day
			res[0].forecast = res[0].forecast.filter(fc => new Date(fc.date) > currentDate);

			for (let i = 0; i < 1 + res[0].forecast.length; i++) {
				pageList.push(
					new EmbedBuilder()
						.setColor(0x66FF66)
						.setTimestamp(Date.now())
						.setFooter({ text: inter.user.tag, iconURL: inter.user.displayAvatarURL({ size: 32 }) })
				);
			}
			if (inter.locale == Locale.Russian) {
				pageList[0]
					.setTitle(res[0].location.name + " - сейчас")
					.setDescription(`${res[0].current.skytext}, ${res[0].current.temperature} °C\nОщущается как ${res[0].current.feelslike} °C`)
					.addFields(
						{
							name: "Ветер",
							value: res[0].current.winddisplay.replace("m/s", "м/с"),
							inline: true
						},
						{
							name: "Влажность",
							value: res[0].current.humidity + "%",
							inline: true
						}
					);
			} else {
				pageList[0]
					.setTitle("Now")
					.setDescription(`${res[0].current.skytext}, ${res[0].current.temperature} °C\nFeels like ${res[0].current.feelslike} °C`)
					.addFields(
						{
							name: "Wind",
							value: res[0].current.winddisplay.replace("m/s", "м/с"),
							inline: true
						},
						{
							name: "Humidity",
							value: res[0].current.humidity + "%",
							inline: true
						}
					);
			}

			for (let i = 1; i < pageList.length; i++) {
				const fc = res[0].forecast[i - 1];
				if (inter.locale == Locale.Russian) {
					const precip = Number(fc.precip);
					pageList[i]
						.setTitle(res[0].location.name + " - " + fc.day)
						.setDescription(`От ${fc.low} °C до ${fc.high} °C`)
						.setFields(
							{
								name: "Осадки",
								value: precip == 0 ? "Нет осадков" : (
									precip == 1 ? "Слабые осадки" : (
										precip == 2 ? "Средние осадки" : "Сильные осадки"
									)
								)
							}
						);
				} else {
					const precip = Number(fc.precip);
					pageList[i]
						.setTitle(fc.day.charAt(0).toUpperCase() + fc.day.slice(1))
						.setDescription(`От ${fc.low} °C до ${fc.high} °C`)
						.setFields(
							{
								name: "Precipitation",
								value: precip == 0 ? "No precipitation" : (
									precip == 1 ? "Weak precipitation" : (
										precip == 2 ? "Average precipitation" : "Heavy precipitation"
									)
								)
							}
						);
				}
			}

			const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();
			row.addComponents(
				new ButtonBuilder()
					.setCustomId("weather@previous")
					.setEmoji("⬅️")
					// @ts-ignore
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId("weather@next")
					.setEmoji("➡️")
					// @ts-ignore
					.setStyle(ButtonStyle.Primary)
			);

			inter.editReply({ embeds: [pageList[0]], components: [row] });

			wdata.set(
				inter.user.id,
				{
					pageList: pageList,
					curPage: 0,
					msg: reply,
					btnList: row,
					timeout: setTimeout(() => wdata.delete(inter.user.id), 5 * 60 * 1000)
				}
			);
		});
	},
	btnFun: async (einter) => {
		const cdata = wdata.get(einter.inter.user.id);
		if (!cdata) return;

		const iact = einter.act == "previous" ? -1 : 1;
		if (!(cdata.curPage + iact >= 0 && cdata.curPage + iact < cdata.pageList.length)) return;
		cdata.curPage += iact;

		if (cdata.curPage == 0) {
			cdata.btnList.components[0].setDisabled(true);
			cdata.btnList.components[1].setDisabled(false);
		} else if (cdata.curPage + 1 == cdata.pageList.length) {
			cdata.btnList.components[0].setDisabled(false);
			cdata.btnList.components[1].setDisabled(true);
		} else {
			cdata.btnList.components[0].setDisabled(false);
			cdata.btnList.components[1].setDisabled(false);
		}

		cdata.msg.delete();
		const reply = await einter.inter.reply({ embeds: [cdata.pageList[cdata.curPage]], components: [cdata.btnList] });

		cdata.msg = reply;
		cdata.timeout.refresh();
	}
}

module.exports = command;
