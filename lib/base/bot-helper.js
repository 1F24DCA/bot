import fs from 'fs';

import OAuth2Helper from './oauth2-helper.js';

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
        let bot = this.getBot();
        if (bot !== null) this.destroy(bot);

        let body = await this.token(parameters);

        const token = body['access_token'];
        const tokenType = body['token_type'];
        const expiresIn = body['expires_in'];

        bot = this.#bot = await this.connect(token, tokenType);

        this.initialize(bot);

        setTimeout(() => {
            this.destroy(bot);

            this.reconnect().catch(console.error);
        }, 1000*expiresIn);

        console.log('Bot connected!');
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