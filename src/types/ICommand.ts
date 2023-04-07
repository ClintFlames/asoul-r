import { ButtonInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface IButtonInteraction {
	act:string,
	inter:ButtonInteraction
}

export interface ICommand {
	data: SlashCommandBuilder,
	fun: (inter:ChatInputCommandInteraction) => void,
	btnFun?: (einter:IButtonInteraction) => void
}