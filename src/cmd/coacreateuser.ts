import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("coacreateuser")
    .setDescription("Creates user in DB, even if it's not found automatically.")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Player in game name")
        .setRequired(true)
    )
    .addBooleanOption(o =>
      o.setName("lonewolf")
        .setDescription("Is player lonewolf?")
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
    const lonewolf = inter.options.getBoolean("lonewolf", true);

    const result = await (await fetch(
      url + "/user/" + name + "/" + lonewolf,
      { method: "POST" }
    )).json();

    if (result.error != undefined) {
      embed.setColor(0xff6666);
      embed.setTitle(`Player "${name}" already exists.`);
      return inter.editReply({ embeds: [embed] });
    }

    embed.setTitle("Empty player created")
      .setDescription(`User "${result.name}", was created.`);

    inter.editReply({ embeds: [embed] })
  }
}

module.exports = command;
