import BotHelper from './base/bot-helper.js';
import TwitchBotInformation from './model/twitch-bot-information.js';

export default class TwitchBot extends BotHelper {
	static add(information) {
		const bot = new TwitchBot(
			new TwitchBotInformation(
				information.redirectUri,
				information.id,
				information.scope,
				information.username,
				information.channel
			)
		);

		bot.reconnect().catch(console.error);
	}
}