import express from 'express';

import BotHelper from '../bot-helper.js';

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

export default managerRouter;