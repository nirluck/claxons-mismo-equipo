/* =========================================================================
   Mismo Equipo · envío del registro a Supabase
   Expone window.enviarRegistro(datos) -> Promise<{folio, creado_en}>.
   app.js la llama al enviar el formulario; si esta hoja no está cargada
   o falta la configuración, la maqueta sigue funcionando sin base.

   Habla con PostgREST a pelo, sin la librería de Supabase: es una sola
   llamada y así el sitio no carga 40 kB de más.
   ========================================================================= */

(function () {
  "use strict";

  var cfg = window.MISMO_EQUIPO || {};
  var URL_BASE = (cfg.supabaseUrl || "").replace(/\/+$/, "");
  /* supabaseKey es el nombre nuevo; supabaseAnonKey sigue valiendo */
  var LLAVE = cfg.supabaseKey || cfg.supabaseAnonKey || "";
  var LISTA = URL_BASE && LLAVE &&
              URL_BASE.indexOf("TU-PROYECTO") === -1 &&
              LLAVE.indexOf("TU_LLAVE") === -1 &&
              LLAVE.indexOf("TU_ANON_KEY") === -1;

  if (!LISTA) {
    console.warn(
      "[Mismo Equipo] Falta configurar js/config.js. " +
      "El formulario valida pero no guarda nada."
    );
    return;
  }

  /* ------------------------------------------------- de dónde llegó ---- */

  function origen() {
    var p = new URLSearchParams(window.location.search);
    var o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .forEach(function (k) {
        var v = p.get(k);
        if (v) o[k] = v.slice(0, 120);
      });
    if (document.referrer) o.referer = document.referrer.slice(0, 300);
    o.pagina = window.location.pathname;
    return o;
  }

  /* ------------------------------------------------------- el envío ---- */

  function enviarRegistro(datos) {
    var cuerpo = {
      datos: {
        nombre: datos.nombre,
        correo: datos.correo,
        celular: datos.celular,
        nacimiento: datos.nacimiento,
        genero: datos.genero || null,
        video: datos.video,
        acepta_terminos: true,
        acepta_privacidad: true,
        quiere_novedades: !!datos.novedades,
        origen: origen(),
        agente: navigator.userAgent
      }
    };

    var corta = new AbortController();
    var reloj = setTimeout(function () { corta.abort(); }, 15000);

    return fetch(URL_BASE + "/rest/v1/rpc/registrar_participacion", {
      method: "POST",
      headers: {
        "apikey": LLAVE,
        "Authorization": "Bearer " + LLAVE,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cuerpo),
      signal: corta.signal
    })
      .then(function (r) {
        clearTimeout(reloj);
        return r.json().catch(function () { return null; }).then(function (json) {
          if (r.ok) return json || {};
          /* Los mensajes que levanta la función vienen en json.message y
             están escritos para leerse tal cual. */
          var msg = json && (json.message || json.error_description || json.error);
          throw new Error(msg || "No pudimos guardar tu participación.");
        });
      })
      .catch(function (err) {
        clearTimeout(reloj);
        if (err && err.name === "AbortError") {
          throw new Error("La conexión tardó demasiado. Inténtalo de nuevo.");
        }
        if (err instanceof TypeError) {
          throw new Error("Revisa tu conexión e inténtalo de nuevo.");
        }
        throw err;
      });
  }

  window.enviarRegistro = enviarRegistro;
})();
