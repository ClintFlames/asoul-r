import { APIEmbedField, ActionRowBuilder, EmbedBuilder, Locale, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, fetchRecommendedShardCount } from "discord.js";
import { ICommand } from "../types/ICommand";
import { config } from "../../config";
import Levenshtein from "levenshtein";
import { CoaPrettier } from "../types/CoaPrettier";

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

    const checkDanger = (value: any) => {
      if (value === null || value === undefined) return false;
      if (config.coasdb.adminList.includes(inter.user.id)) return false;
      const embed = new EmbedBuilder()
        .setTitle("This is dangerous zone. Ask admins to edit this.")
        .setColor(0xff6666)
        .setTimestamp();
      inter.editReply({ embeds: [embed] });
      return true;
    }

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

    let isOwner = false;
    if (!config.coasdb.adminList.includes(inter.user.id)) {
      for (const id of guild.member.include_owner) {
        const player = await (await fetch(url + "/user/" + id)).json();
        if (player.discord_verified && player.discord_id == inter.user.id) isOwner = true;
      }
    } else isOwner = true;

    if (!isOwner) {
      embed.setColor(0xff6666)
        .setTitle(`You are not owner of "${guild.name}".`);
      return inter.editReply({ embeds: [embed] });
    }

    const newGuild = {
      name: guild.name,
      description: guild.description,
      regex: guild.member.regex,
      discord_server: guild.discord_server,
      include: guild.member.include,
      include_owner: guild.member.include_owner,
      exclude: guild.member.exclude
    }

    switch (inter.options.getSubcommand()) {
      case "general": {
        const newName = inter.options.getString("guild_name", false)?.trim();
        const newDescription = inter.options.getString("guild_description", false)?.trim();
        const newRegex = inter.options.getString("guild_regex", false)?.trim();

        if (checkDanger(newRegex)) return;

        if (newName?.length == 0) {
          embed.setColor(0xff6666)
            .setTitle("Guild Name can't be empty.");
          return inter.editReply({ embeds: [embed] });
        }

        if (typeof newName == "string") newGuild.name = newName;
        if (typeof newDescription == "string") newGuild.description = newDescription;
        if (typeof newRegex == "string") newGuild.regex = newRegex;

        break;
      }
      case "discord": {
        const newDiscordId = inter.options.getString("id", true);
        const newDiscordInvite = inter.options.getString("invite", true);
        const newDiscordLogChannel = inter.options.getString("log_channel", true);

        newGuild.discord_server = {
          id: newDiscordId,
          invite: newDiscordInvite,
          log_channel: newDiscordLogChannel
        }

        break;
      }
      case "list_pop": {
        const listName = inter.options.getString("list_name", true);
        const username = inter.options.getString("user_name", true).trim().toLowerCase();

        switch (listName) {
          case "include_owner": if (checkDanger(1)) return;
          default: break;
        }

        // @ts-ignore
        const list = newGuild[listName];
        const index: number = list.findIndex((v: string) => v == username);
        if (index != -1) list.splice(index, 1);

        break;
      }
      case "list_push": {
        const listName = inter.options.getString("list_name", true);
        const username = inter.options.getString("user_name", true).trim().toLowerCase();

        switch (listName) {
          case "include_owner": if (checkDanger(1)) return;
          default: break;
        }

        // @ts-ignore
        newGuild[listName].push(username);

        break;
      }
    }

    // Update and send message
    {
      const guildUpdated = await (await fetch(
        url + "/guild/" + guild._id,
        {
          method: "PUT",
          headers: new Headers({ "Content-Type": "application/json" }),
          body: JSON.stringify(newGuild)
        }
      )).json();
      let guildIconURL = null;
      let guildBannerURL = null;
      try {
        if (guildUpdated?.discord_server?.id) {
          const dguild = await inter.client.guilds.fetch(guildUpdated.discord_server.id);
          guildIconURL = dguild.iconURL({ size: 128 });
          guildBannerURL = dguild.bannerURL({ size: 1024 });
        }
      } catch (e) { }

      inter.editReply({
        embeds: [(await CoaPrettier.guildToEmbed(
          guildUpdated,
          guildIconURL,
          guildBannerURL
        ))[0]]
      });
    }
  }
}


module.exports = command;
