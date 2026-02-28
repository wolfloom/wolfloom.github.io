const engines = {
    google: { url: 'https://www.google.com/search?q=', icon: 'search' },
	ecosia: { url: 'https://www.ecosia.org/search?q=', icon: 'leaf' },
	bing: { url: 'https://www.bing.com/search?q=', icon: 'search' },
	duckduckgo: { url: 'https://duckduckgo.com/?q=', icon: 'search' },
	yahoo: { url: 'https://search.yahoo.com/search?p=', icon: 'search' },
    youtube: { url: 'https://www.youtube.com/results?search_query=', icon: 'youtube' },
    spotify: { url: 'https://open.spotify.com/search/', icon: 'music' },
    amazon: { url: 'https://www.amazon.com/s?k=', icon: 'shopping-cart' },
    chatgpt: { url: 'https://chat.openai.com/?q=', icon: 'cpu' },
    copilot: { url: 'https://www.bing.com/search?mturn=1&q=', icon: 'cpu' },
    claude: { url: 'https://claude.ai/new?q=', icon: 'cpu' },
    perplexity: { url: 'https://www.perplexity.ai/search?q=', icon: 'cpu' },
    gemini: { url: 'https://www.google.com/search?udm=50&source=searchlabs&q=', icon: 'cpu' }
};

const aiEngines = ['chatgpt','copilot','claude','perplexity', 'gemini'];
const searchEngines = ['google','ecosia','bing','duckduckgo', 'yahoo'];
const engineDropdown = document.getElementById('engineDropdown');

function renderEngineDropdown(){
    if(!engineDropdown) return;
    engineDropdown.innerHTML = '';
    
	// Only selected search
    const selectedSearch = localStorage.getItem('selectedSearch') || 'google';
    if(searchEngines.includes(selectedSearch)){
        const div = document.createElement('div');
        div.classList.add('engine-option');
        div.innerHTML = `<i data-lucide="${engines[selectedSearch].icon}"></i> ${selectedSearch.charAt(0).toUpperCase() + selectedSearch.slice(1)}`;
        div.addEventListener('click',()=>setEngine(selectedSearch));
        engineDropdown.appendChild(div);
    }

    // Regular engines
    ['youtube','spotify','amazon'].forEach(key => {
        const div = document.createElement('div');
        div.classList.add('engine-option');
        div.innerHTML = `<i data-lucide="${engines[key].icon}"></i> ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        div.addEventListener('click',()=>setEngine(key));
        engineDropdown.appendChild(div);
    });

    // Only selected AI
    const selectedAI = localStorage.getItem('selectedAI') || 'chatgpt';
    if(aiEngines.includes(selectedAI)){
        const div = document.createElement('div');
        div.classList.add('engine-option');
        div.innerHTML = `<i data-lucide="${engines[selectedAI].icon}"></i> ${selectedAI.charAt(0).toUpperCase() + selectedAI.slice(1)}`;
        div.addEventListener('click',()=>setEngine(selectedAI));
        engineDropdown.appendChild(div);
    }

    if(window.lucide) lucide.createIcons();
}

// ============================
// AI selector setup
// ============================
const aiSelect = document.getElementById('aiSelect');

// Load previous choice
let currentAI = localStorage.getItem('selectedAI') || 'chatgpt';
if(aiSelect) aiSelect.value = currentAI;

// Save when changed
if(aiSelect){
    aiSelect.addEventListener('change', () => {
        currentAI = aiSelect.value;
        localStorage.setItem('selectedAI', currentAI);
        console.log("Selected AI:", currentAI);

        // <— THIS IS STEP 3 —>
        // Re-render engine dropdown to only show the selected AI
        renderEngineDropdown();

        // Optionally set the search bar to use this AI immediately
        setEngine(currentAI);
    });
}

// ============================
// Search selector setup
// ============================
const searchSelect = document.getElementById('searchSelect');

// Load previous choice
let currentSearch = localStorage.getItem('selectedSearch') || 'google';
if(searchSelect) searchSelect.value = currentSearch;

// Save when changed
if(searchSelect){
    searchSelect.addEventListener('change', () => {
        currentSearch = searchSelect.value;
        localStorage.setItem('selectedSearch', currentSearch);
        console.log("Selected search:", currentSearch);

        // <— THIS IS STEP 3 —>
        // Re-render engine dropdown to only show the selected search
        renderEngineDropdown();

        // Optionally set the search bar to use this search immediately
        setEngine(currentSearch);
    });
}

let currentEngine = localStorage.getItem('lastEngine');
if (!engines[currentEngine]) currentEngine = 'google';

// Load previous choice
if(aiSelect) aiSelect.value = currentAI;

// Save when changed
if(aiSelect){
    aiSelect.addEventListener('change', () => {
        currentAI = aiSelect.value;
        localStorage.setItem('selectedAI', currentAI);
        console.log("Selected AI:", currentAI); // optional debug
    });
}

// Load previous choice
if(searchSelect) searchSelect.value = currentSearch;

// Save when changed
if(searchSelect){
    searchSelect.addEventListener('change', () => {
        currentSearch = searchSelect.value;
        localStorage.setItem('selectedSearch', currentSearch);
        console.log("Selected search:", currentSearch); // optional debug
    });
}


(function forceCaret() {
    const searchBox = document.getElementById("mainSearch");
    if (searchBox) {
        // Repeat a few times just to outsmart Chrome
        [50, 100, 200].forEach(ms => setTimeout(() => {
            searchBox.focus();
            searchBox.select(); // optional
        }, ms));
    }
})();
function setEngine(choice) {
    if (!engines[choice]) return;
    currentEngine = choice;
    localStorage.setItem('lastEngine', choice);
    const icon = document.getElementById('activeEngineIcon');
    if (icon) {
        icon.setAttribute('data-lucide', engines[choice].icon);
        lucide.createIcons();
    }
    if (engineDropdown) engineDropdown.style.display = 'none';
}



// ==============================
// Shortcuts (isolated)
// ==============================
(function() {
    const container=document.getElementById('shortcutContainer');
    if(!container) return;

    let shortcuts=JSON.parse(localStorage.getItem('shortcuts'))||[
        {name:'Google', url:'https://www.google.com', icon:'https://www.google.com/s2/favicons?domain=google.com'},
        {name:'YouTube', url:'https://www.youtube.com', icon:'https://www.google.com/s2/favicons?domain=youtube.com'}
    ];

    function renderShortcuts(){
        container.innerHTML='';
        shortcuts.forEach((sc,idx)=>{
            const div=document.createElement('div');
            div.classList.add('shortcut');
            div.dataset.idx=idx;
            div.dataset.url=sc.url;
            div.dataset.name=sc.name;
            div.innerHTML=`<img class="shortcut-icon" src="${sc.icon}" alt="${sc.name}"><span>${sc.name}</span>`;
            div.addEventListener('click',()=>window.open(sc.url,'_blank'));
            div.addEventListener('contextmenu',e=>{
                e.preventDefault();
                if(confirm(`Delete shortcut "${sc.name}"?`)){
                    shortcuts.splice(idx,1);
                    localStorage.setItem('shortcuts',JSON.stringify(shortcuts));
                    renderShortcuts();
                }
            });
            container.appendChild(div);
        });

        const addBtn=document.createElement('div');
        addBtn.classList.add('shortcut','shortcut-add');
        addBtn.innerHTML=`<i data-lucide="plus"></i><span>Add</span>`;
        addBtn.addEventListener('click',()=>{
            const name=prompt('Shortcut name:');
            const url=prompt('Shortcut URL (https://...)');
            if(name && url){
                const icon=`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=256`;
                shortcuts.push({name,url,icon});
                localStorage.setItem('shortcuts',JSON.stringify(shortcuts));
                renderShortcuts();
                if(window.lucide) lucide.createIcons();
            }
        });
        container.appendChild(addBtn);
        if(window.lucide) lucide.createIcons();
    }

    renderShortcuts();
})();

document.addEventListener('DOMContentLoaded', () => {
    // Set AI selector value
    if(aiSelect) aiSelect.value = currentAI;

    // Update dropdown when AI changes
    if(aiSelect){
        aiSelect.addEventListener('change', () => {
            currentAI = aiSelect.value;
            localStorage.setItem('selectedAI', currentAI);
            renderEngineDropdown(); // Refresh dropdown
            setEngine(currentAI);   // Use selected AI immediately
        });
    }

    // Initial dropdown render
    renderEngineDropdown();
});