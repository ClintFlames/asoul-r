import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("coalink")
    .setDescription("Links your discord account with Curse of Aros player")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Player name")
        .setRequired(true)
    ) as SlashCommandBuilder,
  fun: async (inter) => {
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

    const name = inter.options.getString("name", false);
    const player = await (await fetch(url + "/user/" + name)).json();


    if (player.error != undefined) {
      embed.setColor(0xff6666);
      embed.setTitle(`Player "${name}" was not found.`);
      return inter.editReply({ embeds: [embed] });
    }

    if (player.discord_id == inter.user.id) {
      embed.setColor(0xff6666);
      embed.setTitle(`Player "${player.name}" already linked with your discord.`);
      return inter.editReply({ embeds: [embed] });
    }

    if (player.discord_verified == true) {
      embed.setColor(0xff6666);
      embed.setTitle(`Player "${player.name}" has verified discord. You can't link it.`);
      return inter.editReply({ embeds: [embed] });
    }

    const result = await (await fetch(
      url + "/user/discord/" + name,
      {
        method: "PUT",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          discord_verified: false,
          discord_id: inter.user.id
        })
      }
    )).json();

    embed.setColor(0x66ff66)
      .setTitle("Yay! You linked your player to your account.")
      .setDescription("But it's not verified, so anyone can relink it to their discord. You can ask admins for verefication.")

    inter.editReply({ embeds: [embed] });
  }
}

module.exports = command;
