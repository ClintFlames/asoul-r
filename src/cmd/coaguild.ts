import { APIEmbedField, ActionRowBuilder, EmbedBuilder, Locale, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";
import Levenshtein from "levenshtein";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("coaguild")
    .setDescription("Gives info about guild")
    .addStringOption(o =>
      o.setName("name")
        .setDescription("Guild name")
        .setRequired(true)
    ) as SlashCommandBuilder,
  fun: async (inter) => {
    await inter.deferReply();
    const url = config.coasdb.url;
    const apiInfo = await (await fetch(url)).json();
    const embed = new EmbedBuilder()
      .setFooter({ text: "Next update" })
      .setTimestamp(apiInfo.next_update);

    const reqName = inter.options.getString("name", true);
    let id: null | string = null;
    const guildList: { _id: string, name: string, distance: number }[] = (
      await (await fetch(url + "/guilds/name_id")).json()
    );
    // Try to find guild by exact name
    for (const { _id, name } of guildList) if (name.toLowerCase() == reqName.toLowerCase())
      id = _id;

    if (id != null) {
      const guild = await (await fetch(url + "/guild/" + id)).json();

      return inter.editReply("```\n" +
        JSON.stringify(guild, null, 2) + "\n" +
        JSON.stringify(apiInfo, null, 2)
        + "\n```");
    }
    // If guild not found
    embed.setColor(0xFF6666)
      .setTitle(`Guild "${reqName}" not found, maybe you mean one of these?`);
    const select = new StringSelectMenuBuilder()
      .setCustomId("coaguild")
      .setPlaceholder("Select guild");

    // Calculate levelshtein distance
    for (let i = 0; i < guildList.length; i++) {
      guildList[i].distance = new Levenshtein(
        reqName.toLowerCase(),
        guildList[i].name.toLowerCase()
      ).distance;
    }

    // Suggest only 5 guilds
    const suggestList = guildList.sort((a, b) => a.distance - b.distance).slice(0, 5);
    for (const suggest of suggestList) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(suggest.name)
          .setValue(suggest._id)
      )
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(select);

    await inter.editReply({
      embeds: [embed],
      components: [row],
    });
  },
  sltFun: async (inter) => {
    await inter.deferReply();
    const url = config.coasdb.url;
    const apiInfo = await (await fetch(url)).json();
    // const embed = new EmbedBuilder()
    //   .setFooter({ text: "Next update" })
    //   .setTimestamp(apiInfo.next_update);

    const id = inter.values[0];

    const guild = await (await fetch(url + "/guild/" + id)).json();

    inter.editReply("```\n" +
      JSON.stringify(guild, null, 2) + "\n" +
      JSON.stringify(apiInfo, null, 2)
      + "\n```");
  }
}

module.exports = command;
