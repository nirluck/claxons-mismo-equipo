/* =========================================================================
   Mismo Equipo · Los Claxons × Viva Aerobús
   Maqueta de referencia. No hay envío real: el formulario valida en el
   navegador y termina en la pantalla de confirmación.
   ========================================================================= */

(function () {
  "use strict";

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- toast -- */

  const toast = $("#toast");
  let toastTimer;
  function avisar(texto) {
    if (!toast) return;
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  /* ---------------------------------------------------------- cabecera -- */

  const cabecera = $("#cabecera");
  const hero = $(".hero");

  function actualizaCabecera() {
    if (!cabecera) return;
    var ocultar =
      hero &&
      hero.offsetParent !== null &&
      window.scrollY < hero.offsetTop + hero.offsetHeight - 100;
    cabecera.classList.toggle("oculta", !!ocultar);
  }

  actualizaCabecera();
  window.addEventListener("scroll", actualizaCabecera, { passive: true });
  window.addEventListener("resize", actualizaCabecera, { passive: true });
  window.addEventListener("hashchange", actualizaCabecera);

  /* ------------------------------------------- pase de abordar: inclina -- */

  const lienzo = $("#paseLienzo");
  const pase = $("#pase");

  if (lienzo && pase && !menosMovimiento && window.matchMedia("(hover: hover)").matches) {
    let cuadro = null;

    lienzo.addEventListener("pointermove", (e) => {
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        const caja = lienzo.getBoundingClientRect();
        const x = (e.clientX - caja.left) / caja.width - 0.5;
        const y = (e.clientY - caja.top) / caja.height - 0.5;
        pase.style.transform =
          `rotateY(${x * 9}deg) rotateX(${-y * 7}deg) translateZ(14px)`;
        cuadro = null;
      });
    });

    lienzo.addEventListener("pointerleave", () => {
      pase.style.transform = "";
    });
  }

  /* --------------------------------- el nombre se escribe en el pase --- */

  const campoNombre = $("#nombre");
  const paseNombre = $("#paseNombre");

  if (campoNombre && paseNombre) {
    campoNombre.addEventListener("input", () => {
      const v = campoNombre.value.trim();
      paseNombre.textContent = v || "Tu nombre";
      paseNombre.classList.toggle("tenue", !v);
      paseNombre.classList.toggle("escrito", v.length > 2);
    });
  }

  /* ------------------------------------------------ aparición de pasos -- */

  const pasos = $$(".paso");
  if (pasos.length) {
    if (menosMovimiento || !("IntersectionObserver" in window)) {
      pasos.forEach((p) => p.classList.add("visible"));
    } else {
      const obs = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((en) => {
            if (!en.isIntersecting) return;
            const i = pasos.indexOf(en.target);
            en.target.style.transitionDelay = (i % 3) * 70 + "ms";
            en.target.classList.add("visible");
            obs.unobserve(en.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
      );
      pasos.forEach((p) => obs.observe(p));
    }
  }

  /* --------------------------------------------------- copiar hashtags -- */

  $$("[data-copiar]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const texto = btn.dataset.copiar;
      try {
        await navigator.clipboard.writeText(texto);
      } catch (e) {
        const tmp = document.createElement("textarea");
        tmp.value = texto;
        tmp.setAttribute("readonly", "");
        tmp.style.position = "fixed";
        tmp.style.opacity = "0";
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand("copy"); } catch (e2) { /* sin portapapeles */ }
        document.body.removeChild(tmp);
      }
      btn.classList.add("copiada");
      avisar("Copiado. Pégalo en tu publicación.");
      setTimeout(() => btn.classList.remove("copiada"), 1800);
    });
  });

  /* --------------------------------------------------------- pre-save -- */

  const presave = $("[data-presave]");
  if (presave) {
    presave.addEventListener("click", (e) => {
      e.preventDefault();
      avisar("Aquí va el smart link del pre-save.");
    });
  }

  /* -------------------------------------------------------- formulario -- */

  const form = $("#formulario");
  if (!form) return;

  const fieldsets = $$(".paso-form", form);
  const nodos = $$("#riel .nodo");
  const tramos = $$("#riel .tramo");
  const listo = $("#listo");
  let actual = 1;

  const reglas = {
    nombre: (v) => v.trim().split(/\s+/).filter(Boolean).length >= 2 && v.trim().length >= 5,
    nacimiento: (v) => {
      if (!v) return false;
      const n = new Date(v);
      if (Number.isNaN(n.getTime())) return false;
      const hoy = new Date();
      let edad = hoy.getFullYear() - n.getFullYear();
      const m = hoy.getMonth() - n.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--;
      return edad >= 18 && edad < 110;
    },
    correo: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()),
    celular: (v) => v.replace(/\D/g, "").length === 10,
    video: (v) => plataformaDe(v) !== null
  };

  /* La promocion vive solo en TikTok: cualquier otro dominio se rechaza. */
  function plataformaDe(url) {
    const v = url.trim().toLowerCase();
    if (!/^https?:\/\//.test(v)) return null;
    return /^https?:\/\/([a-z0-9-]+\.)*tiktok\.com\//.test(v) ? "TikTok" : null;
  }

  function contenedor(campo) {
    return campo.closest(".campo");
  }

  function revisar(campo, mostrarError) {
    const regla = reglas[campo.name];
    if (!regla) return true;
    const ok = regla(campo.value);
    const caja = contenedor(campo);
    if (!caja) return ok;
    caja.classList.toggle("bien", ok && campo.value.trim() !== "");
    caja.classList.toggle("mal", !ok && (mostrarError || campo.value.trim() !== ""));
    return ok;
  }

  $$("input, select", form).forEach((campo) => {
    if (!reglas[campo.name]) return;
    campo.addEventListener("blur", () => revisar(campo, true));
    campo.addEventListener("input", () => {
      const caja = contenedor(campo);
      if (caja && caja.classList.contains("mal")) revisar(campo, true);
      else revisar(campo, false);
    });
  });

  /* plataforma detectada en vivo */
  const campoVideo = $("#video");
  const chip = $("#plataforma");
  const chipNombre = $("#plataformaNombre");

  if (campoVideo && chip) {
    campoVideo.addEventListener("input", () => {
      const p = plataformaDe(campoVideo.value);
      if (p) {
        chipNombre.textContent = p + " detectado";
        chip.classList.add("visible");
      } else {
        chip.classList.remove("visible");
      }
    });
  }

  /* navegación entre pasos */

  function pintarRiel() {
    nodos.forEach((n, i) => {
      const num = i + 1;
      n.classList.toggle("activo", num === actual);
      n.classList.toggle("hecho", num < actual);
    });
    tramos.forEach((t, i) => t.classList.toggle("hecho", i + 1 < actual));
  }

  function irA(n) {
    actual = n;
    fieldsets.forEach((fs) => fs.classList.toggle("activo", Number(fs.dataset.paso) === n));
    pintarRiel();
    if (n === 3) llenarResumen();
    const caja = form.closest(".formulario");
    if (caja) {
      const y = caja.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: menosMovimiento ? "auto" : "smooth" });
    }
    const primero = $(".paso-form.activo input, .paso-form.activo select", form);
    if (primero && n > 1) setTimeout(() => primero.focus({ preventScroll: true }), 380);
  }

  function validarPaso(n) {
    const fs = fieldsets.find((f) => Number(f.dataset.paso) === n);
    const campos = $$("input, select", fs).filter((c) => reglas[c.name]);
    let ok = true;
    let primerMal = null;
    campos.forEach((c) => {
      if (!revisar(c, true)) {
        ok = false;
        if (!primerMal) primerMal = c;
      }
    });
    if (primerMal) {
      primerMal.focus({ preventScroll: true });
      avisar("Revisa el campo marcado en rojo.");
    }
    return ok;
  }

  function llenarResumen() {
    const mapa = {
      nombre: $("#nombre").value.trim(),
      correo: $("#correo").value.trim(),
      video: $("#video").value.trim()
    };
    $$("[data-resumen]").forEach((el) => {
      const clave = el.dataset.resumen;
      let v = mapa[clave] || "—";
      if (clave === "video" && v.length > 46) v = v.slice(0, 44) + "…";
      el.textContent = v;
    });
  }

  $$("[data-avanzar]", form).forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validarPaso(actual)) irA(Math.min(actual + 1, 3));
    });
  });

  $$("[data-volver]", form).forEach((btn) => {
    btn.addEventListener("click", () => irA(Math.max(actual - 1, 1)));
  });

  /* envío */

  function recogerDatos() {
    const v = (sel) => { const c = $(sel); return c ? c.value.trim() : ""; };
    const casilla = (nombre) => {
      const c = $('input[name="' + nombre + '"]', form);
      return !!(c && c.checked);
    };
    return {
      nombre: v("#nombre"),
      correo: v("#correo"),
      celular: v("#celular").replace(/\D/g, ""),
      nacimiento: v("#nacimiento"),
      genero: v("#genero"),
      video: v("#video"),
      novedades: casilla("novedades")
    };
  }

  function mostrarListo(folio) {
    form.style.display = "none";
    const riel = $("#riel");
    if (riel) riel.style.display = "none";
    /* el talon deja de ser la lista de revision y pasa a ser el destino */
    const antes = $("#revisaAntes");
    const despues = $("#revisaDespues");
    if (antes) antes.hidden = true;
    if (despues) despues.hidden = false;
    /* y la cabecera del formulario cede su lugar al lockup */
    const cabezaForm = $("#cabezaForm");
    const cabezaGracias = $("#cabezaGracias");
    if (cabezaForm) cabezaForm.hidden = true;
    if (cabezaGracias) cabezaGracias.hidden = false;
    if (!listo) return;
    const hueco = $("[data-folio]", listo);
    if (hueco && folio) {
      hueco.textContent = folio;
      const linea = hueco.closest(".folio");
      if (linea) linea.hidden = false;
    }
    listo.classList.add("visible");
    const y = listo.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: menosMovimiento ? "auto" : "smooth" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let ok = validarPaso(1) && validarPaso(2);
    const casillas = $$('input[type="checkbox"][required]', form);
    casillas.forEach((c) => {
      const caja = c.closest(".casilla");
      const bien = c.checked;
      if (caja) caja.classList.toggle("mal", !bien);
      if (!bien) ok = false;
    });

    if (!ok) {
      avisar("Faltan datos por confirmar.");
      return;
    }

    /* Sin registro.js configurado la maqueta solo muestra la confirmación. */
    if (typeof window.enviarRegistro !== "function") {
      mostrarListo(null);
      return;
    }

    const boton = $('button[type="submit"]', form);
    const marca = boton ? boton.innerHTML : "";
    if (boton) {
      boton.disabled = true;
      boton.innerHTML = "Enviando…";
    }

    window.enviarRegistro(recogerDatos())
      .then((r) => mostrarListo(r && r.folio))
      .catch((err) => {
        avisar((err && err.message) || "No pudimos guardar tu participación.");
        if (boton) {
          boton.disabled = false;
          boton.innerHTML = marca;
        }
      });
  });

  /* enter avanza en lugar de enviar, salvo en el último paso */
  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || actual === 3) return;
    if (e.target.tagName === "TEXTAREA") return;
    e.preventDefault();
    if (validarPaso(actual)) irA(actual + 1);
  });
})();
