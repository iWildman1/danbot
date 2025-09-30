import { logger } from "@/framework/logger";
import { getCommand } from "@/framework/registry";
import type { ChatInputCommandInteraction, Interaction } from "discord.js";

const log = logger.child({ module: "router" });

async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
	const command = getCommand(interaction.commandName);
	if (!command) return;

	await command.execute(interaction);
}

export async function routeInteraction(interaction: Interaction) {
	try {
		if (interaction.isChatInputCommand()) {
			log.debug("Dispatching slash command", {
				name: interaction.commandName,
				userId: interaction.user?.id,
			});
			await handleSlashCommand(interaction);
		}
	} catch (error) {
		log.error("Error handling interaction", error);

		if (
			interaction.isChatInputCommand() &&
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
