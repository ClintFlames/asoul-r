
import { APIEmbedField, EmbedBuilder, Locale, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../types/ICommand";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Displays info about bot")
    .setNameLocalization("ru", "инфо")
    .setDescriptionLocalization("ru", "Отображает информацию о боте"),
  fun: async (inter) => {
    const embed = new EmbedBuilder()
      .setColor(0x9B2D30)
      .setTimestamp(Date.now())
      .setFooter({ text: inter.user.tag, iconURL: inter.user.displayAvatarURL({ size: 32 }) });

    if (inter.locale == Locale.Russian) {
      embed
        .setTitle("ASOUL")
        .setDescription("Или более правильно, [ASOUL Resurrected](https://github.com/ClintFlames/asoul-r) это переписанная версия моего старого бота [ASOUL](https://github.com/ClintFlames/asoul). Поскольку ASOUL больше не поддерживается, я решил не переименовывать этого бота, а заменить его ASOUL Resurrected.")
        .addFields(
          {
            name: "Встречайте",
            value:
              `
Автор
Сенсей
Мышь`.trimStart(),
            inline: true
          },
          {
            name: "Discord",
            value: `
@clintflames
@katze_942
@hjodrunn`.trimStart(),
            inline: true
          },
          {
            name: "GitHub",
            value: `
[ClintFlames](https://github.com/ClintFlames)
[Katze-942](https://github.com/Katze-942)
[Hjodrunn](https://github.com/Hjodrunn)`.trimStart(),
            inline: true
          },
          {
            name: "Links",
            value: `
[ASOUL Resurrected GitHub](https://github.com/ClintFlames/asoul-r)
[ASOUL GitHub](https://github.com/ClintFlames/asoul)
[Пригласить Бота](https://discordapp.com/oauth2/authorize?client_id=582995690158817301&scope=bot&permissions=274878024768)`.trimStart(),
            inline: false
          },
        );
    } else {
      embed
        .setTitle("ASOUL")
        .setDescription("Or more correctly, [ASOUL Resurrected](https://github.com/ClintFlames/asoul-r) is a rewrite of my old bot [ASOUL](https://github.com/ClintFlames/asoul). Since ASOUL is no longer maintained, I decided not to rename this bot and replace it with ASOUL Resurrected.")
        .addFields(
          {
            name: "Meet the",
            value:
              `
Author
Sensei
Mouse`.trimStart(),
            inline: true
          },
          {
            name: "Discord",
            value: `
@clintflames
@katze_942
@hjodrunn`.trimStart(),
            inline: true
          },
          {
            name: "GitHub",
            value: `
[ClintFlames](https://github.com/ClintFlames)
[Katze-942](https://github.com/Katze-942)
[Hjodrunn](https://github.com/Hjodrunn)`.trimStart(),
            inline: true
          },
          {
            name: "Links",
            value: `
[ASOUL Resurrected GitHub](https://github.com/ClintFlames/asoul-r)
[ASOUL GitHub](https://github.com/ClintFlames/asoul)
[Invite Bot](https://discordapp.com/oauth2/authorize?client_id=582995690158817301&scope=bot&permissions=274878024768)`.trimStart(),
            inline: false
          },
        );
    }

    inter.reply({ embeds: [embed] });
  }
}

module.exports = command;
