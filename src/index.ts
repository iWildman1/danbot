import { CronJob } from "cron";
import { Events, type TextChannel } from "discord.js";
import { commands } from "@/commands";
import { env } from "@/env";
import {
	createDiscordClient,
	initializeDiscordBot,
	setupInteractionHandling,
} from "@/services/discord";
import { registerCommand } from "@/commands/registry";
import {
	scanAndSendDailyEvents,
	scanAndSendInstantEvents,
} from "@/services/scanner";

for (const command of commands) {
	registerCommand(command);
}

const client = createDiscordClient();

client.login(env.DISCORD_TOKEN);

let instantChannel: TextChannel;
let dailyChannel: TextChannel;

setupInteractionHandling(client);

// Create the scheduled tasks but don't start them running straight away
// Runs every 15m between 7am and 10pm - https://crontab.guru/#*/15_7-22_*_*_*
const instantJob = new CronJob(
	"*/15 7-22 * * *",
	() => scanAndSendInstantEvents(instantChannel),
	null,
	false,
);

// Runs daily at 7pm - https://crontab.guru/#0_9_*_*_*
const dailyJob = new CronJob(
	"0 19 * * *",
	() => scanAndSendDailyEvents(dailyChannel),
	null,
	false,
);

// Boot up the Discord integration and start the schedulers
client.on(Events.ClientReady, async () => {
	const channels = await initializeDiscordBot(client);

	instantChannel = channels.instantChannel;
	dailyChannel = channels.dailyChannel;

	instantJob.start();
	dailyJob.start();

	console.log("[DanBot] Bot is ready and schedulers started!");
});
