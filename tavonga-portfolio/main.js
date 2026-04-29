const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const THEME_KEY = "tavonga_portfolio_theme";

function setYear() {
  const y = String(new Date().getFullYear());
  const yearEl = $("#year");
  const heroYear = $("#heroYear");
  if (yearEl) yearEl.textContent = y;
  if (heroYear) heroYear.textContent = y;
}

function setHeaderClock() {
  const el = $("#headerClock");
  if (!el) return;

  const tick = () => {
    const now = new Date();
    const opts = { hour: "2-digit", minute: "2-digit", hour12: true };
    try {
      el.textContent = `${now.toLocaleTimeString(undefined, opts)} · CAT`;
    } catch {
      el.textContent = now.toLocaleTimeString();
    }
  };

  tick();
  window.setInterval(tick, 30_000);
}

function applyTheme(mode) {
  const root = document.documentElement;
  const light = mode === "light";
  root.classList.toggle("is-light", light);
  root.style.colorScheme = light ? "light" : "dark";
  const label = light ? "Switch to dark theme" : "Switch to light theme";
  $("#themeToggle")?.setAttribute("aria-label", label);
  $("#themeToggleMobile")?.setAttribute("aria-label", label);
}

function setupThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.classList.contains("is-light") ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  };

  $("#themeToggle")?.addEventListener("click", toggle);
  $("#themeToggleMobile")?.addEventListener("click", toggle);

  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "light" ? "light" : "dark");
}

function setupMobileMenu() {
  const btn = $("#mobileMenuBtn");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("hidden", !open);
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  $$(".hero-mobile-link", menu).forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });
}

function setupRevealOnScroll() {
  const els = $$(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { root: null, threshold: 0.18 }
  );

  els.forEach((el) => io.observe(el));
}

function sectionToNavKey(sectionId) {
  if (sectionId === "home") return "home";
  if (sectionId === "projects") return "blog";
  if (sectionId === "about" || sectionId === "skills" || sectionId === "experience" || sectionId === "interests")
    return "profile";
  return null;
}

function setHeroNavActive(navKey) {
  $$(".hero-nav-link[data-nav]").forEach((a) => {
    const key = a.getAttribute("data-nav");
    a.classList.toggle("is-active", Boolean(navKey) && key === navKey);
  });
}

function setupActiveNav() {
  const links = $$(".hero-nav-link[data-nav]");
  if (!links.length) return;

  const ids = ["home", "about", "skills", "projects", "experience", "interests", "contact"];
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
      const id = visible?.target?.id;
      if (!id) return;
      setHeroNavActive(sectionToNavKey(id));
    },
    { threshold: [0.12, 0.22, 0.32, 0.45], rootMargin: "-14% 0px -58% 0px" }
  );

  sections.forEach((s) => io.observe(s));
}

function setupContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  const errors = (name) => $(`[data-error-for="${name}"]`, form);
  const input = (name) => form.elements.namedItem(name);

  const setError = (name, msg) => {
    const el = errors(name);
    if (el) el.textContent = msg || "";
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = String(input("name")?.value || "").trim();
    const email = String(input("email")?.value || "").trim();
    const subject = String(input("subject")?.value || "").trim();
    const message = String(input("message")?.value || "").trim();

    let ok = true;
    setError("name", "");
    setError("email", "");
    setError("subject", "");
    setError("message", "");

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      ok = false;
    }
    if (!isEmail(email)) {
      setError("email", "Please enter a valid email address.");
      ok = false;
    }
    if (subject.length < 3) {
      setError("subject", "Please add a short subject.");
      ok = false;
    }
    if (message.length < 10) {
      setError("message", "Please write a longer message (10+ characters).");
      ok = false;
    }

    if (!ok) return;

    const to = "tavongasumani@gmail.com";
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
      "",
      "--",
      "Sent from Tavonga Sumani portfolio contact form",
    ].join("\n");

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}

function setupParallaxScroll() {
  const root = document.documentElement;
  const main = $("#main");
  const footer = $("#siteFooter");
  if (!main) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    root.style.setProperty("--header-parallax-y", "0px");
    root.style.setProperty("--hero-parallax-y", "0px");
    root.style.setProperty("--bg-parallax-y", "0px");
    root.style.setProperty("--content-parallax-y", "0px");
    if (footer) footer.classList.add("is-visible");
    return;
  }

  const updateFooterSpacer = () => {
    if (!footer) return;
    const h = footer.getBoundingClientRect().height || 0;
    main.style.paddingBottom = `${Math.max(24, h)}px`;
  };

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight || 1;

    root.style.setProperty("--header-parallax-y", `${Math.round(y * 0.18)}px`);
    root.style.setProperty("--hero-parallax-y", `${Math.round(y * 0.22)}px`);
    root.style.setProperty("--bg-parallax-y", `${Math.round(y * 0.1)}px`);
    root.style.setProperty("--content-parallax-y", `${Math.round(-y * 0.04)}px`);

    if (footer) {
      const showAt = vh * 0.7;
      footer.classList.toggle("is-visible", y > showAt);
    }

    ticking = false;
  };

  const queueUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  };

  updateFooterSpacer();
  queueUpdate();
  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", () => {
    updateFooterSpacer();
    queueUpdate();
  });
}

setYear();
setHeaderClock();
if (window.lucide?.createIcons) window.lucide.createIcons();
setupThemeToggle();
setupMobileMenu();
setupRevealOnScroll();
setupActiveNav();
setupContactForm();
setupParallaxScroll();
