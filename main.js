// Homepage interactions loaded with defer to keep initial render fast.
(function(){
  "use strict";

  var avatar = document.getElementById("avatar");
  var toastEl = document.getElementById("toast");
  if (!avatar || !toastEl) return;

  var clicks = 0;
  var toastTimer;
  var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  var seqIndex = 0;
  var touches = [];

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 3000);
  }

  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    var container = document.createElement("div");
    container.className = "confetti";
    var colors = ["#3fb950", "#58a6ff", "#d29922", "#f85149", "#bc8cff", "#ff7b72"];

    for (var i = 0; i < 40; i++) {
      var piece = document.createElement("i");
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * 2 + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(function(){ container.remove(); }, 5000);
  }

  avatar.addEventListener("click", function(){
    clicks++;
    avatar.classList.remove("spin");
    void avatar.offsetWidth;
    avatar.classList.add("spin");
    if (clicks === 7) {
      toast("Achievement Unlocked: Curious Clicker!");
      clicks = 0;
    } else if (clicks === 3) {
      toast("Keep clicking...");
    }
  });

  document.addEventListener("keydown", function(event){
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    seqIndex = key === seq[seqIndex] ? seqIndex + 1 : key === seq[0] ? 1 : 0;
    if (seqIndex !== seq.length) return;

    seqIndex = 0;
    confetti();
    toast("Konami Code Activated!");
  });

  document.addEventListener("touchstart", function(event){
    if (event.touches.length !== 1) return;
    touches.push({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      t: Date.now()
    });
    if (touches.length > 20) touches.shift();
  }, { passive: true });

  document.addEventListener("touchend", function(){
    if (touches.length < 10) return;
    var recent = touches.slice(-10);
    var elapsed = recent[9].t - recent[0].t;
    if (elapsed < 3000) {
      confetti();
      toast("Tap frenzy!");
    }
  }, { passive: true });
})();
