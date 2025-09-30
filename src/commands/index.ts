import { getDailyAlertsCommand } from "@/commands/get-daily-alerts";
import { getInstantAlertsCommand } from "@/commands/get-instant-alerts";
import { helpCommand } from "@/commands/help";

const commands = [helpCommand, getInstantAlertsCommand, getDailyAlertsCommand];

const commandsByName = new Map(commands.map((c) => [c.data.name, c]));

export function getCommand(name: string) {
	return commandsByName.get(name);
}

export function getCommandsJSON() {
	return commands.map((command) => command.data.toJSON());
}
