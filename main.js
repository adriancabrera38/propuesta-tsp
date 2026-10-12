/* TSP Transportes · propuesta Plan Esencial. IIFE, sin dependencias. */
(function () {
  "use strict";
  var WA = "34698540914";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  function safe(fn, n) { try { fn(); } catch (e) { if (window.console) console.warn("[tsp] " + n, e); } }

  /* El camión: rueda siempre, avanza al hacer scroll y la carretera se mueve */
  function initTruck() {
    var truck = $("[data-truck]"), road = $("[data-road]"), wheels = $$("[data-wheel]");
    if (!truck) return;
    var last = performance.now(), dist = 0, sy = scrollY, speed = 0;
    function frame(now) {
      var dt = Math.min(64, now - last); last = now;
      var dy = scrollY - sy; sy = scrollY;
      speed += ((0.06 + Math.abs(dy) * 0.02) - speed) * 0.1;      // siempre en marcha; acelera con el scroll
      dist += speed * dt;
      var hero = $(".hero"), p = hero ? clamp(scrollY / hero.offsetHeight, 0, 1) : 0;
      var bob = Math.sin(now / 140) * 1.6;
      truck.style.transform = "translate3d(" + (p * 60) + "vw," + bob + "px,0)";
      if (road) road.style.transform = "translate3d(" + (-(dist % 92)) + "px,0,0)";
      wheels.forEach(function (w) { w.style.transform = "rotate(" + (dist * 2) + "deg)"; });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initNav() {
    var nav = $("[data-nav]");
    function on() { nav.classList.toggle("is-scrolled", scrollY > 10); }
    addEventListener("scroll", on, { passive: true }); on();
  }

  /* Pasos: la línea naranja se rellena al bajar */
  function initSteps() {
    var ol = $("[data-steps]"); if (!ol) return;
    var items = $$("li", ol);
    function on() {
      var r = ol.getBoundingClientRect(), mid = innerHeight * 0.62;
      var p = clamp((mid - r.top) / r.height, 0, 1);
      ol.style.setProperty("--fill", (p * 100) + "%");
      items.forEach(function (li) { var lr = li.getBoundingClientRect(); li.classList.toggle("on", lr.top + 24 < mid); });
    }
    addEventListener("scroll", on, { passive: true }); on();
  }

  /* Presupuesto: monta el mensaje y abre WhatsApp */
  function initQuote() {
    var f = $("[data-quote]"); if (!f) return;
    var size = $("[data-size]", f);
    function sync() {
      var t = f.querySelector('input[name="tipo"]:checked').value;
      size.hidden = /Porte|oficina/i.test(t);
    }
    f.addEventListener("change", sync); sync();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (n) { var el = f.elements[n]; return el && el.value ? el.value.trim() : ""; };
      var tipo = f.querySelector('input[name="tipo"]:checked').value;
      var tam = !size.hidden ? (f.querySelector('input[name="tam"]:checked') || {}).value : "";
      var extras = $$(".extras input:checked", f).map(function (c) { return c.value; });
      var fecha = v("fecha") ? new Date(v("fecha") + "T12:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";
      var L = ["Hola, quiero pedir un presupuesto:", "", "• Servicio: " + tipo + (tam ? " (" + tam + ")" : "")];
      if (v("desde") || v("hasta")) L.push("• Trayecto: " + (v("desde") || "—") + " → " + (v("hasta") || "—"));
      if (fecha) L.push("• Fecha aproximada: " + fecha);
      if (extras.length) L.push("• Extras: " + extras.join(", "));
      if (v("nombre")) L.push("", "Soy " + v("nombre") + ".");
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(L.join("\n")), "_blank", "noopener");
    });
  }

  function initMap() {
    var m = $(".map"); if (!m) return;
    if (!("IntersectionObserver" in window)) { m.classList.add("in"); return; }
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { m.classList.add("in"); io.disconnect(); } }, { threshold: 0.05 });
    io.observe(m); setTimeout(function () { m.classList.add("in"); }, 6000);
  }

  function initReveal() {
    var els = $$(".sec-head, .svc, .como-copy, .como-img, .op-head, .op, .zonas-grid > div, .map, .pres-copy, .quote, .faq-grid > div");
    els.forEach(function (el) { el.classList.add("rv"); });
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.08 + "s"; io.observe(el); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add("in"); }); }, 6000);
  }

  function boot() {
    safe(initTruck, "truck"); safe(initNav, "nav"); safe(initSteps, "steps");
    safe(initQuote, "quote"); safe(initMap, "map"); safe(initReveal, "reveal");
    window.__TSP_OK = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
