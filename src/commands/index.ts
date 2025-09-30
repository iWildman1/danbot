import { getDailyAlertsCommand } from "@/commands/get-daily-alerts";
import { getInstantAlertsCommand } from "@/commands/get-instant-alerts";
import { helpCommand } from "@/commands/help";

export const commands = [
	helpCommand,
	getInstantAlertsCommand,
	getDailyAlertsCommand,
];

export const commandsByName = new Map(commands.map((c) => [c.data.name, c]));
