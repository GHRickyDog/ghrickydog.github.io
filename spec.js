console.log(
    "%c[SPEC LABS KERNEL]%c ⚠️ Accesso riservato ai terminali Desktop.\nPremere la sequenza %c S + P + C %c sulla tastiera per sbloccare i Logs di laboratorio.",
    "color: #ff0000; font-weight: bold; font-size: 14px; background: #110000; padding: 4px 8px; border-radius: 4px;",
    "color: #00ff00; font-size: 13px;",
    "color: #ffffff; background: #ff0000; font-weight: bold; font-size: 13px; padding: 2px 6px; border-radius: 3px;",
    "color: #00ff00; font-size: 13px;"
);

if (window.innerWidth < 768) {
    console.log(
        "%c[SPEC LABS NOTICE]%c Per la massima esperienza da pilota, si consiglia la visione su PC o schermo orizzontale! 🏎️💨",
        "color: #ffaa00; font-weight: bold;",
        "color: #cccccc;"
    );
}

const BACKEND_URL = "https://spec-backend.vercel.app/api/chat";

const specWidgetBtn = document.getElementById('spec-widget-btn');
const specChatWindow = document.getElementById('spec-chat-window');
const closeChatBtn = document.getElementById('close-chat-btn');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');

let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (keys['s'] && keys['p'] && keys['c']) {
        window.location.href = 'spec_logs.html';
    }
});
document.addEventListener('keyup', (e) => { 
    delete keys[e.key.toLowerCase()]; 
});

const btn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

if (btn) {
    btn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'racing') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'spec'); 
        } else {
            document.documentElement.setAttribute('data-theme', 'racing');
            localStorage.setItem('theme', 'racing');
        }
    });
}

if (specWidgetBtn && specChatWindow) {
    specWidgetBtn.addEventListener('click', () => {
        specChatWindow.classList.toggle('hidden');

        if (!specChatWindow.classList.contains('hidden') && userInput) {
            userInput.focus();
        }
    });
}

if (closeChatBtn && specChatWindow) {
    closeChatBtn.addEventListener('click', () => {
        specChatWindow.classList.add('hidden');
    });
}

if (sendBtn) {
    sendBtn.addEventListener('click', gestisciInvio);
}

if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            gestisciInvio();
        }
    });
}

async function gestisciInvio() {
    if (!userInput || !chatBox) return;

    const messaggioTesto = userInput.value.trim();
    if (messaggioTesto === "") return;

    aggiungiMessaggio(messaggioTesto, 'utente');
    userInput.value = "";

    aggiungiMessaggio("Spec AI sta elaborando la prossima follia... attendi.", 'ia');
    const elementoCaricamento = chatBox.lastChild;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messaggio: messaggioTesto })
        });

        const data = await response.json();
        if (elementoCaricamento) elementoCaricamento.remove();

        if (data.risposta) {
            aggiungiMessaggio(data.risposta, 'ia');
        } else {
            aggiungiMessaggio("Scusa, amico, qui è saltato qualche fusibile. Riprova, forse sono io che sto navigando con un 56K...", 'ia');
        }

    } catch (error) {
        console.error("Connessione reale non disponibile. Attivazione simulazione locale.");
        
        setTimeout(() => {
            if (elementoCaricamento) elementoCaricamento.remove();
            
            aggiungiMessaggio(
                "Ops! Si è verificato un errore...\n" +
                "Prova a riconnetterti per ricevere idee ignoranti e folli... vale la pena!",
                'ia'
            );
        }, 1000);
    }
}

function aggiungiMessaggio(testo, mittente) {
    if (!chatBox) return;
    
    const nuovoMessaggio = document.createElement('div');
    nuovoMessaggio.classList.add('message');
    
    if (mittente === 'utente') {
        nuovoMessaggio.classList.add('user-message');
        nuovoMessaggio.innerHTML = testo.replace(/\n/g, '<br>');
    } else {
        nuovoMessaggio.classList.add('ai-message');
        
        let testoFormattato = testo.trim();
        testoFormattato = testoFormattato.replace(/\n([A-Za-zÀ-ÿ0-9\s]+):/g, '\n- **$1**:');

        if (typeof marked !== 'undefined') {
            nuovoMessaggio.innerHTML = marked.parse(testoFormattato);
        } else {
            nuovoMessaggio.innerHTML = testoFormattato.replace(/\n/g, '<br>');
        }
    }
    
    chatBox.appendChild(nuovoMessaggio);
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

function ordinaTabella(idTabella, indiceColonna, tipo = 'testo') {
  const tabella = document.getElementById(idTabella);
  if (!tabella) return;

  const tbody = tabella.querySelector('tbody');
  const righe = Array.from(tbody.querySelectorAll('tr'));
  
  const ordineAttuale = tabella.dataset.ordine === 'asc' ? 'desc' : 'asc';
  tabella.dataset.ordine = ordineAttuale;

  righe.sort((a, b) => {
    let valA = a.children[indiceColonna].innerText.trim();
    let valB = b.children[indiceColonna].innerText.trim();

    if (tipo === 'tempo') {
      const aMs = converteTempoInMs(valA);
      const bMs = converteTempoInMs(valB);
      return ordineAttuale === 'asc' ? aMs - bMs : bMs - aMs;
    } 
    
    return ordineAttuale === 'asc' 
      ? valA.localeCompare(valB, undefined, { numeric: true }) 
      : valB.localeCompare(valA, undefined, { numeric: true });
  });

  righe.forEach(riga => tbody.appendChild(riga));

  if (tabella.riaggiornaPaginazione) {
    tabella.riaggiornaPaginazione();
  }
}

function converteTempoInMs(tempoStr) {
  if (!tempoStr || tempoStr === '-') return Infinity;
  const parti = tempoStr.split(':');
  if (parti.length < 2) return Infinity;
  
  const minuti = parseFloat(parti[0]);
  const secondi = parseFloat(parti[1]);
  return (minuti * 60 + secondi) * 1000;
}

const RIGHE_PER_PAGINA = 20;

function gestisciPaginazione(idTabella, idControlli) {
  const tabella = document.getElementById(idTabella);
  if (!tabella) return;

  const tbody = tabella.querySelector('tbody');
  let paginaCorrente = 1;

  function mostraPagina(pagina) {
    paginaCorrente = pagina;

    const righeTutte = Array.from(tbody.querySelectorAll('tr'));
    
    const righeVisibili = righeTutte.filter(r => r.style.display !== 'none' || r.dataset.paginato === 'true');
    const totalePagine = Math.ceil(righeVisibili.length / RIGHE_PER_PAGINA) || 1;

    if (paginaCorrente > totalePagine) paginaCorrente = totalePagine;

    const inizio = (paginaCorrente - 1) * RIGHE_PER_PAGINA;
    const fine = inizio + RIGHE_PER_PAGINA;

    righeVisibili.forEach((riga, index) => {
      if (index >= inizio && index < fine) {
        riga.style.display = '';
        riga.dataset.paginato = 'true';
      } else {
        riga.style.display = 'none';
        riga.dataset.paginato = 'true';
      }
    });

    aggiornaPulsanti(totalePagine);
  }

  function aggiornaPulsanti(totalePagine) {
    let container = document.getElementById(idControlli) || tabella.parentNode.querySelector('.aggiorna-tabella');

    if (!container) {
      container = document.createElement('div');
      container.id = idControlli;
      container.className = 'aggiorna-tabella';
      
      const parentContainer = tabella.closest('.tabella-container') || tabella.parentNode;
      parentContainer.parentNode.insertBefore(container, parentContainer.nextSibling);
    }

    if (totalePagine <= 1) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.gap = '12px';

    container.innerHTML = `
        <button id="prev_${idTabella}" class="btn-paginazione" ${paginaCorrente === 1 ? 'disabled' : ''}>
            ◄ Precedente
        </button>
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <span class="paginazione-info" style="margin: 0; padding: 0; position: relative; top: 5px;">Pagina ${paginaCorrente} di ${totalePagine}</span>
        </div>
        <button id="next_${idTabella}" class="btn-paginazione" ${paginaCorrente === totalePagine ? 'disabled' : ''}>
            Successiva ►
        </button>
    `;

    document.getElementById(`prev_${idTabella}`).onclick = () => {
      if (paginaCorrente > 1) mostraPagina(paginaCorrente - 1);
    };
    document.getElementById(`next_${idTabella}`).onclick = () => {
      if (paginaCorrente < totalePagine) mostraPagina(paginaCorrente + 1);
    };
  }

  tabella.riaggiornaPaginazione = () => mostraPagina(1);

  mostraPagina(1);
}

document.addEventListener('DOMContentLoaded', () => {
  gestisciPaginazione('specBoardTable', 'controlliPaginazioneSpec');
  gestisciPaginazione('assettoWallTable', 'controlliPaginazioneAssetto');
});

document.addEventListener('DOMContentLoaded', () => {
  const inputRicerca = document.getElementById('ricerca-specboard');
  const selectOrdina = document.getElementById('ordina-per');
  const tabellaSpec = document.getElementById('specBoardTable');

  if (!tabellaSpec) return;

  if (inputRicerca) {
    inputRicerca.addEventListener('input', () => {
      const filtro = inputRicerca.value.toLowerCase().trim();
      const righe = tabellaSpec.querySelectorAll('tbody tr');

      righe.forEach(riga => {
        const testoRiga = riga.innerText.toLowerCase();
        if (testoRiga.includes(filtro)) {
          delete riga.dataset.filtrata;
        } else {
          riga.dataset.filtrata = 'nascosta';
          riga.style.display = 'none';
        }
      });

      if (tabellaSpec.riaggiornaPaginazione) {
        tabellaSpec.riaggiornaPaginazione();
      }
    });
  }

  if (selectOrdina) {
    selectOrdina.addEventListener('change', () => {
      const valore = selectOrdina.value;
      const tbody = tabellaSpec.querySelector('tbody');
      const righe = Array.from(tbody.querySelectorAll('tr'));

      righe.sort((a, b) => {
        if (valore === 'data-desc' || valore === 'data-asc') {
          const dataA = converteData(a.children[4]?.innerText.trim());
          const dataB = converteData(b.children[4]?.innerText.trim());
          return valore === 'data-desc' ? dataB - dataA : dataA - dataB;
        }

        if (valore === 'tempo-asc' || valore === 'tempo-desc') {
          const tempoA = converteTempoInMs(a.children[5]?.innerText.trim());
          const tempoB = converteTempoInMs(b.children[5]?.innerText.trim());
          return valore === 'tempo-asc' ? tempoA - tempoB : tempoB - tempoA;
        }
      });

      righe.forEach(riga => tbody.appendChild(riga));

      if (tabellaSpec.riaggiornaPaginazione) {
        tabellaSpec.riaggiornaPaginazione();
      }
    });
  }
});

function converteData(dataStr) {
  if (!dataStr || dataStr === '-') return 0;
  const parti = dataStr.split('/');
  if (parti.length < 3) return 0;
  return new Date(parti[2], parti[1] - 1, parti[0]).getTime();
}

function converteTempoInMs(tempoStr) {
  if (!tempoStr || tempoStr === '-' || tempoStr.trim() === '') return Infinity;
  
  const tempoPulito = tempoStr.replace(/X/gi, '0').trim();
  
  const parti = tempoPulito.split(':');
  if (parti.length < 2) return Infinity;
  
  const minuti = parseFloat(parti[0]);
  const secondi = parseFloat(parti[1]);
  
  if (isNaN(minuti) || isNaN(secondi)) return Infinity;
  
  return (minuti * 60 + secondi) * 1000;
}