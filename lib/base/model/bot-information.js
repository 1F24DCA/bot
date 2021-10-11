import OAuth2Information from './oauth2-information.js';

export default class BotInformation extends OAuth2Information {
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