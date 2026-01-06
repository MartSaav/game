let score = 0, best = localStorage.getItem("bestScore") || 0;
let timeLeft = 30;
let timer, spawnInterval;
let spawnSpeed = 1200;   // velocidad inicial aumentada para más lento (era 700)
let circleLifetime = 650; // duración inicial

const game = document.getElementById("game");
const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const timeText = document.getElementById("time");
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
    spawnSpeed = 1200;  // reiniciar a la velocidad más lenta
    circleLifetime = 650;

    scoreText.textContent = "Score: " + score;
    timeText.textContent = "Time: " + timeLeft;
    startBtn.style.display = "none";

    timer = setInterval(() => {
        timeLeft--;
        timeText.textContent = "Time: " + timeLeft;

        // dificultad progresiva (se acelera menos agresivamente para mantenerlo jugable en mobile)
        spawnSpeed = Math.max(400, spawnSpeed - 10);  // reducido de 15 a 10 para que se acelere más lentamente
        circleLifetime = Math.max(350, circleLifetime - 8);

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
    const size = Math.random() * 100 + 50;  // tamaño aumentado: entre 50 y 150 px (era 30-80)
    const hue = Math.random() * 360;

    circle.classList.add("circle");
    circle.style.setProperty("--color", `hsla(${hue}, 80%, 60%, 0.8)`);
    circle.style.width = size + "px";
    circle.style.height = size + "px";
    circle.style.top = Math.random() * (window.innerHeight - size) + "px";
    circle.style.left = Math.random() * (window.innerWidth - size) + "px";

    circle.addEventListener("click", (e) => {
        score++;
        scoreText.textContent = "Score: " + score;

        popSound.currentTime = 0;
        popSound.play();

        if (navigator.vibrate) navigator.vibrate(50); // 📱 vibración mobile

        circle.classList.add("fade");
        createSparks(e.clientX, e.clientY, hue);

        setTimeout(() => circle.remove(), 200);
    });

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
    document.querySelectorAll(".circle").forEach(c => c.remove());
}