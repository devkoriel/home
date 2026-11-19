// Liquid Glass sheen: a soft highlight on the window that follows the pointer.
(function(){
  "use strict";

  var win = document.querySelector(".terminal");
  if (!win) return;
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;

  var frame = 0;
  var pointerX = 0;
  var pointerY = 0;

  win.addEventListener("pointerenter", function(){ win.classList.add("lit"); });
  win.addEventListener("pointerleave", function(){ win.classList.remove("lit"); });
  win.addEventListener("pointermove", function(event){
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(function(){
      frame = 0;
      var box = win.getBoundingClientRect();
      win.style.setProperty("--mx", (pointerX - box.left) + "px");
      win.style.setProperty("--my", (pointerY - box.top) + "px");
    });
  });
})();
