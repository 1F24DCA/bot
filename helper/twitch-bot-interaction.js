import BotInteraction from './base/bot-interaction.js';

export default class TwitchBotInteraction extends BotInteraction {
    emote(text) {
        if (text.match('^(?:Wink|Jookchang|Jeoleon|AwesomeFace)$')) text = `fstflr${text}`;

        return text;
    }
}