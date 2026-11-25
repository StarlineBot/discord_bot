# 섯다라인 애드온 서버 (addon_server)

섯다라인 애드온(PC 앱)의 **디스코드 로그인 + 설정 동기화** 서버. 계정 관리 1단계.

- 명세: `StarlineBot/mabinogi_addon` 저장소 `docs/account-management-spec.md` 3절
- 봇(`discord_bot`, pm2)과 **같은 저장소·같은 VM, 다른 프로세스**(systemd `addon-server`)
- Python 3.10+ · FastAPI · SQLite(WAL) · `127.0.0.1:8000` · 앞단 Caddy `https://starline-bot.duckdns.org`
- 메모리: 측정값 평소 약 64MB, 2MB 업로드 반복 시 최고 약 68MB(목표 100MB 이하). systemd에서 110MB부터 늦추고 160MB면 이 서비스만 종료(봇 보호)

```
앱(PC) ──HTTPS──> Caddy(443) ──> 127.0.0.1:8000 (이 서버)
                                   ├─ data/addon.sqlite3   users · settings
                                   └─ data/settings/<디스코드ID>.zip
```

## 폴더

| 경로 | 내용 |
|---|---|
| `app/main.py` | API(`create_app` 팩토리) |
| `app/tokens.py` | 앱 토큰(Ed25519 서명 JWT) |
| `app/discord_oauth.py` | 디스코드 Authorization Code 흐름 |
| `app/bundle.py` | 설정 묶음(ZIP) 검사 + 기능 사용 값 추출 |
| `app/db.py` | SQLite 스키마·접근 |
| `scripts/genkey.py` | 서명 키 만들기 / 공개 키 보기 |
| `scripts/backup.py` | 백업(7일치) / 복원 |
| `deploy/` | systemd 서비스·백업 타이머, Caddyfile 예시 |
| `tests/` | pytest |
| `.env` · `data/` · `backups/` · `.venv/` | **git 제외**(VM에만) |

---

## 1. 앱 연동 규격

### 1.1 로그인
1. 앱이 `localhost:53123`에서 기다리면서 브라우저를 엽니다.
   `GET https://starline-bot.duckdns.org/auth/start?state=<무작위 8~128자 [A-Za-z0-9_-]>&port=53123`
2. 서버가 디스코드 인증 화면으로 보냅니다(scope `identify`). 이미 허용한 사용자는 화면 없이 바로 넘어갑니다.
3. 결과는 항상 `http://localhost:<port>/callback?...`로 돌아옵니다. 앱은 먼저 `state`가 보낸 값과 같은지 확인합니다.
   - 성공: `?token=<앱 토큰>&state=<앱 state>`
   - 취소: `?error=access_denied&state=…` · 실패: `?error=login_failed&state=…` · 차단(2단계): `?error=blocked&state=…`
   - 로그인 요청은 10분 안에 끝내야 하고, 같은 요청은 한 번만 쓸 수 있습니다. 만료되면 서버가 안내 페이지를 보여줍니다.

### 1.2 앱 토큰
- 형식: JWT, 헤더 `{"alg":"EdDSA","kid":"k1"}`, 서명 Ed25519
- 클레임: `iss="starline-bot"`, `aud="mabinogi-addon"`, `sub=<디스코드 ID>`, `name`, `tier`(`user`/`creator`), `iat`, `exp`(발급 후 30일)
- 앱은 **공개 키로 서명·iss·aud·exp를 확인**합니다(`scripts/genkey.py --public`으로 출력). 비밀 키는 서버에만 있어서 config.json을 고쳐 제작자인 척할 수 없습니다.
- `tier`는 서버 `.env`의 `CREATOR_IDS`로 정합니다. `/me`를 부를 때마다 다시 계산합니다.
- 예(파이썬 앱): `jwt.decode(token, public_key, algorithms=["EdDSA"], audience="mabinogi-addon", issuer="starline-bot")`

### 1.3 API
아래는 모두 `Authorization: Bearer <앱 토큰>` 헤더가 필요합니다. 토큰이 없거나 틀렸거나 만료됐거나 DB에 없는 사용자면 `401`, 차단(2단계)이면 `403`, 너무 자주 부르면 `429`입니다(사용자당 분당 60회).

| 요청 | 응답 |
|---|---|
| `GET /me` | `{id, name, tier, status, token, expiresAt}` — 새 토큰 발급 + 마지막 접속 기록. 앱 시작할 때와 켜진 동안 하루 1번 |
| `POST /auth/logout` | `204` — 로그아웃 시각 기록(봇 보기용). 토큰은 앱이 지웁니다 |
| `GET /settings` | 없으면 `{exists:false, rev:0}`, 있으면 `{exists:true, rev, updated, device, resolution, size}` |
| `GET /settings/blob` | 설정 묶음(ZIP, `application/zip`), 헤더 `X-Settings-Rev`. 없으면 `404` |
| `PUT /settings?device=<PC 이름>&resolution=<2560x1440>` | 본문 = 설정 묶음 ZIP 원본. 헤더 `If-Match: <내가 받은 rev>`(처음이면 `0`). 성공하면 `{rev, updated, size}` |

`PUT /settings` 오류:
- `428`: `If-Match`가 없음
- `400`: `If-Match`가 숫자가 아님
- `409`: rev가 다름 → 응답 `{detail, rev:<서버 현재 rev>}`. 앱은 "어느 설정을 쓸지" 물어봅니다
- `413`: 묶음이 2MB를 넘거나, config.json이 1MB를 넘거나, 풀었을 때 64MB를 넘음
- `422`: ZIP이 아님, `config.json`이 없거나 JSON 객체가 아님, `..` 같은 위험한 경로, 비밀값(`nexonApiKey`·`inquiryWebhookUrl`·`configWebhookUrl`)이 들어 있음

그 밖에:
- `device`는 64자까지, `resolution`은 `숫자x숫자` 형식만 저장합니다(아니면 비워 둠). 한글 PC 이름도 됩니다(URL 인코딩).
- 묶음 형식은 앱 `config.export_bundle`과 같습니다(`config.json` + `userdata/…`). 서버는 묶음을 풀지 않고 그대로 보관합니다.
- `features`(봇 보기용, 명세 3.4.2절):
  - 새 앱: config.json 최상위 `featureUsage: {"<기능>": "YYYY-MM-DD"}`(기능별 마지막 실제 동작 날짜)가 있으면 **그것만** 저장합니다(최대 64개, 키 64자, 형식이 틀린 값은 버림).
  - 옛 앱(0.52.0 이하, `featureUsage` 없음): `{"<기능>": {"enabled": true/false}}` 값과 최상위 `...Enabled` 불값을 저장합니다(옛 키 `autofindV2`는 뺌).
- `character`(봇 보기용, 명세 3.4.4 캐릭터 사용 현황): config.json의 `voice.pack`(고른 캐릭터, 빈 값 = 기본 목소리)·`character.pet`·`character.affinity.<고른 팩>.value`(0~100)만 `{pack, pet, affinity}`로 저장(형식 틀린 값은 뺌). 로그인·비로그인 둘 다. 칸이 생기기 전에 올린 로그인 사용자는 서버 시작 때 보관된 묶음에서 한 번 채우고, 비로그인은 다음 올림 때 채워진다.
  - 봇 `!현황 애드온`은 날짜 값이면 서버가 받은 날(KST) 포함 최근 7일 안일 때만 🟢(미래 날짜는 받은 날로 봄), 불값이면 true일 때 🟢로 표시합니다.

| 그 밖의 경로 | |
|---|---|
| `GET /health` | `{"ok": true}` — 인증 없음, 운영 확인용 |
| `PUT /guest/settings?resolution=<2560x1440>` | **비로그인 설정 올리기**(명세 3.4.3, 사용 현황 보기용) — 토큰 없음, 헤더 `X-Install-Id: <16~32자 소문자 hex>`, 본문 ZIP. 성공 `204` |

`PUT /guest/settings`:
- 묶음 검사는 `PUT /settings`와 같음(400 = `X-Install-Id` 형식 틀림, 413·422 같음). 요청 제한: 설치당 10분에 1회, 전체 분당 300회(넘으면 429 — 앱은 다음 차례에 다시).
- **묶음(ZIP)은 검사만 하고 저장하지 않습니다**(받아 가는 주소가 없음). `guests` 테이블에 설치별로 해상도·크기·`features`·앱 버전만 덮어씁니다. 10만 행을 넘으면 오래된 것부터 지웁니다.
- **IP를 저장하지 않습니다**: DB에 칸이 없고, uvicorn 접근 로그에서 `/guest/` 요청은 뺍니다(`_HideGuestAccess`). Caddy는 `log` 설정이 없어 접근 로그를 남기지 않습니다.

### 1.4 DB (봇이 읽기 전용으로 열 수 있음 — 다음 단계 `/애드온 사용자`)
`data/addon.sqlite3`. 시각은 모두 UTC ISO8601(`2026-11-11T01:02:03Z`)입니다.
- `users(discord_id PK, name, created, last_seen, logged_out, tier, status)`
- `guests(install_id PK, updated, resolution, size, features JSON, app, character JSON)` — 비로그인(3.4.3). 묶음·IP·PC 이름 없음.
- `settings(discord_id PK, rev, updated, device, resolution, size, features JSON, app, character JSON)` — `app`은 묶음 `sync.json`의 앱 버전(없거나 형식이 틀리면 NULL). 나중에 추가된 컬럼은 `db.py`의 `MIGRATIONS`가 서버 시작 때 `ALTER TABLE`로 붙인다.

---

## 2. VM 처음 설치

VM 계정이 `wjdalstlr21`이고 저장소가 `~/project/discord_bot`에 있다는 기준입니다. 다르면 `deploy/*.service`의 `User`와 경로를 바꿔주세요.

```bash
# ⚠️ 저장소 맨 위(~/project/discord_bot)에도 봇용 .env·.env.example이 있다.
#    아래는 모두 addon_server 안에서만 실행한다(절대 경로 사용, cp -n = 있으면 덮어쓰지 않음).
cd ~/project/discord_bot && git pull
S=~/project/discord_bot/addon_server
test -f $S/app/main.py && cd $S || echo "⚠️ addon_server가 없어요 — 여기서 멈추고 git pull을 확인하세요"

# 1) 파이썬 가상환경 (python3 --version 이 3.10 이상인지 먼저 확인)
sudo apt install -y python3-venv        # 없을 때만
python3 -m venv $S/.venv
$S/.venv/bin/pip install -r $S/requirements.txt

# 2) 데이터·백업 폴더 (systemd가 이 두 폴더에만 쓰기를 허용하므로 미리 만들어야 함)
mkdir -p $S/data $S/backups && chmod 700 $S/data $S/backups

# 3) 비밀값 — 봇의 .env 가 아니라 addon_server/.env
cp -n $S/.env.example $S/.env && chmod 600 $S/.env
$S/.venv/bin/python $S/scripts/genkey.py   # TOKEN_SIGNING_KEY 줄 → $S/.env 에 붙여넣기, 공개 키는 앱에 전달
nano $S/.env                               # DISCORD_CLIENT_SECRET 채우기(3절)

# 4) 서비스 등록
sudo cp $S/deploy/addon-server.service $S/deploy/addon-backup.service $S/deploy/addon-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now addon-server addon-backup.timer
curl -s http://127.0.0.1:8000/health    # {"ok":true}

# 5) Caddy: 테스트용 'ok' 응답을 서버로 바꾸기 (deploy/Caddyfile.example 참고)
sudo nano /etc/caddy/Caddyfile          #   starline-bot.duckdns.org { reverse_proxy 127.0.0.1:8000 }
sudo systemctl reload caddy
curl -s https://starline-bot.duckdns.org/health   # {"ok":true}
```

## 3. 디스코드 개발자 포털 설정
1. https://discord.com/developers/applications 에서 앱의 애플리케이션(Client ID `1172437289339727913`)을 엽니다.
2. **OAuth2 → Redirects**에 `https://starline-bot.duckdns.org/auth/callback`을 추가하고 저장합니다. 지금 있는 `http://localhost:53123/callback`은 새 흐름을 확인한 뒤에 정리합니다.
3. **OAuth2 → Client Secret**에서 Reset Secret을 눌러 나온 값을 `addon_server/.env`의 `DISCORD_CLIENT_SECRET`에 넣습니다. 이 값은 다른 곳에 붙여넣지 마세요.
4. `sudo systemctl restart addon-server`

## 4. 배포(업데이트)
```bash
cd ~/project/discord_bot && git pull
cd addon_server && .venv/bin/pip install -r requirements.txt   # 의존성이 바뀐 경우만
sudo systemctl restart addon-server                             # 봇은 재시작하지 않음
```
- 봇은 main에 푸시되면 GitHub Actions가 VM에서 `git reset --hard origin/main` 후 **봇만** 재시작합니다. 그래서 서버 파일은 디스크에서 이미 새것이어도 **서버는 위 명령으로 재시작해야 반영**됩니다.
- `.env`·`data/`·`backups/`·`.venv/`는 git에 없어서 `git pull`·`reset`을 해도 그대로 남습니다.

## 5. 백업·복원
- `addon-backup.timer`가 매일 04:30(KST)에 `backups/addon-YYYYMMDD.tar.gz`를 만듭니다. SQLite 온라인 백업과 `data/settings/*.zip`이 들어가고, 최신 7개만 남깁니다.
- 수동 백업: `.venv/bin/python scripts/backup.py`
- 복원:
  ```bash
  sudo systemctl stop addon-server
  .venv/bin/python scripts/backup.py restore backups/addon-20261111.tar.gz   # 지금 data/는 data.before-restore-<시각>/ 로 옮겨 둠
  sudo systemctl start addon-server
  ```
- 백업 파일도 같은 VM 안에 있습니다. VM 자체가 망가질 때를 대비하려면 Cloud Storage 복사를 추가로 검토하세요(제안, 아직 없음).

## 6. 운영 확인
```bash
systemctl status addon-server                 # 실행 상태·메모리
journalctl -u addon-server -n 100 --no-pager  # 로그(로그인 성공/실패 포함)
systemctl list-timers addon-backup.timer      # 다음 백업 시각
ls -lh backups/
```

## 7. 개발·테스트(로컬)
```bash
cd addon_server
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest -q
```
테스트는 디스코드를 가짜로 바꿔서 돌립니다. 확인하는 것:
- 로그인 흐름(취소, 실패, state 재사용·만료)
- 위조·만료·서명 없는 토큰과 DB에 없는 사용자 거절, `/me`에서 등급 재계산, 로그아웃 기록
- 설정 업로드·다운로드, rev 충돌 409, `If-Match` 누락 428, 2MB 초과 413
- ZIP 아님·config 없음·경로 탈출·비밀값 포함 422, 사용자 간 분리
- 요청 수 제한, WAL 모드, 백업 7일 보관과 복원
