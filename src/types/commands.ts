import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export type ComponentInteraction = ButtonInteraction;

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    // Declarative list of component IDs this command handles
    componentIds?: string[];
    handleInteraction?: (interaction: ComponentInteraction) => Promise<void>;
}
