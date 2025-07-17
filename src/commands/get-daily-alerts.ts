import { assignDailyRole } from "@/services/role-manager";
import type { Command, ComponentInteraction } from "@/types/commands";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import { registerCommand } from "./registry";

const getDailyAlertsCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("get-daily-alerts")
		.setDescription("Set up your DanBot daily event notification preferences"),

	async execute(interaction: ChatInputCommandInteraction) {
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
			ephemeral: true,
		});
	},

	canHandle(interaction: ComponentInteraction) {
		return (
			interaction.isButton() &&
			["daily_notifications", "daily_access_only"].includes(
				interaction.customId,
			)
		);
	},

	async handleInteraction(interaction: ComponentInteraction) {
		const preference = interaction.customId.replace("daily_", "") as
			| "notifications"
			| "access_only";
		const member = interaction.member as GuildMember;

		try {
			await assignDailyRole(member, preference);

			const embed = new EmbedBuilder()
				.setTitle("✅ Daily Preferences Set")
				.setDescription(
					preference === "notifications"
						? "You will now receive tagged daily notifications for new Waterstones events and have access to the daily notifications channel."
						: "You now have access to the daily notifications channel without being tagged in daily notifications.",
				)
				.setColor(0x00ff00);

			await interaction.update({
				embeds: [embed],
				components: [],
			});
		} catch (error) {
			console.error("[GetDailyAlertsCommand] Error assigning role:", error);

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

registerCommand(getDailyAlertsCommand);
