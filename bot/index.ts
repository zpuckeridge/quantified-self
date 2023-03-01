const {
  Client,
  Intents,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} = require("discord.js");

require("dotenv").config();

const cron = require("node-cron");

const client = new Client({
  partials: ["MESSAGE", "REACTION"],
  intents: [
    1 << 0, // GUILDS
    1 << 9, // GUILD_MESSAGES
    1 << 10, // GUILD_MESSAGE_REACTIONS
  ],
});

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

client.on("ready", async () => {
  console.log(`Successfully logged in as ${client.user.tag}!`);

  // Register global slash command
  const commandData = {
    name: "mood",
    description: "What mood are you currently in?",
  };

  try {
    await client.application.commands.create(commandData);
    console.log("Global slash command registered!");
  } catch (error) {
    console.error(`Error registering global slash command: ${error}`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const question = "What mood are you currently in?";

  if (interaction.commandName === "mood") {
    const row = new ActionRowBuilder().addComponents(
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

    await interaction.reply({
      content: question,
      components: [row],
    });

    const channel = interaction.client.channels.cache.get(
      process.env.BOT_CHANNEL
    );
    const collector = channel.createMessageComponentCollector();

    collector.on("collect", async (i) => {
      const mood = i.customId;
      await i.update({
        content: `You have selected ${mood} - this has been recorded in the database.`,
        components: [],
      });

      // Record the selected response in Supabase 'quantified' table
      const { error } = await supabase.from("quantified").insert({
        question: question,
        type: "range",
        value: mood,
        source: "discord",
      });
      if (error) console.error(error);
    });
  }
});

client.login(process.env.BOT_TOKEN);
