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
    socialPlatforms: [],
    serviceBlocks: [],
    closing: {
      title: "Operativita completa",
      description: "Dalla strategia al deploy: ogni progetto e seguito end-to-end.",
    },
  };
})();

const DEFAULT_ACCENT = "amber";
const SUPPORTED_ACCENTS = ["amber", "cyan", "emerald", "rose"];
const STORY_INTERVAL_MS = 4200;
const SHOWCASE_INTERVAL_MS = 3600;
const ACCENT_RGB_MAP = {
  amber: "207, 138, 31",
  cyan: "27, 127, 147",
  emerald: "55, 123, 86",
  rose: "184, 80, 105",
};
const EXCHANGE_TIER_METRICS = [
  { label: "Fino a EUR 500", value: "12%" },
  { label: "Fino a EUR 1100", value: "10,5%" },
  { label: "Fino a EUR 5000", value: "9%" },
  { label: "Fino a EUR 10000", value: "7,5%" },
  { label: "Oltre EUR 10000", value: "5%" },
];

const catalogState = {
  category: "all",
  topOnly: false,
  viewMode: "deck",
  activeServiceId: "",
};

let servicesPageData = normalizeServicesPage(DEFAULT_SERVICES_PAGE);
let revealObserver = null;
let railObserver = null;
let storyTimer = null;
let showcaseTimer = null;
let tickerItems = [];
let showcaseCards = [];
let showcaseIndex = 0;

const els = {
  heroBadge: document.getElementById("heroBadge"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  heroHighlight: document.getElementById("heroHighlight"),
  heroTicker: document.getElementById("heroTicker"),
  heroStats: document.getElementById("heroStats"),
  heroPrimaryCta: document.getElementById("heroPrimaryCta"),
  heroSecondaryCta: document.getElementById("heroSecondaryCta"),
  heroShowcaseStack: document.getElementById("heroShowcaseStack"),
  heroShowcaseDots: document.getElementById("heroShowcaseDots"),

  serviceCategoryFilters: document.getElementById("serviceCategoryFilters"),
  serviceTopOnly: document.getElementById("serviceTopOnly"),
  modeDeckBtn: document.getElementById("modeDeckBtn"),
  modeStoryBtn: document.getElementById("modeStoryBtn"),
  serviceCountLabel: document.getElementById("serviceCountLabel"),

  spotlightBox: document.getElementById("spotlightBox"),
  spotlightCategory: document.getElementById("spotlightCategory"),
  spotlightFeatured: document.getElementById("spotlightFeatured"),
  spotlightTitle: document.getElementById("spotlightTitle"),
  spotlightDescription: document.getElementById("spotlightDescription"),
  spotlightPrice: document.getElementById("spotlightPrice"),
  spotlightPriceNote: document.getElementById("spotlightPriceNote"),
  spotlightMetrics: document.getElementById("spotlightMetrics"),
  spotlightBankPricePanel: document.getElementById("spotlightBankPricePanel"),
  spotlightBankPriceList: document.getElementById("spotlightBankPriceList"),
  spotlightFeatures: document.getElementById("spotlightFeatures"),

  storyPrevBtn: document.getElementById("storyPrevBtn"),
  storyNextBtn: document.getElementById("storyNextBtn"),
  storyPosition: document.getElementById("storyPosition"),
  storyProgressBar: document.getElementById("storyProgressBar"),

  serviceBlocksGrid: document.getElementById("serviceBlocksGrid"),

  socialHeading: document.getElementById("socialHeading"),
  socialSubtitle: document.getElementById("socialSubtitle"),
  socialGrid: document.getElementById("socialGrid"),

  closingTitle: document.getElementById("closingTitle"),
  closingDescription: document.getElementById("closingDescription"),

  scrollMeterBar: document.getElementById("scrollMeterBar"),
  cursorAura: document.getElementById("cursorAura"),
  experienceRail: document.getElementById("experienceRail"),
};

void initializePage();

async function initializePage() {
  bindEvents();
  setupSceneMotion();
  setupCursorAura();
  setupSpotlightTilt();
  renderPage(servicesPageData);
  setupExperienceRail();
  setupRevealObserver();
  updateScrollMeter();

  await loadServicesFromServer();
  renderPage(servicesPageData);
  setupExperienceRail();
  observeRevealNodes();
}

function bindEvents() {
  if (els.serviceTopOnly) {
    els.serviceTopOnly.addEventListener("change", () => {
      catalogState.topOnly = Boolean(els.serviceTopOnly.checked);
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    });
  }

  if (els.serviceCategoryFilters) {
    els.serviceCategoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category-filter]");
      if (!button) return;

      const nextCategory = sanitizeText(button.dataset.categoryFilter) || "all";
      catalogState.category = nextCategory;
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    });
  }

  if (els.modeDeckBtn) {
    els.modeDeckBtn.addEventListener("click", () => {
      catalogState.viewMode = "deck";
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    });
  }

  if (els.modeStoryBtn) {
    els.modeStoryBtn.addEventListener("click", () => {
      catalogState.viewMode = "story";
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    });
  }

  if (els.storyPrevBtn) {
    els.storyPrevBtn.addEventListener("click", () => {
      moveActiveService(-1);
    });
  }

  if (els.storyNextBtn) {
    els.storyNextBtn.addEventListener("click", () => {
      moveActiveService(1);
    });
  }

  if (els.serviceBlocksGrid) {
    els.serviceBlocksGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-service-select]");
      if (!button) return;

      const id = sanitizeText(button.dataset.serviceSelect);
      if (!id) return;

      catalogState.activeServiceId = id;
      renderActiveServiceViews(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
    });

    els.serviceBlocksGrid.addEventListener("pointerover", (event) => {
      const button = event.target.closest("[data-service-select]");
      if (!button) return;
      if (catalogState.viewMode !== "deck") return;

      const id = sanitizeText(button.dataset.serviceSelect);
      if (!id || id === catalogState.activeServiceId) return;

      catalogState.activeServiceId = id;
      renderActiveServiceViews(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
    });

    els.serviceBlocksGrid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const button = event.target.closest("[data-service-select]");
      if (!button) return;

      const id = sanitizeText(button.dataset.serviceSelect);
      if (!id) return;

      event.preventDefault();
      catalogState.activeServiceId = id;
      renderActiveServiceViews(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
    });
  }

  if (els.spotlightBox) {
    els.spotlightBox.addEventListener("mouseenter", stopStoryAutoplay);
    els.spotlightBox.addEventListener("mouseleave", () => syncStoryAutoplay(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || [])));
  }

  if (els.heroShowcaseStack) {
    els.heroShowcaseStack.addEventListener("mouseenter", stopShowcaseAutoplay);
    els.heroShowcaseStack.addEventListener("mouseleave", syncShowcaseAutoplay);
  }

  if (els.heroShowcaseDots) {
    els.heroShowcaseDots.addEventListener("click", (event) => {
      const button = event.target.closest("[data-showcase-dot]");
      if (!button) return;

      const nextIndex = Number(button.dataset.showcaseDot);
      if (!Number.isInteger(nextIndex)) return;

      setShowcaseActive(nextIndex);
      syncShowcaseAutoplay();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (catalogState.viewMode !== "story") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveActiveService(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveActiveService(-1);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopStoryAutoplay();
      stopShowcaseAutoplay();
      return;
    }

    syncStoryAutoplay(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
    syncShowcaseAutoplay();
  });

  window.addEventListener("scroll", updateScrollMeter, { passive: true });
  window.addEventListener("resize", updateScrollMeter);
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
  renderServiceCatalog(pageData.serviceBlocks || []);
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
  renderHeroStats(pageData);
  renderHeroTicker(pageData);
  renderHeroShowcase(pageData.serviceBlocks || []);
  applyMagneticTargets();
}

function renderHeroStats(pageData) {
  if (!els.heroStats) return;

  const blocks = Array.isArray(pageData?.serviceBlocks) ? pageData.serviceBlocks : [];
  const platforms = Array.isArray(pageData?.socialPlatforms) ? pageData.socialPlatforms : [];
  const categories = new Set(blocks.map((block) => sanitizeText(block?.category)).filter(Boolean));
  const featured = blocks.filter((block) => Boolean(block?.featured)).length;

  const stats = [
    { label: "Servizi", value: blocks.length },
    { label: "Categorie", value: categories.size },
    { label: "Top", value: featured },
    { label: "Social", value: platforms.length },
  ];

  els.heroStats.innerHTML = stats
    .map(
      (item) => `
        <article class="hero-stat">
          <strong>${escapeHtml(String(item.value))}</strong>
          <span>${escapeHtml(item.label)}</span>
        </article>
      `
    )
    .join("");

  animateHeroStatCounters();
}

function animateHeroStatCounters() {
  if (!els.heroStats) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const numbers = Array.from(els.heroStats.querySelectorAll("strong"));
  numbers.forEach((node) => {
    const target = Number(node.textContent || "0");
    if (!Number.isFinite(target) || target <= 1) return;

    const startedAt = performance.now();
    const duration = 640;
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };
    node.textContent = "0";
    window.requestAnimationFrame(tick);
  });
}

function renderHeroTicker(pageData) {
  if (!els.heroTicker) return;

  const blocks = Array.isArray(pageData?.serviceBlocks) ? pageData.serviceBlocks : [];
  const categories = Array.from(new Set(blocks.map((block) => sanitizeText(block?.category)).filter(Boolean)));
  const headlineItems = [
    ...categories.slice(0, 6),
    "Bot Moderazione",
    "Antiscam Community",
    "Telegram Mini App",
    "Web Applications",
    "Social Growth",
    "Crypto Exchange",
  ];

  tickerItems = Array.from(new Set(headlineItems.filter(Boolean)));
  if (tickerItems.length === 0) {
    tickerItems = ["Digital Systems", "Telegram Bots", "Web App", "Fintech Services"];
  }

  const singlePass = tickerItems
    .map((item) => `<span class="hero-ticker-item">${escapeHtml(item)}</span>`)
    .join("");

  els.heroTicker.innerHTML = `${singlePass}${singlePass}`;
}

function renderHeroShowcase(blocks) {
  if (!els.heroShowcaseStack || !els.heroShowcaseDots) return;

  const allBlocks = Array.isArray(blocks) ? blocks : [];
  const featured = allBlocks.filter((block) => block?.featured);
  const ordered = [...featured, ...allBlocks];
  const seen = new Set();
  const showcase = ordered
    .filter((block) => {
      const id = sanitizeText(block?.id);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 5);

  if (showcase.length === 0) {
    stopShowcaseAutoplay();
    showcaseCards = [];
    showcaseIndex = 0;
    els.heroShowcaseStack.innerHTML = `
      <article class="showcase-card is-front">
        <p class="showcase-card-category">Service setup</p>
        <h3 class="showcase-card-title">Nessun servizio configurato</h3>
        <p class="showcase-card-meta">Aggiungi i blocchi dalla sezione admin per attivare la preview interattiva.</p>
      </article>
    `;
    els.heroShowcaseDots.innerHTML = "";
    return;
  }

  els.heroShowcaseStack.innerHTML = showcase
    .map((block, index) => {
      const accent = normalizeAccent(block.accent);
      const accentRgb = ACCENT_RGB_MAP[accent] || ACCENT_RGB_MAP[DEFAULT_ACCENT];
      const meta =
        sanitizeText(block.priceNote) ||
        sanitizeText(block.features?.[0]) ||
        sanitizeText(block.description).slice(0, 90) ||
        "Setup modulare su richiesta";

      return `
        <article class="showcase-card" data-showcase-index="${index}" style="--showcase-accent-rgb:${accentRgb};">
          <div class="showcase-card-head">
            <p class="showcase-card-category">${escapeHtml(block.category)}</p>
            <p class="showcase-card-price">${escapeHtml(block.price)}</p>
          </div>
          <h3 class="showcase-card-title">${escapeHtml(block.title)}</h3>
          <p class="showcase-card-meta">${escapeHtml(meta)}</p>
        </article>
      `;
    })
    .join("");

  els.heroShowcaseDots.innerHTML = showcase
    .map(
      (block, index) => `
        <button
          type="button"
          class="showcase-dot"
          data-showcase-dot="${index}"
          role="tab"
          aria-label="Apri preview ${escapeHtmlAttr(block.title)}"
        ></button>
      `
    )
    .join("");

  showcaseCards = Array.from(els.heroShowcaseStack.querySelectorAll(".showcase-card"));
  showcaseIndex = Math.max(0, Math.min(showcaseIndex, showcaseCards.length - 1));
  setShowcaseActive(showcaseIndex);
  syncShowcaseAutoplay();
}

function setShowcaseActive(nextIndex) {
  if (!Array.isArray(showcaseCards) || showcaseCards.length === 0) return;
  const total = showcaseCards.length;
  const normalized = ((nextIndex % total) + total) % total;
  showcaseIndex = normalized;

  showcaseCards.forEach((card, index) => {
    const deltaForward = (index - normalized + total) % total;
    const deltaBackward = (normalized - index + total) % total;
    const isFront = deltaForward === 0;
    const isNext = !isFront && deltaForward === 1;
    const isBack = !isFront && !isNext && deltaBackward === 1;

    card.classList.toggle("is-front", isFront);
    card.classList.toggle("is-next", isNext);
    card.classList.toggle("is-back", isBack);
    card.classList.toggle("is-hidden", !isFront && !isNext && !isBack);
  });

  if (!els.heroShowcaseDots) return;
  const dots = Array.from(els.heroShowcaseDots.querySelectorAll(".showcase-dot"));
  dots.forEach((dot, index) => {
    const active = index === normalized;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function syncShowcaseAutoplay() {
  stopShowcaseAutoplay();

  if (!Array.isArray(showcaseCards) || showcaseCards.length <= 1) {
    return;
  }

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    return;
  }

  showcaseTimer = window.setInterval(() => {
    setShowcaseActive(showcaseIndex + 1);
  }, SHOWCASE_INTERVAL_MS);
}

function stopShowcaseAutoplay() {
  if (!showcaseTimer) return;
  window.clearInterval(showcaseTimer);
  showcaseTimer = null;
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

function renderServiceCatalog(blocks) {
  const allBlocks = Array.isArray(blocks) ? blocks : [];
  renderCategoryFilters(allBlocks);
  renderViewSwitch();

  const filtered = getFilteredServiceBlocks(allBlocks);
  ensureActiveService(filtered);
  renderServiceCount(filtered.length, allBlocks.length);
  renderActiveServiceViews(filtered);
  syncStoryAutoplay(filtered);
  applyMagneticTargets();
}

function renderCategoryFilters(allBlocks) {
  if (!els.serviceCategoryFilters) return;

  const categories = Array.from(
    new Set(allBlocks.map((block) => sanitizeText(block?.category)).filter(Boolean))
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
          class="filter-btn ${isActive ? "is-active" : ""}"
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

function renderViewSwitch() {
  if (els.modeDeckBtn) {
    const active = catalogState.viewMode === "deck";
    els.modeDeckBtn.classList.toggle("is-active", active);
    els.modeDeckBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  if (els.modeStoryBtn) {
    const active = catalogState.viewMode === "story";
    els.modeStoryBtn.classList.toggle("is-active", active);
    els.modeStoryBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }
}

function renderServiceCount(visible, total) {
  if (!els.serviceCountLabel) return;

  els.serviceCountLabel.textContent =
    visible === total ? `${total} servizi disponibili` : `${visible} di ${total} servizi visualizzati`;
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

function ensureActiveService(filteredBlocks) {
  if (!Array.isArray(filteredBlocks) || filteredBlocks.length === 0) {
    catalogState.activeServiceId = "";
    return;
  }

  const exists = filteredBlocks.some((block) => block.id === catalogState.activeServiceId);
  if (!exists) {
    catalogState.activeServiceId = filteredBlocks[0].id;
  }
}

function getActiveBlock(filteredBlocks) {
  if (!Array.isArray(filteredBlocks) || filteredBlocks.length === 0) return null;
  return filteredBlocks.find((block) => block.id === catalogState.activeServiceId) || filteredBlocks[0];
}

function renderActiveServiceViews(filteredBlocks) {
  const active = getActiveBlock(filteredBlocks);
  renderSpotlight(active, filteredBlocks);
  renderMiniCards(filteredBlocks);
}

function renderSpotlight(activeBlock, filteredBlocks) {
  if (!activeBlock) {
    setSpotlightEmpty();
    return;
  }

  applyAccentTheme(activeBlock.accent);

  if (els.spotlightCategory) {
    els.spotlightCategory.textContent = activeBlock.category;
  }

  if (els.spotlightFeatured) {
    els.spotlightFeatured.hidden = !activeBlock.featured;
  }

  if (els.spotlightTitle) els.spotlightTitle.textContent = activeBlock.title;
  if (els.spotlightDescription) els.spotlightDescription.textContent = activeBlock.description;
  if (els.spotlightPrice) els.spotlightPrice.textContent = activeBlock.price;
  if (els.spotlightPriceNote) {
    els.spotlightPriceNote.textContent = activeBlock.priceNote || "";
    els.spotlightPriceNote.hidden = !activeBlock.priceNote;
  }

  renderSpotlightMetrics(activeBlock);
  renderSpotlightBankPriceList(activeBlock);
  renderSpotlightFeatures(activeBlock);
  renderStoryMeta(activeBlock, filteredBlocks);
}

function setSpotlightEmpty() {
  applyAccentTheme(DEFAULT_ACCENT);
  if (els.spotlightCategory) els.spotlightCategory.textContent = "";
  if (els.spotlightFeatured) els.spotlightFeatured.hidden = true;
  if (els.spotlightTitle) els.spotlightTitle.textContent = "Nessun servizio";
  if (els.spotlightDescription) {
    els.spotlightDescription.textContent = "Nessun blocco disponibile con i filtri selezionati.";
  }
  if (els.spotlightPrice) els.spotlightPrice.textContent = "";
  if (els.spotlightPriceNote) {
    els.spotlightPriceNote.textContent = "";
    els.spotlightPriceNote.hidden = true;
  }
  if (els.spotlightMetrics) {
    els.spotlightMetrics.innerHTML = "";
  }
  if (els.spotlightBankPricePanel) {
    els.spotlightBankPricePanel.hidden = true;
  }
  if (els.spotlightBankPriceList) {
    els.spotlightBankPriceList.innerHTML = "";
  }
  if (els.spotlightFeatures) {
    els.spotlightFeatures.innerHTML = "";
  }
  if (els.storyPosition) {
    els.storyPosition.textContent = "0 / 0";
  }
  if (els.storyProgressBar) {
    els.storyProgressBar.classList.remove("is-autoplay");
    els.storyProgressBar.style.width = "0%";
  }
  if (els.storyPrevBtn) els.storyPrevBtn.disabled = true;
  if (els.storyNextBtn) els.storyNextBtn.disabled = true;
}

function renderSpotlightMetrics(block) {
  if (!els.spotlightMetrics) return;

  const fintechMode = isFintechServiceBlock(block);
  const metrics = fintechMode
    ? getFintechMetrics(block).map((entry) => ({ label: entry.label, value: entry.value }))
    : (block.kpis || []).map((entry, index) => ({ label: `KPI ${index + 1}`, value: entry }));

  if (!Array.isArray(metrics) || metrics.length === 0) {
    els.spotlightMetrics.innerHTML = "";
    return;
  }

  els.spotlightMetrics.innerHTML = metrics
    .map((metric) => {
      const percentClass = metric.value.includes("%") ? "is-percent" : "";
      return `
        <article class="metric-chip ${percentClass}">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
        </article>
      `;
    })
    .join("");
}

function renderSpotlightFeatures(block) {
  if (!els.spotlightFeatures) return;

  const features = Array.isArray(block?.features) ? block.features : [];
  if (features.length === 0) {
    els.spotlightFeatures.innerHTML = "";
    return;
  }

  els.spotlightFeatures.innerHTML = features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
}

function renderSpotlightBankPriceList(block) {
  if (!els.spotlightBankPricePanel || !els.spotlightBankPriceList) return;

  const entries = Array.isArray(block?.bankPriceList)
    ? block.bankPriceList
        .map((entry) => ({
          bank: sanitizeText(entry?.bank || entry?.name),
          price: sanitizeText(entry?.price || entry?.value),
        }))
        .filter((entry) => entry.bank && entry.price)
        .slice(0, 20)
    : [];

  if (entries.length === 0) {
    els.spotlightBankPriceList.innerHTML = "";
    els.spotlightBankPricePanel.hidden = true;
    return;
  }

  els.spotlightBankPriceList.innerHTML = entries
    .map(
      (entry) => `
        <li>
          <span>${escapeHtml(entry.bank)}</span>
          <strong>${escapeHtml(entry.price)}</strong>
        </li>
      `
    )
    .join("");
  els.spotlightBankPricePanel.hidden = false;
}

function renderStoryMeta(activeBlock, filteredBlocks) {
  const blocks = Array.isArray(filteredBlocks) ? filteredBlocks : [];
  const total = blocks.length;
  const index = Math.max(
    0,
    blocks.findIndex((block) => block.id === activeBlock?.id)
  );

  if (els.storyPosition) {
    els.storyPosition.textContent = `${total === 0 ? 0 : index + 1} / ${total}`;
  }

  if (els.storyProgressBar) {
    if (catalogState.viewMode !== "story") {
      const percent = total <= 0 ? 0 : ((index + 1) / total) * 100;
      els.storyProgressBar.classList.remove("is-autoplay");
      els.storyProgressBar.style.width = `${percent.toFixed(2)}%`;
    } else if (!storyTimer) {
      els.storyProgressBar.classList.remove("is-autoplay");
      els.storyProgressBar.style.width = "0%";
    }
  }

  const disableNavigation = total <= 1;
  if (els.storyPrevBtn) els.storyPrevBtn.disabled = disableNavigation;
  if (els.storyNextBtn) els.storyNextBtn.disabled = disableNavigation;
}

function renderMiniCards(filteredBlocks) {
  if (!els.serviceBlocksGrid) return;

  const blocks = Array.isArray(filteredBlocks) ? filteredBlocks : [];

  els.serviceBlocksGrid.classList.toggle("is-deck-mode", catalogState.viewMode === "deck");
  els.serviceBlocksGrid.classList.toggle("is-story-mode", catalogState.viewMode === "story");

  if (blocks.length === 0) {
    els.serviceBlocksGrid.innerHTML = `
      <article class="service-mini-card">
        <p class="service-mini-title">Nessun servizio disponibile</p>
      </article>
    `;
    return;
  }

  els.serviceBlocksGrid.innerHTML = blocks
    .map((block, index) => {
      const activeClass = block.id === catalogState.activeServiceId ? "is-active" : "";
      const miniMetrics = isFintechServiceBlock(block)
        ? getFintechMetrics(block).map((metric) => metric.value).slice(0, 2)
        : (block.kpis || []).slice(0, 2);

      return `
        <article class="service-mini-card ${activeClass}" data-service-select="${escapeHtmlAttr(
          block.id
        )}" tabindex="0" role="button" aria-label="Apri servizio ${escapeHtmlAttr(block.title)}" style="--card-index:${index};">
          <div class="service-mini-top">
            <p class="service-mini-category">${escapeHtml(block.category)}</p>
            ${block.featured ? '<p class="service-mini-featured">Top</p>' : ""}
          </div>
          <h3 class="service-mini-title">${escapeHtml(block.title)}</h3>
          <p class="service-mini-price">${escapeHtml(block.price)}</p>
          <div class="service-mini-kpis">
            ${miniMetrics.map((metric) => `<span class="mini-kpi">${escapeHtml(metric)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function moveActiveService(step) {
  const filtered = getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []);
  if (!Array.isArray(filtered) || filtered.length <= 1) return;

  const currentIndex = filtered.findIndex((block) => block.id === catalogState.activeServiceId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (safeIndex + step + filtered.length) % filtered.length;

  catalogState.activeServiceId = filtered[nextIndex].id;
  renderActiveServiceViews(filtered);

  if (catalogState.viewMode === "story" && storyTimer) {
    restartStoryProgressAnimation();
  }
}

function syncStoryAutoplay(filteredBlocks) {
  stopStoryAutoplay();

  if (catalogState.viewMode !== "story") {
    return;
  }

  const blocks = Array.isArray(filteredBlocks) ? filteredBlocks : [];
  if (blocks.length <= 1) {
    return;
  }

  restartStoryProgressAnimation();

  storyTimer = window.setInterval(() => {
    moveActiveService(1);
  }, STORY_INTERVAL_MS);
}

function stopStoryAutoplay() {
  if (storyTimer) {
    window.clearInterval(storyTimer);
    storyTimer = null;
  }

  if (els.storyProgressBar) {
    els.storyProgressBar.classList.remove("is-autoplay");
  }
}

function restartStoryProgressAnimation() {
  if (!els.storyProgressBar) return;
  const bar = els.storyProgressBar;
  bar.classList.remove("is-autoplay");
  bar.style.animationDuration = `${STORY_INTERVAL_MS}ms`;
  bar.style.width = "0%";
  void bar.offsetWidth;
  bar.classList.add("is-autoplay");
}

function renderSocialSection(socialProof, platforms) {
  if (els.socialHeading) {
    els.socialHeading.textContent = socialProof.title;
  }
  if (els.socialSubtitle) {
    els.socialSubtitle.textContent = socialProof.subtitle;
  }

  if (!els.socialGrid) return;

  if (!Array.isArray(platforms) || platforms.length === 0) {
    els.socialGrid.innerHTML = `
      <article class="social-card">
        <h3>Nessuna piattaforma configurata</h3>
        <p>Aggiorna i social dalla sezione admin.</p>
      </article>
    `;
    return;
  }

  els.socialGrid.innerHTML = platforms
    .map(
      (platform) => `
        <article class="social-card">
          <h3>${escapeHtml(platform.name)}</h3>
          ${platform.focus ? `<p>${escapeHtml(platform.focus)}</p>` : ""}
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

function updateScrollMeter() {
  if (!els.scrollMeterBar) return;

  const root = document.documentElement;
  const scrollTop = root.scrollTop || document.body.scrollTop;
  const maxScroll = Math.max(1, root.scrollHeight - root.clientHeight);
  const percent = (scrollTop / maxScroll) * 100;
  const clamped = Math.max(0, Math.min(100, percent));
  els.scrollMeterBar.style.width = `${clamped.toFixed(2)}%`;
  document.body.style.setProperty("--scroll-progress", (clamped / 100).toFixed(4));
}

function setupSceneMotion() {
  document.body.style.setProperty("--pointer-x", "0");
  document.body.style.setProperty("--pointer-y", "0");

  if (window.matchMedia?.("(pointer: coarse)")?.matches) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  let rafId = 0;
  let nextX = 0;
  let nextY = 0;

  const flush = () => {
    rafId = 0;
    document.body.style.setProperty("--pointer-x", nextX.toFixed(4));
    document.body.style.setProperty("--pointer-y", nextY.toFixed(4));
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      nextX = ((event.clientX / width) * 2 - 1) * 0.75;
      nextY = ((event.clientY / height) * 2 - 1) * 0.75;
      if (!rafId) {
        rafId = window.requestAnimationFrame(flush);
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    nextX = 0;
    nextY = 0;
    if (!rafId) {
      rafId = window.requestAnimationFrame(flush);
    }
  });
}

function setupExperienceRail() {
  if (!els.experienceRail) return;

  const sections = Array.from(document.querySelectorAll("[data-rail-label]"));
  if (sections.length === 0) {
    els.experienceRail.innerHTML = "";
    return;
  }

  const items = sections.map((section, index) => {
    const fallbackId = `services-section-${index + 1}`;
    if (!sanitizeText(section.id)) {
      section.id = fallbackId;
    }
    return {
      id: section.id,
      label: sanitizeText(section.dataset.railLabel) || `Sezione ${index + 1}`,
    };
  });

  els.experienceRail.innerHTML = `
    <p class="rail-title">Flow</p>
    <div class="rail-list">
      ${items
        .map(
          (item) => `
            <button
              type="button"
              class="rail-dot"
              data-rail-target="${escapeHtmlAttr(item.id)}"
              data-rail-label="${escapeHtmlAttr(item.label)}"
              aria-label="Vai a ${escapeHtmlAttr(item.label)}"
            ></button>
          `
        )
        .join("")}
    </div>
  `;

  if (els.experienceRail.dataset.bound !== "1") {
    els.experienceRail.dataset.bound = "1";
    els.experienceRail.addEventListener("click", (event) => {
      const button = event.target.closest("[data-rail-target]");
      if (!button) return;

      const targetId = sanitizeText(button.dataset.railTarget);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth";
      target.scrollIntoView({ behavior, block: "start" });
      setActiveExperienceRail(targetId);
    });
  }

  if (!("IntersectionObserver" in window)) {
    setActiveExperienceRail(items[0]?.id || "");
    applyMagneticTargets();
    return;
  }

  railObserver?.disconnect();
  railObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        setActiveExperienceRail(visible.target.id);
      }
    },
    {
      rootMargin: "-16% 0px -52% 0px",
      threshold: [0.25, 0.5, 0.75],
    }
  );

  sections.forEach((section) => railObserver?.observe(section));
  setActiveExperienceRail(items[0]?.id || "");
  applyMagneticTargets();
}

function setActiveExperienceRail(sectionId) {
  if (!els.experienceRail) return;
  const current = sanitizeText(sectionId);
  if (!current) return;

  Array.from(els.experienceRail.querySelectorAll(".rail-dot")).forEach((dot) => {
    const active = sanitizeText(dot.dataset.railTarget) === current;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
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
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    }
  );

  observeRevealNodes();
}

function observeRevealNodes() {
  if (!revealObserver) return;
  document.querySelectorAll(".reveal-item").forEach((node) => revealObserver.observe(node));
}

function applyAccentTheme(accent) {
  const nextAccent = SUPPORTED_ACCENTS.includes(sanitizeText(accent).toLowerCase())
    ? sanitizeText(accent).toLowerCase()
    : DEFAULT_ACCENT;
  document.body.dataset.accentTheme = nextAccent;
}

function setupCursorAura() {
  if (!els.cursorAura) return;
  if (window.matchMedia?.("(pointer: coarse)")?.matches) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const aura = els.cursorAura;

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = event.clientX;
      const y = event.clientY;
      aura.style.transform = `translate(${(x - 110).toFixed(2)}px, ${(y - 110).toFixed(2)}px)`;
      aura.classList.add("is-active");
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    aura.classList.remove("is-active");
  });
}

function setupSpotlightTilt() {
  if (!els.spotlightBox) return;
  if (window.matchMedia?.("(pointer: coarse)")?.matches) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const box = els.spotlightBox;

  box.addEventListener("pointermove", (event) => {
    const rect = box.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 4.8;
    const rotateX = (0.5 - y) * 4.8;
    box.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    box.classList.add("is-hovered");
  });

  box.addEventListener("pointerleave", () => {
    box.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    box.classList.remove("is-hovered");
  });
}

function applyMagneticTargets() {
  if (window.matchMedia?.("(pointer: coarse)")?.matches) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const targets = Array.from(
    document.querySelectorAll(
      ".hero-btn, .hero-link, .filter-btn, .switch-btn, .story-btn, .showcase-dot, .rail-dot"
    )
  );

  targets.forEach((node) => {
    if (node.dataset.magneticBound === "1") return;
    node.dataset.magneticBound = "1";
    node.classList.add("magnetic-target");

    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);

      const shiftX = Math.max(-8, Math.min(8, offsetX * 0.09));
      const shiftY = Math.max(-8, Math.min(8, offsetY * 0.09));
      node.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "translate(0px, 0px)";
    });
  });
}

function isFintechServiceBlock(block) {
  const category = sanitizeText(block?.category).toLowerCase();
  const id = sanitizeText(block?.id).toLowerCase();
  const hasFintechMetrics = Array.isArray(block?.fintechMetrics) && block.fintechMetrics.length > 0;
  const hasBankPricing = Array.isArray(block?.bankPriceList) && block.bankPriceList.length > 0;
  if (hasFintechMetrics) return true;
  if (hasBankPricing) return true;

  return category.includes("fintech") || id.includes("exchange") || id.includes("wallet") || id.includes("bank");
}

function getFintechMetrics(block) {
  const exchangeService = isExchangeServiceBlock(block);
  const rawMetrics = Array.isArray(block?.fintechMetrics) ? block.fintechMetrics : [];
  const normalized = rawMetrics
    .map((metric) => ({
      label: sanitizeText(metric?.label),
      value: sanitizeText(metric?.value),
    }))
    .filter((metric) => metric.label && metric.value)
    .slice(0, 8);

  if (exchangeService && (normalized.length === 0 || isLegacyExchangeFintechMetrics(normalized))) {
    return EXCHANGE_TIER_METRICS.map((entry) => ({ ...entry }));
  }

  if (normalized.length > 0) {
    return normalized;
  }

  return inferFintechMetricsFromKpis(Array.isArray(block?.kpis) ? block.kpis : []);
}

function isExchangeServiceBlock(block) {
  const id = sanitizeText(block?.id).toLowerCase();
  const category = sanitizeText(block?.category).toLowerCase();
  const title = sanitizeText(block?.title).toLowerCase();
  return id.includes("exchange") || category.includes("exchange") || title.includes("exchange");
}

function isLegacyExchangeFintechMetrics(metrics) {
  const list = Array.isArray(metrics) ? metrics : [];
  if (list.length > 3) return false;

  return list.every((metric) => {
    const label = sanitizeText(metric?.label).toLowerCase();
    return label.startsWith("fee") || label.startsWith("spread") || label.startsWith("sla") || label.startsWith("settlement");
  });
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

      const percentEndingMatch = text.match(/^(.*?)(\d+(?:[.,]\d+)?\s*%)$/);
      if (percentEndingMatch) {
        const label = sanitizeText(percentEndingMatch[1]).replace(/[:|-]+$/g, "").trim();
        const value = sanitizeText(percentEndingMatch[2]);
        if (label && value) {
          return { label, value };
        }
      }

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
    .slice(0, 8);
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
            .slice(0, 8)
        : [];
      const bankPriceList = Array.isArray(block?.bankPriceList)
        ? block.bankPriceList
            .map((entry) => ({
              bank: sanitizeText(entry?.bank || entry?.name),
              price: sanitizeText(entry?.price || entry?.value),
            }))
            .filter((entry) => entry.bank && entry.price)
            .slice(0, 20)
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
        bankPriceList,
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
    // Ignore invalid URL.
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
