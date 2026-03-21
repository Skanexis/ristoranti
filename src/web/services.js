const PUBLIC_DATA_ENDPOINT = "/api/public-data";

const DEFAULT_SERVICES_PAGE = (() => {
  const fromStore = window.RIDataStore?.getDefaultData?.()?.servicesPage;
  if (fromStore && typeof fromStore === "object") {
    return fromStore;
  }

  return {
    hero: {
      badge: "YOSUPPORT Digital Studio",
      title: "I nostri servizi",
      subtitle: "Soluzioni complete tra bot Telegram, web platform e servizi digitali operativi.",
      highlight: "Prezzi e blocchi servizi sono gestibili dall'admin center.",
      primaryCtaLabel: "Richiedi preventivo",
      primaryCtaUrl: "https://t.me/SHLC26",
      secondaryCtaLabel: "Contatta supporto",
      secondaryCtaUrl: "https://t.me/SHLC26",
    },
    socialProof: {
      title: "Social network europei piu richiesti",
      subtitle: "Strategie growth su piattaforme ad alta trazione.",
    },
    socialPlatforms: [
      { id: "instagram", name: "Instagram", focus: "Reels, Stories e ADV" },
      { id: "tiktok", name: "TikTok", focus: "Video strategy e community" },
      { id: "facebook", name: "Facebook", focus: "Campagne local e lead" },
      { id: "youtube", name: "YouTube", focus: "Long form + Shorts" },
      { id: "telegram", name: "Telegram", focus: "Community private" },
    ],
    serviceBlocks: [],
    closing: {
      title: "Operativita completa",
      description: "Dalla strategia al deploy: ogni progetto e seguito end-to-end.",
    },
  };
})();

const DEFAULT_ACCENT = "amber";
const SUPPORTED_ACCENTS = ["amber", "cyan", "emerald", "rose"];
const catalogState = {
  category: "all",
  topOnly: false,
  detailsOpen: false,
  focusMode: false,
};

let servicesPageData = normalizeServicesPage(DEFAULT_SERVICES_PAGE);
let revealObserver = null;
let sectionObserver = null;
let serviceCardObserver = null;

const els = {
  heroSection: document.getElementById("heroSection"),
  heroBadge: document.getElementById("heroBadge"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  heroHighlight: document.getElementById("heroHighlight"),
  heroPrimaryCta: document.getElementById("heroPrimaryCta"),
  heroSecondaryCta: document.getElementById("heroSecondaryCta"),
  heroMetrics: document.getElementById("heroMetrics"),
  servicesSummaryRow: document.getElementById("servicesSummaryRow"),
  servicesToolbar: document.getElementById("servicesToolbar"),
  serviceCategoryFilters: document.getElementById("serviceCategoryFilters"),
  serviceTopOnly: document.getElementById("serviceTopOnly"),
  serviceFocusMode: document.getElementById("serviceFocusMode"),
  serviceDetailsToggle: document.getElementById("serviceDetailsToggle"),
  serviceCountLabel: document.getElementById("serviceCountLabel"),
  serviceBlocksGrid: document.getElementById("serviceBlocksGrid"),
  socialHeading: document.getElementById("socialHeading"),
  socialSubtitle: document.getElementById("socialSubtitle"),
  socialMarqueeTrack: document.getElementById("socialMarqueeTrack"),
  closingTitle: document.getElementById("closingTitle"),
  closingDescription: document.getElementById("closingDescription"),
  sectionRail: document.getElementById("sectionRail"),
  scrollProgressBar: document.getElementById("scrollProgressBar"),
};

void initializePage();

async function initializePage() {
  bindCatalogEvents();
  bindGlobalInteractions();
  renderPage(servicesPageData);
  setupRevealObserver();
  setupSectionObserver();
  setupServiceCardObserver();
  setupHeroParallax();
  updateScrollProgress();

  await loadServicesFromServer();
  renderPage(servicesPageData);
  observeRevealNodes();
  observeSections();
  observeServiceCards();
  updateScrollProgress();
}

function bindGlobalInteractions() {
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  if (els.sectionRail) {
    els.sectionRail.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-rail-target]");
      if (!link) return;

      const targetId = String(link.dataset.railTarget || "").trim();
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (els.serviceBlocksGrid) {
    els.serviceBlocksGrid.addEventListener("pointerover", (event) => {
      const card = event.target.closest(".service-card");
      if (!card) return;
      setActiveServiceCard(card);
    });
  }
}

async function loadServicesFromServer() {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), 3200) : 0;

  try {
    const response = await fetch(PUBLIC_DATA_ENDPOINT, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      signal: controller?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    servicesPageData = normalizeServicesPage(payload?.data?.servicesPage);
  } catch {
    servicesPageData = normalizeServicesPage(DEFAULT_SERVICES_PAGE);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function renderPage(pageData) {
  if (!pageData) return;

  renderHero(pageData);
  renderServiceCatalog(pageData.serviceBlocks);
  renderSocialSection(pageData.socialProof, pageData.socialPlatforms);
  renderClosing(pageData.closing);
}

function renderHero(pageData) {
  const hero = pageData.hero || {};

  if (els.heroBadge) els.heroBadge.textContent = hero.badge;
  if (els.heroTitle) els.heroTitle.textContent = hero.title;
  if (els.heroSubtitle) els.heroSubtitle.textContent = hero.subtitle;
  if (els.heroHighlight) els.heroHighlight.textContent = hero.highlight;

  applyCtaLink(els.heroPrimaryCta, hero.primaryCtaLabel, hero.primaryCtaUrl);
  applyCtaLink(els.heroSecondaryCta, hero.secondaryCtaLabel, hero.secondaryCtaUrl);

  renderHeroMetrics(pageData);
}

function renderHeroMetrics(pageData) {
  if (!els.heroMetrics) return;

  const blocks = Array.isArray(pageData?.serviceBlocks) ? pageData.serviceBlocks : [];
  const platforms = Array.isArray(pageData?.socialPlatforms) ? pageData.socialPlatforms : [];
  const categories = new Set(blocks.map((block) => sanitizeText(block?.category)).filter(Boolean));
  const featuredCount = blocks.filter((block) => Boolean(block?.featured)).length;
  const fintechCount = blocks.filter((block) => isFintechServiceBlock(block)).length;

  const metrics = [
    { label: "Servizi", value: blocks.length },
    { label: "Categorie", value: categories.size },
    { label: "Top service", value: featuredCount },
    { label: "Canali social", value: platforms.length },
    { label: "Fintech", value: fintechCount },
  ];

  els.heroMetrics.innerHTML = metrics
    .map(
      (metric) => `
        <article class="hero-metric">
          <strong data-count-target="${Number(metric.value) || 0}">0</strong>
          <span>${escapeHtml(metric.label)}</span>
        </article>
      `
    )
    .join("");

  animateMetricCounters(els.heroMetrics.querySelectorAll("[data-count-target]"));
}

function animateMetricCounters(nodes) {
  const targets = Array.from(nodes || []);
  if (targets.length === 0) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  targets.forEach((node) => {
    const targetValue = Number(node.dataset.countTarget || "0");
    if (!Number.isFinite(targetValue) || targetValue < 0) {
      node.textContent = "0";
      return;
    }

    if (reducedMotion || targetValue <= 1) {
      node.textContent = String(targetValue);
      return;
    }

    const startedAt = performance.now();
    const duration = 820;

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetValue * eased);
      node.textContent = String(current);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  });
}

function applyCtaLink(element, label, url) {
  if (!element) return;

  if (!label || !url) {
    element.hidden = true;
    element.removeAttribute("href");
    element.textContent = "";
    return;
  }

  element.hidden = false;
  element.textContent = label;
  element.href = url;
}

function bindCatalogEvents() {
  if (els.serviceTopOnly) {
    els.serviceTopOnly.addEventListener("change", () => {
      catalogState.topOnly = Boolean(els.serviceTopOnly.checked);
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
      observeServiceCards();
    });
  }

  if (els.serviceCategoryFilters) {
    els.serviceCategoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category-filter]");
      if (!button) return;

      const nextCategory = String(button.dataset.categoryFilter || "all").trim();
      catalogState.category = nextCategory || "all";
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
      observeServiceCards();
    });
  }

  if (els.serviceDetailsToggle) {
    els.serviceDetailsToggle.addEventListener("click", () => {
      catalogState.detailsOpen = !catalogState.detailsOpen;
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
      observeServiceCards();
    });
  }

  if (els.serviceFocusMode) {
    els.serviceFocusMode.addEventListener("click", () => {
      catalogState.focusMode = !catalogState.focusMode;
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
      observeServiceCards();
    });
  }
}

function renderServiceCatalog(blocks) {
  const normalizedBlocks = Array.isArray(blocks) ? blocks : [];
  renderCategoryFilters(normalizedBlocks);
  renderServiceSummary(normalizedBlocks);
  updateDetailsToggleUi();
  updateFocusToggleUi();
  renderServiceBlocks(getFilteredServiceBlocks(normalizedBlocks), normalizedBlocks.length);
}

function renderServiceSummary(blocks) {
  if (!els.servicesSummaryRow) return;

  const allBlocks = Array.isArray(blocks) ? blocks : [];
  const categories = new Set(allBlocks.map((block) => sanitizeText(block?.category)).filter(Boolean));
  const topCount = allBlocks.filter((block) => Boolean(block?.featured)).length;
  const fintechCount = allBlocks.filter((block) => isFintechServiceBlock(block)).length;
  const percentSignals = allBlocks.reduce((acc, block) => {
    const kpis = Array.isArray(block?.kpis) ? block.kpis : [];
    const metrics = Array.isArray(block?.fintechMetrics)
      ? block.fintechMetrics.map((item) => item?.value)
      : [];
    const merged = [...kpis, ...metrics].map((item) => sanitizeText(item)).filter(Boolean);
    return acc + merged.filter((item) => item.includes("%")).length;
  }, 0);

  const pills = [
    { label: "Blocchi", value: allBlocks.length },
    { label: "Categorie", value: categories.size },
    { label: "Top", value: topCount },
    { label: "Fintech", value: fintechCount },
    { label: "Segnali %", value: percentSignals },
  ];

  els.servicesSummaryRow.innerHTML = pills
    .map(
      (pill) => `
        <span class="services-summary-pill">
          ${escapeHtml(pill.label)} <strong>${escapeHtml(String(pill.value))}</strong>
        </span>
      `
    )
    .join("");
}

function renderCategoryFilters(allBlocks) {
  if (!els.serviceCategoryFilters) return;

  const categories = Array.from(
    new Set(
      (Array.isArray(allBlocks) ? allBlocks : [])
        .map((block) => sanitizeText(block?.category))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

  const available = ["all", ...categories];
  if (!available.includes(catalogState.category)) {
    catalogState.category = "all";
  }

  els.serviceCategoryFilters.innerHTML = available
    .map((category) => {
      const isAll = category === "all";
      const label = isAll ? "Tutti" : category;
      const isActive = catalogState.category === category;
      return `
        <button
          type="button"
          class="service-filter-btn ${isActive ? "is-active" : ""}"
          data-category-filter="${escapeHtmlAttr(category)}"
          aria-pressed="${isActive ? "true" : "false"}"
        >
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");

  if (els.serviceTopOnly) {
    els.serviceTopOnly.checked = catalogState.topOnly;
  }
}

function getFilteredServiceBlocks(allBlocks) {
  const byCategory =
    catalogState.category === "all"
      ? allBlocks
      : allBlocks.filter((block) => sanitizeText(block?.category) === catalogState.category);

  if (!catalogState.topOnly) {
    return byCategory;
  }

  return byCategory.filter((block) => Boolean(block?.featured));
}

function updateDetailsToggleUi() {
  if (!els.serviceDetailsToggle) return;
  const open = Boolean(catalogState.detailsOpen);
  els.serviceDetailsToggle.textContent = open ? "Chiudi dettagli" : "Apri dettagli";
  els.serviceDetailsToggle.setAttribute("aria-pressed", open ? "true" : "false");
}

function updateFocusToggleUi() {
  if (!els.serviceFocusMode) return;
  const focusMode = Boolean(catalogState.focusMode);
  els.serviceFocusMode.textContent = focusMode ? "Modalita griglia" : "Modalita focus";
  els.serviceFocusMode.setAttribute("aria-pressed", focusMode ? "true" : "false");
}

function renderServiceBlocks(blocks, totalCount = blocks.length) {
  if (!els.serviceBlocksGrid) return;

  const normalizedBlocks = Array.isArray(blocks) ? blocks : [];

  if (els.serviceCountLabel) {
    const visible = Number(normalizedBlocks.length) || 0;
    const total = Number(totalCount) || 0;
    els.serviceCountLabel.textContent =
      visible === total ? `${total} servizi disponibili` : `${visible} di ${total} servizi visualizzati`;
  }

  els.serviceBlocksGrid.classList.toggle("is-focus-mode", Boolean(catalogState.focusMode));

  if (normalizedBlocks.length === 0) {
    els.serviceBlocksGrid.innerHTML = `
      <article class="service-card" data-accent="${DEFAULT_ACCENT}">
        <p class="service-description">Nessun servizio corrisponde ai filtri selezionati.</p>
      </article>
    `;
    return;
  }

  els.serviceBlocksGrid.innerHTML = normalizedBlocks
    .map((block, index) => {
      const fintechMode = isFintechServiceBlock(block);
      const fintechMetrics = fintechMode ? getFintechMetrics(block) : [];

      const featuresHtml = block.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");

      const kpisHtml = fintechMode
        ? ""
        : (block.kpis || [])
            .map((kpi) => {
              const percentClass = /%/.test(kpi) ? "is-percent" : "";
              return `<span class="service-kpi-chip ${percentClass}">${escapeHtml(kpi)}</span>`;
            })
            .join("");

      const fintechMetricsHtml = fintechMetrics
        .map(
          (metric) => `
            <div class="service-fintech-cell">
              <span class="service-fintech-label">${escapeHtml(metric.label)}</span>
              <strong class="service-fintech-value ${/%/.test(metric.value) ? "is-percent" : ""}">${escapeHtml(metric.value)}</strong>
            </div>
          `
        )
        .join("");

      return `
        <article
          class="service-card ${block.featured ? "is-featured" : ""} ${fintechMode ? "is-fintech" : ""}"
          data-accent="${escapeHtmlAttr(block.accent)}"
          style="--card-index:${index};"
        >
          <div class="service-head">
            <div class="service-chip-row">
              <p class="service-category">${escapeHtml(block.category)}</p>
              ${block.featured ? `<p class="service-featured">Top service</p>` : ""}
            </div>
            <h3 class="service-title">${escapeHtml(block.title)}</h3>
            <p class="service-description">${escapeHtml(block.description)}</p>
          </div>

          <div class="service-price-wrap">
            <p class="service-price">${escapeHtml(block.price)}</p>
            ${block.priceNote ? `<p class="service-price-note">${escapeHtml(block.priceNote)}</p>` : ""}
          </div>

          ${fintechMetricsHtml ? `<div class="service-fintech-row">${fintechMetricsHtml}</div>` : ""}
          ${kpisHtml ? `<div class="service-kpi-row">${kpisHtml}</div>` : ""}

          ${
            featuresHtml
              ? `<details class="service-details" ${catalogState.detailsOpen ? "open" : ""}><summary>Dettagli inclusi</summary><ul class="service-features">${featuresHtml}</ul></details>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  const firstCard = els.serviceBlocksGrid.querySelector(".service-card");
  if (firstCard) {
    setActiveServiceCard(firstCard);
  }
}

function isFintechServiceBlock(block) {
  const category = sanitizeText(block?.category).toLowerCase();
  const id = sanitizeText(block?.id).toLowerCase();
  const hasFintechMetrics = Array.isArray(block?.fintechMetrics) && block.fintechMetrics.length > 0;
  if (hasFintechMetrics) return true;

  return category.includes("fintech") || id.includes("exchange") || id.includes("wallet") || id.includes("bank");
}

function getFintechMetrics(block) {
  const rawMetrics = Array.isArray(block?.fintechMetrics) ? block.fintechMetrics : [];
  const normalized = rawMetrics
    .map((metric) => ({
      label: sanitizeText(metric?.label),
      value: sanitizeText(metric?.value),
    }))
    .filter((metric) => metric.label && metric.value)
    .slice(0, 4);

  if (normalized.length > 0) {
    return normalized;
  }

  return inferFintechMetricsFromKpis(Array.isArray(block?.kpis) ? block.kpis : []);
}

function inferFintechMetricsFromKpis(kpis) {
  const knownLabels = [
    { probe: "fee service", label: "Fee service" },
    { probe: "fee", label: "Fee" },
    { probe: "spread", label: "Spread" },
    { probe: "settlement", label: "Settlement" },
    { probe: "sla", label: "SLA" },
    { probe: "cold storage", label: "Cold storage" },
    { probe: "audit accessi", label: "Audit accessi" },
  ];

  return kpis
    .map((entry, index) => {
      const text = sanitizeText(entry);
      if (!text) return null;

      if (text.includes("|")) {
        const [labelPart, ...valueParts] = text.split("|");
        const label = sanitizeText(labelPart);
        const value = sanitizeText(valueParts.join("|"));
        if (label && value) {
          return { label, value };
        }
      }

      if (text.includes(":")) {
        const [labelPart, ...valueParts] = text.split(":");
        const label = sanitizeText(labelPart);
        const value = sanitizeText(valueParts.join(":"));
        if (label && value) {
          return { label, value };
        }
      }

      const lower = text.toLowerCase();
      const match = knownLabels.find((candidate) => lower.startsWith(candidate.probe));
      if (match) {
        const stripped = text.slice(match.probe.length).replace(/^[-:\s]+/, "").trim();
        return {
          label: match.label,
          value: stripped || text,
        };
      }

      return {
        label: `Metrica ${index + 1}`,
        value: text,
      };
    })
    .filter(Boolean)
    .slice(0, 4);
}

function renderSocialSection(socialProof, platforms) {
  if (els.socialHeading) {
    els.socialHeading.textContent = socialProof.title;
  }
  if (els.socialSubtitle) {
    els.socialSubtitle.textContent = socialProof.subtitle;
  }

  if (!els.socialMarqueeTrack) return;

  if (!Array.isArray(platforms) || platforms.length === 0) {
    els.socialMarqueeTrack.innerHTML = `
      <article class="social-chip">
        <p class="social-chip-title">Nessuna piattaforma configurata</p>
        <p class="social-chip-copy">Inserisci i canali social dal pannello admin.</p>
      </article>
    `;
    return;
  }

  els.socialMarqueeTrack.innerHTML = platforms
    .map(
      (platform, index) => `
        <article class="social-chip" data-platform-id="${escapeHtmlAttr(platform.id)}" style="--social-index:${index};">
          <p class="social-chip-title">${escapeHtml(platform.name)}</p>
          ${platform.focus ? `<p class="social-chip-copy">${escapeHtml(platform.focus)}</p>` : ""}
        </article>
      `
    )
    .join("");
}

function renderClosing(closing) {
  if (els.closingTitle) {
    els.closingTitle.textContent = closing.title;
  }
  if (els.closingDescription) {
    els.closingDescription.textContent = closing.description;
  }
}

function setupRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal-item").forEach((node) => node.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver?.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.14,
    }
  );

  observeRevealNodes();
}

function observeRevealNodes() {
  if (!revealObserver) return;
  document.querySelectorAll(".reveal-item").forEach((node) => revealObserver.observe(node));
}

function setupSectionObserver() {
  if (!("IntersectionObserver" in window)) return;

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const activeId = visible.target.id;
      updateRailActiveState(activeId);
    },
    {
      rootMargin: "-20% 0px -40% 0px",
      threshold: [0.2, 0.4, 0.6],
    }
  );

  observeSections();
}

function observeSections() {
  if (!sectionObserver) return;
  document.querySelectorAll("[data-section]").forEach((node) => sectionObserver.observe(node));
}

function updateRailActiveState(activeSectionId) {
  if (!els.sectionRail) return;
  const links = Array.from(els.sectionRail.querySelectorAll("a[data-rail-target]"));
  links.forEach((link) => {
    const isActive = link.dataset.railTarget === activeSectionId;
    link.classList.toggle("is-active", isActive);
  });
}

function setupServiceCardObserver() {
  if (!("IntersectionObserver" in window)) return;

  serviceCardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.dataset.ratio = String(entry.intersectionRatio || 0);
      });

      const cards = Array.from(document.querySelectorAll(".service-card"));
      if (cards.length === 0) return;

      const candidate = cards
        .map((card) => ({ card, ratio: Number(card.dataset.ratio || "0") }))
        .sort((a, b) => b.ratio - a.ratio)[0];

      if (candidate && candidate.ratio >= 0.45) {
        setActiveServiceCard(candidate.card);
      }
    },
    {
      rootMargin: "-20% 0px -25% 0px",
      threshold: [0.2, 0.45, 0.7],
    }
  );
}

function observeServiceCards() {
  if (!serviceCardObserver) return;
  serviceCardObserver.disconnect();
  document.querySelectorAll(".service-card").forEach((card) => serviceCardObserver.observe(card));
}

function setActiveServiceCard(activeCard) {
  const cards = Array.from(document.querySelectorAll(".service-card"));
  cards.forEach((card) => {
    card.classList.toggle("is-active", card === activeCard);
  });
}

function setupHeroParallax() {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reducedMotion || !els.heroSection) return;

  const metricsCard = els.heroSection.querySelector(".hero-metrics-card");
  if (!metricsCard) return;

  els.heroSection.addEventListener("pointermove", (event) => {
    const rect = els.heroSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const shiftX = (x - 0.5) * 8;
    const shiftY = (y - 0.5) * 8;
    metricsCard.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
  });

  els.heroSection.addEventListener("pointerleave", () => {
    metricsCard.style.transform = "translate(0px, 0px)";
  });
}

function updateScrollProgress() {
  if (!els.scrollProgressBar) return;

  const root = document.documentElement;
  const scrollTop = root.scrollTop || document.body.scrollTop;
  const maxScroll = Math.max(1, root.scrollHeight - root.clientHeight);
  const percent = Math.max(0, Math.min(100, (scrollTop / maxScroll) * 100));

  els.scrollProgressBar.style.width = `${percent.toFixed(2)}%`;
}

function normalizeServicesPage(input) {
  const page = input && typeof input === "object" ? input : {};
  const defaults = DEFAULT_SERVICES_PAGE;
  const heroRaw = page.hero && typeof page.hero === "object" ? page.hero : {};
  const socialProofRaw = page.socialProof && typeof page.socialProof === "object" ? page.socialProof : {};
  const closingRaw = page.closing && typeof page.closing === "object" ? page.closing : {};

  const hero = {
    badge: sanitizeText(heroRaw.badge) || sanitizeText(defaults.hero?.badge) || "YOSUPPORT",
    title: sanitizeText(heroRaw.title) || sanitizeText(defaults.hero?.title) || "I nostri servizi",
    subtitle: sanitizeText(heroRaw.subtitle) || sanitizeText(defaults.hero?.subtitle) || "",
    highlight: sanitizeText(heroRaw.highlight) || sanitizeText(defaults.hero?.highlight) || "",
    primaryCtaLabel:
      sanitizeText(heroRaw.primaryCtaLabel) || sanitizeText(defaults.hero?.primaryCtaLabel) || "Contattaci",
    primaryCtaUrl: normalizeAbsoluteUrl(heroRaw.primaryCtaUrl, defaults.hero?.primaryCtaUrl),
    secondaryCtaLabel:
      sanitizeText(heroRaw.secondaryCtaLabel) || sanitizeText(defaults.hero?.secondaryCtaLabel) || "",
    secondaryCtaUrl: normalizeAbsoluteUrl(heroRaw.secondaryCtaUrl, defaults.hero?.secondaryCtaUrl),
  };

  const socialProof = {
    title: sanitizeText(socialProofRaw.title) || sanitizeText(defaults.socialProof?.title) || "Social networks",
    subtitle: sanitizeText(socialProofRaw.subtitle) || sanitizeText(defaults.socialProof?.subtitle) || "",
  };

  const socialPlatformsInput = Array.isArray(page.socialPlatforms) ? page.socialPlatforms : defaults.socialPlatforms || [];
  const seenPlatformIds = new Set();
  const socialPlatforms = socialPlatformsInput
    .map((platform, index) => {
      const name = sanitizeText(platform?.name);
      if (!name) return null;

      const baseId = slugify(platform?.id || name || `platform-${index + 1}`) || `platform-${index + 1}`;
      let id = baseId;
      if (seenPlatformIds.has(id)) {
        id = `${baseId}-${index + 1}`;
      }
      seenPlatformIds.add(id);

      return {
        id,
        name,
        focus: sanitizeText(platform?.focus),
      };
    })
    .filter(Boolean);

  const blockInput = Array.isArray(page.serviceBlocks) ? page.serviceBlocks : defaults.serviceBlocks || [];
  const seenBlockIds = new Set();
  const serviceBlocks = blockInput
    .map((block, index) => {
      const title = sanitizeText(block?.title);
      if (!title) return null;

      const baseId = slugify(block?.id || title || `service-${index + 1}`) || `service-${index + 1}`;
      let id = baseId;
      if (seenBlockIds.has(id)) {
        id = `${baseId}-${index + 1}`;
      }
      seenBlockIds.add(id);

      const features = Array.isArray(block?.features)
        ? block.features.map((entry) => sanitizeText(entry)).filter(Boolean).slice(0, 8)
        : [];
      const kpis = Array.isArray(block?.kpis)
        ? block.kpis.map((entry) => sanitizeText(entry)).filter(Boolean).slice(0, 4)
        : [];
      const fintechMetrics = Array.isArray(block?.fintechMetrics)
        ? block.fintechMetrics
            .map((metric) => ({
              label: sanitizeText(metric?.label),
              value: sanitizeText(metric?.value),
            }))
            .filter((metric) => metric.label && metric.value)
            .slice(0, 4)
        : [];

      return {
        id,
        category: sanitizeText(block?.category) || "Servizi",
        title,
        description: sanitizeText(block?.description),
        price: sanitizeText(block?.price) || "da EUR 0",
        priceNote: sanitizeText(block?.priceNote),
        kpis,
        fintechMetrics,
        accent: normalizeAccent(block?.accent),
        featured: Boolean(block?.featured),
        features,
      };
    })
    .filter(Boolean);

  const closing = {
    title: sanitizeText(closingRaw.title) || sanitizeText(defaults.closing?.title) || "",
    description: sanitizeText(closingRaw.description) || sanitizeText(defaults.closing?.description) || "",
  };

  return {
    hero,
    socialProof,
    socialPlatforms,
    serviceBlocks,
    closing,
  };
}

function normalizeAccent(value) {
  const candidate = sanitizeText(value).toLowerCase();
  if (SUPPORTED_ACCENTS.includes(candidate)) {
    return candidate;
  }
  return DEFAULT_ACCENT;
}

function normalizeAbsoluteUrl(value, fallback) {
  const candidate = sanitizeText(value);
  if (!candidate) {
    return sanitizeText(fallback);
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Ignore invalid url.
  }

  return sanitizeText(fallback);
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value) {
  return sanitizeText(String(value || ""))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}
