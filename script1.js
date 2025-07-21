// Firebase Config (replace with your actual config)
try{
const firebaseConfig = {
    apiKey: "AIzaSyDWjHFd-bcPYhPYEh_Kj2Tv-9gJQYStuDs",
    authDomain: "quiz-scorer.firebaseapp.com",
    databaseURL: "https://quiz-scorer-default-rtdb.firebaseio.com",
    projectId: "quiz-scorer",
    storageBucket: "quiz-scorer.firebasestorage.app",
    messagingSenderId: "978597917630",
    appId: "1:978597917630:web:ee3b70ae686b5d38aabfef",
    measurementId: "G-4G3GPEW9EL"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
 console.log("✅ Firebase initialized");
} catch (error) {
  console.error("❌ Firebase error:", error);
}
  /* --------------------------------
     CONFIG & STATE
  --------------------------------- */
  const teams = ["[A]", "[B]", "[C]", "[D]", "[E]", "[F]"];
  const pointValues = [10, 20, 30];
  let scores = Array(teams.length).fill(0);
  
  /* --------------------------------
     DOM REFERENCES
  --------------------------------- */
  const scoreboard = document.getElementById("scoreboard");
  const dingSoundPlus  = document.getElementById("ding-plus");
  const dingSoundMinus = document.getElementById("ding-minus");
  
  // Add background logo
  const backgroundLogo = document.createElement("img");
  backgroundLogo.src = "nsd-logo.png";
  backgroundLogo.alt = "Center Logo";
  backgroundLogo.className = "center-background-logo floating";
  scoreboard.appendChild(backgroundLogo);
  
  /* --------------------------------
     BUILD TEAM ROWS
  --------------------------------- */
  teams.forEach((name, idx) => {
    const card = document.createElement("div");
    card.className = "team";
    card.dataset.index = idx;
  
    card.innerHTML = `
      <img src="photos/team${idx}.png" alt="${name}" class="team-photo">
      <h2>${name}</h2>
      <div class="score" id="score-${idx}">0</div>
      <div class="buttons"></div>
    `;
    scoreboard.appendChild(card);
  
    const btnWrap = card.querySelector(".buttons");
  
    pointValues.forEach(p => {
      const b = document.createElement("button");
      b.textContent = `+${p}`;
      b.onclick = () => changeScore(idx, p);
      btnWrap.appendChild(b);
    });
  
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "R";
    resetBtn.onclick = () => setScore(idx, 0);
    btnWrap.appendChild(resetBtn);
  
    const minusValues = [-5, -10, -15];
    minusValues.forEach(m => {
      const minusBtn = document.createElement("button");
      minusBtn.textContent = `${m}`;
      minusBtn.onclick = () => changeScore(idx, m);
      btnWrap.appendChild(minusBtn);
    });
  
    // Custom input and button
    const customInput = document.createElement("input");
    customInput.type = "number";
    customInput.placeholder = "Bonus";
    customInput.className = "custom-score-input";
  
    const customAddBtn = document.createElement("button");
    customAddBtn.textContent = "Add";
    customAddBtn.onclick = () => {
      const value = parseInt(customInput.value);
      if (!isNaN(value)) {
        changeScore(idx, value);
        customInput.value = "";
      }
    };
  
    btnWrap.appendChild(customInput);
    btnWrap.appendChild(customAddBtn);
  });
  
  /* --------------------------------
     SCORE HANDLERS
  --------------------------------- */
  function changeScore(teamIdx, delta) {
    scores[teamIdx] = Math.max(0, scores[teamIdx] + delta);
    renderScore(teamIdx, delta);
  
    const sfx = delta >= 0 ? dingSoundPlus : dingSoundMinus;
    sfx.currentTime = 0;
    sfx.play();
  
    if (delta === 10 || delta === 20 || delta === 30) {
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.8 } });
    }
  
    updateScoresInFirebase();
    sortAndAnimate();
  }
  
  function setScore(teamIdx, value) {
    scores[teamIdx] = Math.max(0, value);
    renderScore(teamIdx);
    updateScoresInFirebase();
    sortAndAnimate();
  }
  
  function renderScore(teamIdx, delta = 0) {
    const el = document.getElementById(`score-${teamIdx}`);
    el.textContent = scores[teamIdx];
  
    el.classList.remove("plus", "minus", "animate");
  
    if (delta > 0) el.classList.add("plus");
    if (delta < 0) el.classList.add("minus");
  
    void el.offsetWidth;
    el.classList.add("animate");
  
    el.addEventListener(
      "animationend",
      () => el.classList.remove("plus", "minus", "animate"),
      { once: true }
    );
  }
  
  /* --------------------------------
     FIREBASE SYNC
  --------------------------------- */
  function updateScoresInFirebase() {
    db.ref("scores").set(scores);
  }
  
  // Sync on load
  db.ref("scores").on("value", (snapshot) => {
    const data = snapshot.val();
    if (Array.isArray(data)) {
      scores = data;
      scores.forEach((score, idx) => renderScore(idx));
      sortAndAnimate();
    }
  });
  
  /* --------------------------------
     LEADERBOARD SORT + FLIP ANIMATION
  --------------------------------- */
  function sortAndAnimate() {
    const cards = Array.from(scoreboard.querySelectorAll(".team"));
    const first = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
  
    cards
      .sort((a, b) => scores[+b.dataset.index] - scores[+a.dataset.index])
      .forEach(c => scoreboard.appendChild(c));
  
    const last = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
  
    cards.forEach(card => {
      const f = first.get(card);
      const l = last.get(card);
      const dx = f.left - l.left;
      const dy = f.top - l.top;
      if (dx || dy) {
        card.style.transition = "none";
        card.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          card.style.transition = "transform 0.45s cubic-bezier(.25,.8,.25,1)";
          card.style.transform = "";
        });
        card.addEventListener("transitionend", () => {
          card.style.transition = "";
        }, { once: true });
      }
    });
  }
  