import { env } from "@/env";
import { sendEventNotification } from "@/utils/messaging";
import type { TextChannel } from "discord.js";
import { getDailyEventsList, getEventsList } from "./events";

export async function scanAndSendInstantEvents(channel: TextChannel) {
	console.log(`[DanBot] Starting event scan at ${new Date().toString()}.`);

	const events = await getEventsList();

	if (events.length > 0) {
		await sendEventNotification(
			events,
			channel,
			env.INSTANT_NOTIFICATIONS_ROLE_ID,
			env.INSTANT_NOTIFICATIONS_CHANNEL_ID,
			"instant",
		);
	}

	console.log(
		`[DanBot] Successfully ran event scan at ${new Date().toString()}. Detected ${
			events.length
		} new events`,
	);
}

export async function scanAndSendDailyEvents(dailyChannel: TextChannel) {
	console.log(
		`[DanBot] Starting daily event scan at ${new Date().toString()}.`,
	);

	const events = await getDailyEventsList();

	if (events.length > 0) {
		await sendEventNotification(
			events,
			dailyChannel,
			env.DAILY_NOTIFICATIONS_ROLE_ID,
			env.DAILY_NOTIFICATIONS_CHANNEL_ID,
			"daily",
		);
	}

	console.log(
		`[DanBot] Successfully ran daily event scan at ${new Date().toString()}. Detected ${
			events.length
		} new events`,
	);
}
