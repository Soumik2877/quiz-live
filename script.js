// extra teams  : "Team G", "Team H"
/* --------------------------------
   CONFIG & STATE
--------------------------------- */
const teams = [
    "Team A", "Team B", "Team C", "Team D",
    "Team E", "Team F"
  ];
  const pointValues = [10, 20, 30];
  const scores = Array(teams.length).fill(0);
  
  /* --------------------------------
     DOM REFERENCES
  --------------------------------- */
  const scoreboard = document.getElementById("scoreboard");
  const dingSoundPlus  = document.getElementById("ding-plus");
  const dingSoundMinus  = document.getElementById("ding-minus");
  
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
    card.dataset.index = idx;          // static reference to the score slot
  
    card.innerHTML = `
      <img src="photos/team${idx}.png" alt="${name}" class="team-photo">
      <h2>${name}</h2>
      <div class="score" id="score-${idx}">0</div>
      <div class="buttons"></div>
    `;
    scoreboard.appendChild(card);
  
    /* buttons */
    const btnWrap = card.querySelector(".buttons");
  
    pointValues.forEach(p => {
      const b = document.createElement("button");
      b.textContent = `+${p}`;
      b.onclick = () => changeScore(idx, p);
      btnWrap.appendChild(b);
    });
  
    // const resetBtn = document.createElement("button");
    // resetBtn.textContent = "Reset";
    // resetBtn.onclick = () => setScore(idx, 0);
    // btnWrap.appendChild(resetBtn);
  
    // const minusBtn = document.createElement("button");
    // minusBtn.textContent = "-5";
    // minusBtn.onclick = () => changeScore(idx, -5);
    // btnWrap.appendChild(minusBtn);

    const minusValues = [-5, -10, -15];
    minusValues.forEach(m => {
    const minusBtn = document.createElement("button");
    minusBtn.textContent = `${m}`;
    minusBtn.onclick = () => changeScore(idx, m);
    btnWrap.appendChild(minusBtn); });

    // Input field for custom ADD score
const customInput = document.createElement("input");
customInput.type = "number";
customInput.placeholder = "Bonus";
customInput.className = "custom-score-input";

// Button to add custom score
const customAddBtn = document.createElement("button");
customAddBtn.textContent = "Add";
customAddBtn.onclick = () => {
  const value = parseInt(customInput.value);
  if (!isNaN(value)) {
    changeScore(idx, value);  // ✅ same as +10/+20
    customInput.value = "";   // clear input after adding
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
    renderScore(teamIdx,delta);
  
    // /* sound */
    // dingSound.currentTime = 0;
    // dingSound.play();
    const sfx = delta >= 0 ? dingSoundPlus : dingSoundMinus;
    sfx.currentTime = 0;
    sfx.play();
  
    /* confetti on +20 */
    if (delta === 30 || delta === 20 || delta === 10) {
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.8 } });
    }
  
    sortAndAnimate();
  }
  
  function setScore(teamIdx, value) {
    scores[teamIdx] = Math.max(0, value);
    renderScore(teamIdx);
    sortAndAnimate();
  }
  //version1
//   function renderScore(teamIdx) {
//     const el = document.getElementById(`score-${teamIdx}`);
//     el.textContent = scores[teamIdx];
//     el.classList.remove("animate");
//     void el.offsetWidth;      // restart bounce
//     el.classList.add("animate");
//   }

//version2
// function renderScore(teamIdx) {
//     const el = document.getElementById(`score-${teamIdx}`);
//     el.textContent = scores[teamIdx];
  
//     /* restart bounce for THIS score */
//     el.classList.remove("animate");
//     void el.offsetWidth;          // force reflow
//     el.classList.add("animate");
  
//     /* 🔑 remove the class as soon as the bounce ends */
//     el.addEventListener(
//       "animationend",
//       () => el.classList.remove("animate"),
//       { once: true }
//     );
//   }
  
  //version 3
  function renderScore(teamIdx, delta = 0) {
    const el = document.getElementById(`score-${teamIdx}`);
    el.textContent = scores[teamIdx];
  
    /* strip any previous colour */
    el.classList.remove("plus", "minus", "animate");
  
    /* choose colour based on sign of delta */
    if (delta > 0)   el.classList.add("plus");
    if (delta < 0)   el.classList.add("minus");
  
    /* restart the bounce */
    void el.offsetWidth;          // force reflow
    el.classList.add("animate");
  
    /* after the bounce, remove colour + animate classes */
    el.addEventListener(
      "animationend",
      () => el.classList.remove("plus", "minus", "animate"),
      { once: true }
    );
  }

  /* --------------------------------
     LEADERBOARD SORT + FLIP ANIMATION
  --------------------------------- */
  function sortAndAnimate() {
    /* FIRST --------------- record starting rects */
    const cards   = Array.from(scoreboard.children);
    const first   = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
  
    /* SORT ----------------- put cards in new score order */
    cards
      .sort((a, b) => scores[+b.dataset.index] - scores[+a.dataset.index])
      .forEach(c => scoreboard.appendChild(c));
  
    /* LAST ----------------- record new rects */
    const last = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
  
    /* INVERT + PLAY -------- animate only the cards that moved */
    cards.forEach(card => {
      const f = first.get(card);
      const l = last.get(card);
      const dx = f.left - l.left;
      const dy = f.top  - l.top;
      if (dx || dy) {
        card.style.transition = "none";
        card.style.transform  = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          card.style.transition = "transform 0.45s cubic-bezier(.25,.8,.25,1)";
          card.style.transform  = "";
        });
        card.addEventListener(
          "transitionend",
          () => (card.style.transition = ""),
          { once: true }
        );
      }
    });
  }
  