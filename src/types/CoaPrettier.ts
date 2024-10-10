import { EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const levelExperience = [
  0,
  46,
  99,
  159,
  229,
  309,
  401,
  507,
  628,
  768,
  928,
  1112,
  1324,
  1567,
  1847,
  2168,
  2537,
  2961,
  3448,
  4008,
  4651,
  5389,
  6237,
  7212,
  8332,
  9618,
  11095,
  12792,
  14742,
  16982,
  19555,
  22510,
  25905,
  29805,
  34285,
  39431,
  45342,
  52132,
  59932,
  68892,
  79184,
  91006,
  104586,
  120186,
  138106,
  158690,
  182335,
  209496,
  240696,
  276536,
  317705,
  364996,
  419319,
  481720,
  553400,
  635738,
  730320,
  838966,
  963768,
  1107128,
  1271805,
  1460969,
  1678262,
  1927866,
  2214586,
  2543940,
  2922269,
  3356855,
  3856063,
  4429503,
  5088212,
  5844870,
  6714042,
  7712459,
  8859339,
  10176758,
  11690075,
  13428420,
  15425254,
  17719014,
  20353852,
  23380486,
  26857176,
  30850844,
  35438364,
  40708040,
  46761308,
  53714688,
  61702024,
  70877064,
  81416417,
  93522954,
  107429714,
  123404386,
  141754466,
  162833172,
  187046247,
  214859767,
  246809111,
  283509271,
  325666684,
  374092835,
  429719875,
  493618564,
  567018884,
  651333710,
  748186012,
  859440093,
  987237472,
  1134038112,
  1302667765,
  1496372370,
  1718880532,
  1974475291,
  2268076571,
  2605335878,
  2992745089,
  3437761413,
  3948950932,
  4536153492
];

export const totalLevel = (xpList: number[]) => {
  let lvl = 0;

  for (const xp of xpList) lvl += levelExperience.findIndex(
    (v, i) => v == xp || (levelExperience[i + 1] > xp && v < xp)
  ) + 1;

  return lvl;
}

type EmbedRes = [EmbedBuilder, boolean];

const prettyNumber = (n: number) => n.toLocaleString("en-US");

// TODO: This is bad af, and need rewrite of course
export class CoaPrettier {
  static async apiInfoToEmbed(): Promise<EmbedRes> {
    const url = config.coasdb.url;
    let apiInfo: any = null;
    try {
      apiInfo = await (await fetch(url)).json();
    } catch (e) {
      const embed = new EmbedBuilder()
        .setTitle("Sorry, can't reach api. Try again later.")
        .setColor(0xff6666)
        .setTimestamp();
      return [embed, true];
    }

    const embed = new EmbedBuilder()
      .setFooter({ text: "Next update" })
      .setTimestamp(apiInfo.next_update);

    return [embed, false];
  }

  static async playerToEmbed(player: any, guild: any, guildIconURL: any): Promise<EmbedRes> {
    const [embed, isApiDown] = await this.apiInfoToEmbed();

    if (isApiDown) return [embed, isApiDown];

    if (player?.color) embed.setColor(parseInt(player.color));
    else embed.setColor(0xffff66);

    if (player?.discord_id) embed
      .setDescription(`Discord: <@${player.discord_id}> (${(
        player.discord_verified ? "verified" : "unverified"
      )})`);

    if (guild) embed.setAuthor({
      name: guild.name,
      url: guild.discord_server?.invite,
      iconURL: guildIconURL
    });

    embed
      .setTitle((player.lonewolf ? "🐺 " : "") + player.name)
      .addFields(
        {
          name: "Skills",
          value: `Melee: ${totalLevel([player.xp.melee])} (${prettyNumber(player.xp.melee)})
Magic: ${totalLevel([player.xp.magic])} (${prettyNumber(player.xp.magic)})
Mining: ${totalLevel([player.xp.mining])} (${prettyNumber(player.xp.mining)})
Smithing: ${totalLevel([player.xp.smithing])} (${prettyNumber(player.xp.smithing)})
Woodcutting: ${totalLevel([player.xp.woodcutting])} (${prettyNumber(player.xp.woodcutting)})
Crafting: ${totalLevel([player.xp.crafting])} (${prettyNumber(player.xp.crafting)})
Fishing: ${totalLevel([player.xp.fishing])} (${prettyNumber(player.xp.fishing)})
Cooking: ${totalLevel([player.xp.cooking])} (${prettyNumber(player.xp.cooking)})
Tailoring: ${totalLevel([player.xp.tailoring])} (${prettyNumber(player.xp.tailoring)})
`,
          inline: false
        },
        {
          name: "Rank",
          value: `Total XP: ${prettyNumber(player.total_xp)}
Normal: ${prettyNumber(player.rank.normal)}
Global: ${prettyNumber(player.rank.global)}
`,
          inline: false
        },
      )

    return [embed, isApiDown];
  }

  static async guildToEmbed(
    guild: any,
    guildIconURL: any,
    guildBannerURL: any
  ): Promise<EmbedRes> {
    const [embed, isApiDown] = await this.apiInfoToEmbed();

    if (isApiDown) return [embed, isApiDown];

    try {
      const maxDisplay = 20;
      const url = config.coasdb.url;
      const members: { name: string, xp: number }[] = [];
      const owners: string[] = [];

      // Get members and their xp
      for (const id of guild.member.current_members) {
        const player = await (
          await fetch(url + "/user/" + id)
        ).json();
        members.push({
          name: player.name,
          xp: player.total_xp
        });
      }
      for (const id of guild.member.include_owner) {
        const name = members.find(v => v.name.toLowerCase() == id)?.name;
        if (name) owners.push(name);
      }

      embed.setColor(0x66ff66)
        .setImage(guildBannerURL)
        .setAuthor({
          name: guild.name,
          url: guild.discord_server?.invite,
          iconURL: guildIconURL,
        })
        .setDescription(guild.description)
        .addFields(
          {
            name: "Rank",
            value: `Total XP: ${prettyNumber(guild.xp)}
Rank: ${guild.rank} `,
            inline: false
          },
          {
            name: `Owners`,
            value: owners.length != 0 ? owners.join("\n") : "...",
            inline: false
          },
          {
            name: `Members(${guild.member.current_members.length})`,
            value: members.length == 0 ? "..." : (
              members.slice(0, maxDisplay)
                .sort((a, b) => b.xp - a.xp)
                .map(v => `${v.name} (${prettyNumber(v.xp)})`)
                .join("\n") +
              (members.length > maxDisplay ? "\n..." : "")
            ),
            inline: false
          },
          {
            name: "DB ID",
            value: guild._id
          }
        );

      return [embed, isApiDown];
    } catch (e) {
      console.log(e);
      embed.setColor(0xff6666)
        .setTitle("Something went wrong...");
      return [embed, true];
    }
  }
}
