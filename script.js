// === [INIZIO DATI E VARIABILI GLOBALI] ===
const stati = [
  { id: "da-fare", nome: "Da Fare", colore: "cyan-700" },
  { id: "in-lavorazione", nome: "In Lavorazione", colore: "cyan-400" },
  { id: "in-attesa", nome: "In Attesa", colore: "yellow-400" },
  { id: "completato", nome: "Completato", colore: "green-400" },
];
let lavori = [
  { id: 1, azienda: "Azienda Nicola", tipo: "DVR", collaboratore: "Mario Rossi", note: "Urgente", stato: "da-fare", timer: 0, running: false },
  { id: 2, azienda: "Sanitas S.p.A.", tipo: "Relazione Chimica", collaboratore: "Giulia Bianchi", note: "", stato: "da-fare", timer: 0, running: false },
  { id: 3, azienda: "Ecoltalia", tipo: "Autorizzazione Unica Ambientale", collaboratore: "Luca Moretti", note: "", stato: "in-lavorazione", timer: 0, running: false },
];
// Timer multipli per ogni lavoro
let timerIntervals = {};
// === [FINE DATI E VARIABILI GLOBALI] ===


// === [INIZIO RENDER BOARD KANBAN] ===
function renderBoard() {
  const board = document.getElementById('kanban-board');
  board.innerHTML = '';
  stati.forEach(stato => {
    const col = document.createElement('section');
    col.className = `kanban-column bg-white rounded-2xl shadow-lg p-4 flex-1 min-w-[250px]`;
    col.dataset.stato = stato.id;
    col.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <span class="bg-${stato.colore} text-white rounded-full h-6 w-6 flex items-center justify-center text-xl">
          ${stato.nome.charAt(0)}
        </span>
        <h2 class="font-bold text-lg text-${stato.colore.replace('-400','-700')}">${stato.nome}</h2>
      </div>
      <div class="kanban-cards" id="cards-${stato.id}"></div>
    `;
    board.appendChild(col);
    // === [INIZIO EVENTI DRAG&DROP COLONNA] ===
    col.addEventListener('dragover', dragOverHandler);
    col.addEventListener('drop', dropHandler);
    // === [FINE EVENTI DRAG&DROP COLONNA] ===
  });
  renderCards();
}
// === [FINE RENDER BOARD KANBAN] ===


// === [INIZIO RENDER CARDS] ===
function renderCards() {
  stati.forEach(stato => {
    const cardBox = document.getElementById(`cards-${stato.id}`);
    cardBox.innerHTML = '';
    lavori.filter(lav => lav.stato === stato.id).forEach(lav => {
      const card = document.createElement('div');
      card.className = 'card-lavoro bg-white rounded-xl shadow p-4 mb-4 border border-cyan-100';
      card.draggable = true;
      card.dataset.id = lav.id;
      card.innerHTML = `
        <div class="font-bold text-base">${lav.azienda}</div>
        <div class="text-gray-700 text-sm">${lav.tipo}
          ${lav.note ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded ml-2">${lav.note}</span>` : ""}
        </div>
        <div class="flex items-center gap-2 mt-2 mb-2">
          <span class="text-gray-700 text-xs font-semibold">${lav.collaboratore}</span>
        </div>
        <div class="flex gap-2 items-center mb-2">
          <span class="text-cyan-700 font-mono text-base" id="timer-${lav.id}">${formatTimer(lav.timer)}</span>
          <button onclick="startTimer(${lav.id})" class="bg-cyan-600 text-white px-2 py-1 rounded-lg font-bold">Inizia</button>
          <button onclick="pauseTimer(${lav.id})" class="bg-yellow-400 text-white px-2 py-1 rounded-lg font-bold">Pausa</button>
          <button onclick="stopTimer(${lav.id})" class="bg-green-600 text-white px-2 py-1 rounded-lg font-bold">Stop</button>
          <button onclick="openModale(${lav.id})" class="bg-gray-200 text-cyan-700 px-2 py-1 rounded-lg font-bold">✏️</button>
        </div>
        <div class="flex justify-end">
          <button onclick="eliminaLavoro(${lav.id})" title="Elimina" class="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded font-bold text-xs">Elimina</button>
        </div>
      `;
      card.addEventListener('dragstart', dragStartHandler);
      card.addEventListener('dragend', dragEndHandler);
      cardBox.appendChild(card);
    });
  });
}
// === [FINE RENDER CARDS] ===

// === [INIZIO FUNZIONE ELIMINA LAVORO] ===
window.eliminaLavoro = function(id) {
  if(confirm("Sei sicuro di voler eliminare questo lavoro?")) {
    lavori = lavori.filter(lav => lav.id !== id);
    renderBoard();
  }
}
// === [FINE FUNZIONE ELIMINA LAVORO] ===



// === [INIZIO FUNZIONI TIMER] ===
window.startTimer = function(id) {
  let lav = lavori.find(l => l.id === id);
  if (!lav.running) {
    lav.running = true;
    timerIntervals[id] = setInterval(() => {
      lav.timer++;
      document.getElementById(`timer-${id}`).textContent = formatTimer(lav.timer);
    }, 1000);
  }
}
window.pauseTimer = function(id) {
  let lav = lavori.find(l => l.id === id);
  if (lav.running) {
    lav.running = false;
    clearInterval(timerIntervals[id]);
  }
}
window.stopTimer = function(id) {
  window.pauseTimer(id);
  let lav = lavori.find(l => l.id === id);
  lav.timer = 0;
  document.getElementById(`timer-${id}`).textContent = formatTimer(lav.timer);
}
function formatTimer(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
// === [FINE FUNZIONI TIMER] ===


// === [INIZIO FUNZIONI DRAG&DROP] ===
let draggedCardId = null;
function dragStartHandler(e) {
  draggedCardId = this.dataset.id;
  this.classList.add('dragging');
}
function dragEndHandler(e) {
  this.classList.remove('dragging');
}
function dragOverHandler(e) {
  e.preventDefault();
  this.classList.add('dragover');
}
function dropHandler(e) {
  e.preventDefault();
  this.classList.remove('dragover');
  if (draggedCardId) {
    let lav = lavori.find(l => l.id == draggedCardId);
    lav.stato = this.dataset.stato;
    renderBoard();
    draggedCardId = null;
  }
}
// === [FINE FUNZIONI DRAG&DROP] ===


// === [INIZIO MODALE NUOVO/MODIFICA LAVORO] ===
document.getElementById('btn-nuovo-lavoro').onclick = function() {
  openModale();
};
window.openModale = function(id=null) {
  document.getElementById('modale-lavoro').classList.remove('hidden');
  if (id) {
    const lav = lavori.find(l => l.id === id);
    document.getElementById('lavoro-id').value = lav.id;
    document.getElementById('lavoro-azienda').value = lav.azienda;
    document.getElementById('lavoro-tipo').value = lav.tipo;
    document.getElementById('lavoro-collaboratore').value = lav.collaboratore;
    document.getElementById('lavoro-note').value = lav.note;
    document.getElementById('modale-title').textContent = "Modifica Lavoro";
  } else {
    document.getElementById('lavoro-id').value = '';
    document.getElementById('lavoro-azienda').value = '';
    document.getElementById('lavoro-tipo').value = '';
    document.getElementById('lavoro-collaboratore').value = '';
    document.getElementById('lavoro-note').value = '';
    document.getElementById('modale-title').textContent = "Nuovo Lavoro";
  }
};
window.closeModale = function() {
  document.getElementById('modale-lavoro').classList.add('hidden');
};
document.getElementById('form-lavoro').onsubmit = function(e) {
  e.preventDefault();
  const id = document.getElementById('lavoro-id').value;
  const azienda = document.getElementById('lavoro-azienda').value;
  const tipo = document.getElementById('lavoro-tipo').value;
  const collaboratore = document.getElementById('lavoro-collaboratore').value;
  const note = document.getElementById('lavoro-note').value;
  if (id) {
    // Modifica lavoro esistente
    let lav = lavori.find(l => l.id == id);
    lav.azienda = azienda;
    lav.tipo = tipo;
    lav.collaboratore = collaboratore;
    lav.note = note;
  } else {
    // Nuovo lavoro
    const nuovo = {
      id: Date.now(),
      azienda, tipo, collaboratore, note,
      stato: "da-fare", timer: 0, running: false
    };
    lavori.push(nuovo);
  }
  closeModale();
  renderBoard();
};
// === [FINE MODALE NUOVO/MODIFICA LAVORO] ===


// === [INIZIO AVVIO INIZIALE] ===
renderBoard();
// === [FINE AVVIO INIZIALE] ===
