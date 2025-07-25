import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import { getAllCommands, getCommand } from "./registry";

async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
	const command = getCommand(interaction.commandName);
	if (!command) return;

	await command.execute(interaction);
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
	for (const command of getAllCommands()) {
		if (!command.canHandle || !command.handleInteraction) continue;

		if (command.canHandle(interaction)) {
			await command.handleInteraction(interaction);
			return;
		}
	}
}

export async function routeInteraction(interaction: Interaction) {
	try {
		if (interaction.isChatInputCommand()) {
			await handleSlashCommand(interaction);
		} else if (interaction.isButton()) {
			await handleButtonInteraction(interaction);
		}
	} catch (error) {
		console.error("[DanBot] Error handling interaction:", error);

		if (
			(interaction.isChatInputCommand() || interaction.isButton()) &&
			!interaction.replied &&
			!interaction.deferred
		) {
			await interaction.reply({
				content: "❌ An error occurred while processing your request.",
				ephemeral: true,
			});
		}
	}
}
