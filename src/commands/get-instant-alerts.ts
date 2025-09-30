import { logger } from "@/framework/logger";
import { assignRole } from "@/services/role-manager";
import type { Command } from "@/types/commands";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	type GuildMember,
	SlashCommandBuilder,
} from "discord.js";

export const getInstantAlertsCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("get-instant-alerts")
		.setDescription("Set up your DanBot event notification preferences"),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle("🔔 DanBot Instant Event Notifications")
			.setDescription(
				"Choose your notification preference for instant alerts for new events:",
			)
			.addFields(
				{
					name: "🔔 Get Notifications",
					value:
						"Access to instant notifications channel + tagged when new events are found",
					inline: false,
				},
				{
					name: "👁️ Access Only",
					value: "Access to instant notifications channel without being tagged",
					inline: false,
				},
			)
			.setColor(0x5865f2);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("instant_notifications")
				.setLabel("🔔 Get Notifications")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("instant_access_only")
				.setLabel("👁️ Access Only")
				.setStyle(ButtonStyle.Secondary),
		);

		await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true,
		});

		const response = await interaction.fetchReply();

		// Collect button interaction with 60 second timeout
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (i) => i.user.id === interaction.user.id,
			time: 60000,
		});

		collector.on("collect", async (buttonInteraction) => {
			const preference =
				buttonInteraction.customId === "instant_notifications"
					? "notifications"
					: "access_only";
			const member = buttonInteraction.member as GuildMember;

			try {
				await assignRole(member, preference);

				const success = new EmbedBuilder()
					.setTitle("✅ Preferences Set")
					.setDescription(
						preference === "notifications"
							? "You will now receive tagged notifications for new Waterstones events and have access to the instant notifications channel."
							: "You now have access to the instant notifications channel without being tagged in notifications.",
					)
					.setColor(0x00ff00);

				await buttonInteraction.update({
					embeds: [success],
					components: [],
				});

				logger.info("Assigned instant role:", member.user.id, preference);

				collector.stop("completed");
			} catch (error) {
				logger.error(
					"Error assigning instant role:",
					member.user.id,
					preference,
					error,
				);

				const errorMessage =
					error instanceof Error
						? error.message
						: "An unexpected error occurred.";

				const errorEmbed = new EmbedBuilder()
					.setTitle("❌ Error")
					.setDescription(errorMessage)
					.setColor(0xff0000);

				await buttonInteraction.update({
					embeds: [errorEmbed],
					components: [],
				});

				collector.stop("error");
			}
		});

		collector.on("end", (collected, reason) => {
			if (reason === "time") {
				logger.debug(
					"Instant alerts collector timed out:",
					interaction.user.id,
					collected.size,
				);
			}
		});
	},
};
