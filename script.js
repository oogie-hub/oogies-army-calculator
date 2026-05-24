const ratio = document.getElementById(‘ratio’);
const customRatioBox = document.getElementById(‘customRatioBox’);
const joinerLimitToggle = document.getElementById(‘joinerLimitToggle’);
const joinerLimitBox = document.getElementById(‘joinerLimitBox’);

ratio.addEventListener(‘change’, () => {
customRatioBox.classList.toggle(‘hidden’, ratio.value !== ‘custom’);
calculate();
});

joinerLimitToggle.addEventListener(‘change’, () => {
joinerLimitBox.classList.toggle(‘hidden’, !joinerLimitToggle.checked);
calculate();
});

document.querySelectorAll(‘input, select’).forEach(el => {
el.addEventListener(‘input’, calculate);
});

function getRatio(){

let value = ratio.value;

if(value === ‘custom’){
value = document.getElementById(‘customRatio’).value || ‘10/10/80’;
}

const parts = value.split(’/’).map(Number);

return {
inf: parts[0] / 100,
cav: parts[1] / 100,
arch: parts[2] / 100,
label:value
};
}

function calculate(){

let infantry = Number(document.getElementById(‘infantry’).value || 0);
let cavalry = Number(document.getElementById(‘cavalry’).value || 0);
let archer = Number(document.getElementById(‘archer’).value || 0);

const baseCap = Number(document.getElementById(‘capacity’).value || 0);

const cityBonus = Number(document.getElementById(‘cityBonus’).value || 0);
const fearlessRoar = Number(document.getElementById(‘fearlessRoar’).value || 0);

const formations = Number(document.getElementById(‘formations’).value);

const runningCap = Math.round(baseCap + (baseCap * cityBonus) + fearlessRoar);

document.getElementById(‘runningCap’).innerText = runningCap.toLocaleString();

const r = getRatio();

const results = document.getElementById(‘results’);
results.innerHTML = ‘’;

for(let i=1;i<=formations;i++){

let inf = Math.min(Math.round(runningCap * r.inf), infantry);
let cav = Math.min(Math.round(runningCap * r.cav), cavalry);
let arch = Math.min(Math.round(runningCap * r.arch), archer);
infantry -= inf;
cavalry -= cav;
archer -= arch;
const div = document.createElement('div');
div.className = 'march';
let title = `March ${i}`;
if(document.getElementById('bearTrap').checked){
  title = i === 1 ? 'Rally Captain March' : `Joiner March ${i-1}`;
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
  <div class="row">
    <span>Total</span>
    <strong>${(inf+cav+arch).toLocaleString()}</strong>
  </div>
`;
results.appendChild(div);

}

document.getElementById(‘remainingInf’).innerText = infantry.toLocaleString();
document.getElementById(‘remainingCav’).innerText = cavalry.toLocaleString();
document.getElementById(‘remainingArch’).innerText = archer.toLocaleString();
}

calculate();