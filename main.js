let charts=[]; const yen=v=> Math.round(v).toLocaleString()+"万円"; const val=id=>parseFloat(document.getElementById(id).value)||0;
function loanPayment(principal, annualRate, years){const r=annualRate/100/12,n=years*12;if(r===0)return principal/n;return principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)}
function loanBalance(principal, annualRate, years, paidMonths){const r=annualRate/100/12,n=years*12,p=loanPayment(principal,annualRate,years);if(paidMonths>=n)return 0;if(r===0)return Math.max(0,principal-p*paidMonths);return Math.max(0,principal*Math.pow(1+r,paidMonths)-p*(Math.pow(1+r,paidMonths)-1)/r)}


function calcAgeFromDob(dob, asOf=new Date()){
 if(!dob) return null;
 const d=new Date(dob+'T00:00:00'); if(isNaN(d)) return null;
 let age=asOf.getFullYear()-d.getFullYear();
 const m=asOf.getMonth()-d.getMonth();
 if(m<0 || (m===0 && asOf.getDate()<d.getDate())) age--;
 return age;
}
function getChildren(){return [...document.querySelectorAll('.childRow')].map(row=>({name:row.querySelector('.childName')?.value||'',relation:row.querySelector('.childRelation')?.value||'',dob:row.querySelector('.childDob')?.value||''})).filter(c=>c.name||c.relation||c.dob);}
function addChild(){const list=document.getElementById('childList'); const div=document.createElement('div'); div.className='childRow'; div.innerHTML=`<div class="field"><label>名前</label><input class="childName" type="text" value=""></div><div class="field"><label>続柄</label><input class="childRelation" type="text" value=""></div><div class="field"><label>生年月日</label><input class="childDob" type="date" value=""></div><button type="button" onclick="removeChild(this)">削除</button>`; list.appendChild(div); div.querySelectorAll('input').forEach(el=>el.addEventListener('input',run)); run();}
function removeChild(btn){btn.closest('.childRow')?.remove(); run();}
function getFamily(){
 const today=new Date();
 return {
  owner:{name:document.getElementById('ownerName')?.value||'世帯主',relation:'世帯主',dob:document.getElementById('ownerDob')?.value||'',age:calcAgeFromDob(document.getElementById('ownerDob')?.value,today),job:document.getElementById('ownerJob')?.value||''},
  spouse:{name:document.getElementById('spouseName')?.value||'配偶者',relation:'配偶者',dob:document.getElementById('spouseDob')?.value||'',age:calcAgeFromDob(document.getElementById('spouseDob')?.value,today),job:document.getElementById('spouseJob')?.value||''},
  children:getChildren().map(c=>({...c,age:calcAgeFromDob(c.dob,today),job:''}))
 };
}
function syncAgeFromOwnerDob(){const a=calcAgeFromDob(document.getElementById('ownerDob')?.value); if(a!==null){const ageInput=document.getElementById('age'); if(ageInput && (!ageInput.dataset.userEdited || ageInput.dataset.userEdited==='dob')){ageInput.value=a; ageInput.dataset.userEdited='dob';}}}
function renderFamily(){const fam=getFamily(); const members=[fam.owner]; if(fam.spouse.name||fam.spouse.dob||fam.spouse.job) members.push(fam.spouse); fam.children.forEach(c=>members.push({...c,job:''}));
 const table=document.getElementById('familyTable'); if(table){table.innerHTML='<tr><th>名前</th><th>続柄</th><th>年齢</th><th>職業</th></tr>'+members.map(m=>`<tr><td>${m.name||'-'}</td><td>${m.relation||'-'}</td><td>${m.age!==null?m.age+'歳':'-'}</td><td>${m.job||'-'}</td></tr>`).join('');}
 const mini=document.getElementById('familyMini'); if(mini){mini.textContent=`世帯主 ${fam.owner.age!==null?fam.owner.age+'歳':'-'} ／ 配偶者 ${fam.spouse.age!==null?fam.spouse.age+'歳':'-'} ／ 子ども ${fam.children.length}人`;}
}
function childSchoolEvents(){const ownerAge=val('age'); const out=[]; getFamily().children.forEach(c=>{if(c.age===null) return; const label=(c.relation||c.name||'子ども'); [[6,'小学校入学'],[12,'中学校入学'],[15,'高校入学'],[18,'大学入学']].forEach(([target,name])=>{const at=ownerAge+(target-c.age); if(at>=ownerAge && at<=val('endAge')) out.push([`${label} ${name}`,at]);});}); return out;}

function getOneTimeEvents(){return [...document.querySelectorAll('.oneTimeRow')].map(row=>({age:parseFloat(row.querySelector('.eventAge')?.value)||0,name:row.querySelector('.eventName')?.value||'ライフイベント',income:parseFloat(row.querySelector('.eventIncome')?.value)||0,expense:parseFloat(row.querySelector('.eventExpense')?.value)||0})).filter(e=>e.age>0&&(e.income||e.expense||e.name));}
function addOneTime(){const list=document.getElementById('oneTimeList'); const div=document.createElement('div'); div.className='oneTimeRow'; div.innerHTML=`<div class="field eventAgeField"><label>年齢</label><input class="eventAge" type="number" value=""></div><div class="field eventNameField"><label>内容</label><input class="eventName" type="text" value=""></div><div class="field eventIncomeField"><label>ライフイベント収入（万円）</label><input class="eventIncome" type="number" value="0"></div><div class="field eventExpenseField"><label>ライフイベント費用（万円）</label><input class="eventExpense" type="number" value="0"></div><button type="button" onclick="removeOneTime(this)">削除</button>`; list.appendChild(div); div.querySelectorAll('input').forEach(el=>el.addEventListener('input',run));}
function removeOneTime(btn){btn.closest('.oneTimeRow')?.remove(); run();}




const RENOVATION_TYPES={
 '給湯器交換':25,
 '外壁塗装':120,
 '屋根工事':100,
 'キッチン交換':100,
 '浴室交換':120,
 'トイレ交換':30,
 '洗面台交換':25,
 'クロス張替え':60,
 'フローリング張替え':100,
 '水回り一式':300,
 '全面リフォーム':500,
 'その他':0
};
function renovationOptions(selected='給湯器交換'){return Object.keys(RENOVATION_TYPES).map(name=>`<option value="${escapeAttr(name)}"${name===selected?' selected':''}>${name}</option>`).join('');}
function initRenovationSelects(){document.querySelectorAll('.renovationType').forEach((el,i)=>{const selected=el.dataset.value||el.value||'給湯器交換';el.innerHTML=renovationOptions(selected);if(i===0&&!el.value)el.value='給湯器交換';});}
function getRenovations(){return [...document.querySelectorAll('.renovationRow')].map(row=>({age:parseFloat(row.querySelector('.renovationAge')?.value)||0,type:row.querySelector('.renovationType')?.value||'その他',cost:parseFloat(row.querySelector('.renovationCost')?.value)||0})).filter(r=>r.age>0&&(r.cost>0||r.type));}
function addRenovation(item={age:'',type:'給湯器交換',cost:25}){const list=document.getElementById('renovationList');const div=document.createElement('div');div.className='renovationRow';div.innerHTML=`<div class="field"><label>実施年齢</label><input class="renovationAge" type="number" value="${escapeAttr(item.age??'')}"></div><div class="field"><label>内容</label><select class="renovationType" onchange="applyRenovationEstimate(this)">${renovationOptions(item.type||'給湯器交換')}</select></div><div class="field"><label>想定費用（万円）</label><input class="renovationCost" type="number" value="${escapeAttr(item.cost??RENOVATION_TYPES[item.type]??0)}"></div><button type="button" onclick="removeRenovation(this)">削除</button>`;list.appendChild(div);div.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',run));run();}
function removeRenovation(btn){btn.closest('.renovationRow')?.remove();run();}
function applyRenovationEstimate(select){const row=select.closest('.renovationRow');const cost=row?.querySelector('.renovationCost');if(cost)cost.value=RENOVATION_TYPES[select.value]??0;run();}
function setRenovationRows(items){const list=document.getElementById('renovationList');if(!list)return;list.innerHTML='';(items&&items.length?items:[]).forEach(item=>addRenovation(item));if(!items?.length)addRenovation({age:'',type:'給湯器交換',cost:25});}


function updatePurchaseType(){const type=document.getElementById('purchaseType')?.value||'usedCondo';document.querySelectorAll('.purchaseFields').forEach(el=>{el.hidden=!el.dataset.types.split(',').includes(type);});run();}
function getLivingStages(){return [...document.querySelectorAll('.livingStageRow')].map(r=>({age:parseFloat(r.querySelector('.livingStageAge')?.value)||0,amount:parseFloat(r.querySelector('.livingStageAmount')?.value)||0})).filter(x=>x.age>0).sort((a,b)=>a.age-b.age);}
function getLivingMonthAtAge(age,base){let amount=base;getLivingStages().forEach(s=>{if(age>=s.age)amount=s.amount;});return amount;}
function addLivingStage(item={age:'',amount:''}){const list=document.getElementById('livingStageList');const d=document.createElement('div');d.className='dynamicRow livingStageRow';d.innerHTML=`<div class="field"><label>開始年齢</label><input class="livingStageAge" type="number" value="${escapeAttr(item.age??'')}"></div><div class="field"><label>生活費/月（万円）</label><input class="livingStageAmount" type="number" step="0.1" value="${escapeAttr(item.amount??'')}"></div><button type="button" onclick="removeLivingStage(this)">削除</button>`;list.appendChild(d);d.querySelectorAll('input').forEach(el=>el.addEventListener('input',run));run();}
function removeLivingStage(btn){btn.closest('.livingStageRow')?.remove();run();}
function setLivingStages(items){const list=document.getElementById('livingStageList');if(!list)return;list.innerHTML='';(items||[]).forEach(addLivingStage);}
function getFurniture(){return [...document.querySelectorAll('.furnitureRow')].map(r=>({type:r.querySelector('.furnitureType')?.value||'その他',cost:parseFloat(r.querySelector('.furnitureCost')?.value)||0})).filter(x=>x.cost>0||x.type);}
function addFurniture(item={type:'その他',cost:0}){const opts=['エアコン','冷蔵庫','洗濯機','テレビ','ソファ','ダイニングセット','ベッド','カーテン','その他'].map(x=>`<option${x===item.type?' selected':''}>${x}</option>`).join('');const list=document.getElementById('furnitureList');const d=document.createElement('div');d.className='dynamicRow furnitureRow';d.innerHTML=`<div class="field"><label>内容</label><select class="furnitureType">${opts}</select></div><div class="field"><label>金額（万円）</label><input class="furnitureCost" type="number" value="${escapeAttr(item.cost??0)}"></div><button type="button" onclick="removeFurniture(this)">削除</button>`;list.appendChild(d);d.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',run));run();}
function removeFurniture(btn){btn.closest('.furnitureRow')?.remove();run();}
function setFurnitureRows(items){const list=document.getElementById('furnitureList');if(!list)return;list.innerHTML='';(items&&items.length?items:[]).forEach(addFurniture);if(!items?.length)addFurniture({type:'その他',cost:0});}

const STORAGE_KEY='coshaLifePlanner_v28_multi';
let currentPlanId=null;
function setSaveStatus(msg){const el=document.getElementById('saveStatus'); if(el) el.textContent=msg;}
function getPlanStore(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{"plans":[],"currentId":null}');}
  catch(e){return {plans:[],currentId:null};}
}
function setPlanStore(store){localStorage.setItem(STORAGE_KEY, JSON.stringify(store));}
function collectPlanData(){
  const data={inputs:{}, children:getChildren(), events:getOneTimeEvents(), renovations:getRenovations(), livingStages:getLivingStages(), furniture:getFurniture(), cf:{}};
  document.querySelectorAll('.panel input[id], .panel select[id]').forEach(el=>{data.inputs[el.id]=el.value;});
  document.querySelectorAll('#cfControls input[type=checkbox]').forEach(el=>{data.cf[el.dataset.cf]=el.checked;});
  return data;
}
function guessPlanName(){
  const owner=document.getElementById('ownerName')?.value?.trim();
  if(owner) return owner.endsWith('様')?owner:owner+'様';
  return '名称未設定';
}
function saveAsNewPlan(){
  const name=prompt('保存名を入力してください', guessPlanName());
  if(!name) return;
  const store=getPlanStore();
  const id='plan_'+Date.now();
  const now=new Date().toISOString();
  store.plans.unshift({id,name:name.trim(),createdAt:now,updatedAt:now,data:collectPlanData()});
  store.currentId=id;
  setPlanStore(store);
  currentPlanId=id;
  renderSavedPlans();
  setSaveStatus(`保存しました：${name.trim()}`);
}
function overwriteCurrentPlan(){
  const store=getPlanStore();
  let id=currentPlanId || store.currentId;
  let plan=store.plans.find(p=>p.id===id);
  if(!plan){ saveAsNewPlan(); return; }
  plan.data=collectPlanData();
  plan.updatedAt=new Date().toISOString();
  setPlanStore(store);
  renderSavedPlans();
  setSaveStatus(`上書き保存しました：${plan.name}`);
}
function loadPlanById(id){
  const store=getPlanStore();
  const plan=store.plans.find(p=>p.id===id);
  if(!plan){setSaveStatus('保存データが見つかりません。'); return;}
  applyPlanData(plan.data);
  store.currentId=id;
  setPlanStore(store);
  currentPlanId=id;
  renderSavedPlans();
  setSaveStatus(`読み込みました：${plan.name}`);
}
function deletePlanById(id){
  const store=getPlanStore();
  const plan=store.plans.find(p=>p.id===id);
  if(!plan) return;
  if(!confirm(`${plan.name}を削除しますか？`)) return;
  store.plans=store.plans.filter(p=>p.id!==id);
  if(store.currentId===id) store.currentId=store.plans[0]?.id||null;
  setPlanStore(store);
  currentPlanId=store.currentId;
  renderSavedPlans();
  setSaveStatus('保存データを削除しました。');
}
function renamePlanById(id){
  const store=getPlanStore();
  const plan=store.plans.find(p=>p.id===id);
  if(!plan) return;
  const name=prompt('保存名を変更してください', plan.name);
  if(!name) return;
  plan.name=name.trim();
  plan.updatedAt=new Date().toISOString();
  setPlanStore(store);
  renderSavedPlans();
  setSaveStatus(`保存名を変更しました：${plan.name}`);
}
function applyPlanData(data){
  Object.entries(data.inputs||{}).forEach(([id,value])=>{const el=document.getElementById(id); if(el) el.value=value;});
  Object.entries(data.cf||{}).forEach(([key,checked])=>{const el=document.querySelector(`#cfControls input[data-cf="${key}"]`); if(el) el.checked=!!checked;});
  setChildRows(data.children||[]);
  setEventRows(data.events||[]);
  setRenovationRows(data.renovations||[]);
  setLivingStages(data.livingStages||[]);
  setFurnitureRows(data.furniture||[]);
  updatePurchaseType();
  document.getElementById('age')?.setAttribute('data-user-edited','manual');
  run();
}
function setChildRows(children){
  const list=document.getElementById('childList');
  if(!list) return;
  list.innerHTML='';
  (children&&children.length?children:[]).forEach(c=>{
    const div=document.createElement('div');
    div.className='childRow';
    div.innerHTML=`<div class="field"><label>名前</label><input class="childName" type="text" value="${escapeAttr(c.name||'')}"></div><div class="field"><label>続柄</label><input class="childRelation" type="text" value="${escapeAttr(c.relation||'')}"></div><div class="field"><label>生年月日</label><input class="childDob" type="date" value="${escapeAttr(c.dob||'')}"></div><button type="button" onclick="removeChild(this)">削除</button>`;
    list.appendChild(div);
  });
  list.querySelectorAll('input').forEach(el=>el.addEventListener('input',run));
}
function setEventRows(events){
  const list=document.getElementById('oneTimeList');
  if(!list) return;
  list.innerHTML='';
  (events&&events.length?events:[]).forEach(e=>{
    const div=document.createElement('div');
    div.className='oneTimeRow';
    div.innerHTML=`<div class="field eventAgeField"><label>年齢</label><input class="eventAge" type="number" value="${escapeAttr(e.age||'')}"></div><div class="field eventNameField"><label>内容</label><input class="eventName" type="text" value="${escapeAttr(e.name||'')}"></div><div class="field eventIncomeField"><label>ライフイベント収入（万円）</label><input class="eventIncome" type="number" value="${escapeAttr(e.income||0)}"></div><div class="field eventExpenseField"><label>ライフイベント費用（万円）</label><input class="eventExpense" type="number" value="${escapeAttr(e.expense||0)}"></div><button type="button" onclick="removeOneTime(this)">削除</button>`;
    list.appendChild(div);
  });
  list.querySelectorAll('input').forEach(el=>el.addEventListener('input',run));
}
function escapeAttr(v){return String(v).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function renderSavedPlans(){
  const list=document.getElementById('savedPlanList');
  if(!list) return;
  const store=getPlanStore();
  currentPlanId=store.currentId;
  if(!store.plans.length){
    list.innerHTML='<div class="emptySave">保存データはありません。<br>「＋ 新規保存」から保存できます。</div>';
    return;
  }
  list.innerHTML=store.plans.map(p=>{
    const date=p.updatedAt?new Date(p.updatedAt).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
    const selected=p.id===store.currentId?' style="outline:2px solid rgba(184,137,104,.35)"':'';
    return `<div class="savedPlanItem"${selected}><div><div class="name">${escapeHtml(p.name)}</div><div class="meta">更新：${escapeHtml(date)}</div></div><button type="button" class="secondary" onclick="loadPlanById('${p.id}')">開く</button><button type="button" class="danger" onclick="deletePlanById('${p.id}')">削除</button></div>`;
  }).join('');
}
function escapeHtml(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function initSaveStatus(){
  const store=getPlanStore();
  currentPlanId=store.currentId;
  renderSavedPlans();
  setSaveStatus(store.plans.length?`${store.plans.length}件保存済み`:'未保存');
}


function estimateNisaBalanceAtStart(){
 const age=val('age'), start=val('nisaWithdrawAge');
 let nisa=val('nisaNow');
 const annualAdd=val('nisaMonthly')*12;
 const rate=val('nisaRate')/100;
 const end=val('nisaEnd');
 if(start<age) return nisa;
 for(let y=age;y<=start;y++){
   if(y<=end){ nisa=nisa*(1+rate)+annualAdd; }
   else if(y<start){ nisa=nisa*(1+rate); }
   else { nisa=nisa*(1+rate); }
 }
 return Math.max(0,nisa);
}
function estimateIdecoBalanceAtStart(){
 const age=val('age'), start=val('idecoReceiveAge');
 let ideco=val('idecoNow');
 const annualAdd=val('idecoMonthly')*12;
 const rate=val('idecoRate')/100;
 if(start<age) return ideco;
 for(let y=age;y<=start;y++){
   const add=y<start?annualAdd:0;
   ideco=ideco*(1+rate)+add;
 }
 return Math.max(0,ideco);
}
function updateWithdrawEstimates(){
 const nisaBal=estimateNisaBalanceAtStart();
 const nisaAge=val('nisaWithdrawAge');
 const nisaMonthly=val('nisaWithdrawMonthly');
 const targetAge=val('nisaTargetEndAge');
 const nisaStartEl=document.getElementById('nisaStartBalance');
 if(nisaStartEl) nisaStartEl.textContent=yen(nisaBal);
 const months=nisaMonthly>0 ? Math.floor(nisaBal/nisaMonthly) : 0;
 const years=months/12;
 const endAge=nisaMonthly>0 ? nisaAge+years : null;
 const ns=document.getElementById('nisaWithdrawSummary');
 if(ns){
   ns.innerHTML = nisaMonthly>0
     ? `毎月 <b>${nisaMonthly.toLocaleString(undefined,{maximumFractionDigits:1})}万円</b> 取り崩す場合、約 <b>${years.toFixed(1)}年</b>、<b>${Math.floor(endAge)}歳頃</b> まで受取可能です。`
     : '毎月取り崩し額を入力すると、何歳頃まで持つかを表示します。';
 }
 const rs=document.getElementById('nisaReverseSummary');
 if(rs){
   const targetMonths=Math.max(0,(targetAge-nisaAge)*12);
   const possible=targetMonths>0 ? nisaBal/targetMonths : 0;
   rs.innerHTML = targetMonths>0
     ? `<b>${targetAge}歳</b> まで持たせる場合、毎月取り崩し目安は約 <b>${possible.toLocaleString(undefined,{maximumFractionDigits:1})}万円</b> です。`
     : '目標年齢は取り崩し開始年齢より後にしてください。';
 }
 const idecoBal=estimateIdecoBalanceAtStart();
 const idecoStartEl=document.getElementById('idecoStartBalance');
 if(idecoStartEl) idecoStartEl.textContent=yen(idecoBal);
 const method=document.getElementById('idecoReceiveMethod')?.value||'pension';
 const years2=Math.max(1,val('idecoReceiveYears')||10);
 const is=document.getElementById('idecoReceiveSummary');
 if(is){
   if(method==='lump'){
     is.innerHTML=`一時金で受け取る場合、受取額目安は約 <b>${yen(idecoBal)}</b> です。`;
   }else{
     const annual=idecoBal/years2;
     const monthly=annual/12;
     is.innerHTML=`${years2}年の年金形式の場合、年間約 <b>${annual.toLocaleString(undefined,{maximumFractionDigits:1})}万円</b>（月約 <b>${monthly.toLocaleString(undefined,{maximumFractionDigits:1})}万円</b>）の受取目安です。`;
   }
 }
}

function simulate(){
 const age=val('age'),endAge=val('endAge'),retire=val('retireAge'),pAge=val('pensionAge');
 const ownerIncome0=val('income'),spouseIncome0=val('spouseIncome'),raise=val('raise')/100,pension=val('pension'),otherIncomeBase=val('otherIncome'),cash0=val('cash'),livingBaseMonth=(val('food')+val('utilities')+val('comm')+val('insurance')+val('education')+val('car')+val('leisure')+val('otherExpense')),rent=val('rent')*12;
 const purchaseType=document.getElementById('purchaseType')?.value||'usedCondo'; const price=purchaseType==='landOrder'?(val('landPrice')+val('buildingCost')):val('price'),cost=val('cost'),down=val('down'),rate=val('rate'),term=val('term'),tax=val('tax'),maint=(purchaseType==='usedCondo'?(val('managementFee')+val('repairReserve')):0)*12,fireInsurance=val('fireInsurance'),movingCost=val('movingCost'),furniture=getFurniture(),furnitureTotal=furniture.reduce((a,x)=>a+x.cost,0);
 const oneTimeEvents=getOneTimeEvents();
 const renovations=getRenovations();
 const nisaNow=val('nisaNow'),nisaM=val('nisaMonthly')*12,nisaRate=val('nisaRate')/100,nisaEnd=val('nisaEnd'),nisaWithdrawAge=val('nisaWithdrawAge'),nisaWithdrawAnnual=val('nisaWithdrawMonthly')*12;
 const idecoNow=val('idecoNow'),idecoM=val('idecoMonthly')*12,idecoRate=val('idecoRate')/100,idecoReceiveAge=val('idecoReceiveAge'),idecoReceiveMethod=(document.getElementById('idecoReceiveMethod')?.value||'pension'),idecoReceiveYears=Math.max(1,val('idecoReceiveYears')||10);
 const otherAssetNow=val('fundNow')+val('stockNow')+val('otherAssetNow'),otherAssetRate=val('otherAssetRate')/100;
 const borrowInput=val('borrow'); const borrow=Math.max(0, borrowInput || (price+cost-down)); const mpay=loanPayment(borrow,rate,term);
 let cashBuy=cash0-down, cashRent=cash0, nisa=nisaNow, ideco=idecoNow, otherAsset=otherAssetNow, rows=[];
 let data={ages:[],cashBuy:[],cashRent:[],nisa:[],ideco:[],otherAsset:[],financial:[],loan:[],estate:[],netBuy:[],netRent:[],cf:{ownerIncome:[],spouseIncome:[],pensionIncome:[],otherIncome:[],oneTimeIncome:[],living:[],houseCost:[],investment:[],furnitureExpense:[],renovationExpense:[],oneTimeExpense:[],idecoReceive:[],nisaWithdraw:[],annualCF:[]}};
 for(let y=age;y<=endAge;y++){
   let i=y-age;
   let ownerIncome=y<retire?ownerIncome0*Math.pow(1+raise,i):0;
   let spouseIncome=y<retire?spouseIncome0*Math.pow(1+raise,i):0;
   let pensionIncome=y>=pAge?pension:0;
   let otherInc=otherIncomeBase;
   let inc=ownerIncome+spouseIncome+pensionIncome+otherInc;
   let living=getLivingMonthAtAge(y,livingBaseMonth)*12;
   let loan=loanBalance(borrow,rate,term,i*12);
   let fireExpense=((y-age)%5===0)?fireInsurance:0;
   let houseCost=(loan>0?mpay*12:0)+tax+maint+fireExpense;
   let nisaAdd=0;
   if(y<nisaWithdrawAge){
     nisaAdd=y<=nisaEnd?nisaM:0;
     nisa=nisa*(1+nisaRate)+nisaAdd;
   }else if(y===nisaWithdrawAge){
     nisaAdd=y<=nisaEnd?nisaM:0;
     nisa=nisa*(1+nisaRate)+nisaAdd;
   }
   let nisaWithdraw=0;
   if(y>=nisaWithdrawAge && nisaWithdrawAnnual>0 && nisa>0){
     nisaWithdraw=Math.min(nisa,nisaWithdrawAnnual);
     nisa=Math.max(0,nisa-nisaWithdraw);
   }
   let idecoAdd=0;
   if(y<idecoReceiveAge){
     idecoAdd=idecoM;
     ideco=ideco*(1+idecoRate)+idecoAdd;
   }else if(y===idecoReceiveAge){
     ideco=ideco*(1+idecoRate);
   }
   let idecoReceive=0;
   if(y>=idecoReceiveAge && ideco>0){
     if(idecoReceiveMethod==='lump'){
       if(y===idecoReceiveAge){idecoReceive=ideco; ideco=0;}
     }else{
       const payoutEnd=idecoReceiveAge+idecoReceiveYears;
       if(y<payoutEnd){
         const remainingYears=Math.max(1,payoutEnd-y);
         idecoReceive=ideco/remainingYears;
         ideco=Math.max(0,ideco-idecoReceive);
       }
     }
   }
   otherAsset=otherAsset*(1+otherAssetRate);
   let investmentAdd=nisaAdd+idecoAdd;
   let eventsThisYear=oneTimeEvents.filter(e=>e.age===y);
   let oneTimeIncome=eventsThisYear.reduce((sum,e)=>sum+e.income,0);
   let oneTimeExpense=eventsThisYear.reduce((sum,e)=>sum+e.expense,0);
   let renovationsThisYear=renovations.filter(r=>r.age===y);
   let renovationExpense=renovationsThisYear.reduce((sum,r)=>sum+r.cost,0);
   let furnitureExpense=(y===age)?(furnitureTotal+movingCost):0;
   let cfBuy=inc+oneTimeIncome+idecoReceive+nisaWithdraw-living-houseCost-investmentAdd-oneTimeExpense-renovationExpense-furnitureExpense;
   let cfRent=inc+oneTimeIncome+idecoReceive+nisaWithdraw-living-rent-investmentAdd-oneTimeExpense-renovationExpense;
   cashBuy+=cfBuy; cashRent+=cfRent;
   let estate=price*Math.pow(.995,i);
   let financial=cashBuy+nisa+ideco+otherAsset;
   let netB=financial+estate-loan;
   let netR=cashRent+nisa+ideco+otherAsset;
   data.ages.push(y); data.cashBuy.push(Math.round(cashBuy)); data.cashRent.push(Math.round(cashRent)); data.nisa.push(Math.round(nisa)); data.ideco.push(Math.round(ideco)); data.otherAsset.push(Math.round(otherAsset)); data.financial.push(Math.round(financial)); data.loan.push(Math.round(loan)); data.estate.push(Math.round(estate)); data.netBuy.push(Math.round(netB)); data.netRent.push(Math.round(netR));
   data.cf.ownerIncome.push(Math.round(ownerIncome)); data.cf.spouseIncome.push(Math.round(spouseIncome)); data.cf.pensionIncome.push(Math.round(pensionIncome)); data.cf.otherIncome.push(Math.round(otherInc)); data.cf.oneTimeIncome.push(Math.round(oneTimeIncome)); data.cf.living.push(-Math.round(living)); data.cf.houseCost.push(-Math.round(houseCost)); data.cf.investment.push(-Math.round(investmentAdd)); data.cf.furnitureExpense.push(-Math.round(furnitureExpense)); data.cf.renovationExpense.push(-Math.round(renovationExpense)); data.cf.oneTimeExpense.push(-Math.round(oneTimeExpense)); data.cf.idecoReceive.push(Math.round(idecoReceive)); data.cf.nisaWithdraw.push(Math.round(nisaWithdraw)); data.cf.annualCF.push(Math.round(cfBuy));
   rows.push({age:y,livingMonth:living/12,furnitureExpense,ownerIncome,spouseIncome,pensionIncome,otherIncome:otherInc,income:inc,oneTimeIncome,expense:living,houseCost,fireExpense,renovationExpense,oneTimeExpense,idecoReceive,nisaWithdraw,nisaAdd,idecoAdd,investmentAdd,cfBuy,cashBuy,loan,financial,netB,eventsThisYear,renovationsThisYear});
 }
 return {data,rows,mpay,borrow};
}
const CHART_COLORS={
  // 収入：青系
  '世帯主給与':'#1d4ed8',
  '配偶者給与':'#60a5fa',
  '年金':'#38bdf8',
  'その他収入':'#93c5fd',
  'ライフイベント収入':'#0ea5e9',
  'iDeCo受取':'#14b8a6',
  'NISA取り崩し':'#16a34a',
  // 支出：赤・オレンジ系
  '生活費':'#f87171',
  '住宅費':'#fb923c',
  'NISA/iDeCo':'#34d399',
  'リフォーム費用':'#c2410c',
  'ライフイベント費用':'#dc2626',
  '年間収支':'#374151',
  // 資産形成：緑系
  'NISA':'#22c55e',
  'iDeCo':'#84cc16',
  'その他金融資産':'#2dd4bf',
  '金融資産合計':'#15803d',
  '現預金':'#0f766e',
  '金融資産':'#16a34a',
  '住宅ローン残高':'#9ca3af',
  '今回のシミュレーション':'#1d4ed8'
};
function withChartColor(ds){
  const c=CHART_COLORS[ds.label];
  if(c){
    ds.borderColor=ds.borderColor||c;
    ds.backgroundColor=ds.backgroundColor||c;
    ds.pointBackgroundColor=ds.pointBackgroundColor||c;
  }
  const isLine = ds.type==='line' || ds.showLine || ds.borderWidth;
  if(isLine){
    ds.borderWidth = ds.borderWidth ?? 1.8;
    ds.pointRadius = ds.pointRadius ?? 0;
    ds.pointHoverRadius = ds.pointHoverRadius ?? 4;
    ds.tension = ds.tension ?? .22;
    ds.fill = ds.fill ?? false;
  }
  return ds;
}
function draw(id,type,labels,datasets,extraOptions={}){const ctx=document.getElementById(id); const colored=datasets.map(d=>withChartColor(d)); const tooltipLabel=extraOptions.tooltipLabel; delete extraOptions.tooltipLabel; const defaultPlugins={legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10,padding:12,font:{size:11}}},tooltip:{callbacks:{label:tooltipLabel||((c)=>`${c.dataset.label}: ${yen(c.raw)}`)}}}; const plugins={...defaultPlugins,...(extraOptions.plugins||{})}; charts.push(new Chart(ctx,{type, data:{labels,datasets:colored}, options:{responsive:true,maintainAspectRatio:false,plugins,elements:{line:{borderWidth:1.8},point:{radius:0,hoverRadius:4}},scales:{y:{ticks:{callback:v=>v+'万'}},...(extraOptions.scales||{})},...extraOptions,plugins}}))}
function cfChecked(key){const el=document.querySelector(`#cfControls input[data-cf="${key}"]`); return !el || el.checked;}
function cfDataset(label,key,data){return cfChecked(key)?withChartColor({label,data:data.cf[key],borderWidth:0,stack:'cf'}):null;}
function drawCashflow(data,rows){
 const inner=document.getElementById('cashflowChartInner');
 if(inner){ inner.style.width=Math.max(980, data.ages.length*34)+'px'; }
 const sets=[
   cfDataset('世帯主給与','ownerIncome',data),
   cfDataset('配偶者給与','spouseIncome',data),
   cfDataset('年金','pensionIncome',data),
   cfDataset('その他収入','otherIncome',data),
   cfDataset('ライフイベント収入','oneTimeIncome',data),
   cfDataset('iDeCo受取','idecoReceive',data),
   cfDataset('NISA取り崩し','nisaWithdraw',data),
   cfDataset('生活費','living',data),
   cfDataset('住宅費','houseCost',data),
   cfDataset('NISA/iDeCo','investment',data),
   cfDataset('家具・家電・引越し','furnitureExpense',data),
   cfDataset('リフォーム費用','renovationExpense',data),
   cfDataset('ライフイベント費用','oneTimeExpense',data),
   // 年間収支は棒グラフより前面に出すため、orderを小さくして最後に描画
   {label:'年間収支',data:data.cf.annualCF,type:'line',borderWidth:1.8,pointRadius:0,pointHoverRadius:4,tension:.22,yAxisID:'y',order:-10,stack:undefined}
 ].filter(Boolean).map(ds=>{
   if(ds.label!=='年間収支') ds.order=10;
   return ds;
 });
 const itemLine=(name,value)=> value ? `${name}: ${yen(value)}` : null;
 const renovationLines=(r)=>r?.renovationsThisYear?.filter(x=>x.cost).map(x=>`リフォーム費用（${x.type||'その他'}）: ${yen(x.cost)}`)||[];
 const eventLines=(r,type)=>{
   if(!r?.eventsThisYear?.length) return [];
   return r.eventsThisYear
     .filter(e=>type==='income' ? e.income : e.expense)
     .map(e=>`${type==='income'?'ライフイベント収入':'ライフイベント費用'}（${e.name||'ライフイベント'}）: ${yen(type==='income'?e.income:e.expense)}`);
 };
 const tooltipCallbacks={
   title:(items)=> items?.length ? `${items[0].label}歳` : '',
   label:()=>null,
   afterBody:(items)=>{
     const idx=items?.[0]?.dataIndex ?? 0;
     const r=rows[idx];
     if(!r) return [];
     const lines=[];
     lines.push('【収入】');
     [
       itemLine('世帯主給与',r.ownerIncome),
       itemLine('配偶者給与',r.spouseIncome),
       itemLine('年金',r.pensionIncome),
       itemLine('その他収入',r.otherIncome),
       ...eventLines(r,'income'),
       itemLine('iDeCo受取',r.idecoReceive),
       itemLine('NISA取り崩し',r.nisaWithdraw)
     ].filter(Boolean).forEach(v=>lines.push(v));
     lines.push('');
     lines.push('【支出】');
     [
       itemLine('生活費',r.expense),
       itemLine('住宅ローン・固定資産税等',r.houseCost-r.fireExpense),
       itemLine('火災保険（5年一括）',r.fireExpense),
       itemLine('家具・家電・引越し',r.furnitureExpense),
       itemLine('NISA/iDeCo',r.investmentAdd),
       ...renovationLines(r),
       ...eventLines(r,'expense')
     ].filter(Boolean).forEach(v=>lines.push(v));
     lines.push('');
     lines.push(`年間収支: ${yen(r.cfBuy)}`);
     return lines;
   }
 };
 draw('cashflowChart','bar',data.ages,sets,{plugins:{tooltip:{callbacks:tooltipCallbacks}},scales:{x:{stacked:true,ticks:{autoSkip:false,maxRotation:0,minRotation:0}},y:{stacked:true,ticks:{callback:v=>v+'万'}}}});
}
function run(){syncAgeFromOwnerDob(); renderFamily(); charts.forEach(c=>c.destroy()); charts=[]; const livingMonth=val('food')+val('utilities')+val('comm')+val('insurance')+val('education')+val('car')+val('leisure')+val('otherExpense'); document.getElementById('livingTotal').textContent=livingMonth.toLocaleString()+'万円'; const furnitureTotal=getFurniture().reduce((a,x)=>a+x.cost,0); const fte=document.getElementById('furnitureTotal'); if(fte) fte.textContent=furnitureTotal.toLocaleString()+'万円'; const financialNow=val('nisaNow')+val('idecoNow')+val('fundNow')+val('stockNow')+val('otherAssetNow'); const ft=document.getElementById('financialTotal'); if(ft) ft.textContent=financialNow.toLocaleString()+'万円'; updateWithdrawEstimates();
 const {data,rows,mpay,borrow}=simulate();
 const mhLoan=mpay, mhMaint=(document.getElementById('purchaseType')?.value==='usedCondo'?(val('managementFee')+val('repairReserve')):0), mhTax=val('tax')/12, mhFire=val('fireInsurance');
 const mhTotal=mhLoan+mhMaint+mhTax;
 const current=rows[0]||{};
 const monthlyIncome=val('monthlyTakeHome');
 const monthlyLiving=(current.expense||0)/12;
 const monthlyInvestment=(current.investmentAdd||0)/12;
 const monthlyCF=monthlyIncome-mhTotal-monthlyLiving-monthlyInvestment;
 const fmtM=v=>v.toLocaleString(undefined,{maximumFractionDigits:1})+'万円';
 document.getElementById('monthlyHousingTotal').textContent=fmtM(mhTotal)+'/月';
 document.getElementById('mhLoan').textContent=fmtM(mhLoan);
 document.getElementById('mhMaint').textContent=fmtM(mhMaint);
 document.getElementById('mhTax').textContent=fmtM(mhTax);
 document.getElementById('mhFire').textContent=fmtM(mhFire)+'/回';
 document.getElementById('mhTotal2').textContent=fmtM(mhTotal);
 document.getElementById('monthlyCF').innerHTML='<span class="'+(monthlyCF>=0?'good':'bad')+'">'+fmtM(monthlyCF)+'/月</span>';
 document.getElementById('miIncome').textContent=fmtM(monthlyIncome);
 document.getElementById('miHousing').textContent=fmtM(mhTotal);
 document.getElementById('miLiving').textContent=fmtM(monthlyLiving);
 document.getElementById('miInvestment').textContent=fmtM(monthlyInvestment);
 document.getElementById('miTotal2').innerHTML='<span class="'+(monthlyCF>=0?'good':'bad')+'">'+fmtM(monthlyCF)+'</span>';
 const last=data.ages.length-1; const idx65=data.ages.indexOf(65); const age65=idx65>=0?idx65:last; const loanEndAge=val('age')+val('term'); document.getElementById('mPay').textContent=mpay.toLocaleString(undefined,{maximumFractionDigits:1})+'万円'; document.getElementById('fin65').textContent=yen(data.financial[age65]??data.financial[last]); document.getElementById('loanEndAge').textContent=loanEndAge+'歳'; document.getElementById('finEnd').textContent=yen(data.financial[last]); document.getElementById('bdCash65').textContent=yen(data.cashBuy[age65]??data.cashBuy[last]); document.getElementById('bdNisa65').textContent=yen(data.nisa[age65]??data.nisa[last]); document.getElementById('bdIdeco65').textContent=yen(data.ideco[age65]??data.ideco[last]); document.getElementById('bdOther65').textContent=yen(data.otherAsset[age65]??data.otherAsset[last]); document.getElementById('bdFin65').textContent=yen(data.financial[age65]??data.financial[last]); const minCash=Math.min(...data.cashBuy); const minIdx=data.cashBuy.indexOf(minCash); const tight=rows[minIdx]; document.getElementById('comment').innerHTML=`購入形態は <b>${document.getElementById('purchaseType')?.selectedOptions[0]?.text||'-'}</b>、借入想定額は <b>${yen(borrow)}</b>、月々返済は <b>${mpay.toLocaleString(undefined,{maximumFractionDigits:1})}万円</b>、固定資産税は年4回払い（年間 <b>${yen(val('tax'))}</b>）、火災保険は購入年と5年ごとに <b>${yen(val('fireInsurance'))}</b> を一括支出として反映しています。現預金が最も少なくなるのは <b>${tight.age}歳</b> 時点で <b class="${minCash<0?'bad':'good'}">${yen(minCash)}</b>。NISA・iDeCo等の積立・取り崩しを反映した場合、${data.ages[last]}歳時点の金融資産は <b>${yen(data.financial[last])}</b> の試算です。これは想定利回りに基づく参考値で、将来の成果を保証するものではありません。`;
 draw('assetChart','line',data.ages,[{label:'現預金',data:data.cashBuy,borderWidth:1.6},{label:'金融資産',data:data.financial,borderWidth:1.6},{label:'住宅ローン残高',data:data.loan,borderWidth:1.6}]);
 draw('cashChart','line',data.ages,[{label:'今回のシミュレーション',data:data.cashBuy,borderWidth:1.8}]);
 draw('nisaChart','line',data.ages,[{label:'NISA',data:data.nisa,borderWidth:1.8},{label:'iDeCo',data:data.ideco,borderWidth:1.6},{label:'その他金融資産',data:data.otherAsset,borderWidth:1.6},{label:'金融資産合計',data:data.financial,borderWidth:2}]);
 drawCashflow(data,rows);
 const fireEvents=[]; for(let a=val('age');a<=val('endAge');a+=5){fireEvents.push([a===val('age')?'火災保険一括払い':'火災保険更新・一括払い',a]);} const furnitureEvents=getFurniture().length?[[`家具・家電・引越し（${yen(getFurniture().reduce((a,x)=>a+x.cost,0)+val('movingCost'))}）`,val('age')]]:[]; const renovationEvents=getRenovations().map(r=>[`リフォーム：${r.type}（${yen(r.cost)}）`,r.age]); const customEvents=getOneTimeEvents().map(e=>[e.name,e.age]); const schoolEvents=childSchoolEvents(); const purchaseLabel=document.getElementById('purchaseType')?.selectedOptions[0]?.text||'住宅購入'; const ev=[[purchaseLabel,val('age')],['教育費ピーク',52],['NISA積立終了',val('nisaEnd')],['NISA取り崩し開始',val('nisaWithdrawAge')],['iDeCo受取開始',val('idecoReceiveAge')],['定年',val('retireAge')],['年金開始',val('pensionAge')],['ローン完済',val('age')+val('term')],...fireEvents,...furnitureEvents,...renovationEvents,...schoolEvents,...customEvents].filter(e=>e[1]>=val('age')&&e[1]<=val('endAge')).sort((a,b)=>a[1]-b[1]); document.getElementById('timeline').innerHTML=ev.map(e=>`<div class="event"><div class="age">${e[1]}歳</div><div class="name">${e[0]}</div></div>`).join('');
 document.getElementById('cfTable').innerHTML='<tr><th>年齢</th><th>給与</th><th>年金</th><th>その他/ライフイベント収入</th><th>生活費</th><th>住宅費</th><th>家具・家電・引越し</th><th>リフォーム費用</th><th>ライフイベント費用</th><th>iDeCo受取</th><th>NISA取り崩し</th><th>NISA積立</th><th>iDeCo掛金</th><th>年間収支</th><th>現預金</th><th>金融資産</th><th>残債</th></tr>'+rows.map((r)=> `<tr><td>${r.age}歳</td><td>${yen(r.ownerIncome+r.spouseIncome)}</td><td>${yen(r.pensionIncome)}</td><td>${yen(r.otherIncome+r.oneTimeIncome)}</td><td>${yen(r.expense)}</td><td>${yen(r.houseCost)}</td><td>${yen(r.furnitureExpense)}</td><td>${yen(r.renovationExpense)}</td><td>${yen(r.oneTimeExpense)}</td><td>${yen(r.idecoReceive)}</td><td>${yen(r.nisaWithdraw)}</td><td>${yen(r.nisaAdd)}</td><td>${yen(r.idecoAdd)}</td><td class="${r.cfBuy>=0?'good':'bad'}">${yen(r.cfBuy)}</td><td>${yen(r.cashBuy)}</td><td>${yen(r.financial)}</td><td>${yen(r.loan)}</td></tr>`).join('');
}

function updatePrintReport(){
 const owner=(document.getElementById('ownerName')?.value||'').trim();
 const now=new Date();
 const dateText=now.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric'});
 const purchase=document.getElementById('purchaseType')?.selectedOptions[0]?.text||'-';
 const borrow=val('borrow');
 const rate=val('rate');
 const term=val('term');
 const client=document.getElementById('printClientName'); if(client) client.textContent=`お客様名：${owner||'-'} 様`;
 const created=document.getElementById('printCreatedAt'); if(created) created.textContent=`作成日：${dateText}`;
 const pt=document.getElementById('printPurchaseType'); if(pt) pt.textContent=purchase;
 const pb=document.getElementById('printBorrow'); if(pb) pb.textContent=yen(borrow);
 const pl=document.getElementById('printLoanTerms'); if(pl) pl.textContent=`${term}年・年${rate}%`;
}
window.addEventListener('beforeprint',()=>{run();updatePrintReport();});
function setupFinancialModal(){
 const card=document.getElementById('fin65Card');
 const modal=document.getElementById('fin65Modal');
 const close=document.getElementById('fin65Close');
 if(!card||!modal||card.dataset.bound)return;
 card.dataset.bound='1';
 card.addEventListener('click',()=>{modal.hidden=false;});
 close?.addEventListener('click',()=>{modal.hidden=true;});
 modal.addEventListener('click',(e)=>{if(e.target===modal)modal.hidden=true;});
 document.addEventListener('keydown',(e)=>{if(e.key==='Escape')modal.hidden=true;});
}
setupFinancialModal();
updatePrintReport();
initRenovationSelects();
updatePurchaseType();
document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>{const livingMonth=val('food')+val('utilities')+val('comm')+val('insurance')+val('education')+val('car')+val('leisure')+val('otherExpense'); const lt=document.getElementById('livingTotal'); if(lt) lt.textContent=livingMonth.toLocaleString()+'万円'; const furnitureTotal=getFurniture().reduce((a,x)=>a+x.cost,0); const fte=document.getElementById('furnitureTotal'); if(fte) fte.textContent=furnitureTotal.toLocaleString()+'万円'; const financialNow=val('nisaNow')+val('idecoNow')+val('fundNow')+val('stockNow')+val('otherAssetNow'); const ft=document.getElementById('financialTotal'); if(ft) ft.textContent=financialNow.toLocaleString()+'万円';}));
document.getElementById('age')?.addEventListener('input',()=>{document.getElementById('age').dataset.userEdited='manual';});
document.getElementById('ownerDob')?.addEventListener('input',()=>{document.getElementById('age').dataset.userEdited='dob'; run();});
document.querySelectorAll('.panel input,.panel select').forEach(el=>el.addEventListener('change',()=>{setSaveStatus('未保存の変更あり'); run();}));
document.querySelectorAll('#cfControls input[type=checkbox]').forEach(el=>el.addEventListener('change',()=>{setSaveStatus('未保存の変更あり'); run();}));
initSaveStatus();
run();
</script>

<script>
function proposalText(id, fallback='-'){
  const el=document.getElementById(id);
  const v=el ? (el.textContent || el.value || '').trim() : '';
  return v || fallback;
}
function proposalInput(id, fallback='-'){
  const el=document.getElementById(id);
  const v=el ? String(el.value || '').trim() : '';
  return v || fallback;
}
function proposalCanvas(id){
  const c=document.getElementById(id);
  try{return c && c.width ? c.toDataURL('image/png',1) : '';}catch(e){return '';}
}
function proposalEscape(value){
  return String(value ?? '').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function proposalTimelineHtml(){
  const currentAge=parseFloat(document.getElementById('age')?.value)||0;
  const currentYear=new Date().getFullYear();
  const grouped=new Map();

  document.querySelectorAll('#timeline .event').forEach(card=>{
    const ageText=card.querySelector('.age')?.textContent||'';
    const age=parseFloat(ageText.replace(/[^0-9.]/g,''));
    const name=(card.querySelector('.name')?.textContent||'ライフイベント').trim();
    if(!Number.isFinite(age)) return;
    const year=Math.round(currentYear+(age-currentAge));
    if(!grouped.has(year)) grouped.set(year,[]);
    grouped.get(year).push({name,age});
  });

  if(!grouped.size){
    return '<div class="empty">登録されたライフイベントはありません。</div>';
  }

  return [...grouped.entries()].sort((a,b)=>a[0]-b[0]).map(([year,events])=>{
    const items=events.map(item=>`<div class="eventText">${proposalEscape(item.name)}（${item.age}歳）</div>`).join('');
    return `<div class="eventListRow"><div class="eventListYear">${year}年</div><div class="eventListItems">${items}</div></div>`;
  }).join('');
}
function openProposalPreview(){
  run();
  setTimeout(()=>{
  if(typeof updatePrintReport==='function') updatePrintReport();
  const w=window.open('','_blank');
  if(!w){alert('提案書プレビューを開けませんでした。ポップアップを許可してください。');return;}

  const client=proposalInput('ownerName','お客様');
  const created=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric'}).format(new Date());
  const purchaseType=proposalText('printPurchaseType');
  const borrow=proposalText('printBorrow');
  const loanTerms=proposalText('printLoanTerms');
  const family=document.getElementById('familyTable')?.outerHTML || '';
  const comment=document.getElementById('comment')?.innerHTML || '';
  const timeline=proposalTimelineHtml();
  const asset=proposalCanvas('assetChart');
  const cashflow=proposalCanvas('cashflowChart');

  const doc=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${proposalEscape(client)}様 住宅購入ライフプラン</title>
<style>
:root{--ink:#1d252d;--muted:#6f7880;--line:#dfe3e6;--soft:#f5f6f4;--accent:#2c4b42}
*{box-sizing:border-box}
body{margin:0;background:#e9ebec;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}
.toolbar{position:sticky;top:0;z-index:10;height:64px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 24px}
.toolbar strong{font-size:15px}
.toolbar button{border:0;border-radius:8px;padding:11px 16px;font-weight:700;cursor:pointer}
.back{background:#edf0f1;color:var(--ink)}
.pdf{background:var(--accent);color:#fff}
.page{width:297mm;min-height:210mm;margin:24px auto;background:#fff;padding:11mm 13mm 9mm;box-shadow:0 8px 30px rgba(0,0,0,.12);page-break-after:always;display:flex;flex-direction:column}
.page:last-child{page-break-after:auto}
.brand{font-size:11px;letter-spacing:.14em;color:var(--accent);font-weight:800}
.head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:2px solid var(--ink);padding-bottom:9px}
.head h1{font-size:23px;margin:5px 0 2px;font-weight:650;letter-spacing:.02em}
.meta{text-align:right;font-size:10px;line-height:1.7;color:var(--muted)}
.lead{font-size:12px;margin:10px 0}
.topGrid{display:grid;grid-template-columns:0.92fr 1.35fr;gap:13px;align-items:start}
.conditions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.condition{background:var(--soft);padding:9px;border-radius:7px;min-height:57px}
.condition span,.metric span{display:block;font-size:9px;color:var(--muted);margin-bottom:4px}
.condition b{font-size:12px}
.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:8px}
.metric{border:1px solid var(--line);border-radius:8px;padding:10px}
.metric b{font-size:20px;letter-spacing:-.03em}
.section{margin-top:11px}
.section h2{font-size:13px;margin:0 0 7px;padding-bottom:5px;border-bottom:1px solid var(--line)}
.note{background:var(--soft);border-left:4px solid var(--accent);padding:9px 11px;line-height:1.55;font-size:10px}
.chart{width:100%;border:1px solid var(--line);border-radius:7px;padding:5px;background:#fff}
.chart img{display:block;width:100%;height:auto;object-fit:contain}
.assetChart img{max-height:78mm}
.cashflowSection{margin-top:9px}
.cashflowChart img{max-height:65mm}
.page2Summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
.page2Summary .metric{min-height:64px}
.familyEvents{display:grid;grid-template-columns:.85fr 1.5fr;gap:16px;margin-top:10px}
.page2Note{margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.page2Box{background:var(--soft);border-radius:8px;padding:10px 12px;font-size:10px;line-height:1.55}
.family table{width:100%;border-collapse:collapse;font-size:10px}
.family th,.family td{border-bottom:1px solid var(--line);padding:6px;text-align:left}
.timeline{font-size:10px;border-top:1px solid var(--line)}
.eventListRow{display:grid;grid-template-columns:72px 1fr;border-bottom:1px solid var(--line);page-break-inside:avoid}
.eventListYear{padding:8px 10px 8px 0;font-weight:700;color:var(--muted);white-space:nowrap}
.eventListItems{padding:8px 0 8px 12px;border-left:3px solid var(--accent)}
.eventText{line-height:1.45;margin-bottom:3px;color:var(--ink)}
.eventText:last-child{margin-bottom:0}
.disclaimer{font-size:8px;line-height:1.5;color:var(--muted);margin-top:auto;border-top:1px solid var(--line);padding-top:7px}
.footer{display:flex;justify-content:space-between;font-size:8px;color:var(--muted);margin-top:6px}
.empty{color:var(--muted);font-size:10px}
@media(max-width:1100px){
  .page{width:calc(100% - 24px);min-height:auto;margin:12px;padding:22px}
  .topGrid,.familyEvents{grid-template-columns:1fr}
  .toolbar{padding:0 12px}
  .toolbar strong{display:none}
}
@media print{
  @page{size:A4 landscape;margin:0}
  body{background:#fff}
  .toolbar{display:none}
  .page{width:297mm;min-height:210mm;margin:0;box-shadow:none;padding:11mm 13mm 9mm}
  .page:last-child{page-break-after:auto}
}
</style></head><body><div class="toolbar"><button class="back" onclick="window.close()">← シミュレーターに戻る</button><strong>提案書プレビュー</strong><button class="pdf" onclick="window.print()">PDF保存／印刷</button></div>
<section class="page">
<div class="head"><div><div class="brand">COSHA LIFE DESIGN</div><h1>住宅購入ライフプラン</h1><div>${proposalEscape(client)} 様</div></div><div class="meta">作成日：${proposalEscape(created)}<br>株式会社cosha</div></div>
<p class="lead">住宅購入後の暮らしを、現在の条件をもとに数字で見える化しました。</p>
<div class="topGrid">
  <div>
    <div class="conditions">
      <div class="condition"><span>購入形態</span><b>${proposalEscape(purchaseType)}</b></div>
      <div class="condition"><span>借入予定額</span><b>${proposalEscape(borrow)}</b></div>
      <div class="condition"><span>返済期間・金利</span><b>${proposalEscape(loanTerms)}</b></div>
    </div>
    <div class="metrics">
      <div class="metric"><span>月々の住宅費</span><b>${proposalEscape(proposalText('monthlyHousingTotal'))}</b></div>
      <div class="metric"><span>毎月の家計収支</span><b>${proposalEscape(proposalText('monthlyCF'))}</b></div>
      <div class="metric"><span>住宅ローン完済年齢</span><b>${proposalEscape(proposalText('loanEndAge'))}</b></div>
      <div class="metric"><span>65歳時点の金融資産</span><b>${proposalEscape(proposalText('fin65'))}</b></div>
    </div>
    <div class="section"><h2>シミュレーション結果のポイント</h2><div class="note">${comment}</div></div>
  </div>
  <div class="section" style="margin-top:0"><h2>金融資産・住宅ローン推移</h2>${asset?`<div class="chart assetChart"><img src="${asset}"></div>`:'<div class="empty">グラフを表示できませんでした。</div>'}</div>
</div>
<div class="section cashflowSection"><h2>全体キャッシュフロー</h2>${cashflow?`<div class="chart cashflowChart"><img src="${cashflow}"></div>`:'<div class="empty">グラフを表示できませんでした。</div>'}</div>
<div class="footer"><span>cosha ライフプランシミュレーション</span><span>1 / 2</span></div>
</section>
<section class="page">
<div class="head"><div><div class="brand">COSHA LIFE DESIGN</div><h1>ご家族とライフイベント</h1></div><div class="meta">${proposalEscape(client)} 様<br>${proposalEscape(created)}</div></div>
<div class="familyEvents">
  <div class="section family"><h2>ご家族の状況</h2>${family}</div>
  <div class="section"><h2>今後のライフイベント</h2><div class="timeline">${timeline}</div></div>
</div>
<div class="disclaimer">本資料は入力された条件および想定利回り等に基づく参考シミュレーションです。将来の収入、支出、運用成果、税制、社会保障制度、金利、不動産価値等を保証するものではありません。実際の資金計画は、金融機関・税理士・ファイナンシャルプランナー等の専門家にもご確認ください。</div>
<div class="footer"><span>cosha ライフプランシミュレーション</span><span>2 / 2</span></div>
</section></body></html>`;
  w.document.open();w.document.write(doc);w.document.close();
  },150);
}