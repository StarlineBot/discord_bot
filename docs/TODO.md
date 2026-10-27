# TODO

급하지 않지만 나중에 볼 것들. 처리하면 지우거나 `[x]`로 표시.

## 인프라 / 배포

- [ ] **GCP VM 외부 IP를 고정 IP로 승격** (현재 `136.119.121.58`)
  - 2026-10 무료→유료 전환 때 VM이 재시작되며 IP가 바뀌어, Secret `GCP_HOST`가 옛 IP를 가리켜 배포 SSH가 `i/o timeout`으로 실패했음(봇 자체는 정상).
  - GCP 콘솔 → VPC 네트워크 → IP 주소 → 해당 IP ⋮ → 고정 IP 주소로 승격. VM 삭제 시 고정 IP도 같이 해제(미사용 고정 IP는 과금).
  - 다시 IP가 바뀌면: VM에서 `curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip` → `GCP_HOST` 갱신.
- [ ] **VM 디스크 사용량 80%** — 로그·npm 캐시 등 정리.
- [ ] **CI `create env file` 단계의 `cat .env` 제거** — 저장소 공개 후 Actions 로그도 공개. 현재는 시크릿이 `***`로 마스킹되는 것 확인함.
- [ ] **GitHub Actions 경고 정리** — `actions/checkout@v4`·`actions/setup-node@v4`가 Node 20 지원 종료 경고. v5로 올리고, CI Node 18(EOL)도 20/22로 검토.
- [ ] **npm audit** — 취약점 36개(critical 3). `puppeteer@21` 지원 종료 경고 포함.
- 참고: 저장소를 비공개로 되돌리면 Actions 사용량(budget) 한도에 걸려 CI가 러너 배정 없이 즉시 실패함.

## 듀얼(전투) 밸런스

현재 시뮬(`node docs/battle-sim/game-balance-sim.js`) 기준 전체 42~56%.

- [ ] **무도가 AI 점검** — 패링 타이밍·콤보 연결을 AI가 제대로 굴리는지 로그로 확인.
- [ ] **극단 상성** — 스펠브레이커 vs 마법사·세이지·볼트 100% / vs 프리스트 1%·광전사 0%, 프리스트 vs 참회사제·스펠브레이커·암살도적·광전사 0~1%, 기사 vs 사냥꾼·암살도적 90%+.
- [ ] **하위권** — 갬블러(~42%), 암살도적(~43%).
- 기사의 참회사제·프리스트·절개도적(최대체력 비례·방어무시 피해) 하드카운터는 의도적으로 유지하기로 함.

## 듀얼 나레이션

- [ ] **살아있는시체 사용 시 "반동 N" 표기** → 시체 전용 연출로 변경.
- [ ] **스택형 스킬 스택 표시 공통화** — 종말(침식)·단죄(참회)·파열(출혈) 등 "N스택" 표기.

## 문서

- [ ] **`docs/battle-game-design.md` 갱신** — 암흑기사·참회사제·무도가 등 신규/개편 캐릭이 스탯표(5·6장)에 없음. 2026-10 변경(암흑기사 재조정, 볼트마법조합 ×1.5, 광전사 격노 +140%, 기사 방패밀쳐내기 자기 최대체력 4%) 반영.
