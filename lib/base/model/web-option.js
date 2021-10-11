export default class WebOption {
    #domain = 'http://localhost';
    getDomain() { return this.#domain; }
    setDomain(domain) {
        if (typeof domain !== 'string' || !domain.match('https?://[^/#%=]+')) throw 'Wrong value of parameter: domain';
        this.#domain = domain;
    }

    #webPort = null;
    getWebPort() {
        if (this.#webPort !== null) {
            return this.#webPort;
        } else if (this.getSslOption() !== null) {
            return 443;
        } else {
            return 80;
        }
    }
    setWebPort(webPort) {
        if (typeof webPort !== 'number') webPort = null;
        this.#webPort = webPort;
    }

    #managerPort = null;
    hasManagerPort() { return this.#managerPort !== null; }
    getManagerPort() {
        if (this.hasManagerPort()) {
            return this.#managerPort;
        } else {
            return this.getWebPort();
        }
    }
    setManagerPort(managerPort) {
        if (typeof managerPort !== 'number') managerPort = null;
        this.#managerPort = managerPort;
    }

    #sslOption = null;
    getSslOption() { return this.#sslOption; }
    setSslOption(sslOption) {
        if (typeof sslOption !== 'object') sslOption = null;
        this.#sslOption = sslOption;
    }
}