import { ChatInputCommandInteraction, Client, Collection } from "discord.js";
import { IButtonInteraction } from "./ICommand";

export class EClient extends Client {
	public cmdList:Collection<string, (inter:ChatInputCommandInteraction) => void> = new Collection();
	public btnList:Collection<string, (einter:IButtonInteraction) => void> = new Collection();
}