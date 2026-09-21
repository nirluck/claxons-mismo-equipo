/* =========================================================================
   Mismo Equipo · interacciones
   Microinteracciones propias de esta versión. La lógica del formulario y
   del encabezado vive en app.js, que se carga antes.
   ========================================================================= */

(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


  /* ------------------------- el encabezado entra pronto, al 3% del scroll */

  const cabecera = document.getElementById("cabecera");
  if (cabecera) {
    const revisar = () => {
      const alcance = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const umbral = Math.max(alcance * 0.03, 40);
      cabecera.classList.toggle("oculta", window.scrollY < umbral);
    };
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    window.addEventListener("resize", revisar, { passive: true });
  }

  /* --------------------------------- selects: color de marcador de texto */

  $$("select").forEach((sel) => {
    const marcar = () => sel.classList.toggle("vacio", sel.value === "");
    marcar();
    sel.addEventListener("change", marcar);
  });

  /* ------------------------------------- parallax suave del fondo del hero */

  const heroFoto = $(".d-hero-foto");
  const hero = $(".d-hero");

  if (heroFoto && hero && !quieto) {
    let pendiente = false;
    const mover = () => {
      pendiente = false;
      const alto = hero.offsetHeight || 1;
      const avance = Math.min(Math.max(window.scrollY / alto, 0), 1);
      /* se mueve el encuadre, no la caja: asi el reposo es el del Figma
         y nunca se descubre un borde */
      heroFoto.style.objectPosition = "62% " + (50 + avance * 6).toFixed(2) + "%";
    };
    mover();
    window.addEventListener("scroll", () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(mover);
    }, { passive: true });
  }

  /* --------------------------------------- inclinación de los boletos */

  if (conMouse && !quieto) {
    $$(".d-boleto-caja").forEach((caja) => {
      const boleto = $(".d-boleto", caja);
      if (!boleto) return;
      const base = caja.classList.contains("uno") ? -10 : 10;
      let cuadro = null;

      caja.addEventListener("pointermove", (e) => {
        if (cuadro) return;
        cuadro = requestAnimationFrame(() => {
          const r = caja.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          boleto.style.transform =
            "rotate(0deg) translateY(-14px) scale(1.03)" +
            " rotateY(" + (x * 12).toFixed(2) + "deg)" +
            " rotateX(" + (-y * 10).toFixed(2) + "deg)";
          cuadro = null;
        });
      });

      caja.addEventListener("pointerleave", () => {
        boleto.style.transform = "rotate(" + base + "deg)";
      });
    });
  }

  /* ------------------- el paso resaltado sigue al scroll y al puntero */
  /* Dos fuentes para el mismo resalte. Manda el puntero mientras esta
     encima; si no, manda el scroll, que es lo unico que hay en tactil.
     Se resuelve con IntersectionObserver y no con un listener de scroll:
     el navegador calcula los cruces por su cuenta, sin correr codigo en
     cada cuadro ni forzar relayouts. */

  const pasos = $$(".paso");
  if (pasos.length) {
    let porScroll = null;   /* el que cruza la franja central */
    let porPuntero = null;  /* el que tiene el raton encima */

    const pintar = () => {
      const elegido = porPuntero || porScroll;
      pasos.forEach((p) => p.classList.toggle("activo", p === elegido));
    };

    if ("IntersectionObserver" in window) {
      /* franja de 30% de alto a media pantalla: un paso se enciende al
         entrar en ella y se apaga al salir */
      const enFranja = new Set();
      const vigia = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) enFranja.add(e.target);
          else enFranja.delete(e.target);
        });
        /* las dos columnas van escalonadas, asi que varias pueden cruzar a la
           vez: gana la que tenga el centro mas cerca del centro de pantalla.
           Medir aqui es barato, el observador dispara en los cruces y no en
           cada cuadro. */
        const medio = window.innerHeight / 2;
        let mejor = null, cerca = Infinity;
        enFranja.forEach((p) => {
          const r = p.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - medio);
          if (d < cerca) { cerca = d; mejor = p; }
        });
        porScroll = mejor;
        pintar();
      }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
      pasos.forEach((p) => vigia.observe(p));
    }

    if (conMouse) {
      pasos.forEach((p) => {
        p.addEventListener("pointerenter", () => { porPuntero = p; pintar(); });
      });
      const zona = $(".d-pasos-cuerpo");
      if (zona) {
        /* al salir del bloque el mando vuelve al scroll */
        zona.addEventListener("pointerleave", () => { porPuntero = null; pintar(); });
      }
    }
  }

  /* ------------------------------- aparición de boletos y bloque de bases */

  /* los boletos quedan fuera: asoman ya desde el hero, asi que no pueden
     nacer invisibles esperando a que el scroll los alcance */
  const aparecen = $$(".d-dato, .d-revisa, .d-tarjeta");
  if (aparecen.length) {
    if (quieto || !("IntersectionObserver" in window)) {
      aparecen.forEach((e) => e.classList.add("a-la-vista"));
    } else {
      aparecen.forEach((e) => e.classList.add("por-aparecer"));
      const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          const i = aparecen.indexOf(en.target);
          en.target.style.transitionDelay = (i % 3) * 80 + "ms";
          en.target.classList.add("a-la-vista");
          obs.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
      aparecen.forEach((e) => obs.observe(e));
    }
  }
})();
