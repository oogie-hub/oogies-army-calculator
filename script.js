const translations = {
en: {
troopsTitle: "Number of Troops",
modifiersTitle: "Modifiers",
rulesTitle: "Rules",
marchesTitle: "Marches",
infantryLabel: "🛡️ Infantry",
cavalryLabel: "🐴 Cavalry",
archerLabel: "🏹 Archer"
},
es: {
troopsTitle: "Número de Tropas",
modifiersTitle: "Modificadores",
rulesTitle: "Reglas",
marchesTitle: "Marchas",
infantryLabel: "🛡️ Infantería",
cavalryLabel: "🐴 Caballería",
archerLabel: "🏹 Arqueros"
},
pt: {
troopsTitle: "Número de Tropas",
modifiersTitle: "Modificadores",
rulesTitle: "Regras",
marchesTitle: "Marchas",
infantryLabel: "🛡️ Infantaria",
cavalryLabel: "🐴 Cavalaria",
archerLabel: "Arqueiros"
},
bg: {
troopsTitle: "Брой Войски",
modifiersTitle: "Модификатори",
rulesTitle: "Правила",
marchesTitle: "Маршове",
infantryLabel: "🛡️ Пехота",
cavalryLabel: "🐴 Кавалерия",
archerLabel: "🏹 Стрелци"
},
zh: {
troopsTitle: "部队数量",
modifiersTitle: "修正项",
rulesTitle: "规则",
marchesTitle: "队列",
infantryLabel: "🛡️ 步兵",
cavalryLabel: "🐴 骑兵",
archerLabel: "🏹 弓兵"
}
};



document.getElementById('languageSelect').addEventListener('change', (e) => {

const lang = translations[e.target.value];

for (const key in lang) {

const element = document.getElementById(key);

if(element){

element.innerText = lang[key];

}

}

});












const ratio = document.getElementById('ratio');
const customRatioContainer = document.getElementById('customRatioContainer');
const customRatio = document.getElementById('customRatio');
const bearTrap = document.getElementById('bearTrap');
const fillFirstContainer = document.getElementById('fillFirstContainer');
const joinerLimitToggle = document.getElementById('joinerLimitToggle');
const joinerLimitContainer = document.getElementById('joinerLimitContainer');

ratio.addEventListener('change', () => {
customRatioContainer.classList.toggle('hidden', ratio.value !== 'custom');
calculate();
});

bearTrap.addEventListener('change', () => {
fillFirstContainer.classList.toggle('hidden', !bearTrap.checked);
calculate();
});

joinerLimitToggle.addEventListener('change', () => {
joinerLimitContainer.classList.toggle('hidden', !joinerLimitToggle.checked);
});

customRatio.addEventListener('input', (e) => {

let value = e.target.value.replace(/[^0-9]/g,'');

if(value.length > 2 && value.length <= 4){
value = value.slice(0,2) + '/' + value.slice(2);
}

if(value.length > 4){
value = value.slice(0,2) + '/' + value.slice(2,4) + '/' + value.slice(4,6);
}

e.target.value = value;

});

document.querySelectorAll('input, select').forEach((el, index, arr) => {

el.addEventListener('keydown', (e) => {

if(e.key === 'Enter'){

e.preventDefault();

const next = arr[index + 1];

if(next){
next.focus();
}

}

});

el.addEventListener('input', calculate);
});

function getRatio(){

let value = ratio.value;

if(value === 'custom'){
value = customRatio.value || '10/10/80';
}

const parts = value.split('/').map(Number);

return {
inf: parts[0] / 100,
cav: parts[1] / 100,
arch: parts[2] / 100
};

}

function calculate(){

let infantry = Number(document.getElementById('infantry').value || 0);
let cavalry = Number(document.getElementById('cavalry').value || 0);
let archer = Number(document.getElementById('archer').value || 0);

const baseCap = Number(document.getElementById('capacity').value || 0);
const cityBonus = Number(document.getElementById('cityBonus').value || 0);
const fearlessRoar = Number(document.getElementById('fearlessRoar').value || 0);

const formations = Number(document.getElementById('formations').value || 0);

const runningCapacity = Math.round(baseCap + (baseCap * cityBonus) + fearlessRoar);

document.getElementById('runningCapacity').innerText = runningCapacity.toLocaleString();

const results = document.getElementById('results');

results.innerHTML = '';

if(!formations){
return;
}

const r = getRatio();

let infRemaining = infantry;
let cavRemaining = cavalry;
let archRemaining = archer;

for(let i=1;i<=formations;i++){

let inf;
let cav;
let arch;

if(bearTrap.checked){

if(document.getElementById('fillFirst').checked && i === 1){

inf = Math.min(Math.round(runningCapacity * r.inf), infRemaining);
cav = Math.min(Math.round(runningCapacity * r.cav), cavRemaining);
arch = Math.min(Math.round(runningCapacity * r.arch), archRemaining);

}else{

const remainingMarches = document.getElementById('fillFirst').checked ? formations - 1 : formations;

arch = Math.floor(archRemaining / remainingMarches);

const remainingCapacity = runningCapacity - arch;

const ratioTotal = r.inf + r.cav;

inf = Math.floor((remainingCapacity * (r.inf / ratioTotal)));
cav = Math.floor((remainingCapacity * (r.cav / ratioTotal)));

inf = Math.min(inf, infRemaining);
cav = Math.min(cav, cavRemaining);

}

}else{

inf = Math.floor(infantry / formations);
cav = Math.floor(cavalry / formations);
arch = Math.floor(archer / formations);

}

infRemaining -= inf;
cavRemaining -= cav;
archRemaining -= arch;

const div = document.createElement('div');

div.className = 'march';

let title = `March ${i}`;

if(bearTrap.checked){

title = `Joiner March ${i}`;

if(document.getElementById('fillFirst').checked){
title = i === 1 ? 'Rally Captain' : `Joiner March ${i-1}`;
}

}

div.innerHTML = `
<div class="march-title">${title}</div>

<div class="row">
<span>Infantry <span class="percent">${Math.round(r.inf*100)}%</span></span>
<strong>${inf.toLocaleString()}</strong>
</div>

<div class="row">
<span>Cavalry <span class="percent">${Math.round(r.cav*100)}%</span></span>
<strong>${cav.toLocaleString()}</strong>
</div>

<div class="row">
<span>Archer <span class="percent">${Math.round(r.arch*100)}%</span></span>
<strong>${arch.toLocaleString()}</strong>
</div>
`;

results.appendChild(div);

}

document.getElementById('remainingInfantry').innerText = infRemaining.toLocaleString();
document.getElementById('remainingCavalry').innerText = cavRemaining.toLocaleString();
document.getElementById('remainingArcher').innerText = archRemaining.toLocaleString();

}

const helpModal = document.getElementById('helpModal');

document.getElementById('helpButton').addEventListener('click', () => {
helpModal.classList.remove('hidden');
});

document.getElementById('closeHelp').addEventListener('click', () => {
helpModal.classList.add('hidden');
});

helpModal.addEventListener('click', (e) => {
if(e.target === helpModal){
helpModal.classList.add('hidden');
}
});

calculate();
