import { APIEmbedField, ActionRowBuilder, EmbedBuilder, Interaction, Locale, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";
import Levenshtein from "levenshtein";
import { CoaPrettier } from "../types/CoaPrettier";

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
      let guildIconURL = null;
      let guildBannerURL = null;
      try {
        if (guild?.discord_server?.id) {
          const dguild = await inter.client.guilds.fetch(guild.discord_server.id);
          guildIconURL = dguild.iconURL({ size: 128 });
          guildBannerURL = dguild.bannerURL({ size: 1024 });
        }
      } catch (e) { }

      return inter.editReply({
        embeds: [(await CoaPrettier.guildToEmbed(
          guild,
          guildIconURL,
          guildBannerURL
        ))[0]]
      });
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
    const id = inter.values[0];

    const guild = await (await fetch(url + "/guild/" + id)).json();
    let guildIconURL = null;
    let guildBannerURL = null;
    try {
      if (guild?.discord_server?.id) {
        const dguild = await inter.client.guilds.fetch(guild.discord_server.id);
        guildIconURL = dguild.iconURL({ size: 128 });
        guildBannerURL = dguild.bannerURL({ size: 1024 });
      }
    } catch (e) { }

    inter.editReply({
      embeds: [(await CoaPrettier.guildToEmbed(
        guild,
        guildIconURL,
        guildBannerURL
      ))[0]]
    });
  }
}

module.exports = command;
