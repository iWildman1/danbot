import { assignRole } from "@/services/role-manager";
import type { Command } from "@/types/commands";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import { logger } from "@/framework/logger";

const log = logger.child({ module: "get-instant-alerts" });

export const getInstantAlertsCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("get-instant-alerts")
		.setDescription("Set up your DanBot event notification preferences"),

	componentIds: ["instant_notifications", "instant_access_only"],

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
	},

	async handleInteraction(interaction) {
		const id = interaction.customId;
		const preference =
			id === "instant_notifications" ? "notifications" : "access_only";
		const member = interaction.member as GuildMember;

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

			await interaction.update({
				embeds: [success],
				components: [],
			});

			log.info("Assigned instant role", {
				userId: member.user.id,
				preference,
			});
		} catch (error) {
			log.error("Error assigning instant role", error, {
				userId: member.user.id,
				preference,
			});

			const errorMessage =
				error instanceof Error
					? error.message
					: "An unexpected error occurred.";

			const errorEmbed = new EmbedBuilder()
				.setTitle("❌ Error")
				.setDescription(errorMessage)
				.setColor(0xff0000);

			await interaction.update({
				embeds: [errorEmbed],
				components: [],
			});
		}
	},
};
