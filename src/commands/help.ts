import type { Command } from "@/types/commands";
import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { registerCommand } from "./registry";

const helpCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Learn about DanBot and how to use it"),

	async execute(interaction: ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle("🤖 DanBot - Book Event Notifications")
			.setDescription(
				"DanBot monitors Waterstones events from Eventbrite and sends Discord notifications to keep you updated about new bookshop events",
			)
			.addFields(
				{
					name: "📅 What DanBot Does",
					value:
						"• Monitors Waterstones events from Eventbrite API\n• Sends notifications for new events\n• Filters out past events, only showing live/future ones",
					inline: false,
				},
				{
					name: "🔔 Notification Types",
					value:
						"**Instant Alerts**: Every 15 minutes (7am-10pm)\n**Daily Alerts**: Once daily at 7pm\n\nUse the commands below to set your preferences!",
					inline: false,
				},
				{
					name: "⚙️ Available Commands",
					value:
						"• `/get-instant-alerts` - Set up instant notification preferences\n• `/get-daily-alerts` - Set up daily notification preferences\n• `/help` - Show this help message",
					inline: false,
				},
				{
					name: "🎯 How to Get Notifications",
					value:
						"1. Use `/get-instant-alerts` or `/get-daily-alerts`\n2. Choose your preference:\n   - 🔔 **Get Notifications**: Access + tagged in alerts\n   - 👁️ **Access Only**: Access without being tagged\n3. You'll be added to the appropriate channel!",
					inline: false,
				},
				{
					name: "💡 Tips",
					value:
						"• You can change your preferences anytime\n• Use both instant and daily alerts for full coverage\n• The bot runs automatically - no need to do anything else!",
					inline: false,
				},
			)
			.setColor(0x5865f2)
			.setFooter({
				text: "DanBot keeps you connected to author events",
			});

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};

registerCommand(helpCommand);
