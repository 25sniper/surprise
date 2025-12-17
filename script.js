// Configuration
const CONFIG = {
    name: "Narmadha",
    date: "2025-12-18T00:00:00", // Start of the birthday
    photoUrl: "assets/img/7.jpg", 
    puzzleImage: "assets/img/7.jpg"
};

// State
let currentStage = 0;
const stages = [
    'welcome-stage',
    'balloon-stage',
    'countdown-stage',
    'cake-stage',
    'puzzle-stage',
    'reveal-stage'
];

// Elements
const bgMusic = document.getElementById('bg-music');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupWelcome();
    setupCountdown();
});

// --- Stage Management ---
function nextStage() {
    const currentId = stages[currentStage];
    const nextId = stages[currentStage + 1];

    if (nextId) {
        document.getElementById(currentId).classList.remove('active');

        // Wait for fade out
        setTimeout(() => {
            document.getElementById(currentId).classList.add('hidden');
            const nextEl = document.getElementById(nextId);
            nextEl.classList.remove('hidden');

            // Trigger reflow
            void nextEl.offsetWidth;

            nextEl.classList.add('active');
            currentStage++;
            initStage(currentStage);
        }, 1000);
    }
}

function initStage(index) {
    const stageId = stages[index];
    if (stageId === 'balloon-stage') startBalloons();
    if (stageId === 'countdown-stage') checkCountdown();
    if (stageId === 'cake-stage') startCandleInteraction();
    if (stageId === 'puzzle-stage') startPuzzle();
    if (stageId === 'reveal-stage') startFireworksShow();
}

// --- Stage 1: Welcome ---
function setupWelcome() {
    document.getElementById('enter-btn').addEventListener('click', () => {
        bgMusic.play().catch(e => console.log("Audio autoplay prevented"));

        // Use realistic fireworks for entrance too
        startFireworksShow(2000); // Short burst

        setTimeout(nextStage, 2500);
    });
}

// --- Stage 2: Balloons ---
function startBalloons() {
    const container = document.getElementById('balloon-container');
    let poppedCount = 0;
    const totalBalloons = 10;
    const requiredPops = 5;

    function createBalloon() {
        if (poppedCount >= requiredPops) return;

        const b = document.createElement('div');
        b.className = 'balloon';
        b.style.left = Math.random() * 90 + '%';
        b.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        b.style.animationDuration = (Math.random() * 5 + 8) + 's'; // Slower, more majestic

        b.addEventListener('click', function (e) {
            // Visual Pop Effect (Mini Confetti)
            createPopExplosion(e.clientX, e.clientY, b.style.backgroundColor);

            this.remove();
            poppedCount++;
            playPopSound();

            if (poppedCount === requiredPops) {
                setTimeout(nextStage, 1000);
            }
        });

        container.appendChild(b);

        // Remove if it floats away
        setTimeout(() => {
            if (b.parentNode) b.remove();
        }, 15000);
    }

    // Spawn balloons loop
    const interval = setInterval(() => {
        if (poppedCount >= requiredPops) {
            clearInterval(interval);
        } else {
            createBalloon();
        }
    }, 1200);
}

function createPopExplosion(x, y, color) {
    // Canvas overlay pop
    const count = 30;
    for (let i = 0; i < count; i++) {
        fireworks.push(new SparkParticle(x, y, color));
    }
}

function playPopSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }
}

// --- Fireworks System ---
const fireworks = [];
let fireworksInterval;

class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.targetRadius = 1;
        this.hue = Math.random() * 360;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        this.speed *= this.acceleration;

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.targetX, this.targetY, this.hue);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 20 + hue;
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            fireworks.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }
}

// Sparks for balloon pop
class SparkParticle extends Particle {
    constructor(x, y, color) {
        super(x, y, 0);
        this.hue = Math.random() * 360; // Use specific color if parsed properly, but random is festive
        this.speed = Math.random() * 5 + 2;
        this.gravity = 0.5;
        this.decay = 0.03;
    }

    draw() {
        // Simple circle for consistency with CSS balloons
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
        ctx.fill();
    }
}

function createParticles(x, y, hue) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        fireworks.push(new Particle(x, y, hue));
    }
}

function startFireworksShow(duration = 0) {
    const loop = () => {
        // Clear with trail effect
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        // Randomly launch fireworks
        if (Math.random() < 0.05) {
            const startX = Math.random() * canvas.width;
            // Launch from bottom
            fireworks.push(new Firework(startX, canvas.height, Math.random() * canvas.width, Math.random() * canvas.height / 2));
        }

        requestAnimationFrame(loop);
    }
    loop();

    // Stop launching new ones if duration is set (not fully implemented in this simple loop but loop continues for particles)
}

// --- Stage 3: Countdown ---
function setupCountdown() {
    const timerEl = document.getElementById('timer');
    const msgEl = document.getElementById('countdown-message');

    function update() {
        const now = new Date().getTime();
        const target = new Date(CONFIG.date).getTime();
        const diff = target - now;

        if (diff < 0) {
            timerEl.classList.add('hidden');
            msgEl.classList.remove('hidden');
            msgEl.innerHTML = "It's Time! <br> <button class='btn' onclick='nextStage()'>Start Party</button>";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = d.toString().padStart(2, '0');
        document.getElementById('hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
    }

    setInterval(update, 1000);
    update();
}

function checkCountdown() { }

// --- Stage 4: Cake & Candle ---
function startCandleInteraction() {
    const flame = document.querySelector('.flame');
    const candle = document.querySelector('.candle');
    let blownOut = false;

    candle.addEventListener('click', blowOut);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                scriptProcessor.onaudioprocess = function () {
                    if (blownOut) return;
                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    let values = 0;
                    for (let i = 0; i < array.length; i++) values += array[i];
                    if ((values / array.length) > 80) {
                        blowOut();
                        stream.getTracks().forEach(track => track.stop());
                    }
                };
            })
            .catch(err => console.log("Mic error", err));
    }

    function blowOut() {
        if (blownOut) return;
        blownOut = true;
        flame.classList.add('out');
        // Smoke effect could be added here
        setTimeout(() => { nextStage(); }, 2000);
    }
}

// --- Stage 5: Puzzle ---
function startPuzzle() {
    const grid = document.getElementById('puzzle-container');
    const size = 3;
    let tiles = [];
    let state = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    grid.innerHTML = '';
    for (let i = 0; i < size * size; i++) {
        const tile = document.createElement('div');
        tile.className = 'puzzle-piece';
        if (i === 8) tile.classList.add('empty');
        const row = Math.floor(i / size);
        const col = i % size;
        tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
        tile.id = `tile-${i}`;
        tiles.push(tile);
    }

    function render() {
        grid.innerHTML = '';
        state.forEach((tileIndex, positionIndex) => {
            const tile = tiles[tileIndex];
            tile.onclick = () => tryMove(positionIndex);
            grid.appendChild(tile);
        });
    }

    function tryMove(posIndex) {
        const emptyPos = state.indexOf(8);
        const row = Math.floor(posIndex / size);
        const col = posIndex % size;
        const emptyRow = Math.floor(emptyPos / size);
        const emptyCol = emptyPos % size;

        if ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1) {
            [state[posIndex], state[emptyPos]] = [state[emptyPos], state[posIndex]];
            render();
            checkWin();
        }
    }

    function checkWin() {
        if (state.every((val, idx) => val === idx)) {
            setTimeout(() => { nextStage(); }, 1000);
        }
    }

    for (let i = 0; i < 50; i++) {
        const emptyPos = state.indexOf(8);
        const neighbors = [];
        const emptyRow = Math.floor(emptyPos / size);
        const emptyCol = emptyPos % size;
        if (emptyRow > 0) neighbors.push(emptyPos - 3);
        if (emptyRow < 2) neighbors.push(emptyPos + 3);
        if (emptyCol > 0) neighbors.push(emptyPos - 1);
        if (emptyCol < 2) neighbors.push(emptyPos + 1);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        [state[randomNeighbor], state[emptyPos]] = [state[emptyPos], state[randomNeighbor]];
    }

    render();
}

function triggerFinalConfetti() {
    // Legacy holder, now handled by startFireworksShow in initStage
}
