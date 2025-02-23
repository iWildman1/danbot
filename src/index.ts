import {
  Client,
  GatewayIntentBits,
  ChannelType,
  type TextChannel,
} from 'discord.js';
import { CronJob } from 'cron';
import { env } from './env';
import { getEventsList } from './events';

const CHUNK_SIZE = 1500;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.login(env.DISCORD_TOKEN);

let channel: TextChannel;

// Create the scheduled task but don't start it running straight away
// Runs every 30m between 7am and 10pm - https://crontab.guru/#*/30_7-22_*_*_*
const job = new CronJob('*/15 7-22 * * *', checkForEventsAndSend, null, false);

// Boot up the Discord integration and start the scheduler
client.on('ready', () => {
  const internalChannel = client.channels.cache.get(env.DISCORD_CHANNEL);

  if (internalChannel?.type !== ChannelType.GuildText) {
    throw new Error(
      'The targeted channel must be a text channel. DanBot cannot work with any other kind of channel'
    );
  }

  channel = internalChannel;

  // If we're in development mode, only run the scan once - Don't schedule anything
  if (env.NODE_ENV === 'development') {
    console.log('[DanBot] Running in development mode. Firing one-off scan...');

    checkForEventsAndSend();

    return;
  }

  job.start();
});

async function checkForEventsAndSend() {
  console.log(`[DanBot] Starting event scan at ${new Date().toString()}.`);

  const events = await getEventsList();

  // Send a full response if we did get a list
  if (events.length > 0) {
    sendEventsResponse(events);
  }

  console.log(
    `[DanBot] Successfully ran event scan at ${new Date().toString()}. Detected ${
      events.length
    } new events`
  );
}

function sendEventsResponse(events: Awaited<ReturnType<typeof getEventsList>>) {
  const eventTitles = events.map((event) => `- ${event.name.text}\n`).join('');

  // Discord has a max message size of 2,000 characters - We need to split our message into
  // multiple message chunks to stay under this
  const chunkedTitles: string[] = [];
  let currentChunk = 0;

  while (currentChunk < eventTitles.length) {
    chunkedTitles.push(
      eventTitles.substring(currentChunk, currentChunk + CHUNK_SIZE)
    );
    currentChunk += CHUNK_SIZE;
  }

  // If we're in staging or development, just log the events to the console instead of sending them to Discord
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'staging') {
    console.log(
      `[DanBot] Waterstones Eventbrite search complete.**\nFound ${events.length} events:`
    );

    chunkedTitles?.forEach((chunk) => {
      if (chunk.length > 0) console.log(chunk);
    });

    return;
  }

  channel.send(
    `<@${env.DISCORD_TAG_ID}>\n**Waterstones Eventbrite search complete.**\nFound ${events.length} events:`
  );

  chunkedTitles?.forEach((chunk) => {
    if (chunk.length > 0) channel.send(chunk);
  });
}
