import tmijs from 'tmi.js';

import BotHelper, { BotInformation, BotInteraction } from './base/bot-helper.js';

export default class TwitchBot extends BotHelper {
    static add(parameters) {
        const botInformation = new TwitchBotInformation(
            parameters.redirectUri,
            parameters.id,
            parameters.scope,
            parameters.username,
            parameters.channel
        );

        const botHelper = new TwitchBot(botInformation);
        botHelper.reconnect().catch(console.error);
    }

    async connectBot(token) {
        const username = this.getInformation().getUsername();
        const channel = this.getInformation().getChannel();

        const twitch = new tmijs.client({
            identity: {
                username: username,
                password: token,
            },
            channels: [channel]
        });

        await twitch.connect();
        return twitch;
    }

    initializeBot(twitch) {
        const interaction = new TwitchBotInteraction(this);
        twitch.on('message', (channel, user, message, self) => {
            if (self) return;

            const reaction = interaction.onMessage(message, user.username);
            if (typeof reaction === 'string' && reaction.length > 0) {
                twitch.say(channel, reaction);
            }
        });
    }

    destroyBot(twitch) {
        twitch.disconnect();
    }
}

class TwitchBotInformation extends BotInformation {
    #username = null;
    getUsername() { return this.#username; }

    #channel = null;
    getChannel() { return this.#channel; }

    constructor(redirectUri, id, scope, username, channel) {
        super('twitch', 'https://id.twitch.tv', redirectUri, id, scope);

        this.#username = username;
        this.#channel = channel;
    }
}

class TwitchBotInteraction extends BotInteraction {
    emote(text) {
        if (text.match('^(?:Wink|Jookchang|Jeoleon|AwesomeFace)$')) text = `fstflr${text}`;

        return text;
    }
}