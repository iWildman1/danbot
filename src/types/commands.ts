import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export type ComponentInteraction = ButtonInteraction;

export interface Command {
	data: SlashCommandBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	canHandle?: (interaction: ComponentInteraction) => boolean;
	handleInteraction?: (interaction: ComponentInteraction) => Promise<void>;
}
