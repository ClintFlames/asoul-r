import { ChatInputCommandInteraction, Client, Collection, StringSelectMenuInteraction } from "discord.js";
import { IButtonInteraction } from "./ICommand";

export class EClient extends Client {
	public cmdList: Collection<string, (inter: ChatInputCommandInteraction) => void> = new Collection();
	public btnList: Collection<string, (einter: IButtonInteraction) => void> = new Collection();
	public sltList: Collection<string, (inter: StringSelectMenuInteraction) => void> = new Collection();
}
