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
  '행운아': { 힘: 25, 지능: 20, 체력: 40, 민첩: 85, 솜씨: 35, 행운: 100 }
}
const AIS = ['공격적','방어적','판단형']; const pickAI=()=>AIS[Math.floor(rand()*3)]
function derive (c) {
  return {
    물공: Math.round(c.힘*(1+step(c.힘,10)/100)), 마공: Math.round(c.지능*(1+step(c.지능,10)/100)),
    물방: (step(c.힘,3)+step(c.체력,1))/100, 마방: Math.min(30+step(c.지능,3),70)/100,
    maxhp: Math.round(50+c.체력*1.1+c.힘*0.5+c.지능*0.2+c.민첩*0.2+c.행운*0.3),
    명중: Math.min(20+step(c.솜씨,5), c.솜씨===100?90:80)/100, 물회: Math.min(10+step(c.민첩,2.5),50)/100, 마회: step(c.민첩,3)/100,
    sigPen:c.힘===100, sigDodge:c.행운===100, sigTank:c.체력===100, sigEcho:c.민첩===100, sigEye:c.지능===100,
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
function attack (A, D, dA, dD, defending) {
  const magic = dA.마공 > dA.물공
  const ls={used:false}, lsD={used:false}
  let dmg, 고정=0
  if (dD.sigDodge && rand()<0.30) return 0   // 천운(행운100): 완전회피 30%
  if (!magic) {
    if (!luckRoll(rand()<(dA.명중-(A.missDown>0?0.2:0)), ls, dA.리롤+(A.luckBuff>0?0.2:0))) return 0
    let dodge = dD.물회
    if (luckRoll(rand()<dodge, lsD, dD.리롤)) { if(dD.sigEcho)D.echoReady=1; return 0 }  // 도적 잔상: 회피 시 다음 확정크리
    dmg = dA.물공
    if (dD.방패막기 && rand()<dD.방패막기) { dmg*=0.30; 고정=dD.방패고정 }
    else if (dD.무기막기 && rand()<dD.무기막기) { dmg*=0.50 }
    dmg *= (1-dD.물방*(dA.sigPen?0.70:1))   // 파괴(힘100): 물방 30% 관통
    if (D.sunder>0) dmg*=1.15
    if (rand()<0.30 && rand()>=(dA.비껴무효+(A.luckBuff>0?0.2:0))) dmg*=0.70
    let crit = luckRoll(rand()<(dA.크리+(A.luckBuff>0?0.2:0)), ls, dA.리롤+(A.luckBuff>0?0.2:0))
    if (A.echoReady) { crit=true; A.echoReady=0 }
    if (crit) dmg*=(dA.물크기본+rand()*dA.크랜폭)*(A.luckBuff>0?2:1)
  } else {
    if (luckRoll(false, lsD, dD.리롤)) return 0
    dmg = dA.마공
    if (dD.방패막기 && rand()<dD.방패막기) { dmg*=0.30; 고정=dD.방패고정 }
    dmg *= (1-dD.마방)
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
  return Math.max(Math.round(dmg),1)
}
// ── 공통 헬퍼 ──
function guts(dmg, foe, df){ const p=foe.hp/df.maxhp; if(p<0.5)dmg*=(1-df.근성*((0.5-p)/0.5)); return dmg }
function absorb(foe, dmg){ // 실드 흡수. 남은 데미지 반환
  if(foe.shield>0){ if(dmg<=foe.shield){foe.shield-=dmg; return 0} else {const r=dmg-foe.shield; foe.shield=0; foe.vuln=1; return r} }
  return dmg
}
function applyCC(foe, field, dur){ foe[field]=Math.max(foe[field], foe.sigTank?Math.max(dur-1,0):dur) }  // 기사 불굴: CC 지속 -1턴
function estAtk(a, d){ // 평타 기대딜(순위용 근사)
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
    { name:'피의갈망', tag:'딜',
      ready:(s,f,ds,df)=> s.cd[1]===0,
      score:(s,f,ds,df,x)=> x.est*1.05,
      exec:(s,f,ds,df)=>{ let d=attack(s,f,ds,df,f.defending); f.hp-=d; s.hp=Math.min(ds.maxhp,s.hp+Math.round(d*0.5)); s.cd[1]=4 } },
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
    cast:0, instVuln:0, stun:0, noDefend:0, missDown:0,
    sigDodge:d.sigDodge, sigEcho:d.sigEcho, sigTank:d.sigTank, echoReady:0, revive:d.sigTank?1:0}
}
function reviveCheck(f, d){ if(f.hp<=0 && f.revive>0){ f.hp=Math.round(d.maxhp*0.20); f.revive--; f.stun=0; f.noDefend=0 } }
function battle (cA, cB) {
  const dA=derive(CHARS[cA]), dB=derive(CHARS[cB])
  const A=mkFighter(dA,cA), B=mkFighter(dB,cB)
  let t=0; const DT=0.1
  const act=(self,foe,ds,df)=>{
    self.defending=false
    self.cd[0]=Math.max(0,self.cd[0]-1); self.cd[1]=Math.max(0,self.cd[1]-1)
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
    if(self.ai!=='방어적'){
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
    if(A.gauge<=0){A.gauge=Math.max(dA.턴-(A.rage>0?2:0),2);act(A,B,dA,dB); reviveCheck(B,dB)} if(B.hp<=0)break
    if(B.gauge<=0){B.gauge=Math.max(dB.턴-(B.rage>0?2:0),2);act(B,A,dB,dA); reviveCheck(A,dA)} }
  if(t>=600)return 'draw'
  return A.hp>0?cA:cB
}
const names=Object.keys(CHARS); const overall={}; let draws=0
console.log('=== V41: 태그 기반 AI (딜/제어/조건부) ===')
for(const a of names){ const row=[];let tot=0,cnt=0
  for(const b of names){ if(a===b){row.push(' - ');continue} let win=0
    for(let i=0;i<2000;i++){const w=i%2===0?battle(a,b):battle(b,a); if(w===a)win++; else if(w==='draw')draws++}
    const p=Math.round(win/20);row.push((p+'%').padStart(4));tot+=p;cnt++ }
  overall[a]=Math.round(tot/cnt); console.log(a.padEnd(6),'|',row.join(' | ')) }
console.log('열:',names.join(' / '))
console.log('--- 종합 ---'); for(const n of names)console.log('  '+n.padEnd(6)+': '+overall[n]+'%')
console.log('무승부:',draws)
