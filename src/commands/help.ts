import type { Command } from "@/types/commands";
import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";

export const helpCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Learn about DanBot and how to use it"),

	async execute(interaction: ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle("📚 DanBot")
			.setDescription(
				"I keep an eye on Waterstones events and let you know when new ones pop up!",
			)
			.addFields(
				{
					name: "What I do",
					value:
						"I check Eventbrite every so often for new Waterstones events and post them here. Only upcoming events - no point in telling you about stuff that's already happened.",
					inline: false,
				},
				{
					name: "Getting notifications",
					value:
						"**Instant alerts**: Every 15 minutes between 7am-10pm\n**Daily digest**: Once a day at 7pm\n\nRun the commands below to choose what works for you.",
					inline: false,
				},
				{
					name: "Commands",
					value:
						"`/get-instant-alerts` - Get pinged as soon as new events are found\n`/get-daily-alerts` - Get a daily summary of what's new\n`/help` - This message",
					inline: false,
				},
				{
					name: "How it works",
					value:
						"Run one of the alert commands and pick whether you want to be tagged in notifications or just have access to see them. You can change your mind anytime.",
					inline: false,
				},
			)
			.setColor(0x5865f2);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};
