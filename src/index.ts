import { CronJob } from "cron";
import {
	ChannelType,
	Client,
	GatewayIntentBits,
	type TextChannel,
} from "discord.js";
import { env } from "./env";
import { getEventsList } from "./events";

const CHUNK_SIZE = 1500;

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

client.login(env.DISCORD_TOKEN);

let channel: TextChannel;

// Create the scheduled task but don't start it running straight away
// Runs every 30m between 7am and 10pm - https://crontab.guru/#*/30_7-22_*_*_*
const job = new CronJob("*/15 7-22 * * *", checkForEventsAndSend, null, false);

// Boot up the Discord integration and start the scheduler
client.on("ready", () => {
	const internalChannel = client.channels.cache.get(env.DISCORD_CHANNEL);

	if (internalChannel?.type !== ChannelType.GuildText) {
		throw new Error(
			"The targeted channel must be a text channel. DanBot cannot work with any other kind of channel",
		);
	}

	channel = internalChannel;
	job.start();
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
		`<@${env.DISCORD_TAG_ID}>\n**Waterstones Eventbrite search complete.**\nFound ${events.length} events:`,
	);

	for (const chunk of chunkedTitles || []) {
		if (chunk.length > 0) channel.send(chunk);
	}
}
