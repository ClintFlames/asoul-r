import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("coalinkverify")
    .setDescription("Verify user and game profile link.")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Player in game name")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Player discord account")
        .setRequired(true)
    )
    .addBooleanOption(o =>
      o.setName("verify")
        .setDescription("Should set verify true or false")
        .setRequired(true)
    ) as SlashCommandBuilder,
  fun: async (inter) => {
    if (!config.godList.includes(inter.user.id)) return inter.reply("ONLY ADMINS CAN TYPE THIS COMMAND");

    await inter.deferReply();
    const url = config.coasdb.url;
    const apiInfo = await (await fetch(url)).json();
    const embed = new EmbedBuilder()
      .setFooter({ text: "Next update" })
      .setTimestamp(apiInfo.next_update);

    const name = inter.options.getString("name", true);
    const user = inter.options.getUser("user", true);
    const shouldVerify = inter.options.getBoolean("verify", true);

    const player = await (await fetch(url + "/user/" + name)).json();

    if (player.error != undefined) {
      embed.setColor(0xff6666);
      embed.setTitle(`Player "${name}" was not found.`);
      return inter.editReply({ embeds: [embed] });
    }

    const result = await (await fetch(
      url + "/user/discord/" + name,
      {
        method: "PUT",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          discord_verified: shouldVerify,
          discord_id: user.id
        })
      }
    )).json();

    embed.setTitle("Verify " + (shouldVerify ? "set" : "reset"))
      .setDescription(`User <@${user.id}> has ${shouldVerify ? "verified" : "unverified"} game account "${result.name}".`)

    inter.editReply({ embeds: [embed] })
  }
}

module.exports = command;
