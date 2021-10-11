export default class OAuth2Information {
    #domain = null;
    getDomain() { return this.#domain; }

    #redirectUri = null;
    getRedirectUri() { return this.#redirectUri; }

    #id = null;
    getId() { return this.#id; }

    #secret = null;
    getSecret() { return this.#secret; }
    setSecret(secret) { this.#secret = secret; }

    #refreshToken = null;
    getRefreshToken() { return this.#refreshToken; }
    setRefreshToken(refreshToken) { this.#refreshToken = refreshToken; }

    #scopeList = null;
    getScope() { return Array.isArray(this.#scopeList) ? this.#scopeList.join('%20') : ''; }
    addScope(scope) {
        if (!Array.isArray(this.#scopeList)) this.#scopeList = [];
        this.#scopeList.push(scope);
    }

    constructor(domain, redirectUri, id, scopeList) {
        if (typeof domain !== 'string' || !domain.match('https?://[^/#%=]+')) throw 'Wrong value of parameter: domain';
        if (typeof redirectUri !== 'string' || !redirectUri.match('https?://[^/#%=]+')) throw 'Wrong value of parameter: redirectUri';
        if (typeof id !== 'string' || id.length == 0) throw 'Wrong value of parameter: id';

        this.#domain = domain;
        this.#redirectUri = redirectUri;
        this.#id = id;
        this.#scopeList = scopeList;
    }
}