import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { handleInitializeButtonInteraction } from "../handlers/initialize-buttons-handler";

export const initializeCommand = new SlashCommandBuilder()
	.setName("initialize")
	.setDescription("Set up your DanBot event notification preferences");

export async function handleInitializeCommand(
	interaction: ChatInputCommandInteraction,
) {
	const embed = new EmbedBuilder()
		.setTitle("🔔 DanBot Event Notifications")
		.setDescription("Choose your notification preference for new events:")
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

	const response = await interaction.reply({
		embeds: [embed],
		components: [row],
		ephemeral: true,
	});

	// Handle button interactions for this specific message and user
	try {
		const buttonInteraction = await response.awaitMessageComponent({
			filter: (i) => i.user.id === interaction.user.id && i.isButton(),
			time: 60_000, // 1 minute timeout
		});

		if (buttonInteraction.isButton()) {
			await handleInitializeButtonInteraction(buttonInteraction);
		}
	} catch (error) {
		// Timeout or other error - disable buttons
		const timeoutEmbed = new EmbedBuilder()
			.setTitle("⏰ Interaction Timeout")
			.setDescription(
				"This interaction has expired. Please run `/initialize` again.",
			)
			.setColor(0xff0000);

		await interaction.editReply({
			embeds: [timeoutEmbed],
			components: [],
		});
	}
}
