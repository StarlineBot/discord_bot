# 명령어 사용량 기록 (기획·미구현)

> 상태: 기획, 구현 대기. "기본안"은 구현 전 확인.
> 기준 코드: `main` `423de6b`, djs-commander 0.0.50

## 1. 목적

슬래시 명령(디스코드 "앱 명령어")이 **정상 실행될 때마다** 서버(VM)의 JSON 파일에 횟수를 쌓아, 어떤 명령이 얼마나 쓰이는지 본다.
- 안 쓰이는 명령 정리 판단(예: `/튼주`는 "사용량이 적어" 비활성화됐지만 근거 데이터가 없었다)
- 주간 기능 소개(`docs/support-server-spotlight-plan.md`)에서 **덜 쓰이는 명령을 우선 소개**하는 근거
- 에러가 잦은 명령 발견

현재 코드엔 사용량 기록이 없다(`!현황`은 서버별 설정·애드온 사용자만 보여줌).

## 2. "정상 실행"을 잡는 위치

djs-commander는 명령을 이렇게 실행한다(`dist/index.js` `_handleCommands`):
```js
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  const command = this._commands.find(cmd => cmd.name === interaction.commandName)
  await command.run({ interaction, client, handler })   // 예외는 잡지 않음
})
```
- `_commands`는 `new CommandHandler()` **생성자 안에서 동기로** 채워지고, `run`은 `await`로 끝까지 기다린다.
- 따라서 `index.js`에서 핸들러를 만든 직후 **각 명령의 `run`을 감싸면** 명령 파일을 하나도 고치지 않고 성공/실패를 잡을 수 있다.

```js
// index.js (개념)
const handler = new CommandHandler({ client, commandsPath, eventsPath })
for (const cmd of handler.commands) {
  const run = cmd.run
  cmd.run = async (ctx) => {
    const started = Date.now()
    try {
      await run(ctx)
      usage.record(ctx.interaction, 'ok', Date.now() - started)
    } catch (e) {
      usage.record(ctx.interaction, 'err', Date.now() - started)
      throw e // 기존 동작 유지(최상위 unhandledRejection 안전망이 로그)
    }
  }
}
```
- 기록 실패가 명령 실행을 방해하지 않도록 `usage.record` 안에서 예외를 전부 삼킨다.

### "정상"의 한계
- 명령이 **스스로 에러를 잡고** "에러가 났어 😢" 같은 답을 보내면 예외가 밖으로 안 나와 `ok`로 센다.
- 권한 부족으로 "관리자만 쓸 수 있어~"라고 거절해도 `ok`.
- 보완(선택): 명령이 결과를 직접 표시할 수 있게 `interaction.usageResult = 'fail' | 'denied'`를 두고, 있으면 그 값으로 기록. 중요한 명령부터 조금씩 붙인다.

## 3. 무엇을 기록하나

| 항목 | 예 | 비고 |
|---|---|---|
| 날짜(KST) | `2026-11-23` | `luxon` `Asia/Seoul` |
| 서버 | guildId | DM에서 쓴 명령은 `DM` |
| 명령 | `경매장 유물` | 하위 명령까지(`getSubcommand(false)`) |
| 결과 | `ok` / `err` (+ 선택 `fail`·`denied`) | |
| 사용자 수 | 하루 기준 서로 다른 사람 수 | **디스코드 ID는 저장하지 않음**(아래) |
| 걸린 시간 | 평균·최대 ms | 느린 명령 발견용(선택) |

- **제작자 사용 제외**: `config/bot.js`의 `developerId`·`auditLogIgnoreUserIds`(부계정)는 세지 않는다 — 테스트하느라 누른 횟수가 섞이지 않게.
- **사용자 수**: 당일에만 `해시(유저ID + 비밀 소금)` 앞 10글자 목록을 메모리·파일에 두고, 날이 바뀌면 **숫자만 남기고 목록은 지운다**. 원래 ID로 되돌릴 수 없고 다음 날엔 목록도 없다.
- **버튼은 세지 않음**(기본안): `/성수깡`·`/듀얼`처럼 버튼으로 이어지는 명령은 명령 1회만 센다. 필요해지면 `buttonReaction.js`의 action별로 따로 센다.

## 4. 저장 — 월별 JSON

`static/json/usage/commands-2026-11.json` (gitignore, VM에만)
```json
{
  "2026-11-23": {
    "<guildId>": {
      "요리":        { "ok": 12, "err": 0, "users": 5, "msAvg": 420, "msMax": 1800 },
      "경매장 유물": { "ok": 3,  "err": 1, "users": 2, "msAvg": 2100, "msMax": 5200 }
    },
    "DM": { "운세": { "ok": 1, "err": 0, "users": 1 } }
  }
}
```
- **월별 파일**로 나눠 이번 달 파일만 다시 쓴다 → 파일이 커져도 쓰기 비용이 늘지 않음(한 달 ≈ 수십~수백 KB 예상).
- **매번 쓰지 않고 메모리에 모았다가 1분마다 저장**, pm2 재시작 신호(`SIGINT`/`SIGTERM`) 때 한 번 더 저장. 비정상 종료 시 최대 1분치만 잃는다.
- `readAll/writeAll`·파일 없으면 `{}` 관례 유지. 쓰기는 임시 파일에 쓰고 이름 바꾸기(쓰는 도중 꺼져도 파일이 깨지지 않게).
- 보관: 기본안 **무기한**(작음). 필요하면 1년 지난 달은 명령별 합계만 남기는 압축.

### 왜 한 줄씩 쌓는(로그) 방식이 아니라 합계인가
| 방식 | 장점 | 단점 |
|---|---|---|
| **합계(기본안)** | 작고, 보기 빠름, 기존 JSON 관례 그대로 | 나중에 "몇 시에 많이 쓰나" 같은 새 질문은 못 함 |
| 한 줄씩(JSONL) | 원본이 남아 어떤 분석도 가능 | 1년에 수십 MB, 볼 때마다 다시 계산, 사용자 ID 처리 고민 |

시간대 분석이 필요하면 합계에 `hours: [24칸]`만 추가하면 된다.

## 5. 보는 법 — `!현황 명령어`

이미 있는 제작자 전용 `!현황`(`events/messageCreate/ownerStatus.js`, `modules/ownerStatus.js`)에 붙인다.

```
!현황 명령어        # 최근 7일
!현황 명령어 30     # 최근 30일
```
```
📊 명령어 사용량 (최근 7일, 제작자 제외)
🥇 오미 312회 · 48명      🥈 요리 201회 · 37명      🥉 경매장 154회 · 22명
…
⚠️ 에러 많음: 경매장 유물 err 9/40 (22%)
🐢 느림: 경매장 유물 평균 2.1초
💤 7일간 0회: 브리레흐주화깡, 사주팔자
🏠 서버별: 섯다라인길드 640회 · ○○길드 210회 · …
```
- "0회" 목록은 등록된 명령 전체(`handler.commands`, 비활성·베타 제외)와 비교해 만든다.

## 6. 다른 기획과 연결

- **주간 기능 소개**: 셔플 백(§3) 대신/보조로 **최근 30일 사용량이 낮은 명령에 가중치** — 몰라서 안 쓰는 기능을 먼저 알린다.
- **설정 1회 안내·소식**: 안내 발송 뒤 해당 서버의 명령 사용량 변화로 효과 확인.

## 7. 구현 메모

- 신규 `modules/commandUsage.js`: `record(interaction, result, ms)`, `flush()`, `summary(days)`.
- `index.js`: 핸들러 생성 직후 `run` 감싸기(§2) + 1분 `setInterval(flush)` + 종료 신호 시 `flush()`.
- `modules/ownerStatus.js` / `events/messageCreate/ownerStatus.js`: `명령어` 하위 화면.
- 소금(salt): `.env`에 `USAGE_SALT`(VM) — 없으면 사용자 수 집계만 끈다.
- 테스트: `tests/`에 `commandUsage` 집계·월 경계·제작자 제외 단위 테스트(jest).

## 8. 결정 현황

| 항목 | 결정 |
|---|---|
| 기록 대상 | 기본안: 슬래시 명령(하위 명령 포함), 버튼 제외 |
| 성공 판정 | 기본안: `run`이 예외 없이 끝나면 ok, 선택적으로 명령이 `usageResult` 표시 |
| 저장 형식 | 기본안: 월별 합계 JSON, 1분마다 저장 |
| 사용자 수 | 기본안: 하루 단위 서로 다른 사람 수만(해시, 다음 날 목록 삭제) |
| 제작자 사용 | 기본안: 제외 |
| 보기 | 기본안: `!현황 명령어 [일수]` |
