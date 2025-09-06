import { helpCommand } from "@/commands/help";
import { getInstantAlertsCommand } from "@/commands/get-instant-alerts";
import { getDailyAlertsCommand } from "@/commands/get-daily-alerts";

export const commands = [
	helpCommand,
	getInstantAlertsCommand,
	getDailyAlertsCommand,
];


export const commandsByName = new Map(
	commands.map((c) => [c.data.name, c]),
);
