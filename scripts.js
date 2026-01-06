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

        // dificultad progresiva multiplicada por nivel (más desafiante en niveles altos)
        spawnSpeed = Math.max(200, spawnSpeed - (10 * level));  // Reducción aumentada por nivel
        circleLifetime = Math.max(200, circleLifetime - (8 * level));  // Reducción aumentada por nivel

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
    const size = Math.random() * 60 + 40;  // tamaño reducido para móviles: entre 40 y 100 px (era 50-150)
    const hue = Math.random() * 360;

    circle.classList.add("circle");  // Restaurado a "circle"
    circle.style.setProperty("--color", `hsla(${hue}, 80%, 60%, 0.8)`);
    circle.style.width = size + "px";
    circle.style.height = size + "px";
    // Posicionamiento ajustado para evitar superposición con HUD (evitar top 100px)
    circle.style.top = Math.random() * (window.innerHeight - size - 100) + 100 + "px";
    circle.style.left = Math.random() * (window.innerWidth - size) + "px";

    // Función para manejar el clic/toque
    const handleClick = (e) => {
        score++;
        scoreText.textContent = "Score: " + score;

        popSound.currentTime = 0;
        popSound.play();

        if (navigator.vibrate) navigator.vibrate(50); // 📱 vibración mobile

        circle.classList.add("fade");
        createSparks(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, hue); // Soporte para touch

        setTimeout(() => circle.remove(), 200);
    };

    // Agregar listeners para click y touchstart (para móviles)
    circle.addEventListener("click", handleClick);
    circle.addEventListener("touchstart", handleClick, { passive: true }); // Passive para mejor rendimiento en touch

    game.appendChild(circle);

    setTimeout(() => { if (circle.parentNode) circle.remove(); }, circleLifetime);
}

function createSparks(x, y, hue){
    for(let i=0;i<6;i++){
        const spark = document.createElement("div");
        spark.classList.add("spark");
        spark.style.left = x + "px";
        spark.style.top = y + "px";
        spark.style.background = `hsl(${hue},100%,70%)`;
        spark.style.setProperty("--x", (Math.random()*80-40)+"px");
        spark.style.setProperty("--y", (Math.random()*80-40)+"px");
        document.body.appendChild(spark);
        setTimeout(()=>spark.remove(),400);
    }
}

function removeAllCircles() {
    document.querySelectorAll(".circle").forEach(c => c.remove());  // Restaurado a ".circle"
}