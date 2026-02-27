// Blocking theme init — must be in <head> to prevent FOUC
(function(){
  var t = localStorage.getItem("theme");
  if (t) document.documentElement.setAttribute("data-theme", t);
})();
