const faces=[
{symbol:"☠",name:"Teschio rosso",score:-2,className:"red-skull"},
{symbol:"✕",name:"X rossa",score:-1,className:"red-x"},
{symbol:"✕",name:"X rossa",score:-1,className:"red-x"},
{symbol:"♣",name:"Quadrifoglio verde",score:1,className:"green-clover"},
{symbol:"♣",name:"Quadrifoglio verde",score:1,className:"green-clover"},
{symbol:"♛",name:"Corona verde scintillante",score:2,className:"green-crown"}];

let diceCount=1,rolling=false,rerollMode=false,currentResults=[],history=[];

const countEl=document.getElementById("dice-count"),minusBtn=document.getElementById("minus"),plusBtn=document.getElementById("plus"),
rollBtn=document.getElementById("roll-button"),diceContainer=document.getElementById("dice-container"),
resultPanel=document.getElementById("result-panel"),resultScore=document.getElementById("result-score"),resultBreakdown=document.getElementById("result-breakdown"),
rerollControls=document.getElementById("reroll-controls"),rerollButton=document.getElementById("reroll-button"),
confirmRerollButton=document.getElementById("confirm-reroll"),cancelRerollButton=document.getElementById("cancel-reroll"),rerollHint=document.getElementById("reroll-hint"),
historyButton=document.getElementById("history-button"),historyPanel=document.getElementById("history-panel"),historyList=document.getElementById("history-list"),clearHistoryButton=document.getElementById("clear-history");

function updateCount(){countEl.textContent=diceCount}
minusBtn.addEventListener("click",()=>{if(!rolling&&!rerollMode&&diceCount>1){diceCount--;updateCount()}});
plusBtn.addEventListener("click",()=>{if(!rolling&&!rerollMode&&diceCount<30){diceCount++;updateCount()}});
function randomFace(){return faces[Math.floor(Math.random()*faces.length)]}
function createDie(face,index){
 const die=document.createElement("div");die.className=`die ${face.className}`;die.textContent=face.symbol;die.setAttribute("aria-label",face.name);
 die.dataset.index=index;die.style.setProperty("--rot",`${(Math.random()*16-8).toFixed(1)}deg`);return die;
}
function calculateTotal(results){return results.reduce((s,f)=>s+f.score,0)}
function formatBreakdown(results,total){
 const pieces=results.map(r=>`${r.symbol} ${r.score>0?"+":""}${r.score}`);return `${pieces.join("   ·   ")}   =   ${total>0?"+":""}${total}`;
}
function showResult(){
 const total=calculateTotal(currentResults);resultScore.textContent=total>0?`+${total}`:total;resultBreakdown.textContent=formatBreakdown(currentResults,total);
 resultPanel.classList.remove("show");requestAnimationFrame(()=>resultPanel.classList.add("show"));
}
function addToHistory(results,type){
 const total=calculateTotal(results);history.unshift({total,type,symbols:results.map(f=>f.symbol),details:results.map(f=>`${f.name}: ${f.score>0?"+":""}${f.score}`).join(" · ")});
 history=history.slice(0,10);renderHistory();
}
function renderHistory(){
 if(!history.length){historyList.innerHTML='<div class="history-empty">Nessun tiro registrato.</div>';return}
 historyList.innerHTML=history.map((e,i)=>`<div class="history-entry"><div class="history-number">#${history.length-i}</div><div class="history-symbols" title="${e.type}: ${e.details}">${e.symbols.join(" ")}</div><div class="history-total ${e.total<0?"negative":""}">${e.total>0?"+":""}${e.total}</div></div>`).join("");
}
function renderDice(){
 diceContainer.innerHTML="";
 currentResults.forEach((face,index)=>{
  const die=createDie(face,index);
  if(rerollMode){die.classList.add("selectable");die.addEventListener("click",()=>die.classList.toggle("selected"))}
  diceContainer.appendChild(die);
 });
}
function enterRerollMode(){
 if(rolling||!currentResults.length)return;
 rerollMode=true;diceContainer.classList.add("reroll-mode");rerollButton.hidden=true;confirmRerollButton.hidden=false;cancelRerollButton.hidden=false;rerollHint.hidden=false;renderDice();
}
function exitRerollMode(){
 rerollMode=false;diceContainer.classList.remove("reroll-mode");rerollButton.hidden=false;confirmRerollButton.hidden=true;cancelRerollButton.hidden=true;rerollHint.hidden=true;renderDice();
}
async function confirmReroll(){
 if(!rerollMode||rolling)return;
 const selected=[...diceContainer.querySelectorAll(".die.selected")];
 if(!selected.length){rerollHint.textContent="Seleziona almeno un dado da rilanciare.";rerollHint.classList.add("warning");setTimeout(()=>{rerollHint.textContent="Seleziona i dadi che vuoi rilanciare.";rerollHint.classList.remove("warning")},1800);return}
 rolling=true;confirmRerollButton.disabled=true;cancelRerollButton.disabled=true;
 selected.forEach((die,i)=>{die.classList.remove("selected");die.classList.add("rolling");die.style.animationDelay=`${i*70}ms`});
 await new Promise(r=>setTimeout(r,650));
 selected.forEach(die=>{currentResults[Number(die.dataset.index)]=randomFace()});
 rerollMode=false;diceContainer.classList.remove("reroll-mode");rerollButton.hidden=false;confirmRerollButton.hidden=true;cancelRerollButton.hidden=true;rerollHint.hidden=true;
 renderDice();showResult();addToHistory(currentResults,"Re-Roll");
 rolling=false;confirmRerollButton.disabled=false;cancelRerollButton.disabled=false;
}
async function rollDice(){
 if(rolling||rerollMode)return;
 rolling=true;rollBtn.disabled=true;resultPanel.classList.remove("show");resultScore.textContent="…";resultBreakdown.textContent="Il destino decide…";
 currentResults=Array.from({length:diceCount},randomFace);diceContainer.innerHTML="";
 currentResults.forEach((face,i)=>{const die=createDie(face,i);die.classList.add("rolling");die.style.animationDelay=`${i*55}ms`;diceContainer.appendChild(die)});
 await new Promise(r=>setTimeout(r,680));showResult();addToHistory(currentResults,"Tiro");rerollControls.hidden=false;rerollButton.hidden=false;rolling=false;rollBtn.disabled=false;
}
rollBtn.addEventListener("click",rollDice);rerollButton.addEventListener("click",enterRerollMode);confirmRerollButton.addEventListener("click",confirmReroll);cancelRerollButton.addEventListener("click",exitRerollMode);
historyButton.addEventListener("click",()=>{const hidden=historyPanel.hidden;historyPanel.hidden=!hidden;historyButton.setAttribute("aria-expanded",String(hidden))});
clearHistoryButton.addEventListener("click",()=>{history=[];renderHistory()});
updateCount();renderHistory();rerollControls.hidden=true;
