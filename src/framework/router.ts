import { getCommand } from "@/commands";
import { logger } from "@/framework/logger";
import {
	type ChatInputCommandInteraction,
	type Interaction,
	MessageFlags,
} from "discord.js";

async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
	const command = getCommand(interaction.commandName);
	if (!command) return;

	await command.execute(interaction);
}

export async function routeInteraction(interaction: Interaction) {
	try {
		if (interaction.isChatInputCommand()) {
			logger.debug(
				"Dispatching slash command:",
				interaction.commandName,
				interaction.user?.id,
			);
			await handleSlashCommand(interaction);
		}
	} catch (error) {
		logger.error("Error handling interaction:", error);

		if (
			interaction.isChatInputCommand() &&
			!interaction.replied &&
			!interaction.deferred
		) {
			await interaction.reply({
				content: "❌ An error occurred while processing your request.",
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
