# DanBot

This is my incredibly dumb, incredibly basic little weekend project that scans for any new events from Waterstones and sends them to Discord. It's not really meant for anything other than that - If you're looking at this code for any kind of production-related reasons, you really probably shouldn't!

## Why though?

My fiancée likes to read, and missed out on a few events with authors that she really likes. So, as a bit of fun, I made this script for her birthday that warns her whenever any new events get scheduled so that she's less likely to miss out in future :).

### But you can already do this with a mailing list/Eventbrite???!!!1

I know. I wouldn't be a real programmer if I didn't spend a couple hours making something myself instead of using something that already exists in like 5 minutes 🤷

## How does it work?

It hits the Eventbrite API, loops through pagination to get a list of all possible events, checks to see whether they've already been seen before and then sends Discord notifications via a "bot" whenever a new event is detected. It runs on a cron job every 15 minutes between 7am and 10pm (because otherwise I get notifications when I'd rather be sleeping).

There's some Discord-related weirdness in there that splits the list into multiple messages to avoid character-count limits, but nothing fancy.

All-in-all, very basic, very "ronseal" - It Does What It Says On The Tin.
