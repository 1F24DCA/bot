import express from 'express';
import https from 'https';

import BotHelper from "./bot-helper.js";

const managerRouter = express.Router();
managerRouter.get('/login/:platform/:id', (request, response) => {
    const platform = request.params.platform;
    const id = request.params.id;

    response.redirect(BotHelper.get(platform, id).authorize());
});
managerRouter.get('/login/:platform/:id/process', (request, response) => {
    const platform = request.params.platform;
    const id = request.params.id;

    const code = request.query.code;

    BotHelper.get(platform, id).connect({
        grant_type: 'authorization_code',
        code: code
    }).then(() => {
        response.redirect('/');
    }).catch(reason => {
        console.error(reason);
        response.send('Failed');
    });
});

export default class WebManager {
    static #option = null;
    static getDomain() { return this.#option.getDomain(); }
    static getManagerPort() { return this.#option.getManagerPort(); }

    static #web = null;
    static #manager = null;

    static initialize(option) {
        let web = WebManager.#web;
        let manager = WebManager.#manager;

        WebManager.#option = option;

        if (web !== null) web.close();
        if (manager !== null) manager.close();

        web = WebManager.#web = express();
        web.get('/', (request, response) => response.write('Hello, world!'));
        if (option.hasManagerPort()) {
            manager = WebManager.#manager = express();
            manager.get('/', (request, response) => {
                const domain = option.getDomain();
                const port = option.getWebPort();
    
                response.redirect(`${domain}:${port}`);
            });
        } else {
            manager = web;
        }

        manager.use('/', managerRouter);

        web = WebManager.#web = WebManager.listen(web, option.getWebPort(), option.getSslOption());
        if (option.hasManagerPort()) {
            manager = WebManager.#manager = WebManager.listen(manager, option.getManagerPort(), option.getSslOption());
        }
    }

    static listen(object, port, sslOption) {
        if (sslOption !== null) {
            object = https.createServer(sslOption, object);
        }

        return object.listen(port, () => console.log(`server running in port ${port}`));
    }
}

export class WebOption {
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