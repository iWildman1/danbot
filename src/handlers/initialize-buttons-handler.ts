import {
	type ButtonInteraction,
	EmbedBuilder,
	type GuildMember,
} from "discord.js";
import { assignRole } from "../services/role-manager";

export async function handleInitializeButtonInteraction(
	interaction: ButtonInteraction,
) {
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
		console.error("[InitializeButton] Error assigning role:", error);

		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred.";

		const errorEmbed = new EmbedBuilder()
			.setTitle("❌ Error")
			.setDescription(errorMessage)
			.setColor(0xff0000);

		await interaction.update({
			embeds: [errorEmbed],
			components: [],
		});
	}
}
