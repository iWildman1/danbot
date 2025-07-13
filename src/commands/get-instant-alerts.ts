import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type GuildMember,
	SlashCommandBuilder,
} from "discord.js";
import { assignRole } from "../services/role-manager";
import type { Command, ComponentInteraction } from "../types/commands";
import { registerCommand } from "./registry";

const getInstantAlertsCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("get-instant-alerts")
		.setDescription("Set up your DanBot event notification preferences"),

	async execute(interaction: ChatInputCommandInteraction) {
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
				.setCustomId("notifications")
				.setLabel("🔔 Get Notifications")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("access_only")
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
			["notifications", "access_only"].includes(interaction.customId)
		);
	},

	async handleInteraction(interaction: ComponentInteraction) {
		const preference = interaction.customId as "notifications" | "access_only";
		const member = interaction.member as GuildMember;

		try {
			await assignRole(member, preference);

			const embed = new EmbedBuilder()
				.setTitle("✅ Preferences Set")
				.setDescription(
					preference === "notifications"
						? "You will now receive tagged notifications for new Waterstones events and have access to the instant notifications channel."
						: "You now have access to the instant notifications channel without being tagged in notifications.",
				)
				.setColor(0x00ff00);

			await interaction.update({
				embeds: [embed],
				components: [],
			});
		} catch (error) {
			console.error("[GetInstantAlertsCommand] Error assigning role:", error);

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

registerCommand(getInstantAlertsCommand);
