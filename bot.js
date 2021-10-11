import express from 'express';
import https from 'https';
import fs from 'fs';

import botManagementRouter from './lib/base/router/bot-management-router.js';

import BotInteraction from './lib/base/bot-interaction.js';
import TwitchBot from './lib/twitch-bot.js';
import DiscordBot from './lib/discord-bot.js';

// DB연결: 유저의 ID를 저장하여, 트위치와 디스코드간의 크로스플랫폼 데이터 공유 및 채팅 로그 기록 등
// 동적 명령어 C/R/U/D: 파일 분리 및 리프레시 엔드포인트 생성, 동적으로 명령어 추가, 조회, 수정, 삭제가 가능하도록 작성
// 트윕/투네이션 API 엮어서 통합관리 시스템 구축: https://twip.kr/api/event 등...
// Express 관련 모듈 사용을 좀 더 단순하게 다룰수 있게 만드는 클래스 (Static 메서드로만 구성) 생성
// 몰라 기억안나 나중에 써야지~

let httpsServerOptions = null;
let domain = 'http://localhost';
let webPort = 80;
let managementPort = 9999;

if (process.platform === 'linux') {
    httpsServerOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/shiba.firstfloor.pe.kr/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/shiba.firstfloor.pe.kr/cert.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/shiba.firstfloor.pe.kr/chain.pem')
    };
    domain = 'https://shiba.firstfloor.pe.kr';
    webPort = 443;

    console.log('Linux detected, changing properties to production setting');
}


let barkCount = 0;

BotInteraction.empty();
BotInteraction.add(['!명령어', '!도움'], () => `멀랑!`);
BotInteraction.add(['!시간', '!날짜'], () => `${new Date()}`);
BotInteraction.add(['ㅋ'], (info, interaction) => interaction.emote('AwesomeFace'));
BotInteraction.add(['멍멍', '컹컹'], () => {
    barkCount += 1;
    return `왈왈 ${barkCount}트`;
});
BotInteraction.add(['twitch:fstflrWink', 'discord:fstflrWink', 'discord:localWink'], (info, interaction) => interaction.emote('Wink'));
BotInteraction.add(['twitch:fstflrJookchang', 'discord:fstflrJookchang', 'discord:localJookchang'], () => `아파!`);
BotInteraction.add(['twitch:fstflrJeoleon', 'discord:fstflrJeoleon', 'discord:localJeoleon'], () => `아구 저런~`);
BotInteraction.add(['twitch:fstflrAwesomeFace', 'discord:fstflrAwesomeFace', 'discord:localAwesomeFace'], () => `ㅋ`);
BotInteraction.add(['discord:localFloorTrail'], (info, interaction) => interaction.emote('FloorTrail'));

TwitchBot.add({
    redirectUri: `${domain}:9999/login/twitch/vv0bl9s6i4mcorbj8u2xnyxc1g42d3/process`,
    id: 'vv0bl9s6i4mcorbj8u2xnyxc1g42d3',
    scope: [
        'channel:manage:broadcast',
        'channel:moderate',
        'chat:edit',
        'chat:read',
        'whispers:read',
        'whispers:edit'
    ],
    username: 'bot_shiba_inu',
    channel: 'fstflr446712'
});

DiscordBot.add({
    redirectUri: `${domain}:9999/login/discord/538667375537684481/process`,
    id: '538667375537684481',
    scope: [
        // 'webhook.incoming', // FIXME 웹훅 지우는 법 찾아볼 것
        'messages.read'
    ]
});

let web = express();
web.get('/', (request, response) => response.send('Hello, world!'));

if (httpsServerOptions !== null) web = https.createServer(httpsServerOptions, web);
web.listen(webPort, () => console.log(`web server running in port ${webPort}`));

let management = express();
management.get('/', (request, response) => response.redirect(domain));
management.use('/', botManagementRouter);

if (httpsServerOptions !== null) management = https.createServer(httpsServerOptions, management);
management.listen(managementPort, () => console.log(`management server running in port ${managementPort}`));