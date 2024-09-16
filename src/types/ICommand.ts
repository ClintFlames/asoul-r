import { ButtonInteraction, ChatInputCommandInteraction, SelectMenuInteraction, SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";

export interface IButtonInteraction {
	act: string,
	inter: ButtonInteraction
}

export interface ICommand {
	data: SlashCommandBuilder,
	fun: (inter: ChatInputCommandInteraction) => void,
	btnFun?: (einter: IButtonInteraction) => void,
	sltFun?: (inter: StringSelectMenuInteraction) => void
}
