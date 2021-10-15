import fs from 'fs';

import OAuth2Helper, { OAuth2Information } from './oauth2-helper.js';

export default class BotHelper extends OAuth2Helper {
    static #botHelperList = {};
    static get(platform, id) {
        return BotHelper.#botHelperList[`${platform}:${id}`];
    }

    #bot = null;
    getBot() { return this.#bot; }

    constructor(information) {
        super(information);

        // if () throw ''; // FIXME information class가 맞는지 검사
        
        const secretPath = this.getInformation().getSecretPath();
        const refreshTokenPath = this.getInformation().getRefreshTokenPath();
        const platform = this.getInformation().getPlatform();
        const id = this.getInformation().getId();

        this.getInformation().setSecret(fs.readFileSync(secretPath, 'utf-8'));

        if (fs.existsSync(refreshTokenPath)) {
            this.getInformation().setRefreshToken(fs.readFileSync(refreshTokenPath, 'utf-8'));
        }

        BotHelper.#botHelperList[`${platform}:${id}`] = this;
    }

    async connect(parameters) {
        const refreshTokenPath = this.getInformation().getRefreshTokenPath();

        let bot = this.getBot();
        if (bot !== null) this.destroyBot(bot);

        let body = await this.token(parameters);

        const token = body['access_token'];
        const tokenType = body['token_type'];
        const expiresIn = body['expires_in'];
        const refreshToken = body['refresh_token'];

        bot = this.#bot = await this.connectBot(token, tokenType);

        this.initializeBot(bot);

        setTimeout(() => {
            this.destroyBot(bot);

            this.reconnect().catch(console.error);
        }, 1000*expiresIn);
        
        console.log('Bot connected!');
        
        fs.writeFileSync(refreshTokenPath, refreshToken);

        return bot;
    }

    async reconnect() {
        const refreshTokenPath = this.getInformation().getRefreshTokenPath();
        if (!fs.existsSync(refreshTokenPath)) {
            console.error('No refresh token exists');
            return;
        }

        try {
            return await this.connect({
                grant_type: 'refresh_token',
                refresh_token: fs.readFileSync(refreshTokenPath, 'utf8')
            });
        } catch (reason) {
            fs.rmSync(refreshTokenPath);

            throw reason;
        }
    }
}

export class BotInformation extends OAuth2Information {
    #platform = null;
    getPlatform() { return this.#platform; }

    #refreshToken = null;
    getRefreshToken() { return this.#refreshToken; }
    setRefreshToken(refreshToken) { this.#refreshToken = refreshToken; }

    constructor(platform, domain, redirectUri, id, scope) {
        super(domain, redirectUri, id, scope);

        if (typeof platform !== 'string' || platform.length === 0) throw 'Wrong value of parameter: platform';

        this.#platform = platform;
    }

    getSecretPath() {
        const cwd = process.cwd().replace('\\', '/');
        const platform = this.getPlatform();
        const id = this.getId();

        return `${cwd}/data/secret/${platform}-${id}.txt`;
    }

    getRefreshTokenPath() {
        const cwd = process.cwd().replace('\\', '/');
        const platform = this.getPlatform();
        const id = this.getId();

        return `${cwd}/data/refresh/${platform}-${id}.txt`;
    }
}

export class BotInteraction {
    static #interactionList = [];
    static empty() {
        BotInteraction.#interactionList = [];
    }
    static add(command, reaction) {
        BotInteraction.#interactionList.push({
            command: command,
            reaction: reaction
        });
    }

    #botHelper = null;
    getBotHelper() { return this.#botHelper; }

    constructor(botHelper) {
        this.#botHelper = botHelper;
    }

    onMessage(message, caller) {
        let result = null;

        const platform = this.getBotHelper().getInformation().getPlatform();
        const bot = this.getBotHelper().getBot();

        BotInteraction.#interactionList.forEach(interaction => {
            interaction.command.forEach(knownCommand => {
                if (result !== null) return; // result가 정해졌다면 모든 forEach문 생략

                const inputArguments = message.split(' ');
                const inputCommand = inputArguments.shift();

                if (knownCommand.match('^(.+?):.+$')) {
                    const emotePlatform = /^(.+?):.+$/g.exec(knownCommand)[1];
                    if (emotePlatform === platform) {
                        knownCommand = knownCommand.replace(`${emotePlatform}:`, '');
                    } else { return; } // 타 플랫폼의 명령어는 무시 (foreach element 하나를 빠져나감)
                }

                if (typeof this.emote !== undefined) {
                    const emote = this.emote(knownCommand);
                    if (typeof emote === 'string' && emote.length > 0) {
                        knownCommand = `${emote}`;
                    }
                }

                if (inputCommand === knownCommand) {
                    const info = {
                        [platform]: bot,
                        args: inputArguments,
                        caller: caller
                    };

                    result = interaction.reaction(info, this);
                }
            });
        });

        return result;
    }
}