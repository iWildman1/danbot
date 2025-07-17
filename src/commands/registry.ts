import type { Command } from "@/types/commands";

const commands = new Map<string, Command>();

export function registerCommand(command: Command) {
  commands.set(command.data.name, command);
}

export function getCommandsJSON() {
  return Array.from(commands.values()).map((command) => command.data.toJSON());
}

export function getCommand(name: string) {
  return commands.get(name);
}

export function getAllCommands() {
  return Array.from(commands.values());
}
