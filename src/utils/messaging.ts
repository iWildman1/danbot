import type { TextChannel } from "discord.js";
import { env } from "@/env";
import type { getEventsList } from "@/services/events";

const CHUNK_SIZE = 1500;

export function createEventMessage(
  events: Awaited<ReturnType<typeof getEventsList>>,
  roleId: string
) {
  const eventTitles = events.map((event) => `- ${event.name.text}\n`).join("");
  const header = `<@&${roleId}>\n**Waterstones Eventbrite search complete.**\nFound ${events.length} events:`;
  return { header, eventTitles };
}

export async function chunkAndSendMessage(
  targetChannel: TextChannel,
  eventTitles: string,
  roleId: string
) {
  const chunkedTitles: string[] = [];
  let currentChunk = 0;

  while (currentChunk < eventTitles.length) {
    chunkedTitles.push(
      eventTitles.substring(currentChunk, currentChunk + CHUNK_SIZE)
    );
    currentChunk += CHUNK_SIZE;
  }

  for (const chunk of chunkedTitles || []) {
    if (chunk.length > 0) await targetChannel.send(`<@&${roleId}>\n${chunk}`);
  }
}

export function logEventNotification(
  events: Awaited<ReturnType<typeof getEventsList>>,
  roleId: string,
  channelId: string,
  type: "instant" | "daily" = "instant"
) {
  const { header, eventTitles } = createEventMessage(events, roleId);

  console.log(`[DanBot DEV] Would send ${type} Discord notification:`);
  console.log(`[DanBot DEV] Role mention: <@&${roleId}>`);
  console.log(`[DanBot DEV] Channel: ${channelId}`);
  console.log(`[DanBot DEV] Header: ${header}`);
  console.log(`[DanBot DEV] Events:\n${eventTitles}`);
}

export async function sendEventNotification(
  events: Awaited<ReturnType<typeof getEventsList>>,
  channel: TextChannel,
  roleId: string,
  channelId: string,
  type: "instant" | "daily" = "instant"
) {
  if (env.NODE_ENV === "development") {
    logEventNotification(events, roleId, channelId, type);
    return;
  }

  const { header, eventTitles } = createEventMessage(events, roleId);
  await channel.send(header);
  await chunkAndSendMessage(channel, eventTitles, roleId);
}
