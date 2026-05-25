
// REPLACE YOUR EXISTING HELP MODAL SECTION WITH THIS

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
