const ratio = document.getElementById('ratio');
const customRatioContainer = document.getElementById('customRatioContainer');
const customRatio = document.getElementById('customRatio');
const bearTrap = document.getElementById('bearTrap');
const fillFirstContainer = document.getElementById('fillFirstContainer');

ratio.addEventListener('change', () => {
customRatioContainer.classList.toggle('hidden', ratio.value !== 'custom');
calculate();
});

bearTrap.addEventListener('change', () => {
fillFirstContainer.classList.toggle('hidden', !bearTrap.checked);
calculate();
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

document.querySelectorAll('input, select').forEach(el => {
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

const formations = Number(document.getElementById('formations').value);

const results = document.getElementById('results');

results.innerHTML = '';

for(let i=1;i<=formations;i++){

const div = document.createElement('div');

div.className = 'march';

let title = `March ${i}`;

if(bearTrap.checked){
title = `Joiner March ${i}`;
}

div.innerHTML = `
<div class="march-title">${title}</div>
`;

results.appendChild(div);

}

}

calculate();
