const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

const question = "What mood are you currently in?";

const range = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("happy")
    .setLabel("Happy")
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId("sad")
    .setLabel("Sad")
    .setStyle(ButtonStyle.Secondary),
  new ButtonBuilder()
    .setCustomId("indifferent")
    .setLabel("Indifferent")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("angry")
    .setLabel("Angry")
    .setStyle(ButtonStyle.Danger)
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mood")
    .setDescription("What mood are you currently in?"),

  async execute(interaction) {
    await interaction.reply({
      content: question,
      components: [range],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector();

    collector.on("collect", async (interaction) => {
      const answer = interaction.customId;
      await interaction.update({
        content: `You have selected ${answer} - this has been recorded in the database.`,
        components: [],
      });

      const { error } = await supabase.from("quantified").insert({
        question: question,
        type: "range",
        value: answer,
        source: "discord",
      });

      if (error) {
        await interaction.editReply({
          content: "There was an error submitting data to Supabase!",
        });
      }
    });
  },
};
