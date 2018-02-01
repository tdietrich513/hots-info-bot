import { Message, GuildChannel } from "discord.js";


export default function canUseEmbeds(message: Message): boolean {
  let useEmbeds = true;

  if (message.channel instanceof GuildChannel) {
      const me = message.client.user;
      const myPermissions = message.channel.permissionsFor(me);
      useEmbeds = myPermissions.has("EMBED_LINKS");
  }

  return useEmbeds;
}