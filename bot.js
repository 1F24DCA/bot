import fs from 'fs';

import WebManager from './lib/base/web-manager.js';
import WebOption from './lib/base/model/web-option.js';

import BotInteraction from './lib/base/bot-interaction.js';
import TwitchBot from './lib/twitch-bot.js';
import DiscordBot from './lib/discord-bot.js';

// DB연결: 유저의 ID를 저장하여, 트위치와 디스코드간의 크로스플랫폼 데이터 공유 및 채팅 로그 기록 등
// 동적 명령어 C/R/U/D: 파일 분리 및 리프레시 엔드포인트 생성, 동적으로 명령어 추가, 조회, 수정, 삭제가 가능하도록 작성
// 트윕/투네이션 API 엮어서 통합관리 시스템 구축: https://twip.kr/api/event 등...
// Express 관련 모듈 사용을 좀 더 단순하게 다룰수 있게 만드는 클래스 (Static 메서드로만 구성) 생성
// 토큰 발급 시 access_token 없으면 뭔가 문제가 있는 것, 이것을 예외로 떨굼
// 몰라 기억안나 나중에 써야지~

const option = new WebOption();
option.setDomain('http://localhost');
option.setManagerPort(9999);

if (process.platform === 'linux') {
    option.setDomain('https://shiba.firstfloor.pe.kr');
    option.setSslOption({
        key: fs.readFileSync('/etc/letsencrypt/live/shiba.firstfloor.pe.kr/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/shiba.firstfloor.pe.kr/cert.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/shiba.firstfloor.pe.kr/chain.pem')
    });

    console.log('Linux detected, changing properties to production setting');
}

WebManager.initialize(option);

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
    redirectUri: `${WebManager.getDomain()}:${WebManager.getManagerPort()}/login/twitch/vv0bl9s6i4mcorbj8u2xnyxc1g42d3/process`,
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
    redirectUri: `${WebManager.getDomain()}:${WebManager.getManagerPort()}/login/discord/538667375537684481/process`,
    id: '538667375537684481',
    scope: [
        // 'webhook.incoming', // FIXME 웹훅 지우는 법 찾아볼 것
        'messages.read'
    ]
});