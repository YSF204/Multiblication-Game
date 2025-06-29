let timeRemaining = 60;
let play = false;
let score = 0;
let correctAnswer;
let Time = null;
let streak = 0;
let highScores = [];
let hintsLeft = 2;
let maxHints = 2;
let difficulty = "medium";
let darkMode = false;

function Show(id) {
  const el = document.getElementById(id);
  el.style.display = "block";
  el.classList.add("show");
  el.classList.remove("hide");
}
function Hide(id) {
  const el = document.getElementById(id);
  el.style.display = "none";
  el.classList.remove("show");
  el.classList.add("hide");
}
function animateScore() {
  const scoreEl = document.getElementById("ScoreValue");
  scoreEl.classList.add("pop");
  setTimeout(() => scoreEl.classList.remove("pop"), 400);
}
function updateProgressBar() {
  const progress = document.getElementById("progress");
  progress.style.width = (timeRemaining / getTimeLimit()) * 100 + "%";
}
function updateHints() {
  document.getElementById("hintsLeft").textContent = hintsLeft;
  document.getElementById("hintBtn").disabled = hintsLeft <= 0 || !play;
}
function updateStreak() {
  const streakEl = document.getElementById("streakCounter");
  if (streak > 1) {
    streakEl.style.display = "block";
    document.getElementById("streakValue").textContent = streak;
  } else {
    streakEl.style.display = "none";
  }
}
function updateLeaderboard() {
  const lb = document.getElementById("leaderboard");
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  let scores = getHighScores();
  if (scores.length === 0) {
    lb.style.display = "none";
    return;
  }
  lb.style.display = "block";
  scores.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `#${i + 1}: ${s} pts`;
    list.appendChild(li);
  });
}
function getHighScores() {
  return JSON.parse(localStorage.getItem("multiplication_highscores") || "[]");
}
function saveHighScore(newScore) {
  let scores = getHighScores();
  scores.push(newScore);
  scores = scores.sort((a, b) => b - a).slice(0, 5);
  localStorage.setItem("multiplication_highscores", JSON.stringify(scores));
}
function getTimeLimit() {
  if (difficulty === "easy") return 90;
  if (difficulty === "hard") return 40;
  return 60;
}
function getNumberRange() {
  if (difficulty === "easy") return [1, 6];
  if (difficulty === "hard") return [6, 15];
  return [1, 9];
}

function resetGame() {
  play = false;
  score = 0;
  streak = 0;
  timeRemaining = getTimeLimit();
  hintsLeft = maxHints;
  document.getElementById("ScoreValue").innerHTML = score;
  document.getElementById("timeRemainingValue").innerHTML = timeRemaining;
  Hide("Correct");
  Hide("Wrong");
  Hide("time");
  for (let i = 1; i <= 4; i++) {
    document.getElementById("box" + i).innerHTML = "";
    document.getElementById("box" + i).style.visibility = "visible";
  }
  document.getElementById("question").innerHTML = "";
  updateProgressBar();
  updateHints();
  updateStreak();
}

function gameOver() {
  play = false;
  StopCounter();
  saveHighScore(score);
  updateLeaderboard();
  setTimeout(() => {
    alert("Game Over! Your score: " + score);
    resetGame();
  }, 100);
}

function StartCounter() {
  if (Time) clearInterval(Time);
  Time = setInterval(() => {
    timeRemaining--;
    document.getElementById("timeRemainingValue").innerHTML = timeRemaining;
    updateProgressBar();
    if (timeRemaining <= 0) {
      gameOver();
    }
  }, 1000);
}

function StopCounter() {
  if (Time) clearInterval(Time);
  Hide("time");
}

function generateQ() {
  let [min, max] = getNumberRange();
  let x = min + Math.floor(Math.random() * (max - min + 1));
  let y = min + Math.floor(Math.random() * (max - min + 1));
  correctAnswer = x * y;
  document.getElementById("question").innerHTML = x + "   X   " + y;
  let correctPos = Math.floor(Math.random() * 4) + 1;
  document.getElementById("box" + correctPos).innerHTML = correctAnswer;
  let answers = [correctAnswer];
  for (let i = 1; i <= 4; i++) {
    if (i !== correctPos) {
      let wrongAnswer;
      do {
        let xw = min + Math.floor(Math.random() * (max - min + 1));
        let yw = min + Math.floor(Math.random() * (max - min + 1));
        wrongAnswer = xw * yw;
      } while (answers.includes(wrongAnswer));
      answers.push(wrongAnswer);
      document.getElementById("box" + i).innerHTML = wrongAnswer;
    }
    document.getElementById("box" + i).style.visibility = "visible";
  }
}

document.getElementById("startGameBtn").onclick = function () {
  if (play == true) {
    StopCounter();
    resetGame();
    return;
  } else {
    play = true;
    score = 0;
    streak = 0;
    timeRemaining = getTimeLimit();
    hintsLeft = maxHints;
    document.getElementById("ScoreValue").innerHTML = score;
    Show("time");
    document.getElementById("timeRemainingValue").innerHTML = timeRemaining;
    updateProgressBar();
    updateHints();
    updateStreak();
    StartCounter();
    generateQ();
  }
};

for (let i = 1; i <= 4; i++) {
  document.getElementById("box" + i).onclick = function () {
    if (!play) return;
    if (parseInt(this.innerHTML) === correctAnswer) {
      score++;
      streak++;
      animateScore();
      generateQ();
      document.getElementById("ScoreValue").innerHTML = score;
      Show("Correct");
      Hide("Wrong");
      setTimeout(() => {
        Hide("Correct");
      }, 1000);
    } else {
      streak = 0;
      Show("Wrong");
      Hide("Correct");
      setTimeout(() => {
        Hide("Wrong");
      }, 1000);
    }
  };
  document.getElementById("box" + i).tabIndex = 0;
  document.getElementById("box" + i).setAttribute("role", "button");
  document.getElementById("box" + i).addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      this.click();
    }
  });
}

document.getElementById("difficulty").onchange = function () {
  difficulty = this.value;
  resetGame();
};

document.getElementById("darkModeToggle").onclick = function () {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  this.textContent = darkMode ? "☀️" : "🌙";
};

document.getElementById("hintBtn").onclick = function () {
  if (!play || hintsLeft <= 0) return;
  let hidden = 0;
  for (let i = 1; i <= 4; i++) {
    let box = document.getElementById("box" + i);
    if (
      parseInt(box.innerHTML) !== correctAnswer &&
      box.style.visibility !== "hidden"
    ) {
      box.style.visibility = "hidden";
      hidden++;
      break;
    }
  }
  hintsLeft--;
  updateHints();
};

window.onload = function () {
  document.getElementById("startGameBtn").focus();
  updateLeaderboard();
  updateHints();
  updateStreak();
  updateProgressBar();
  if (localStorage.getItem("multiplication_darkmode") === "true") {
    darkMode = true;
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeToggle").textContent = "☀️";
  }
};

const observer = new MutationObserver(() => {
  localStorage.setItem(
    "multiplication_darkmode",
    document.body.classList.contains("dark-mode")
  );
});
observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});
