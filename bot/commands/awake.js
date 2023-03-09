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

const question1 = "💤 How would you rate your quality of sleep?";
const question2 = "⏱ How many hours did you sleep?";
const question3 = "🤔 Did you wake up by yourself?";

const range = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("1")
    .setLabel("1")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("2")
    .setLabel("2")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("3")
    .setLabel("3")
    .setStyle(ButtonStyle.Primary)
);

const boolean = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("yes")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("no")
    .setLabel("No")
    .setStyle(ButtonStyle.Primary)
);

const sleep = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("2-4")
    .setLabel("2-4")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("4-6")
    .setLabel("4-6")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("6-8")
    .setLabel("6-8")
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId("8+")
    .setLabel("8+")
    .setStyle(ButtonStyle.Primary)
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("awake")
    .setDescription("Run this at the start of your day!"),

  async execute(interaction) {
    await interaction.reply({
      content: question1,
      components: [range],
    });

    const collector = interaction.channel.createMessageComponentCollector();

    let questionNumber = 1;

    collector.on("collect", async (interaction) => {
      if (questionNumber === 1) {
        const answer = interaction.customId;

        await interaction.deferUpdate();

        const { error } = await supabase.from("quantified").insert({
          question: question1,
          type: "range",
          value: answer,
          source: "discord",
        });

        if (error) {
          await interaction.editReply({
            content: "There was an error submitting data to Supabase!",
          });
        }

        questionNumber++;
        await interaction.editReply({
          content: question2,
          components: [sleep],
        });
      } else if (questionNumber === 2) {
        const answer = interaction.customId;

        await interaction.deferUpdate();

        const { error } = await supabase.from("quantified").insert({
          question: question2,
          type: "range",
          value: answer,
          source: "discord",
        });

        if (error) {
          await interaction.editReply({
            content: "There was an error submitting data to Supabase!",
          });
        }

        questionNumber++;
        await interaction.editReply({
          content: question3,
          components: [boolean],
        });
      } else if (questionNumber === 3) {
        const answer = interaction.customId;

        await interaction.deferUpdate();

        const { error } = await supabase.from("quantified").insert({
          question: question3,
          type: "range",
          value: answer,
          source: "discord",
        });

        if (error) {
          await interaction.editReply({
            content: "There was an error submitting data to Supabase!",
          });
        }
      }
    });
  },
};
