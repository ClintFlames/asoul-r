import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("coadeleteuser")
    .setDescription("Deletes user from DB.")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Player in game name")
        .setRequired(true)
    ) as SlashCommandBuilder,
  fun: async (inter) => {
    if (!config.coasdb.adminList.includes(inter.user.id)) return inter.reply("ONLY ADMINS CAN TYPE THIS COMMAND");

    await inter.deferReply();
    const url = config.coasdb.url;
    let apiInfo: any = null;
    try {
      apiInfo = await (await fetch(url)).json();
    } catch (e) {
      const embed = new EmbedBuilder()
        .setTitle("Sorry, can't reach api. Try again later.")
        .setColor(0xff6666)
        .setTimestamp();
      return inter.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setFooter({ text: "Next update" })
      .setTimestamp(apiInfo.next_update);

    const name = inter.options.getString("name", true);

    const result = await (await fetch(
      url + "/user/" + name,
      { method: "DELETE" }
    )).json();

    if (result.error != undefined) {
      embed.setColor(0xff6666);
      embed.setTitle(`Player "${name}" not found.`);
      return inter.editReply({ embeds: [embed] });
    }

    embed.setTitle("Player delete succesful")
      .setDescription(`User "${name}", was deleted.`);

    inter.editReply({ embeds: [embed] })
  }
}

module.exports = command;
