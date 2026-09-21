/* Páginas legales: la cabecera se esconde al bajar y vuelve al subir.
   Mismo gesto que la landing, sin nada más: estos documentos son para
   leerse, no para animarse. */
(function () {
  "use strict";

  var cabecera = document.getElementById("cabecera");
  if (!cabecera) return;

  var anterior = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    cabecera.classList.toggle("oculta", y > anterior && y > 220);
    anterior = y;
  }, { passive: true });
})();
