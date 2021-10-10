import BotHelper from './base/bot-helper.js';
import DiscordBotInformation from './model/discord-bot-information.js';

export default class DiscordBot extends BotHelper {
    static add(information) {
        const bot = new DiscordBot(
            new DiscordBotInformation(
                information.redirectUri,
                information.id,
                information.scope
            )
        );

        bot.reconnect().catch(console.error);
    }
}