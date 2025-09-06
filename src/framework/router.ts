import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
} from "discord.js";
import { getAllCommands, getCommand } from "@/framework/registry";
import { logger } from "@/framework/logger";

const log = logger.child({ module: "router" });

async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
	const command = getCommand(interaction.commandName);
	if (!command) return;

	await command.execute(interaction);
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
	const id = interaction.customId;

	for (const command of getAllCommands()) {
		if (!command.componentIds || !command.handleInteraction) continue;
		if (command.componentIds.includes(id)) {
			await command.handleInteraction(interaction);
			return;
		}
	}
}

export async function routeInteraction(interaction: Interaction) {
	try {
		if (interaction.isChatInputCommand()) {
			log.debug("Dispatching slash command", {
				name: interaction.commandName,
				userId: interaction.user?.id,
			});
			await handleSlashCommand(interaction);
		} else if (interaction.isButton()) {
			log.debug("Dispatching button interaction", {
				customId: interaction.customId,
				userId: interaction.user?.id,
			});
			await handleButtonInteraction(interaction);
		}
	} catch (error) {
		log.error("Error handling interaction", error);

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
