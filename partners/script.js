const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
const underline = document.querySelector('.underline');

// Function to update the underline position
function moveUnderline(activeBtn) {
    const rect = activeBtn.getBoundingClientRect();
    const parentRect = activeBtn.parentElement.getBoundingClientRect();
    underline.style.width = rect.width + 'px';
    underline.style.left = (rect.left - parentRect.left) + 'px';
}

// Tab click event
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');

        moveUnderline(tab);
    });
});

// Set default active tab and underline
const defaultTab = document.querySelector('.tab-btn.active');
document.getElementById(defaultTab.dataset.tab).classList.add('active');
moveUnderline(defaultTab);

// Adjust underline on window resize
window.addEventListener('resize', () => {
    const active = document.querySelector('.tab-btn.active');
    moveUnderline(active);
});

const glow = document.querySelector('.mouse-glow');

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

let glowStrength = 0;       // 0 to 1
let targetStrength = 0;

let lastMoveTime = Date.now();

const followSpeed = 0.08;   // cursor lag
const glowSpeed = 0.01;     // brightness smoothness

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMoveTime = Date.now();
    targetStrength = 1;     // brighten when moving
});

document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');

    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';

    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 1000);
});

function animate() {

    // Smooth cursor follow
    currentX += (mouseX - currentX) * followSpeed;
    currentY += (mouseY - currentY) * followSpeed;

    glow.style.left = currentX + "px";
    glow.style.top = currentY + "px";

    // If idle for 120ms, dim
    if (Date.now() - lastMoveTime > 120) {
        targetStrength = 0;
    }

    // Smooth brightness transition
    glowStrength += (targetStrength - glowStrength) * glowSpeed;

    // Apply dynamic glow
    const opacity = 0.25 + glowStrength * 0.35;
    const scale = 1 + glowStrength * 0.15;

    glow.style.background = `
        radial-gradient(
            circle,
            rgba(79,195,247,${opacity}),
            transparent 60%
        )
    `;

    glow.style.transform = `translate(-50%, -50%) scale(${scale})`;

    requestAnimationFrame(animate);
}

animate();
