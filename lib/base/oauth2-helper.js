import fetch from 'node-fetch';
import fs from 'fs';

export default class OAuth2Helper {
    #information = null;
    getInformation() { return this.#information; }

    constructor(information) {
        // if () throw ''; // FIXME information class가 맞는지 검사

        this.#information = information;
    }
    
    authorize() {
        const domain = this.getInformation().getDomain();
        const redirectUri = this.getInformation().getRedirectUri();
        const id = this.getInformation().getId();
        const scope = this.getInformation().getScope();

        return `${domain}/oauth2/authorize?client_id=${id}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
    }

    async token(parameters) {
        if (typeof parameters !== 'object' || typeof parameters.grant_type !== 'string') throw 'Wrong value of parameter: parameters';

        const domain = this.getInformation().getDomain();
        const redirectUri = this.getInformation().getRedirectUri();
        const id = this.getInformation().getId();
        const secret = this.getInformation().getSecret();

        let properties = [];
        Object.entries(parameters).forEach(([key, value]) => {
            properties.push(`${key}=${value}`);
        });
        if (parameters.grant_type === 'authorization_code') {
            properties.push(`redirect_uri=${redirectUri}`);
        }

        const queries = properties.join('&');

        let response = await fetch(`${domain}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `client_id=${id}&client_secret=${secret}&${queries}`
        }); let body = await response.json();

        return body;
    }
}