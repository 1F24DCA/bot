import express from 'express';

import BotHelper from './bot-helper.js';

const botRouter = express.Router();

botRouter.get('/', (request, response) => {
	response.send('Hello, world!');
});

botRouter.get('/login/:platform/:id', (request, response) => {
	const platform = request.params.platform;
	const id = request.params.id;

	response.redirect(BotHelper.get(platform, id).authorize());
});

botRouter.get('/login/:platform/:id/process', (request, response) => {
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

export default botRouter;