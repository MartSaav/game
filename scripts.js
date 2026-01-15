let score = 0, best = localStorage.getItem("bestScore") || 0;
let timeLeft = 30;
let level = 1; // Nueva variable para niveles
let timer, spawnInterval;
let spawnSpeed = 1200;   // velocidad inicial aumentada para más lento (era 700)
let circleLifetime = 650; // duración inicial

const game = document.getElementById("game");
const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const timeText = document.getElementById("time");
const levelText = document.getElementById("level"); // Nuevo elemento para nivel
const startBtn = document.getElementById("startBtn");
const popSound = document.getElementById("popSound");
const gameOverModal = document.getElementById("gameOverModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

bestText.textContent = "Best: " + best;

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
    gameOverModal.style.display = "none";
    startGame();
});

function startGame() {
    score = 0;
    timeLeft = 30;
    level = 1; // Reiniciar nivel
    spawnSpeed = 1200;  // reiniciar a la velocidad más lenta
    circleLifetime = 650;

    scoreText.textContent = "Score: " + score;
    timeText.textContent = "Time: " + timeLeft;
    levelText.textContent = "Level: " + level; // Mostrar nivel inicial
    startBtn.style.display = "none";

    timer = setInterval(() => {
        timeLeft--;
        timeText.textContent = "Time: " + timeLeft;

        // Avanzar nivel cada 10 segundos
        if (timeLeft % 10 === 0 && timeLeft > 0) {
            level++;
            levelText.textContent = "Level: " + level;
        }

        // dificultad progresiva multiplicada por nivel (menos agresiva para jugabilidad)
        spawnSpeed = Math.max(300, spawnSpeed - (5 * level));  // Reducción reducida a 5*level
        circleLifetime = Math.max(300, circleLifetime - (4 * level));  // Reducción reducida a 4*level

        if (timeLeft <= 0) endGame();
    }, 1000);

    spawnInterval = setInterval(spawnCircle, spawnSpeed);
}

function endGame() {
    clearInterval(timer);
    clearInterval(spawnInterval);

    finalScore.textContent = score;
    if (score > best) {
        best = score;
        localStorage.setItem("bestScore", best);
        bestText.textContent = "Best: " + best;
        modalTitle.textContent = "🔥 New Record!";
        modalMessage.innerHTML = `Your Score: <span id="finalScore">${score}</span>`;
    } else {
        modalTitle.textContent = "Game Over";
        modalMessage.innerHTML = `Your Score: <span id="finalScore">${score}</span>`;
    }

    gameOverModal.style.display = "flex"; // Mostrar el modal centrado
    removeAllCircles();
}

function spawnCircle() {
    const circle = document.createElement("div");
    const size = Math.random() * 40 + 60;  // Más grandes: entre 60 y 120 px (favorece tamaños mayores)
    const hue = Math.random() * 360;

    circle.classList.add("circle");  // Restaurado a "circle"
    circle.style.setProperty("--color", `hsla(${hue}, 80%, 60%, 0.8)`);
    circle.style.width = size + "px";
    circle.style.height = size + "px";
    // Posicionamiento ajustado para evitar superposición con HUD, overflow en móviles y barras del sistema
    const maxTop = window.innerHeight - size - 150; // Evitar HUD, borde inferior y barras (agregado 50px extra)
    const maxLeft = window.innerWidth - size - 50; // Evitar borde derecho y barras (agregado 50px extra)
    circle.style.top = Math.random() * Math.max(0, maxTop) + 100 + "px"; // Asegurar no negativo
    circle.style.left = Math.random() * Math.max(0, maxLeft) + "px"; // Asegurar no negativo

    // Función para manejar el clic/toque
    const handleClick = (e) => {
        score++;
        scoreText.textContent = "Score: " + score;

        popSound.currentTime = 0;
        popSound.play();

        if (navigator.vibrate) navigator.vibrate(50); // 📱 vibración mobile

        circle.classList.add("fade");
        requestAnimationFrame(() => createConfetti(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY)); // Optimizado con requestAnimationFrame

        setTimeout(() => circle.remove(), 200);
    };

    // Agregar listeners para click y touchstart (para móviles)
    circle.addEventListener("click", handleClick);
    circle.addEventListener("touchstart", handleClick, { passive: true }); // Passive para mejor rendimiento en touch

    game.appendChild(circle);

    setTimeout(() => { if (circle.parentNode) circle.remove(); }, circleLifetime);
}

function createConfetti(x, y) {
    const colors = ['#d80a0aff', '#4ecdc4', '#06a5c9ff', '#16cf79ff', '#dd4b12ff', '#940a94ff', '#f5c712ff', '#a904f0ff']; // Colores variados para confetis
    for (let i = 0; i < 15; i++) { // Reducido a 15 para menos delay (era 20)
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.left = x + "px";
        confetti.style.top = y + "px";
        confetti.style.setProperty("--confetti-color", colors[Math.floor(Math.random() * colors.length)]); // Color aleatorio
        // Movimiento radial para explosión: direcciones aleatorias en 360 grados
        const angle = Math.random() * 2 * Math.PI; // Ángulo aleatorio
        const distance = Math.random() * 150 + 50; // Distancia aleatoria
        const xOffset = Math.cos(angle) * distance;
        const yOffset = Math.sin(angle) * distance;
        confetti.style.setProperty("--x", xOffset + "px");
        confetti.style.setProperty("--y", yOffset + "px");
        // Rotaciones 3D aleatorias
        const rotateX = (Math.random() - 0.5) * 360 + "deg"; // Rotación X aleatoria
        const rotateY = (Math.random() - 0.5) * 360 + "deg"; // Rotación Y aleatoria
        confetti.style.setProperty("--rotateX", rotateX);
        confetti.style.setProperty("--rotateY", rotateY);
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 800); // Duración más corta para explosión
    }
}

function removeAllCircles() {
    document.querySelectorAll(".circle").forEach(c => c.remove());  // Restaurado a ".circle"
}