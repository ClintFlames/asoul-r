import { APIEmbedField, ActionRowBuilder, EmbedBuilder, Locale, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";
import Levenshtein from "levenshtein";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("coaguildedit")
    .setDescription("Edit coa guild")
    .addSubcommand(sc =>
      sc.setName("general")
        .setDescription("Sets general info about guild")
        .addStringOption(o =>
          o.setName("guild_id")
            .setDescription("Guild id")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("guild_name")
            .setDescription("New guild name")
            .setRequired(false)
        )
        .addStringOption(o =>
          o.setName("guild_description")
            .setDescription("New guild descrption")
            .setRequired(false)
        )
        .addStringOption(o =>
          o.setName("guild_regex")
            .setDescription("New guild tag/regex")
            .setRequired(false)
        )
    ).addSubcommand(sc =>
      sc.setName("discord")
        .setDescription("Setup discord for guild")
        .addStringOption(o =>
          o.setName("guild_id")
            .setDescription("Guild id")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("id")
            .setDescription("Discord server id")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("invite")
            .setDescription("Discord server invite")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("log_channel")
            .setDescription("Discord server log channel id")
            .setRequired(true)
        )
    ).addSubcommand(sc =>
      sc.setName("list_push")
        .setDescription("Adds user to one of list")
        .addStringOption(o =>
          o.setName("guild_id")
            .setDescription("Guild id")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("list_name")
            .setDescription("List where user will be added")
            .setRequired(true)
            .addChoices(
              { name: "Include List", value: "include" },
              { name: "Include Owner List", value: "include_owner" },
              { name: "Exclude List", value: "exclude" }
            )
        )
        .addStringOption(o =>
          o.setName("user_name")
            .setDescription("User to be added to list")
            .setRequired(true)
        )
    )
    .addSubcommand(sc =>
      sc.setName("list_pop")
        .setDescription("Removes user to one of list")
        .addStringOption(o =>
          o.setName("guild_id")
            .setDescription("Guild id")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("list_name")
            .setDescription("List where user will be removed")
            .setRequired(true)
            .addChoices(
              { name: "Include List", value: "include" },
              { name: "Include Owner List", value: "include_owner" },
              { name: "Exclude List", value: "exclude" }
            )
        )
        .addStringOption(o =>
          o.setName("user_name")
            .setDescription("User to be removed to list")
            .setRequired(true)
        )
    ) as SlashCommandBuilder,
  fun: async (inter) => {
    await inter.deferReply();
    const url = config.coasdb.url;
    const apiInfo = await (await fetch(url)).json();
    const embed = new EmbedBuilder()
      .setFooter({ text: "Next update" })
      .setTimestamp(apiInfo.next_update);

    const guild_id = inter.options.getString("guild_id", true);
    const guild = await (
      await fetch(url + "/guild/" + guild_id)
    ).json();

    if (guild.error) {
      embed.setColor(0xff6666)
        .setTitle(`Guild by id "${guild_id}" not found.`);
      return inter.editReply({ embeds: [embed] });
    }

    return inter.editReply("Oops currently not implemented")
    switch (inter.options.getSubcommand()) {
      case "general": {
        break;
      }
      case "discord": {
        break;
      }
      case "list_pop": {
        break;
      }
      case "list_push": {
        break;
      }
    }
  }
}

module.exports = command;
