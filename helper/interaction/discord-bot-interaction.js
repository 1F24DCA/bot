import BotInteraction from './base/bot-interaction.js';

export default class DiscordBotInteraction extends BotInteraction {
    emote(text) {
        if (text.match('^(?:Wink|Jookchang|Jeoleon|AwesomeFace)$')) text = `local${text}`;

        const emoji = this.getBotHelper().getBot().emojis.cache.find(emoji => emoji.name === `${text}`);
        if (emoji !== undefined) {
            return emoji.toString();
        } else {
            return null;
        }
    }
}