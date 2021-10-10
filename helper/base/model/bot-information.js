import OAuth2Information from './oauth2-information.js';

export default class BotInformation extends OAuth2Information {
    #platform = null;
    getPlatform() { return this.#platform; }

    #connectFunction = null;
    getConnectFunction() { return this.#connectFunction; }

    #initializeFunction = null;
    getInitializeFunction() { return this.#initializeFunction; }

    #destroyFunction = null;
    getDestroyFunction() { return this.#destroyFunction; }

    constructor(platform, domain, redirectUri, id, scope, connectFunction, initializeFunction, destroyFunction) {
		super(domain, redirectUri, id, scope);
        
		if (typeof connectFunction !== 'function') throw 'Wrong value of parameter: connectFunction';
		if (typeof initializeFunction !== 'function') throw 'Wrong value of parameter: initializeFunction';
		if (typeof destroyFunction !== 'function') throw 'Wrong value of parameter: destroyFunction';

        this.#platform = platform;
        this.#connectFunction = connectFunction;
        this.#initializeFunction = initializeFunction;
        this.#destroyFunction = destroyFunction;
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