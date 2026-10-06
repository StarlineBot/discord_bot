# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

넥슨 MMORPG "마비노기 모바일" 길드 운영·편의용 Discord 봇(섯다라인봇). Node.js + discord.js v14. 게임 정보 조회, 파티 모집/주간일정, 미니게임(턴제 전투·운세), 모드메일 등을 슬래시 명령으로 제공한다. 명령·이벤트 메타데이터와 사용자 대상 문구는 전부 한국어이므로, 코드 주석·커밋 메시지·신규 사용자 문구도 한국어로 작성한다.

## 명령어

```bash
npm start          # 봇 실행 (node index.js). 실행 전 .env 필요 (TOKEN 등)
npm run lint       # eslint --fix (eslint-config-standard, 자동 수정됨)
npm test           # jest (현재 tests/test.js 는 플레이스홀더 1개뿐)
npm test -- -t "테스트이름"   # 단일 테스트 실행 (jest -t 패턴)

# 전투 밸런스 시뮬레이터 (테스트 아님, 수동 실행)
node docs/battle-sim/game-balance-sim.js [반복수]
```

실행에 필요한 환경변수는 `.env.example` 참고: `NODE_ENV`(로컬=development / VM=production), `TOKEN`, `BOT_ID`, `NEXON_API_KEY`. 채널/길드/역할 ID는 더 이상 `.env`에 두지 않는다(아래 "길드 설정" 참고).

## 핵심 아키텍처

### 명령·이벤트 자동 로딩 (djs-commander)
`index.js`는 얇다. `djs-commander`의 `CommandHandler`가 `commands/`와 `events/`를 스캔해 자동 등록한다.
- `commands/*.js` — 파일 하나 = 슬래시 명령 하나. `data`(SlashCommandBuilder)와 `run({ interaction, client })`를 export. **명령 이름은 한국어**(예: `/요리`, `/파티모집`, `/듀얼`).
- `events/<이벤트명>/*.js` — 폴더명이 discord.js 이벤트명(`ready`, `interactionCreate`, `messageCreate`, `voiceStateUpdate` 등), 그 안의 각 파일이 핸들러. 한 이벤트에 여러 핸들러 파일이 병렬 존재한다(예: `events/ready/`에 cronJob·registerGuilds·setState 등).

새 명령을 추가하려면 `commands/`에 파일을 하나 만들면 되고, 별도 등록 코드는 없다.

### 버튼 상호작용 라우팅 (중요한 관례)
버튼은 `customId`로 핸들러를 구분한다. **두 가지 방식이 공존**하므로 주의:
- JSON customId — `events/interactionCreate/buttonReaction.js`가 `JSON.parse(customId)` 성공 시 `action` 필드로 분기(`bulkDelete`, `holyWater`, `duel` 등). 일부 기능은 여기서 자기 모듈로 위임(`holyWater.handleButton`, `battle.handleButton`).
- 파이프 구분 customId — 예: 주간일정의 `ws|...`. 이건 JSON.parse에서 예외가 나며, buttonReaction.js는 **조용히 return**해서 전용 핸들러(`events/interactionCreate/weeklySchedule.js`)가 처리하게 둔다.

따라서 새 버튼 핸들러를 추가할 때, customId가 JSON이 아니면 buttonReaction.js를 수정하지 않아도 되지만, JSON이면 그쪽 switch에 action을 추가한다.

### 길드(서버) 설정 — 3층 구조
멀티 길드를 지원하며, 설정은 성격에 따라 세 곳으로 나뉜다. (`config/guilds.js`는 제거됨 — 주석에 남은 언급은 레거시다.)
1. **`config/bot.js`** — 봇 전역(서버 무관) 고정값. `developerId`, `devGuildId`(dev cron이 건드릴 테스트 서버), `logChannelId`(헬스체크/에러 로그), `inquiryForumChannelId`(모드메일 포럼). git 커밋됨(비밀 아님).
2. **`modules/guildRegistry.js`** → `static/json/guildRegistry.json` — 봇이 들어간 길드의 신원(guildId/ownerId/name) 자동 스냅샷. `events/ready/registerGuilds.js`가 백필하여 자기치유된다. **gitignore라 머신별**이며 유실돼도 재구성됨.
3. **`modules/guildSettings.js`** → `static/json/guildSettings.json` — `/섯다라인설정` 등 명령으로 바뀌는 서버별 토글/채널값(`get/set(guildId, key, fallback)`). 역시 gitignore.

길드 신원 조회는 `modules/getGuildInfo.js`(registry 래핑), 명령 결과를 올릴 기본 채널 결정은 `modules/generalChannel.js`의 `resolveGeneralChannel(interaction)`(설정 채널 → 폴백 → 실행 채널 순, 항상 채널 반환). 새 명령에서 "어디에 결과를 올릴지"는 반드시 이 함수를 쓴다.

### 상태 저장
DB 없음. 영속 상태는 전부 `static/json/*.json` 파일(gitignore). 각 모듈이 `readAll/writeAll` 패턴으로 직접 읽고 쓴다(`guildSettings`, `guildRegistry`, 파티모집 보드 `partyRecruitBoard.json`, 랭킹 `RankingUtil` 등). 파일이 없을 때 `{}`로 폴백하는 관례를 지킨다.

### 스케줄링 (cron)
`events/ready/cronJob.js`가 봇 기동 시 cron 잡들을 건다. **dev/prod 분기 관례**: production은 실제 스케줄(예: `'0 07 * * *'`), development는 즉시 확인용으로 `'* * * * *'`(매분) 등으로 바꾼다. 시간대는 `luxon`으로 `Asia/Seoul` 고정. cron이 특정 길드만 건드려야 하면 `getDevGuildId()`를 기준으로 쓴다.

### 이미지 렌더링
사용자에게 보여주는 상당수 결과(요리정보, 주간일정 달력 등)는 텍스트가 아니라 **`@napi-rs/canvas`로 직접 그린 이미지**로 전송한다(`AttachmentBuilder`). 폰트는 `static/fonts/NanumGothic-*.ttf`, 아이콘은 `static/img/`. (과거 express+HTML→이미지 방식은 폐기됨 — `index.js` 하단 주석 참고.) devDependency의 puppeteer는 CI/배포에서 Chromium 다운로드를 건너뛴다.

### 게임 데이터
요리 데이터는 `modules/cookings.js`(생성물, lint 제외). `scripts/`의 일회성 스크립트로 재생성/갱신한다(`rebuild_cookings.js`, `update_cookings.js`, `update_stats.js`, `fetch_ogham.js` 등). 넥슨 오픈 API(`https://open.api.nexon.com`)를 `NEXON_API_KEY`로 호출하는 코드가 cron·경매 관련 모듈에 있다.

### 턴제 전투(`/듀얼`)
엔진·밸런스·UI가 전부 `modules/battle.js`에 있고, 버튼 처리도 `battle.handleButton`로 자기완결적이다. 설계·공식은 `docs/battle-game-design.md`에 최신 상태로 문서화돼 있으니 전투 로직 수정 전 반드시 읽는다.

### 모드메일
`modules/modmail.js` + `events/messageCreate/modmail.js` — 유저가 봇에 DM하면 `config/bot.js`의 `inquiryForumChannelId` 포럼에 유저별 포스트를 만들고, 포스트 답글을 유저 DM으로 relay한다.

## 배포 / CI

`.github/workflows/ci.yml`: main 브랜치 push/PR에서 `npm ci → lint → test` 실행. **main에 push될 때만** `appleboy/ssh-action`으로 GCP VM에 SSH 접속해 `git reset --hard origin/main` 후 `npm install --omit=dev`, pm2로 `discord-bot` 프로세스를 재시작(`ecosystem.config.js`). 즉 **main에 머지되면 곧바로 운영 봇이 교체된다**. lint/test가 깨지면 배포도 막힌다. (`appspec.yml` + `scripts/*-deploy.sh`는 AWS CodeDeploy용 레거시 경로.)

## 코드 스타일

eslint-config-standard(flat config, `eslint.config.mjs`). 세미콜론 없음, 들여쓰기 2칸, 작은따옴표. `scripts/`, `static/`, `docs/`, 생성물(`modules/cookings.js`)과 모든 `*.json`은 린트 제외. 커밋 전 `npm run lint`로 자동 정리한다.
