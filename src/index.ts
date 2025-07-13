import { CronJob } from "cron";
import {
	ChannelType,
	Client,
	Events,
	GatewayIntentBits,
	REST,
	Routes,
	type TextChannel,
} from "discord.js";
import {
	handleInitializeCommand,
	initializeCommand,
} from "./commands/initialize";
import { env } from "./env";
import { getEventsList } from "./events";

const CHUNK_SIZE = 1500;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.login(env.DISCORD_TOKEN);

let channel: TextChannel;

// Register slash commands
async function registerCommands() {
	const rest = new REST().setToken(env.DISCORD_TOKEN);

	try {
		console.log("[DanBot] Registering slash commands...");

		await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
			body: [initializeCommand.toJSON()],
		});

		console.log("[DanBot] Successfully registered slash commands.");
	} catch (error) {
		console.error("[DanBot] Error registering slash commands:", error);
	}
}

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			if (interaction.commandName === "initialize") {
				await handleInitializeCommand(interaction);
			}
		}
	} catch (error) {
		console.error("[DanBot] Error handling interaction:", error);

		if (
			interaction.isChatInputCommand() &&
			!interaction.replied &&
			!interaction.deferred
		) {
			await interaction.reply({
				content: "❌ An error occurred while processing your request.",
				ephemeral: true,
			});
		}
	}
});

// Create the scheduled task but don't start it running straight away
// Runs every 30m between 7am and 10pm - https://crontab.guru/#*/30_7-22_*_*_*
const job = new CronJob("*/15 7-22 * * *", checkForEventsAndSend, null, false);

// Boot up the Discord integration and start the scheduler
client.on(Events.ClientReady, async () => {
	console.log(`[DanBot] Logged in as ${client.user?.tag}!`);

	if (env.NODE_ENV === "development") {
		console.log(
			"[DanBot DEV] Running in development mode - event notifications will be logged instead of posted to Discord",
		);
	}

	// Register slash commands
	await registerCommands();

	const internalChannel = client.channels.cache.get(
		env.INSTANT_NOTIFICATIONS_CHANNEL_ID,
	);

	if (internalChannel?.type !== ChannelType.GuildText) {
		throw new Error(
			"The instant notifications channel must be a text channel. DanBot cannot work with any other kind of channel",
		);
	}

	channel = internalChannel;
	job.start();

	console.log("[DanBot] Bot is ready and scheduler started!");
});

async function checkForEventsAndSend() {
	console.log(`[DanBot] Starting event scan at ${new Date().toString()}.`);

	const events = await getEventsList();

	// Send a full response if we did get a list
	if (events.length > 0) {
		sendEventsResponse(events);
	}

	console.log(
		`[DanBot] Successfully ran event scan at ${new Date().toString()}. Detected ${
			events.length
		} new events`,
	);
}

function sendEventsResponse(events: Awaited<ReturnType<typeof getEventsList>>) {
	const eventTitles = events.map((event) => `- ${event.name.text}\n`).join("");

	if (env.NODE_ENV === "development") {
		console.log("[DanBot DEV] Would send Discord notification:");
		console.log(
			`[DanBot DEV] Role mention: <@&${env.INSTANT_NOTIFICATIONS_ROLE_ID}>`,
		);
		console.log(
			`[DanBot DEV] Channel: ${env.INSTANT_NOTIFICATIONS_CHANNEL_ID}`,
		);
		console.log(
			`[DanBot DEV] Header: **Waterstones Eventbrite search complete.**\nFound ${events.length} events:`,
		);
		console.log(`[DanBot DEV] Events:\n${eventTitles}`);
		return;
	}

	// Discord has a max message size of 2,000 characters - We need to split our message into
	// multiple message chunks to stay under this
	const chunkedTitles: string[] = [];
	let currentChunk = 0;

	while (currentChunk < eventTitles.length) {
		chunkedTitles.push(
			eventTitles.substring(currentChunk, currentChunk + CHUNK_SIZE),
		);
		currentChunk += CHUNK_SIZE;
	}

	channel.send(
		`<@&${env.INSTANT_NOTIFICATIONS_ROLE_ID}>\n**Waterstones Eventbrite search complete.**\nFound ${events.length} events:`,
	);

	for (const chunk of chunkedTitles || []) {
		if (chunk.length > 0)
			channel.send(`<@&${env.INSTANT_NOTIFICATIONS_ROLE_ID}>\n${chunk}`);
	}
}
