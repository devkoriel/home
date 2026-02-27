// Shared status bar clock — include at end of <body>
(function(){
  "use strict";
  var cl = document.getElementById("clock");
  if (!cl) return;
  function tick() {
    cl.textContent = new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "Asia/Seoul" });
  }
  tick();
  setInterval(tick, 1000);
})();
