// V41: 태그 기반 AI 재설계 (2태그: 딜 / 제어 / 조건부)
// - 스킬 = {tag, ready, score, exec}. 매 턴 점수 최댓값 선택 → 하드코딩 우선순위 버그 제거.
// - 전투 판정(attack/근성/실드)은 V40 유지. instVuln(마법사 취약)만 1.5배로 정식 적용.
const rand = () => Math.random()
const step = (s, per) => Math.floor(s / 10) * per
const CHARS = {
  '전사':   { 힘: 85, 지능: 10, 체력: 70, 민첩: 40, 솜씨: 55, 행운: 30 },
  '광전사': { 힘: 100,지능: 10, 체력: 45, 민첩: 55, 솜씨: 60, 행운: 45 },
  '기사':   { 힘: 55, 지능: 10, 체력: 100,민첩: 35, 솜씨: 50, 행운: 30 },
  '마법사': { 힘: 10, 지능: 100,체력: 45, 민첩: 40, 솜씨: 60, 행운: 40 },
  '도적':   { 힘: 45, 지능: 15, 체력: 40, 민첩: 100,솜씨: 55, 행운: 55 },
  '명사수': { 힘: 55, 지능: 15, 체력: 45, 민첩: 55, 솜씨: 100,행운: 40 },
  '행운아': { 힘: 25, 지능: 20, 체력: 40, 민첩: 85, 솜씨: 35, 행운: 100 },
  '세이지': { 힘: 60, 지능: 65, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30 },  // 하이브리드(혼합 타격)
  '마검사': { 힘: 65, 지능: 60, 체력: 55, 민첩: 50, 솜씨: 50, 행운: 30 }  // 하이브리드(융합 타격, CC 특화)
}
const AIS = ['공격적','방어적','판단형']; const pickAI=()=>AIS[Math.floor(rand()*3)]
// ── 타이틀: 캐릭 선택 시 랜덤 1개. 파생 능력치에 직접 랜덤 보정(= 의도된 매판 변수) ──
const clampT=(v,mx)=>Math.min(v,mx)
const TITLES=[
  {name:'튼튼한', d:d=>{d.물방+=0.10; d.마방=clampT(d.마방+0.10,0.75)}},        // 물/마방 +10%p
  {name:'럭키',   d:d=>{d.리롤=clampT(d.리롤+0.10,0.60)}},                       // 행운굴림 +10%p
  {name:'불주먹', d:d=>{d.크리=clampT(d.크리+0.05,0.80); d.물공=Math.round(d.물공*1.05)}}, // 크리+5%p·물리+5%
  {name:'괴력의', d:d=>{d.물공=Math.round(d.물공*1.12)}},                        // 물리딜 +12%
  // 현자: 적응형 — 스탯 ≥90에 어울리는 보정 분배(탱커=방어, 마법사=마나실드 등). 몰빵 부족 시 범용 폴백
  {name:'현자',   d:d=>{ const b=d.base; let hit=false
    if(b.힘>=90){   d.물공=Math.round(d.물공*1.12); hit=true }
    if(b.체력>=90){ d.물방+=0.10; d.마방=clampT(d.마방+0.08,0.80); hit=true }
    if(b.지능>=90){ d.마나경감=clampT((d.마나경감||0)+0.08,0.45); hit=true }
    if(b.행운>=90){ d.리롤=clampT(d.리롤+0.10,0.60); hit=true }
    if(b.민첩>=90){ d.크리=clampT(d.크리+0.08,0.90); hit=true }
    if(b.솜씨>=90){ d.명중=clampT(d.명중+0.12,0.95); hit=true }
    if(!hit){ d.물공=Math.round(d.물공*1.06); d.마공=Math.round(d.마공*1.06) } }},
  {name:'심연의', flag:'tMPen'},                                                // 마법 마방 25% 관통
  {name:'현혹의', d:d=>{d.마회=clampT(d.마회+0.15,0.60)}},                       // 마법회피(비껴맞음) +15%p
  {name:'매의눈', d:d=>{d.명중=clampT(d.명중+0.12,0.95)}},                       // 명중 +12%p
  {name:'암살자', d:d=>{d.물크기본+=0.6; d.마크기본+=0.6}},                       // 크리배율 +0.6
  {name:'날렵한', d:d=>{d.물회=clampT(d.물회+0.10,0.55)}},                       // 물리회피 +10%p
  {name:'질풍의', d:d=>{d.턴=Math.max(Math.round(d.턴*0.85*10)/10,2)}},          // 턴주기 -15%(빠른/느린 공평)
  {name:'거인',   d:d=>{d.maxhp=Math.round(d.maxhp*1.12)}},                     // 최대HP +12%
  {name:'살이돋아나는', flag:'tRegen'}, // 매턴 HP +3% 재생
  {name:'뱀파이어', flag:'tLeech'},   // 가한 딜 12% 흡혈(attack 경유분)
  {name:'광전사', flag:'tFury'},    // HP 50%↓ 시 딜 +22%
  {name:'철벽',   flag:'tWall'},    // 받는 딜 -10%
  {name:'가시돋힌', flag:'tThorns'},// 받은 딜 5% 반사
]
// 대박 타이틀(0.1%): 갓롤 — 물/마공+20%, 크리+15%p, 턴-1, 받는딜-15%
const JACKPOT={name:'전설의', d:d=>{d.물공=Math.round(d.물공*1.2); d.마공=Math.round(d.마공*1.2); d.크리=clampT(d.크리+0.15,0.90); d.턴=Math.max(d.턴-1,2)}, flag:'tLegend'}
// 꽝 타이틀(좋은 타이틀의 거울상): 합쳐서 20% 등장
const DUDS=[
  {name:'저주받은', d:d=>{d.물공=Math.round(d.물공*0.85); d.마공=Math.round(d.마공*0.85)}}, // 딜 -15%
  {name:'허약한',   flag:'tFrail'},                                                          // 받는딜 +15%
  {name:'둔한',     d:d=>{d.턴=Math.round(d.턴*1.15*10)/10}},                                // 턴주기 +15%(느려짐)
  // 무지한: 현자의 반대(적응형 딜↓). 지능형=마법딜↓, 힘형=물리딜↓, 둘다미달=범용↓
  {name:'무지한',   d:d=>{ const 힘=d.base.힘, 지능=d.base.지능; let hit=false
    if(지능>=50){ d.마공=Math.round(d.마공*0.88); hit=true }
    if(힘>=50){ d.물공=Math.round(d.물공*0.88); hit=true }
    if(!hit){ d.물공=Math.round(d.물공*0.94); d.마공=Math.round(d.마공*0.94) } }},
  {name:'드러난',   d:d=>{ d.마회=Math.max(d.마회-0.15,0) }},                                 // 현혹의 반대: 마법회피 -15%p
]
// 가중 뽑기: 전설의 0.1%, 질풍의 0.5%, 꽝 20%, 나머지 14개 균등(~79.4%)
const GALE=TITLES.find(t=>t.name==='질풍의')
const COMMON=TITLES.filter(t=>t.name!=='질풍의')
const pickTitle=()=>{ const r=rand()
  if(r<0.001)return JACKPOT
  if(r<0.006)return GALE
  if(r<0.206)return DUDS[Math.floor(rand()*DUDS.length)]
  return COMMON[Math.floor(rand()*COMMON.length)] }
function derive (c) {
  return {
    물공: Math.round(c.힘*(1+step(c.힘,10)/100)), 마공: Math.round(c.지능*(1+step(c.지능,10)/100)),
    물방: (step(c.힘,3)+step(c.체력,1))/100, 마방: Math.min(30+step(c.지능,3),70)/100,
    maxhp: Math.round(50+c.체력*1.1+c.힘*0.5+c.지능*0.2+c.민첩*0.2+c.행운*0.3),
    명중: Math.min(20+step(c.솜씨,5), c.솜씨===100?90:80)/100, 물회: Math.min(10+step(c.민첩,2.5),50)/100, 마회: step(c.민첩,3)/100,
    sigPen:c.힘===100, sigDodge:c.행운===100, sigTank:c.체력===100, sigEcho:c.민첩===100, sigEye:c.지능===100, base:c,
    hybrid:(c.힘===60&&c.지능===65&&c.체력===55),
    fusion:(c.힘===65&&c.지능===60&&c.체력===55),
    크리: Math.min(10+step(c.솜씨,1)+step(c.행운,3.5),70)/100, 리롤: Math.min(step(c.행운,4),50)/100,
    근성: step(c.체력,4)/100,
    방패가격: Math.round(Math.round(c.힘*(1+step(c.힘,10)/100))*0.5 + c.체력*1.2 + (step(c.힘,3)+step(c.체력,1))*2),
    힘절반: Math.round(c.힘/2), 돌진딜: Math.round(Math.round(c.힘*(1+step(c.힘,10)/100))*1.5),
    메테오: Math.round(Math.round(c.지능*(1+step(c.지능,10)/100))*4), 회복: Math.min(10+step(c.체력,1),30),
    물크기본:2.5, 마크기본:1.5, 크랜폭:step(c.행운,0.15)*2, 비껴무효:step(c.행운,3)/100, 턴: Math.max(10-step(c.민첩,0.7),2),
    무기막기: c.힘>=50 ? (30+Math.floor((c.힘-50)/10)*2)/100 : 0,
    방패막기: c.체력>=70 ? (30+Math.floor((c.체력-70)/10)*3)/100 : 0,
    방패고정: c.체력>=70 ? c.체력/3 : 0,
    마나경감: c.지능>=70 ? (10+((c.지능-70)/10)*2)/100 : 0
  }
}
function luckRoll (s, ls, p) { if (s) return true; if (ls.used) return false; if (rand()<p){ls.used=true;return true} return false }
function gutsMul (d, hp, df) { const p=hp/df.maxhp; if(p>=0.5)return 1; return 1-df.근성*((0.5-p)/0.5) }
function attack (A, D, dA, dD, defending, guaranteed) {
  const magic = dA.마공 > dA.물공
  const ls={used:false}, lsD={used:false}
  let dmg, 고정=0
  if (dD.sigDodge && rand()<0.30) return 0   // 천운(행운100): 완전회피 30%
  if (dA.hybrid) {   // ── 세이지 혼합 타격: 마법식 자동명중(리롤 완전회피만), 물리+마법 절반 합산 ──
    if (luckRoll(false, lsD, (D.luckLock>0?0:dD.리롤))) return 0
    let block=0; 고정=0
    if (dD.방패막기 && rand()<dD.방패막기) { block=0.30; 고정=dD.방패고정 }        // 방패=둘 다
    const wBlk = (!block && dD.무기막기 && rand()<dD.무기막기) ? 0.50 : 1          // 무기막기=물리절반만
    let crit = luckRoll(rand()<(dA.크리+(A.luckBuff>0?0.2:0)), ls, (A.luckLock>0?0:dA.리롤)+(A.luckBuff>0?0.2:0))
    if (A.echoReady){ crit=true; A.echoReady=0 }
    const cP = crit ? (dA.물크기본+rand()*dA.크랜폭)*(A.luckBuff>0?2:1) : 1
    const cM = crit ? (dA.마크기본+rand()*dA.크랜폭*0.6)*(A.luckBuff>0?2:1) : 1
    let ph = dA.물공*0.85 * (block?(1-block):wBlk) * (1-dD.물방*(dA.sigPen?0.7:1)) * cP
    let mg = dA.마공*0.85 * (block?(1-block):1)   * (1-dD.마방*(A.tMPen?0.75:1)) * cM
    let bolt=0, pendingAmp=0
    if (A.autoSpell>0 && rand()<0.10) {   // 오토스펠 볼트 프록(랜덤 3종)
      const r=rand()
      if (r<1/3){ bolt=dA.base.지능*1.5; pendingAmp=1.1 }       // 파이어볼트
      else if (r<2/3){ bolt=dA.base.지능*1.0 }                  // 아이스볼트(꽝)
      else { bolt=dA.base.지능*1.2; pendingAmp=1.2 }            // 라이트닝볼트
      bolt *= (1-dD.마방*(A.tMPen?0.75:1))
    }
    let dmg = ph + mg + bolt - 고정
    if (D.sunder>0) dmg*=1.15
    if (rand()<0.30 && rand()>=(dA.비껴무효+(A.luckBuff>0?0.2:0))) dmg*=0.70
    if (dD.마나경감) dmg*=(1-dD.마나경감)
    if (defending) dmg*=0.10
    dmg *= gutsMul(dD, D.hp, dD)
    if (D.vuln>0) dmg*=2.0
    if (D.instVuln>0) dmg*=1.5
    if (A.nextAmp){ dmg*=A.nextAmp; A.nextAmp=0 }   // 직전 볼트의 '다음 공격' 버프 소비
    if (A.tFury && A.hp<dA.maxhp*0.5) dmg*=1.22
    if (D.tWall) dmg*=0.90
    if (D.tLegend) dmg*=0.85
    if (D.tFrail) dmg*=1.15
    const fin = Math.max(Math.round(dmg),1)
    if (A.tLeech) A.hp=Math.min(dA.maxhp,A.hp+Math.round(fin*0.12))
    if (D.tThorns) A.hp-=Math.max(Math.round(fin*0.05),1)
    if (pendingAmp) A.nextAmp=pendingAmp   // 이번 볼트가 다음 공격 버프 부여
    return fin
  }
  if (dA.fusion) {   // ── 마검사 융합 타격: (물공+마공) 한 방, 방어자는 max(물방,마방)로만 경감 ──
    if (!guaranteed && luckRoll(rand()<dD.물회, lsD, (D.luckLock>0?0:dD.리롤))) { if(dD.sigEcho)D.echoReady=1; return 0 }
    let dmg = dA.물공 + dA.마공; 고정=0
    if (dD.방패막기 && rand()<dD.방패막기) { dmg*=0.30; 고정=dD.방패고정 }
    else if (dD.무기막기 && rand()<dD.무기막기) { dmg*=0.50 }
    dmg *= (1 - Math.max(dD.물방*(dA.sigPen?0.7:1), dD.마방))   // 방어자 최고 방어 하나로만 경감
    if (D.sunder>0) dmg*=1.15
    if (rand()<0.30 && rand()>=(dA.비껴무효+(A.luckBuff>0?0.2:0))) dmg*=0.70
    let crit = luckRoll(rand()<(dA.크리+(A.luckBuff>0?0.2:0)), ls, (A.luckLock>0?0:dA.리롤)+(A.luckBuff>0?0.2:0))
    if (A.echoReady){ crit=true; A.echoReady=0 }
    if (crit) dmg*=(dA.물크기본+rand()*dA.크랜폭)*(A.luckBuff>0?2:1)
    dmg -= 고정
    if (dD.마나경감) dmg*=(1-dD.마나경감)
    if (defending) dmg*=0.10
    dmg *= gutsMul(dD, D.hp, dD)
    if (D.vuln>0) dmg*=2.0
    if (D.instVuln>0) dmg*=1.5
    if (A.tFury && A.hp<dA.maxhp*0.5) dmg*=1.22
    if (D.tWall) dmg*=0.90
    if (D.tLegend) dmg*=0.85
    if (D.tFrail) dmg*=1.15
    const fin=Math.max(Math.round(dmg),1)
    if (A.tLeech) A.hp=Math.min(dA.maxhp,A.hp+Math.round(fin*0.12))
    if (D.tThorns) A.hp-=Math.max(Math.round(fin*0.05),1)
    return fin
  }
  if (!magic) {
    if (!luckRoll(rand()<(dA.명중-(A.missDown>0?0.2:0)-(A.blind>0?0.3:0)), ls, (A.luckLock>0?0:dA.리롤)+(A.luckBuff>0?0.2:0))) return 0
    let dodge = dD.물회
    if (luckRoll(rand()<dodge, lsD, (D.luckLock>0?0:dD.리롤))) { if(dD.sigEcho)D.echoReady=1; return 0 }  // 도적 잔상: 회피 시 다음 확정크리
    dmg = dA.물공
    if (dD.방패막기 && rand()<dD.방패막기) { dmg*=0.30; 고정=dD.방패고정 }
    else if (dD.무기막기 && rand()<dD.무기막기) { dmg*=0.50 }
    dmg *= (1-dD.물방*(dA.sigPen?0.70:1))   // 파괴(힘100): 물방 30% 관통
    if (D.sunder>0) dmg*=1.15
    if (rand()<0.30 && rand()>=(dA.비껴무효+(A.luckBuff>0?0.2:0))) dmg*=0.70
    let crit = luckRoll(rand()<(dA.크리+(A.luckBuff>0?0.2:0)), ls, (A.luckLock>0?0:dA.리롤)+(A.luckBuff>0?0.2:0))
    if (A.echoReady) { crit=true; A.echoReady=0 }
    if (crit) dmg*=(dA.물크기본+rand()*dA.크랜폭)*(A.luckBuff>0?2:1)
  } else {
    if (luckRoll(false, lsD, (D.luckLock>0?0:dD.리롤))) return 0
    dmg = dA.마공
    if (dD.방패막기 && rand()<dD.방패막기) { dmg*=0.30; 고정=dD.방패고정 }
    dmg *= (1-dD.마방*(A.tMPen?0.75:1))   // 타이틀 심연의: 마방 25% 관통
    if (D.sunder>0) dmg*=1.15
    if (rand()<dD.마회 && rand()>=dA.비껴무효) dmg*=0.70
    if (rand()<(dA.크리+(A.luckBuff>0?0.2:0))) { dmg*=(dA.마크기본+rand()*dA.크랜폭*0.6)*(A.luckBuff>0?2:1); if(dA.sigEye)A.shield=Math.min(Math.round(dA.maxhp*0.3),A.shield+Math.round(dA.maxhp*0.06)) }  // 마법사 심안: 마법크리 시 실드재생
  }
  dmg -= 고정
  if (dD.마나경감) dmg*=(1-dD.마나경감)
  if (defending) dmg*=0.10
  dmg *= gutsMul(dD, D.hp, dD)
  if (D.vuln>0) dmg*=2.0
  if (D.instVuln>0) dmg*=1.5   // 마법사 인스턴트캐스팅 취약
  if (A.tFury && A.hp < dA.maxhp*0.5) dmg*=1.22   // 타이틀 광란
  if (D.tWall) dmg*=0.90                           // 타이틀 철벽
  if (D.tLegend) dmg*=0.85                          // 대박 전설의: 받는딜 -15%
  if (D.tFrail) dmg*=1.15                           // 꽝 허약한: 받는딜 +15%
  const fin = Math.max(Math.round(dmg),1)
  if (A.tLeech) A.hp=Math.min(dA.maxhp, A.hp+Math.round(fin*0.12))   // 타이틀 흡혈
  if (D.tThorns) A.hp-=Math.max(Math.round(fin*0.05),1)              // 타이틀 가시돋힌 반사
  return fin
}
// ── 공통 헬퍼 ──
function guts(dmg, foe, df){ const p=foe.hp/df.maxhp; if(p<0.5)dmg*=(1-df.근성*((0.5-p)/0.5)); return dmg }
function absorb(foe, dmg){ // 실드 흡수. 남은 데미지 반환
  if(foe.shield>0){ if(dmg<=foe.shield){foe.shield-=dmg; return 0} else {const r=dmg-foe.shield; foe.shield=0; foe.vuln=1; return r} }
  return dmg
}
function applyCC(foe, field, dur){ foe[field]=Math.max(foe[field], foe.sigTank?Math.max(dur-1,0):dur) }  // 기사 불굴: CC 지속 -1턴
function applyAdaptiveCC(foe, df){   // 마검사: 상대 최고 스탯(≥70)에 맞는 CC 2턴 / 다 <70이면 폴백 3턴
  const b=df.base
  const cand=[['힘',b.힘],['민첩',b.민첩],['지능',b.지능],['행운',b.행운],['솜씨',b.솜씨],['체력',b.체력]].filter(s=>s[1]>=70)
  if(cand.length===0){ applyCC(foe,'slow',3); foe.slowSec=Math.max(foe.slowSec,1); applyCC(foe,'noDefend',3); return }   // 하이브리드 폴백
  cand.sort((x,y)=>y[1]-x[1]); const top=cand[0][0]
  if(top==='힘') applyCC(foe,'stun',1)
  else if(top==='민첩'){ applyCC(foe,'slow',2); foe.slowSec=Math.max(foe.slowSec,1) }
  else if(top==='지능') applyCC(foe,'silence',2)
  else if(top==='행운') applyCC(foe,'luckLock',2)
  else if(top==='솜씨') applyCC(foe,'blind',2)
  else if(top==='체력'){ applyCC(foe,'noDefend',2); applyCC(foe,'healBlock',2) }
}
function estAtk(a, d){ // 평타 기대딜(순위용 근사)
  if(a.hybrid) return (a.물공*0.85*(1-d.물방)*Math.max(a.명중,0.3)) + (a.마공*0.85*(1-d.마방))
  if(a.fusion) return (a.물공+a.마공)*(1-Math.max(d.물방,d.마방))*Math.max(a.명중,0.3)
  if(a.마공>a.물공) return a.마공*(1-d.마방)
  return a.물공*(1-d.물방)*Math.max(a.명중,0.3)
}
// ── 스킬 레지스트리: [슬롯0, 슬롯1]. tag: 딜 | 제어 | 조건부 ──
const SKILLS = {
  '전사': [
    { name:'방어파괴', tag:'조건부',
      ready:(s,f,ds,df)=> s.cd[0]===0 && f.hp>df.maxhp*0.3,
      score:(s,f,ds,df,x)=> x.est*1.2,
      exec:(s,f,ds,df)=>{ f.sunder=2; let d=attack(s,f,ds,df,f.defending); f.hp-=d+ds.힘절반; s.cd[0]=3 } },
    { name:'돌진', tag:'제어',
      ready:(s,f,ds,df)=> s.cd[1]===0 && f.stun===0 && s.hp>ds.maxhp*0.2,
      score:(s,f,ds,df,x)=> ds.돌진딜*(1-df.물방) + x.foeTurn,
      exec:(s,f,ds,df)=>{ let d=guts(ds.돌진딜*(1-df.물방),f,df); d=Math.max(Math.round(d),1); d=absorb(f,d); f.hp-=d; applyCC(f,'stun',1); s.hp-=Math.round(ds.maxhp*0.1); s.cd[1]=5 } },
  ],
  '광전사': [
    { name:'광폭화', tag:'조건부',
      ready:(s,f,ds,df)=> s.cd[0]===0 && s.rage===0 && s.hp>ds.maxhp*0.4 && f.hp>df.maxhp*0.3,
      score:(s,f,ds,df,x)=> x.est*1.5,
      exec:(s,f,ds,df)=>{ s.rage=3; let d=attack(s,f,ds,df,f.defending); f.hp-=d } },
    { name:'재생의광기', tag:'딜',   // 즉시(턴 소모X, 공격도 함) 25% 회복 + 3턴간 매턴 4% 재생
      ready:(s,f,ds,df)=> s.cd[1]===0 && s.hp<ds.maxhp*0.65,
      score:(s,f,ds,df,x)=> x.est*3,   // 회복+공격이라 저HP면 최우선
      exec:(s,f,ds,df)=>{ s.hp=Math.min(ds.maxhp,s.hp+Math.round(ds.maxhp*0.25)); s.healRegen=3; let d=attack(s,f,ds,df,f.defending); d=absorb(f,d); f.hp-=d; s.cd[1]=5 } },
  ],
  '기사': [
    { name:'방패가격', tag:'딜',
      ready:(s,f,ds,df)=> s.cd[0]===0 && s.hp>ds.maxhp*0.3,
      score:(s,f,ds,df,x)=> ds.방패가격*(1-df.물방),
      exec:(s,f,ds,df)=>{ let d=ds.방패가격; if(f.defending)d*=0.10; d*=(1-df.물방); d=guts(d,f,df); f.hp-=Math.max(Math.round(d),1); s.cd[0]=3 } },
    { name:'도발', tag:'조건부',
      ready:(s,f,ds,df)=> s.cd[1]===0 && f.noDefend===0 && f.hp>df.maxhp*0.3,
      score:(s,f,ds,df,x)=> x.est*1.2,
      exec:(s,f,ds,df)=>{ applyCC(f,'noDefend',2); let d=attack(s,f,ds,df,f.defending); f.hp-=d; s.cd[1]=5 } },
  ],
  '마법사': [
    { name:'메테오', tag:'조건부',
      ready:(s,f,ds,df,x)=> s.cast===0 && x.safe,
      score:(s,f,ds,df,x)=> ds.메테오,
      exec:(s,f,ds,df)=>{ s.cast=3 } },   // 시전 시작(실제 딜은 cast 종료 시)
    { name:'인스턴트캐스팅', tag:'딜',
      ready:(s,f,ds,df)=> s.cd[1]===0,
      score:(s,f,ds,df,x)=> ds.메테오*1.1,  // 쿨(15) 되면 우선 사용
      exec:(s,f,ds,df)=>{ f.hp-=Math.round(ds.메테오*0.6*guts(1,f,df)); s.cd[1]=15; s.instVuln=3 } },
  ],
  '도적': [
    { name:'암습', tag:'제어',
      ready:(s,f,ds,df)=> s.cd[0]===0 && f.stun===0,
      score:(s,f,ds,df,x)=> x.est + x.foeTurn*2,
      exec:(s,f,ds,df)=>{ applyCC(f,'stun',2); let d=attack(s,f,ds,df,f.defending); f.hp-=d; s.cd[0]=10 } },
    { name:'처형', tag:'조건부',
      ready:(s,f,ds,df)=> s.cd[1]===0 && f.hp<df.maxhp*0.25,
      score:(s,f,ds,df,x)=> ds.물공*5*(1-df.물방),
      exec:(s,f,ds,df)=>{ let d=guts(ds.물공*5*(1-df.물방),f,df); f.hp-=Math.max(Math.round(d),1); s.cd[1]=5 } },
  ],
  '명사수': [
    { name:'약점간파', tag:'딜',
      ready:(s,f,ds,df)=> s.cd[0]===0,
      score:(s,f,ds,df,x)=> ds.물공*(ds.물크기본+ds.크랜폭*0.5)*(1-df.물방),
      exec:(s,f,ds,df)=>{ let d=ds.물공*(ds.물크기본+rand()*ds.크랜폭)*(1-df.물방); if(df.마나경감)d*=(1-df.마나경감); if(f.instVuln>0)d*=1.5; d=guts(d,f,df); d=Math.max(Math.round(d),1); d=absorb(f,d); f.hp-=d; s.cd[0]=4 } },
    { name:'견제사격', tag:'조건부',
      ready:(s,f,ds,df)=> s.cd[1]===0 && f.missDown===0 && f.hp>df.maxhp*0.3,
      score:(s,f,ds,df,x)=> x.est*1.1,
      exec:(s,f,ds,df)=>{ let d=attack(s,f,ds,df,f.defending); f.hp-=d; f.missDown=2; s.cd[1]=4 } },
  ],
  '마검사': [
    { name:'약점봉인', tag:'제어',   // 상대 최고 스탯에 맞는 CC(적응형) + 융합딜
      ready:(s,f,ds,df)=> s.cd[0]===0,
      score:(s,f,ds,df,x)=> x.est + x.foeTurn*2,
      exec:(s,f,ds,df)=>{ applyAdaptiveCC(f,df); let d=attack(s,f,ds,df,f.defending); d=absorb(f,d); f.hp-=d; s.cd[0]=3 } },
    { name:'중력베기', tag:'제어',   // 완전명중 융합딜 + 상대 3턴 슬로우(턴+2초)
      ready:(s,f,ds,df)=> s.cd[1]===0,
      score:(s,f,ds,df,x)=> x.est + x.foeTurn,
      exec:(s,f,ds,df)=>{ let d=attack(s,f,ds,df,f.defending,true); d=absorb(f,d); f.hp-=d; f.slow=Math.max(f.slow,3); f.slowSec=Math.max(f.slowSec,2); s.cd[1]=5 } },
  ],
  '세이지': [
    { name:'오토스펠', tag:'딜',   // 즉시(턴 소모X) + 3턴 버프 유지, 공격마다 10% 볼트. 끝나기 직전 재발동→상시
      ready:(s,f,ds,df)=> s.cd[0]===0 && s.autoSpell<=1,
      score:(s,f,ds,df,x)=> x.est*2.2,   // 버프 유지 최우선(연환보다 위)
      exec:(s,f,ds,df)=>{ s.autoSpell=4; let d=attack(s,f,ds,df,f.defending); d=absorb(f,d); f.hp-=d; s.cd[0]=3 } },
    { name:'연환주문', tag:'딜',   // 물/마 혼합 한방기(혼합 타격 ×3)
      ready:(s,f,ds,df)=> s.cd[1]===0,
      score:(s,f,ds,df,x)=> x.est*2,
      exec:(s,f,ds,df)=>{ let d=Math.round(attack(s,f,ds,df,f.defending)*2); d=absorb(f,d); f.hp-=d; s.cd[1]=4 } },
  ],
  '행운아': [
    { name:'행운폭발', tag:'조건부',
      ready:(s,f,ds,df)=> s.cd[0]===0 && s.luckBuff===0 && f.hp>df.maxhp*0.3,
      score:(s,f,ds,df,x)=> x.est*1.5,
      exec:(s,f,ds,df)=>{ s.luckBuff=3; let d=attack(s,f,ds,df,f.defending); f.hp-=d } },
    { name:'동전던지기', tag:'딜',
      ready:(s,f,ds,df)=> s.cd[1]===0,
      score:(s,f,ds,df,x)=> ds.물공*4.25*(1-df.물방)*(s.hp<f.hp?1.3:1),
      exec:(s,f,ds,df)=>{ const m=rand()<0.5?8:0.5; let d=guts(ds.물공*m*(1-df.물방),f,df); f.hp-=Math.max(Math.round(d),1); s.cd[1]=3 } },
  ],
}
function decideDefend (self, foe, ds, df) {
  const est=(df.물공>df.마공?df.물공:df.마공)*0.5
  if(self.noDefend>0)return false
  if(self.ai==='공격적')return false
  if(self.ai==='방어적')return self.hp<ds.maxhp*0.7&&!self.defendedLast&&rand()<0.55
  return self.hp<=est*1.5&&!self.defendedLast&&rand()<0.7
}
function mkFighter(d, name){
  return {name, hp:d.maxhp, gauge:d.턴, ai:pickAI(), defending:false, defCombo:0, defendedLast:false,
    shield:d.마나경감?Math.round(d.maxhp*0.3):0, vuln:0, cd:[0,0], rage:0, sunder:0, luckBuff:0,
    cast:0, instVuln:0, stun:0, noDefend:0, missDown:0, autoSpell:0, nextAmp:0,
    slow:0, slowSec:0, silence:0, luckLock:0, blind:0, healBlock:0, healRegen:0,
    sigDodge:d.sigDodge, sigEcho:d.sigEcho, sigTank:d.sigTank, echoReady:0, revive:d.sigTank?1:0}
}
function reviveCheck(f, d){ if(f.hp<=0 && f.revive>0){ f.hp=Math.round(d.maxhp*0.20); f.revive--; f.stun=0; f.noDefend=0 } }
function battle (cA, cB) {
  const dA=derive(CHARS[cA]), dB=derive(CHARS[cB])
  const tA=pickTitle(), tB=pickTitle()
  if(tA.d)tA.d(dA); if(tB.d)tB.d(dB)   // 스탯형 타이틀은 파생치에 직접 반영
  const A=mkFighter(dA,cA), B=mkFighter(dB,cB)
  if(tA.flag)A[tA.flag]=true; if(tB.flag)B[tB.flag]=true   // 효과형 타이틀 플래그
  let t=0; const DT=0.1
  const act=(self,foe,ds,df)=>{
    self.defending=false
    self.cd[0]=Math.max(0,self.cd[0]-1); self.cd[1]=Math.max(0,self.cd[1]-1)
    if(self.tRegen && self.healBlock===0)self.hp=Math.min(ds.maxhp,self.hp+Math.round(ds.maxhp*0.03))   // 타이틀 재생(회복금지 시 X)
    if(self.autoSpell>0)self.autoSpell--   // 오토스펠 버프 지속
    if(self.slow>0)self.slow--; if(self.silence>0)self.silence--; if(self.luckLock>0)self.luckLock--; if(self.blind>0)self.blind--; if(self.healBlock>0)self.healBlock--
    if(self.healRegen>0 && self.healBlock===0){ self.hp=Math.min(ds.maxhp,self.hp+Math.round(ds.maxhp*0.04)); self.healRegen-- }   // 재생의광기 지속회복
    if(self.stun>0){ self.stun--; self.defCombo=0; self.defendedLast=false; return }
    if(self.instVuln>0)self.instVuln--
    if(self.noDefend>0)self.noDefend--
    if(self.missDown>0)self.missDown--
    if(self.rage>0){self.rage--; if(self.rage===0)self.cd[0]=2}      // 버프 끝나면 쿨 시작
    if(self.luckBuff>0){self.luckBuff--; if(self.luckBuff===0)self.cd[0]=2}
    if(foe.sunder>0)foe.sunder--
    // 마법사 시전 진행
    if(self.name==='마법사' && self.cast>0){ self.cast--; if(self.cast===0){ let d=guts(ds.메테오,foe,df); foe.hp-=Math.round(d) } self.defCombo=0; self.defendedLast=false; return }
    // ── 태그 기반 행동 선택 ──
    if(self.ai!=='방어적' && self.silence===0){   // 침묵 시 스킬 불가(평타만)
      const foeMagic=df.마공>df.물공
      const foeDmg=(foeMagic?df.마공:df.물공)*0.6
      const foeHits=Math.ceil(3/Math.max(df.턴,2)*ds.턴)+2
      const ctx={ est:estAtk(ds,df), foeTurn:estAtk(df,ds), safe:self.hp>foeDmg*foeHits*0.6 }
      let best=null, bestScore=ctx.est   // 평타 기준선. 스킬이 이걸 넘어야 채택
      for(const sk of SKILLS[self.name]){
        if(!sk.ready(self,foe,ds,df,ctx)) continue
        const sc=sk.score(self,foe,ds,df,ctx)
        if(sc>bestScore){ bestScore=sc; best=sk }
      }
      if(best){ best.exec(self,foe,ds,df); self.defCombo=0; self.defendedLast=false; return }
    }
    // ── 방어 or 평타 ──
    if(decideDefend(self,foe,ds,df)){ self.hp=Math.min(ds.maxhp,self.hp+ds.회복*ds.maxhp/100); self.defending=true; self.defCombo++; self.defendedLast=true }
    else {
      let dmg=attack(self,foe,ds,df,foe.defending)
      if(foe.vuln>0)foe.vuln--
      dmg=absorb(foe,dmg)
      foe.hp-=dmg; self.defCombo=0; self.defendedLast=false
    }
  }
  while(A.hp>0&&B.hp>0&&t<600){ A.gauge-=DT;B.gauge-=DT;t+=DT
    if(A.gauge<=0){A.gauge=Math.max(dA.턴-(A.rage>0?2:0),2)+(A.slow>0?A.slowSec:0);act(A,B,dA,dB); reviveCheck(B,dB)} if(B.hp<=0)break
    if(B.gauge<=0){B.gauge=Math.max(dB.턴-(B.rage>0?2:0),2)+(B.slow>0?B.slowSec:0);act(B,A,dB,dA); reviveCheck(A,dA)} }
  if(t>=600){ TS[tA.name].g++; TS[tB.name].g++; return 'draw' }
  const win=A.hp>0?cA:cB
  TS[tA.name].g++; TS[tB.name].g++
  if(win===cA)TS[tA.name].w++; else TS[tB.name].w++
  return win
}
const TS={}; for(const t of [...TITLES,JACKPOT,...DUDS])TS[t.name]={g:0,w:0}
const names=Object.keys(CHARS); const overall={}; let draws=0
console.log('=== V43: 타이틀(랜덤 매판 변수) + 대박 전설의(0.1%) ===')
for(const a of names){ const row=[];let tot=0,cnt=0
  for(const b of names){ if(a===b){row.push(' - ');continue} let win=0
    for(let i=0;i<2000;i++){const w=i%2===0?battle(a,b):battle(b,a); if(w===a)win++; else if(w==='draw')draws++}
    const p=Math.round(win/20);row.push((p+'%').padStart(4));tot+=p;cnt++ }
  overall[a]=Math.round(tot/cnt); console.log(a.padEnd(6),'|',row.join(' | ')) }
console.log('열:',names.join(' / '))
console.log('--- 종합(캐릭) ---'); for(const n of names)console.log('  '+n.padEnd(6)+': '+overall[n]+'%')
console.log('무승부:',draws)
console.log('--- 타이틀별 승률(밸런스 점검: 50% 근처면 건강) ---')
const trows=[...TITLES,JACKPOT,...DUDS].map(t=>({n:t.name,g:TS[t.name].g,p:TS[t.name].g?TS[t.name].w/TS[t.name].g*100:0}))
trows.sort((a,b)=>b.p-a.p)
for(const r of trows)console.log('  '+r.n.padEnd(8)+': '+r.p.toFixed(1)+'%  ('+r.g+'판)')
