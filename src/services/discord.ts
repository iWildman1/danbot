import { getCommandsJSON } from "@/framework/registry";
import { routeInteraction } from "@/framework/router";
import { env } from "@/env";
import {
	ChannelType,
	Client,
	Events,
	GatewayIntentBits,
	REST,
	Routes,
	type TextChannel,
} from "discord.js";

export function createDiscordClient() {
	return new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
		],
	});
}

export async function registerSlashCommands() {
	const rest = new REST().setToken(env.DISCORD_TOKEN);

	try {
		console.log("[DanBot] Registering slash commands...");

		await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
			body: getCommandsJSON(),
		});

		console.log("[DanBot] Successfully registered slash commands.");
	} catch (error) {
		console.error("[DanBot] Error registering slash commands:", error);
	}
}

export function setupInteractionHandling(client: Client) {
	client.on(Events.InteractionCreate, async (interaction) => {
		await routeInteraction(interaction);
	});
}

export function getTextChannel(
	client: Client,
	channelId: string,
	channelName: string,
): TextChannel {
	const channel = client.channels.cache.get(channelId);

	if (channel?.type !== ChannelType.GuildText) {
		throw new Error(
			`The ${channelName} channel must be a text channel. DanBot cannot work with any other kind of channel`,
		);
	}

	return channel;
}

export async function initializeDiscordBot(client: Client) {
	console.log(`[DanBot] Logged in as ${client.user?.tag}!`);

	if (env.NODE_ENV === "development") {
		console.log(
			"[DanBot DEV] Running in development mode - event notifications will be logged instead of posted to Discord",
		);
	}

	await registerSlashCommands();

	const instantChannel = getTextChannel(
		client,
		env.INSTANT_NOTIFICATIONS_CHANNEL_ID,
		"instant notifications",
	);

	const dailyChannel = getTextChannel(
		client,
		env.DAILY_NOTIFICATIONS_CHANNEL_ID,
		"daily notifications",
	);

	return { instantChannel, dailyChannel };
}
