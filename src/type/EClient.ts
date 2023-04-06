import { ButtonInteraction, CacheType, ChatInputCommandInteraction, Client, Collection, Interaction } from "discord.js";
import { ICommand } from "./ICommand";

export class EClient extends Client {
	public cmdList:Collection<String, (interaction:ChatInputCommandInteraction) => void> = new Collection();
	public btnList:Collection<String, (interaction:ButtonInteraction, act:String) => void> = new Collection();
}