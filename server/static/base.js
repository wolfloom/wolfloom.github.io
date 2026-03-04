const settingsMenu = document.getElementById('settingsMenu');
const nameModal = document.getElementById('nameModal');
const greetingModal = document.getElementById('greetingModal');
const displayNameEl = document.getElementById('displayName');
const displayGreetingEl = document.getElementById('displayGreeting');

document.addEventListener('DOMContentLoaded', () => {
    // Lucide icons
    if (window.lucide) lucide.createIcons();

    // Apply saved settings
    updateTheme(localStorage.getItem('themeColor') || '#f4f4f9');
    updateName(localStorage.getItem('userName') || 'Friend');
    updateGreeting(localStorage.getItem('userGreeting') || 'Hello');
    applyFont(localStorage.getItem('userFont') || 'Segoe UI');
    //setEngine(currentEngine);
    updateNavigationState();

    // Search enter
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                window.location.href = engines[currentEngine].url + encodeURIComponent(e.target.value);
            }
        });
    }
});

function updateNavigationState() {
    const path = window.location.pathname.toLowerCase();
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const routes = ['home', 'files', 'notes', 'debug'];

    for (const route of routes) {
        if (path.includes(`/${route}`)) {
            document.getElementById(`nav-${route}`)?.classList.add('active');
            return;
        }
    }

    document.getElementById('nav-home')?.classList.add('active');
}

// ==============================
// Menu Toggle
// ==============================
function toggleMenu(id) {
    closeMenus();
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = id === 'settingsMenu' ? 'flex' : 'block';
}
function closeMenus() {
    if (settingsMenu) settingsMenu.style.display = 'none';
    if (engineDropdown) engineDropdown.style.display = 'none';
    if (nameModal) nameModal.style.display = 'none';
    if (greetingModal) greetingModal.style.display = 'none';
}

// ==============================
// Theme
// ==============================
function adjustColor(hex, amt) {
    if (hex[0]==='#') hex = hex.slice(1);
    let num = parseInt(hex,16);
    let r=Math.max(0,Math.min(255,(num>>16)+amt));
    let g=Math.max(0,Math.min(255,((num>>8)&0x00FF)+amt));
    let b=Math.max(0,Math.min(255,(num&0x0000FF)+amt));
    return "#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}
function updateTheme(color) {
    document.documentElement.style.setProperty('--bg-color', color);
    const hex=color.replace('#','');
    const r=parseInt(hex.substr(0,2),16), g=parseInt(hex.substr(2,2),16), b=parseInt(hex.substr(4,2),16);
    const yiq=((r*299)+(g*587)+(b*114))/1000;
    const isDark=yiq<128;
    const textColor=isDark ? '#ffffff' : '#1f2937';
    document.documentElement.style.setProperty('--text-color', textColor);
    const panelBase=isDark ? adjustColor(color,40) : adjustColor(color,-25);
    document.documentElement.style.setProperty('--panel-color', panelBase+'cc');
    localStorage.setItem('themeColor', color);
}

// ==============================
// Name
// ==============================
function openNameModal() { if (nameModal) nameModal.style.display = 'flex'; }
function saveName() {
    const input = document.getElementById('userNameInput');
    if (!input) return;
    const val = input.value.trim();
    if (val) { updateName(val); if (nameModal) nameModal.style.display='none'; }
}
function updateName(name) {
    if (displayNameEl) displayNameEl.innerText=name;
    localStorage.setItem('userName',name);
}


// ==============================
// Greeting
// ==============================
function openGreetingModal() { if (greetingModal) greetingModal.style.display = 'flex'; }
function saveGreeting() {
    const input = document.getElementById('userGreetingInput');
    if (!input) return;
    const val = input.value.trim();
    if (val) { updateGreeting(val); if (greetingModal) greetingModal.style.display='none'; }
}
function updateGreeting(greeting) {
    if (displayGreetingEl) displayGreetingEl.innerText=greeting;
    localStorage.setItem('userGreeting',greeting);
}

// ==============================
// Fonts
// ==============================
function applyFont(font) {
    document.body.style.fontFamily = `${font}, sans-serif`; // adds fallback
    localStorage.setItem('userFont', font);
}

const themeButton = document.getElementById('themeButton');
const themePicker = document.getElementById('themePicker');
const themeIcon = document.getElementById('themeIcon');

function updateThemeIcon(color) {
    if (themeIcon) themeIcon.style.color = color;
}

// Click icon to open hidden colour picker
if (themeButton && themePicker) {
    themeButton.addEventListener('click', () => themePicker.click());
}

// When colour changes, update theme & icon
themePicker.addEventListener('input', e => {
    updateTheme(e.target.value);
    updateThemeIcon(e.target.value);
});

// Initialize icon colour
updateThemeIcon(themePicker.value);

const googleFonts = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald',
    'Raleway', 'Poppins', 'Merriweather', 'Nunito', 'Ubuntu', 'Custom'
];

const fontSelect = document.getElementById('fontSelect');
const customInput = document.getElementById('customFontInput');

// Populate dropdown
googleFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    if (font !== 'Custom') option.style.fontFamily = font;
    fontSelect.appendChild(option);
});

// Load Google Fonts dynamically (except Custom)
const fontsToLoad = googleFonts.filter(f => f !== 'Custom').join('&family=');
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad}&display=swap`;
document.head.appendChild(link);

// Apply saved font
const savedFont = localStorage.getItem('userFont') || 'Segoe UI';
applyFont(savedFont);
fontSelect.value = googleFonts.includes(savedFont) ? savedFont : 'Custom';
if(fontSelect.value==='Custom') {
    customInput.style.display='block';
    customInput.value = savedFont;
}

// Handle font change
fontSelect.addEventListener('change', () => {
    if (fontSelect.value === 'Custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
        applyFont(fontSelect.value);
    }
});


// Handle custom input
customInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        const fontName = customInput.value.trim();
        if (!fontName) return;

        // Load Google Font dynamically
        const customLink = document.createElement('link');
        customLink.rel = 'stylesheet';
        customLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g,'+')}&display=swap`;
        document.head.appendChild(customLink);

        // Apply font
        applyFont(fontName);
        localStorage.setItem('userFont', fontName);
        customInput.blur();
    }
});