import type { Command } from "@/types/commands";
import { helpCommand } from "@/commands/help";
import { getInstantAlertsCommand } from "@/commands/get-instant-alerts";
import { getDailyAlertsCommand } from "@/commands/get-daily-alerts";

export const commands: Command[] = [
	helpCommand,
	getInstantAlertsCommand,
	getDailyAlertsCommand,
];

export const commandsByName = new Map<string, Command>(
	commands.map((c) => [c.data.name, c]),
);
