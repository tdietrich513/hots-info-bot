# hots-info-bot
Discord chatbot for helpfully providing Heroes of the Storm skill and talent information in chat

## Usage

Place double square brackes around the search, like so: `[[search]]`. The search can be anywhere in a message, and you can even perform more than one search per message.

### Talent or Skill Searches
Search for a talent or skill by surrounding your search with double square brackes. 

For example: `[[haunting wave]]`.

### Hero Talent Tier Searches 
Display a Hero's talent tier by searching for the hero's name (or part of it) followed by the tier level.

For example `[[Hammer 10]]`.

### Notes:
The bot will only search for the first four items in any given message. If there are too many results for any given search, the bot will attempt to truncate the results to avoid spamming the channel.

Game information sourced from https://github.com/heroespatchnotes/heroes-talents and will only be as accurate as that repo is.
