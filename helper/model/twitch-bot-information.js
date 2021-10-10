import tmijs from 'tmi.js';

import BotInformation from '../base/model/bot-information.js';
import TwitchBotInteraction from '../interaction/twitch-bot-interaction.js';

export default class TwitchBotInformation extends BotInformation {
    constructor(redirectUri, id, scope, username, channel) {
        super('twitch', 'https://id.twitch.tv', redirectUri, id, scope, async function(token) {
            const twitch = new tmijs.client({
                identity: {
                    username: username,
                    password: token,
                },
                channels: [channel]
            });

            await twitch.connect();
            return twitch;
        }, function(twitch) {
            const interaction = new TwitchBotInteraction(this);
            twitch.on('message', (channel, user, message, self) => {
                if (self) return;

                const reaction = interaction.onMessage(message, user.username);
                if (typeof reaction === 'string' && reaction.length > 0) {
                    twitch.say(channel, reaction);
                }
            });
        }, function(twitch) { twitch.disconnect() });
    }
}