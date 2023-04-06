import { ButtonInteraction, CacheType, ChatInputCommandInteraction, Interaction, Options, SlashCommandBuilder } from "discord.js";

export interface ICommand {
	data: SlashCommandBuilder,
	run: (interaction:ChatInputCommandInteraction) => void,
	btnrun?: (interaction:ButtonInteraction, act:String) => void
}