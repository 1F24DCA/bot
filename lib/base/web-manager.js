import express from 'express';
import https from 'https';

import managerRouter from './router/manager-router.js';

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