// SOLID Collective — main.js
// Alle interacties en scroll-verhalen. Elke module draait alleen als zijn HTML op de pagina staat.
//  1. Setup            6. Tekst-reveals        11. Aanbod (horizontaal)
//  2. Pagina-transitie 7. Thema-morph          12. Marquee
//  3. Preloader        8. Hero (home)          13. Magnetische knoppen
//  4. Header & menu    9. Manifest             14. Kalender-filter & tellers
//                    10. Pijlers              15. Footer

(function () {
  "use strict";

  /* 1. Setup ============================================================= */

  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // Zonder GSAP of bij reduced motion: statische versie, secties houden hun eigen kleur
  if (!hasGsap || reduced) {
    root.classList.remove("js", "is-loading", "is-arriving");
    $$(".pillars__text").forEach((el) => { el.style.position = "relative"; el.style.marginTop = "32px"; });
    store.set("solid-visited", "1");
    initMenu();
    initFilters();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1 });

  const intro = gsap.timeline({ paused: true }); // hero-intro na preloader / transitie

  /* 2. Pagina-transitie ================================================= */

  const pt = $(".page-transition");
  const ptTitle = $(".page-transition__title");

  function isInternal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
  }

  function leave(href, title) {
    store.set("solid-transition", title || "");
    if (window.lenis) window.lenis.stop();
    ptTitle.textContent = title || "";
    const letters = SplitText.create(ptTitle, { type: "chars" });
    let gone = false;
    const go = () => { if (!gone) { gone = true; window.location.href = href; } };
    setTimeout(go, 1200); // vangnet als animaties stilstaan (bv. tabblad op de achtergrond)
    gsap.timeline({ onComplete: go })
      .set(pt, { pointerEvents: "auto" })
      .fromTo(pt, { yPercent: 101 }, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
      .from(letters.chars, { yPercent: 110, duration: 0.6, stagger: 0.025, ease: "expo.out" }, "-=0.3");
  }

  function arrive() {
    const title = store.get("solid-transition");
    store.del("solid-transition");
    ptTitle.textContent = title || "";
    return gsap.timeline()
      .to(pt, { yPercent: -101, duration: 0.9, ease: "expo.inOut", delay: 0.1 })
      .set(pt, { yPercent: 101, pointerEvents: "none" })
      .add(() => root.classList.remove("is-arriving"));
  }

  if (pt && !reduced) {
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a");
      if (!isInternal(a)) return;
      e.preventDefault();
      const title = a.dataset.title || (a.textContent || "").trim().split("\n")[0];
      leave(a.href, title);
    });
    // Terug-knop (bfcache): bevroren pins en doek zijn onbetrouwbaar, dus vers laden
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) window.location.reload();
    });
  }

  /* 3. Preloader ======================================================== */

  function runPreloader() {
    const pre = $(".preloader");
    return new Promise((resolve) => {
      if (!pre || !root.classList.contains("is-loading")) return resolve();
      const letters = $$(".preloader__word span", pre);
      const dot = $(".preloader__dot", pre);
      const count = $(".preloader__count", pre);
      const fill = $(".preloader__fill", pre);
      const counter = { v: 0 };

      gsap.timeline({
        onComplete: () => {
          root.classList.remove("is-loading");
          store.set("solid-visited", "1");
          if (window.lenis) window.lenis.start();
          resolve();
        },
      })
        .from(letters, { yPercent: 105, duration: 0.9, stagger: 0.06, ease: "expo.out" })
        .to(counter, { v: 100, duration: 1.3, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
        .from(dot, { y: "-120vh", rotate: -90, duration: 0.8, ease: "bounce.out" }, 0.55)
        .to(letters, { yPercent: -105, duration: 0.6, stagger: 0.04, ease: "expo.in" }, 1.45)
        .to(fill, { scale: 1, borderRadius: 0, duration: 0.7, ease: "expo.inOut" }, 1.75)
        .set(dot, { opacity: 0 }, 1.75)
        .to(pre, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 2.35)
        .add(() => intro.play(), 2.55);
    });
  }

  /* 4. Header & menu ==================================================== */

  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    let last = 0;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle("is-scrolled", y > 40);
        if (!body.classList.contains("menu-open")) header.classList.toggle("is-hidden", y > last && y > 240);
        last = y;
      },
    });
  }

  function initMenu() {
    const btn = $(".menu-btn");
    const menu = $("#menu");
    if (!btn || !menu) return;
    const items = $$(".menu__link", menu);
    const foot = $(".menu__foot", menu);
    let open = false;
    let tl;

    function set(state) {
      open = state;
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector(".menu-btn__text").textContent = open ? "Sluit" : "Menu";
      body.classList.toggle("menu-open", open);
      if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
      if (!hasGsap || reduced) {
        menu.style.visibility = open ? "visible" : "hidden";
        menu.style.clipPath = open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)";
      } else {
        if (tl) tl.kill();
        tl = open
          ? gsap.timeline()
              .set(menu, { visibility: "visible" })
              .fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" })
              .from(items, { yPercent: 100, duration: 0.8, stagger: 0.06 }, "-=0.35")
              .from(foot, { opacity: 0, y: 20, duration: 0.6 }, "-=0.6")
          : gsap.timeline()
              .to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: "expo.inOut" })
              .set(menu, { visibility: "hidden" })
              .set(items, { clearProps: "transform" });
      }
      if (open && items[0]) setTimeout(() => items[0].focus({ preventScroll: true }), 60);
    }

    btn.addEventListener("click", () => set(!open));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { set(false); btn.focus(); } });
    // Focus binnen menu houden
    menu.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = [btn, ...$$("a", menu)];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* 6. Tekst-reveals ==================================================== */

  function initReveals() {
    // [data-split="chars|words|lines"] — titels komen letter voor letter uit een masker
    $$("[data-split]").forEach((el) => {
      const type = el.dataset.split || "lines";
      const isHero = el.closest("[data-intro]");
      SplitText.create(el, {
        type: type === "chars" ? "lines,chars" : type === "words" ? "lines,words" : "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          const vars = {
            yPercent: 115,
            rotate: type === "chars" ? 6 : 0,
            duration: type === "lines" ? 1.1 : 1,
            stagger: type === "chars" ? 0.028 : type === "words" ? 0.05 : 0.1,
            ease: "expo.out",
          };
          if (isHero) return intro.from(targets, vars, 0.05);
          return gsap.from(targets, { ...vars, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        },
      });
    });

    // [data-reveal] — rustige fade-up, [data-reveal-stagger] op een ouder voor groepen
    $$("[data-reveal]").forEach((el) => {
      if (el.closest("[data-intro]")) {
        intro.to(el, { opacity: 1, y: 0, duration: 1.1 }, 0.35);
        return;
      }
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: parseFloat(el.dataset.reveal) || 0,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    // Placeholders/beelden zoomen rustig mee
    $$("[data-parallax]").forEach((el) => {
      const inner = el.firstElementChild;
      if (!inner) return;
      gsap.fromTo(inner, { yPercent: -8, scale: 1.18 }, {
        yPercent: 8, scale: 1.04, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Clip-reveal voor media en kaart
    $$("[data-clip]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(12% 12% 12% 12% round 24px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "none",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.6 },
      });
    });
  }

  /* 7. Thema-morph ====================================================== */
  // Secties met data-theme="dark|light|orange" kleuren de hele pagina als ze het midden passeren

  function initThemes() {
    const sections = $$("[data-theme]");
    if (!sections.length) return;
    body.dataset.theme = sections[0].dataset.theme;
    sections.forEach((s) => {
      ScrollTrigger.create({
        trigger: s,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => { if (self.isActive) body.dataset.theme = s.dataset.theme; },
      });
    });
  }

  /* 8. Hero (home): de deuren gaan open ================================= */

  function initHero() {
    const hero = $(".hero");
    if (!hero) return;
    const media = $(".hero__media", hero);
    const [l1, l2, l3] = $$(".hero__line", hero);
    const copy = $(".hero__copy", hero);
    const shade = $(".hero__shade", hero);
    const meta = $(".hero__meta", hero);

    // Moet gelijk zijn aan .hero__media clip-path in style.css
    const clipFor = (mobile) => mobile ? "inset(28% 14% 28% 14% round 14px)" : "inset(24% 31% 24% 31% round 18px)";

    intro.fromTo(media, { clipPath: "inset(50% 50% 50% 50% round 18px)" }, {
      clipPath: clipFor(window.matchMedia("(max-width: 900px)").matches), duration: 1.4, ease: "expo.inOut",
    }, 0);
    intro.from(meta, { opacity: 0, y: 20, duration: 1 }, 0.7);

    // Opnieuw opbouwen als het venster de mobiel/desktop-grens passeert
    gsap.matchMedia().add({ mobile: "(max-width: 900px)", desktop: "(min-width: 901px)" }, (ctx) => {
      const start = clipFor(ctx.conditions.mobile);
      if (intro.progress() === 1) gsap.set(media, { clipPath: start });
      gsap.timeline({
        scrollTrigger: { trigger: hero, start: "top top", end: "+=130%", scrub: 0.8, pin: true, anticipatePin: 1 },
        defaults: { ease: "none" },
      })
        .fromTo(media, { clipPath: start }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, immediateRender: false }, 0)
        .to(l1, { xPercent: -60, opacity: 0, duration: 0.8 }, 0)
        .to(l3, { xPercent: 60, opacity: 0, duration: 0.8 }, 0)
        .to(l2, { scale: 0.55, opacity: 0, duration: 0.7 }, 0.05)
        .to(meta, { opacity: 0, duration: 0.3 }, 0)
        .to(shade, { opacity: 1, duration: 0.5 }, 0.5)
        .fromTo(copy, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.6);
    });
  }

  /* 9. Manifest: woorden lichten op tijdens scrollen ==================== */

  function initManifesto() {
    const text = $(".manifesto__text");
    if (!text) return;
    const split = SplitText.create(text, { type: "words" });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: text, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  /* 10. Pijlers: Connect → Dream → Achieve (gepind) ===================== */

  function initPillars() {
    const el = $(".pillars");
    if (!el) return;
    const words = $(".pillars__words", el);
    const texts = $$(".pillars__text", el);
    const bar = $(".pillars__bar", el);
    const count = $(".pillars__count span", el);
    const steps = texts.length;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: el, start: "top top", end: "+=" + steps * 90 + "%", scrub: 0.6, pin: true, anticipatePin: 1,
        onUpdate: (self) => { count.textContent = String(Math.min(steps, Math.floor(self.progress * steps * 0.999) + 1)).padStart(2, "0"); },
      },
    });
    tl.to(bar, { scaleX: 1, duration: steps }, 0);
    for (let i = 1; i < steps; i++) {
      tl.to(words, { yPercent: (-100 / steps) * i, duration: 0.5, ease: "power3.inOut" }, i - 0.35)
        .to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.25 }, i - 0.35)
        .fromTo(texts[i], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.25 }, i - 0.1);
    }
  }

  /* 11. Aanbod: horizontaal langs de pagina's =========================== */

  function initOffer() {
    const el = $(".offer");
    if (!el) return;
    const track = $(".offer__track", el);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: $(".offer__pin", el), start: "top top", end: () => "+=" + distance(),
          scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
    });
  }

  /* 12. Marquee: reageert op scroll-snelheid ============================ */

  function initMarquee() {
    $$(".marquee").forEach((m) => {
      const track = $(".marquee__track", m);
      const dir = m.dataset.direction === "right" ? 1 : -1;
      let x = 0;
      let boost = 0;
      const width = () => track.firstElementChild.offsetWidth;
      const skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
      if (window.lenis) window.lenis.on("scroll", (l) => { boost = Math.min(Math.abs(l.velocity) * 0.35, 18); skew(gsap.utils.clamp(-8, 8, l.velocity * -0.25)); });
      gsap.ticker.add((_, dt) => {
        x += dir * (0.045 + boost * 0.02) * dt;
        boost *= 0.92;
        const w = width();
        if (x <= -w) x += w;
        if (x > 0) x -= w;
        gsap.set(track, { x });
      });
    });
  }

  /* 13. Magnetische knoppen ============================================= */

  function initMagnetic() {
    if (!finePointer) return;
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* 14. Kalender-filter & tellers ======================================= */

  function initFilters() {
    const bar = $("[data-filters]");
    if (!bar) return;
    const rows = $$("[data-type]");
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      $$("[data-filter]", bar).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const f = btn.dataset.filter;
      const show = rows.filter((r) => f === "alles" || r.dataset.type === f);
      rows.forEach((r) => r.classList.toggle("is-hidden", !show.includes(r)));
      if (hasGsap && !reduced) gsap.fromTo(show, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  function initCounters() {
    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v); },
      });
    });
  }

  /* 15. Footer ========================================================== */

  function initFooter() {
    const footer = $(".footer");
    if (!footer) return;
    const inner = $(".footer__inner", footer);
    gsap.from(inner, {
      yPercent: -18, ease: "none",
      scrollTrigger: { trigger: footer, start: "top bottom", end: "top 25%", scrub: true },
    });
  }

  /* Start =============================================================== */

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    initHeader();
    initMenu();
    initReveals();
    initHero();
    initManifesto();
    initPillars();
    initOffer();
    initMarquee();
    initMagnetic();
    initFilters();
    initCounters();
    initFooter();
    initThemes(); // na de pins, zodat pin-ruimte meetelt
    ScrollTrigger.refresh();

    // Anker in de URL (bv. studio-huren.html#kantoren) pas na de pins opzoeken
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY;
      window.lenis ? window.lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
    } else if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    if (root.classList.contains("is-loading")) {
      runPreloader();
    } else if (root.classList.contains("is-arriving") && pt) {
      arrive();
      intro.delay(0.55).play();
    } else {
      store.set("solid-visited", "1");
      intro.play();
    }
  });

  // Kaart en late afbeeldingen veranderen de hoogte: pins herberekenen
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
