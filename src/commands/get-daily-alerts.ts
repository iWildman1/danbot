import { logger } from "@/framework/logger";
import { assignDailyRole } from "@/services/role-manager";
import type { Command } from "@/types/commands";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	type GuildMember,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";

export const getDailyAlertsCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("get-daily-alerts")
		.setDescription("Set up your DanBot daily event notification preferences"),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle("📅 DanBot Daily Event Notifications")
			.setDescription(
				"Choose your notification preference for daily alerts for new events:",
			)
			.addFields(
				{
					name: "🔔 Get Notifications",
					value:
						"Access to daily notifications channel + tagged when new events are found",
					inline: false,
				},
				{
					name: "👁️ Access Only",
					value: "Access to daily notifications channel without being tagged",
					inline: false,
				},
			)
			.setColor(0x5865f2);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("daily_notifications")
				.setLabel("🔔 Get Notifications")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("daily_access_only")
				.setLabel("👁️ Access Only")
				.setStyle(ButtonStyle.Secondary),
		);

		await interaction.reply({
			embeds: [embed],
			components: [row],
			flags: MessageFlags.Ephemeral,
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
				buttonInteraction.customId === "daily_notifications"
					? "notifications"
					: "access_only";
			const member = buttonInteraction.member as GuildMember;

			try {
				await assignDailyRole(member, preference);

				const success = new EmbedBuilder()
					.setTitle("✅ Daily Preferences Set")
					.setDescription(
						preference === "notifications"
							? "You will now receive tagged daily notifications for new Waterstones events and have access to the daily notifications channel."
							: "You now have access to the daily notifications channel without being tagged in daily notifications.",
					)
					.setColor(0x00ff00);

				await buttonInteraction.update({
					embeds: [success],
					components: [],
				});

				logger.info("Assigned daily role:", member.user.id, preference);

				collector.stop("completed");
			} catch (error) {
				logger.error(
					"Error assigning daily role:",
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

		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				logger.debug(
					"Daily alerts collector timed out:",
					interaction.user.id,
					collected.size,
				);

				const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("daily_notifications_disabled")
						.setLabel("🔔 Get Notifications")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId("daily_access_only_disabled")
						.setLabel("👁️ Access Only")
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true),
				);

				const timeoutEmbed = new EmbedBuilder()
					.setTitle("⏱️ Request Expired")
					.setDescription(
						"This request has timed out. Please run `/get-daily-alerts` again to set your preferences.",
					)
					.setColor(0xff9900);

				try {
					await interaction.editReply({
						embeds: [timeoutEmbed],
						components: [disabledRow],
					});
				} catch (error) {
					logger.error("Error updating expired interaction:", error);
				}
			}
		});
	},
};
