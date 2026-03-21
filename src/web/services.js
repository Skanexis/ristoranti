const PUBLIC_DATA_ENDPOINT = "/api/public-data";

const DEFAULT_SERVICES_PAGE = (() => {
  const fromStore = window.RIDataStore?.getDefaultData?.()?.servicesPage;
  if (fromStore && typeof fromStore === "object") {
    return fromStore;
  }

  return {
    hero: {
      badge: "Servizi Professionali",
      title: "I nostri servizi",
      subtitle:
        "Programmazione bot Telegram e soluzioni Exchange Crypto con condizioni chiare, supporto operativo e gestione professionale.",
      highlight: "Listino ufficiale aggiornabile da admin, con visualizzazione semplice e immediata.",
      primaryCtaLabel: "Richiedi preventivo",
      primaryCtaUrl: "https://t.me/SHLC26",
      secondaryCtaLabel: "Contatto diretto",
      secondaryCtaUrl: "https://t.me/SHLC26",
    },
    socialProof: {
      title: "Social network europei piu richiesti",
      subtitle: "Strategie growth su piattaforme ad alta trazione.",
    },
    socialPlatforms: [],
    serviceBlocks: [],
    closing: {
      title: "Servizio chiaro e professionale",
      description: "Ogni soluzione e presentata in modo trasparente, con prezzi chiari e supporto continuo.",
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

const catalogState = {
  category: "all",
  topOnly: false,
  viewMode: "deck",
  activeServiceId: "",
  spotlightServiceId: "",
};

let servicesPageData = normalizeServicesPage(DEFAULT_SERVICES_PAGE);
let revealObserver = null;
let railObserver = null;
let storyTimer = null;
let showcaseTimer = null;
let tickerItems = [];
let showcaseCards = [];
let showcaseIndex = 0;
let userSelectedViewMode = false;
let spotlightTransitionTimer = null;
let activeSpotlightId = "";
let sectionFlowNodes = [];
let sectionFlowRaf = 0;
let resizeRaf = 0;
let lastViewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
let mobileSpotlightState = {
  hasConditions: false,
  hasFeatures: false,
  ratesOpen: false,
  featuresOpen: false,
};

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
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),
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
  spotlightMobileToggles: document.getElementById("spotlightMobileToggles"),
  toggleFeaturesBtn: document.getElementById("toggleFeaturesBtn"),
  toggleRatesBtn: document.getElementById("toggleRatesBtn"),
  spotlightBankPricePanel: document.getElementById("spotlightBankPricePanel"),
  spotlightBankPriceTitle: document.getElementById("spotlightBankPriceTitle"),
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
  applyResponsiveDefaults();
  bindEvents();
  setupSceneMotion();
  setupCursorAura();
  setupSpotlightTilt();
  setupCtaMicroInteractions();
  setupSectionFlowMotion();
  renderPage(servicesPageData);
  setupExperienceRail();
  setupRevealObserver();
  updateScrollMeter();

  await loadServicesFromServer();
  renderPage(servicesPageData);
  setupSectionFlowMotion();
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

  if (els.clearFiltersBtn) {
    els.clearFiltersBtn.addEventListener("click", () => {
      catalogState.category = "all";
      catalogState.topOnly = false;
      if (els.serviceTopOnly) {
        els.serviceTopOnly.checked = false;
      }
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    });
  }

  if (els.toggleFeaturesBtn) {
    els.toggleFeaturesBtn.addEventListener("click", () => {
      if (!mobileSpotlightState.hasFeatures) return;
      mobileSpotlightState.featuresOpen = true;
      if (mobileSpotlightState.hasConditions) {
        mobileSpotlightState.ratesOpen = false;
      }
      applyMobileSpotlightSections();
    });
  }

  if (els.toggleRatesBtn) {
    els.toggleRatesBtn.addEventListener("click", () => {
      if (!mobileSpotlightState.hasConditions) return;
      mobileSpotlightState.ratesOpen = true;
      if (mobileSpotlightState.hasFeatures) {
        mobileSpotlightState.featuresOpen = false;
      }
      applyMobileSpotlightSections();
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
      userSelectedViewMode = true;
      catalogState.viewMode = "deck";
      renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    });
  }

  if (els.modeStoryBtn) {
    els.modeStoryBtn.addEventListener("click", () => {
      userSelectedViewMode = true;
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
      const detailsButton = event.target.closest("[data-service-details]");
      if (detailsButton) {
        const id = sanitizeText(detailsButton.dataset.serviceDetails);
        if (!id) return;

        catalogState.activeServiceId = id;
        catalogState.spotlightServiceId = id;
        renderActiveServiceViews(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
        scrollSpotlightIntoViewOnMobile();
        return;
      }

      const card = event.target.closest("[data-service-select]");
      if (!card) return;

      const id = sanitizeText(card.dataset.serviceSelect);
      if (!id) return;

      catalogState.activeServiceId = id;
      renderMiniCards(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
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
  window.addEventListener("resize", handleViewportResize);
}

function applyResponsiveDefaults() {
  catalogState.viewMode = "deck";
}

function handleViewportResize() {
  updateScrollMeter();

  if (resizeRaf) return;
  resizeRaf = window.requestAnimationFrame(() => {
    resizeRaf = 0;

    const nextWidth = window.innerWidth;
    const widthChanged = Math.abs(nextWidth - lastViewportWidth) > 2;
    lastViewportWidth = nextWidth;

    // On mobile scroll the browser UI can fire resize with height-only changes.
    // Re-rendering on each of those causes visible "page reload" flicker.
    if (!widthChanged) return;

    applyResponsiveDefaults();
    renderServiceCatalog(servicesPageData?.serviceBlocks || []);
    setupSectionFlowMotion();
  });
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
  if (els.heroSubtitle) {
    els.heroSubtitle.textContent = hero.subtitle;
    els.heroSubtitle.hidden = !sanitizeText(hero.subtitle);
  }
  if (els.heroHighlight) {
    els.heroHighlight.textContent = hero.highlight;
    els.heroHighlight.hidden = !sanitizeText(hero.highlight);
  }

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
  catalogState.viewMode = "deck";
  const allBlocks = Array.isArray(blocks) ? blocks : [];
  renderCategoryFilters(allBlocks);
  renderViewSwitch();

  const filtered = getFilteredServiceBlocks(allBlocks);
  ensureActiveService(filtered);
  renderServiceCount(filtered.length, allBlocks.length);
  renderActiveServiceViews(filtered);
  stopStoryAutoplay();
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

  const isMobile = window.matchMedia?.("(max-width: 760px)")?.matches;
  if (isMobile && total > 1) {
    els.serviceCountLabel.textContent =
      visible === total
        ? `${total} servizi disponibili - scorri le card orizzontalmente`
        : `${visible} di ${total} servizi - scorri le card orizzontalmente`;
    return;
  }

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
    catalogState.spotlightServiceId = "";
    return;
  }

  const exists = filteredBlocks.some((block) => block.id === catalogState.activeServiceId);
  if (!exists) {
    catalogState.activeServiceId = filteredBlocks[0].id;
  }

  const spotlightExists = filteredBlocks.some((block) => block.id === catalogState.spotlightServiceId);
  if (!spotlightExists) {
    catalogState.spotlightServiceId = "";
  }
}

function getActiveBlock(filteredBlocks) {
  if (!Array.isArray(filteredBlocks) || filteredBlocks.length === 0) return null;
  return filteredBlocks.find((block) => block.id === catalogState.activeServiceId) || filteredBlocks[0];
}

function getSpotlightBlock(filteredBlocks) {
  if (!Array.isArray(filteredBlocks) || filteredBlocks.length === 0) return null;
  return filteredBlocks.find((block) => block.id === catalogState.spotlightServiceId) || null;
}

function renderActiveServiceViews(filteredBlocks) {
  renderMiniCards(filteredBlocks);

  const spotlightBlock = getSpotlightBlock(filteredBlocks);
  if (spotlightBlock) {
    renderSpotlight(spotlightBlock, filteredBlocks);
    return;
  }

  if (!Array.isArray(filteredBlocks) || filteredBlocks.length === 0) {
    setSpotlightEmpty();
    return;
  }

  const active = getActiveBlock(filteredBlocks);
  setSpotlightClosed(active, filteredBlocks);
}

function renderSpotlight(activeBlock, filteredBlocks) {
  if (!activeBlock) {
    setSpotlightEmpty();
    return;
  }

  triggerSpotlightTransition(activeBlock.id);
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

  const hasConditions = renderSpotlightConditions(activeBlock);
  const hasFeatures = renderSpotlightFeatures(activeBlock);
  mobileSpotlightState.hasConditions = hasConditions;
  mobileSpotlightState.hasFeatures = hasFeatures;
  if (hasConditions && hasFeatures) {
    mobileSpotlightState.featuresOpen = true;
    mobileSpotlightState.ratesOpen = false;
  } else if (hasConditions) {
    mobileSpotlightState.featuresOpen = false;
    mobileSpotlightState.ratesOpen = true;
  } else if (hasFeatures) {
    mobileSpotlightState.featuresOpen = true;
    mobileSpotlightState.ratesOpen = false;
  } else {
    mobileSpotlightState.featuresOpen = false;
    mobileSpotlightState.ratesOpen = false;
  }
  applyMobileSpotlightSections();
  renderStoryMeta(activeBlock, filteredBlocks);
}

function setSpotlightEmpty() {
  catalogState.spotlightServiceId = "";
  applyAccentTheme(DEFAULT_ACCENT);
  activeSpotlightId = "";
  if (spotlightTransitionTimer) {
    window.clearTimeout(spotlightTransitionTimer);
    spotlightTransitionTimer = null;
  }
  if (els.spotlightBox) {
    els.spotlightBox.classList.remove("is-switching");
  }
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
  if (els.spotlightBankPricePanel) {
    els.spotlightBankPricePanel.hidden = true;
    delete els.spotlightBankPricePanel.dataset.kind;
  }
  if (els.spotlightBankPriceList) {
    els.spotlightBankPriceList.innerHTML = "";
  }
  if (els.spotlightBankPriceTitle) {
    els.spotlightBankPriceTitle.textContent = "Condizioni";
  }
  if (els.spotlightFeatures) {
    els.spotlightFeatures.innerHTML = "";
  }
  mobileSpotlightState.hasConditions = false;
  mobileSpotlightState.hasFeatures = false;
  mobileSpotlightState.featuresOpen = false;
  mobileSpotlightState.ratesOpen = false;
  applyMobileSpotlightSections();
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

function setSpotlightClosed(activeBlock, filteredBlocks) {
  activeSpotlightId = "";
  if (spotlightTransitionTimer) {
    window.clearTimeout(spotlightTransitionTimer);
    spotlightTransitionTimer = null;
  }
  if (els.spotlightBox) {
    els.spotlightBox.classList.remove("is-switching");
  }

  applyAccentTheme(activeBlock?.accent || DEFAULT_ACCENT);

  if (els.spotlightCategory) {
    els.spotlightCategory.textContent = activeBlock?.category || "Dettagli servizio";
  }
  if (els.spotlightFeatured) {
    els.spotlightFeatured.hidden = true;
  }
  if (els.spotlightTitle) {
    els.spotlightTitle.textContent = activeBlock?.title || "Scheda dettagli";
  }
  if (els.spotlightDescription) {
    els.spotlightDescription.textContent = 'Premi "Dettagli" sulla card per aprire la scheda completa del servizio.';
  }
  if (els.spotlightPrice) {
    els.spotlightPrice.textContent = activeBlock?.price || "";
  }
  if (els.spotlightPriceNote) {
    els.spotlightPriceNote.textContent = "";
    els.spotlightPriceNote.hidden = true;
  }
  if (els.spotlightBankPricePanel) {
    els.spotlightBankPricePanel.hidden = true;
    delete els.spotlightBankPricePanel.dataset.kind;
  }
  if (els.spotlightBankPriceList) {
    els.spotlightBankPriceList.innerHTML = "";
  }
  if (els.spotlightBankPriceTitle) {
    els.spotlightBankPriceTitle.textContent = "Condizioni";
  }
  if (els.spotlightFeatures) {
    els.spotlightFeatures.innerHTML = "";
    els.spotlightFeatures.hidden = true;
  }

  mobileSpotlightState.hasConditions = false;
  mobileSpotlightState.hasFeatures = false;
  mobileSpotlightState.featuresOpen = false;
  mobileSpotlightState.ratesOpen = false;
  applyMobileSpotlightSections();
  renderStoryMeta(activeBlock || null, filteredBlocks);
}

function renderSpotlightFeatures(block) {
  if (!els.spotlightFeatures) return false;

  const features = Array.isArray(block?.features) ? block.features : [];
  if (features.length === 0) {
    els.spotlightFeatures.innerHTML = "";
    return false;
  }

  const compactViewport = window.matchMedia?.("(max-width: 760px)")?.matches;
  const maxVisible = compactViewport ? 4 : 6;
  const visibleFeatures = features.slice(0, maxVisible);
  const hasMore = features.length > maxVisible;
  const withMoreHint = hasMore ? [...visibleFeatures, "Altre funzionalita su richiesta"] : visibleFeatures;

  els.spotlightFeatures.innerHTML = withMoreHint.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
  return true;
}

function renderSpotlightConditions(block) {
  if (!els.spotlightBankPricePanel || !els.spotlightBankPriceList || !els.spotlightBankPriceTitle) return false;

  const exchangeTiers = Array.isArray(block?.fintechMetrics)
    ? block.fintechMetrics
        .map((entry) => ({
          label: sanitizeText(entry?.label),
          value: sanitizeText(entry?.value),
        }))
        .filter((entry) => entry.label && entry.value)
        .slice(0, 8)
    : [];

  const bankEntries = Array.isArray(block?.bankPriceList)
    ? block.bankPriceList
        .map((entry) => ({
          label: sanitizeText(entry?.bank || entry?.name),
          value: sanitizeText(entry?.price || entry?.value),
        }))
        .filter((entry) => entry.label && entry.value)
        .slice(0, 60)
    : [];

  const hasExchangeTiers = exchangeTiers.length > 0;
  const hasBanks = bankEntries.length > 0;

  if (!hasExchangeTiers && !hasBanks) {
    els.spotlightBankPriceTitle.textContent = "Condizioni";
    els.spotlightBankPriceList.innerHTML = "";
    els.spotlightBankPricePanel.hidden = true;
    delete els.spotlightBankPricePanel.dataset.kind;
    return false;
  }

  const blockId = sanitizeText(block?.id);
  const blockCategory = sanitizeText(block?.category);
  const blockTitle = sanitizeText(block?.title);
  const isExchangeAccountsList = isExchangeAccountsListBlock(blockId, blockCategory, blockTitle);
  const isExchangeCommissionService = isExchangeCommissionServiceBlock(blockId, blockCategory, blockTitle);

  let entries = [];
  if (hasBanks && isExchangeAccountsList) {
    entries = bankEntries;
    els.spotlightBankPriceTitle.textContent = "Account Exchange disponibili";
    els.spotlightBankPricePanel.dataset.kind = "banks";
  } else if (hasExchangeTiers && isExchangeCommissionService) {
    entries = exchangeTiers;
    els.spotlightBankPriceTitle.textContent = "Commissioni applicate";
    els.spotlightBankPricePanel.dataset.kind = "exchange";
  } else if (hasBanks) {
    entries = bankEntries;
    els.spotlightBankPriceTitle.textContent = "Banche disponibili";
    els.spotlightBankPricePanel.dataset.kind = "banks";
  } else {
    entries = exchangeTiers;
    els.spotlightBankPriceTitle.textContent = "Condizioni";
    els.spotlightBankPricePanel.dataset.kind = "exchange";
  }

  els.spotlightBankPriceList.innerHTML = entries
    .map(
      (entry, index) => `
        <li style="--entry-index:${index};">
          <span>${escapeHtml(entry.label)}</span>
          <strong>${escapeHtml(entry.value)}</strong>
        </li>
      `
    )
    .join("");
  els.spotlightBankPricePanel.hidden = false;
  return true;
}

function applyMobileSpotlightSections() {
  const hasConditions = Boolean(mobileSpotlightState.hasConditions);
  const hasFeatures = Boolean(mobileSpotlightState.hasFeatures);
  const isMobile = window.matchMedia?.("(max-width: 760px)")?.matches;

  if (els.spotlightMobileToggles) {
    els.spotlightMobileToggles.hidden = !isMobile || (!hasConditions && !hasFeatures);
  }

  if (els.toggleFeaturesBtn) {
    els.toggleFeaturesBtn.hidden = !hasFeatures;
    const active = hasFeatures && (!isMobile || mobileSpotlightState.featuresOpen);
    els.toggleFeaturesBtn.classList.toggle("is-active", active);
    els.toggleFeaturesBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  if (els.toggleRatesBtn) {
    els.toggleRatesBtn.hidden = !hasConditions;
    const active = hasConditions && (!isMobile || mobileSpotlightState.ratesOpen);
    els.toggleRatesBtn.classList.toggle("is-active", active);
    els.toggleRatesBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  if (els.spotlightFeatures) {
    els.spotlightFeatures.hidden = !hasFeatures || (isMobile && !mobileSpotlightState.featuresOpen);
  }

  if (els.spotlightBankPricePanel) {
    els.spotlightBankPricePanel.hidden = !hasConditions || (isMobile && !mobileSpotlightState.ratesOpen);
  }
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
      const noteSource =
        sanitizeText(block?.priceNote) ||
        (Array.isArray(block?.features) && sanitizeText(block.features[0])) ||
        sanitizeText(block?.description);
      const note =
        noteSource.length > 84 ? `${noteSource.slice(0, 82).trim()}...` : noteSource;

      return `
        <article class="service-mini-card ${activeClass}" data-service-select="${escapeHtmlAttr(
          block.id
        )}" style="--card-index:${index};">
          <div class="service-mini-top">
            <p class="service-mini-category">${escapeHtml(block.category)}</p>
            ${block.featured ? '<p class="service-mini-featured">Top</p>' : ""}
          </div>
          <h3 class="service-mini-title">${escapeHtml(block.title)}</h3>
          <p class="service-mini-price">${escapeHtml(block.price)}</p>
          ${note ? `<p class="service-mini-note">${escapeHtml(note)}</p>` : ""}
          <div class="service-mini-actions">
            <button
              type="button"
              class="service-mini-details-btn"
              data-service-details="${escapeHtmlAttr(block.id)}"
              aria-label="Apri dettagli per ${escapeHtmlAttr(block.title)}"
            >
              Dettagli
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  syncActiveMiniCardInView();
}

function syncActiveMiniCardInView() {
  if (!els.serviceBlocksGrid) return;
  const hasHorizontalOverflow = els.serviceBlocksGrid.scrollWidth > els.serviceBlocksGrid.clientWidth + 2;
  if (!hasHorizontalOverflow) return;

  const activeId = sanitizeText(catalogState.activeServiceId);
  if (!activeId) return;
  const escapedId =
    typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(activeId)
      : activeId.replace(/["\\]/g, "\\$&");
  const activeCard = els.serviceBlocksGrid.querySelector(`[data-service-select="${escapedId}"]`);
  if (!activeCard || typeof activeCard.scrollIntoView !== "function") return;

  activeCard.scrollIntoView({
    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
    block: "nearest",
    inline: "center",
  });
}

function scrollSpotlightIntoViewOnMobile() {
  if (!els.spotlightBox) return;
  const isMobile = window.matchMedia?.("(max-width: 760px)")?.matches;
  if (!isMobile) return;

  const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth";
  els.spotlightBox.scrollIntoView({ behavior, block: "start" });
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
    els.socialSubtitle.hidden = !sanitizeText(socialProof.subtitle);
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

  const sections = Array.from(document.querySelectorAll(".services-shell [data-rail-label]"));
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
              data-rail-tooltip="${escapeHtmlAttr(item.label)}"
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

function setupSectionFlowMotion() {
  sectionFlowNodes = Array.from(document.querySelectorAll(".services-shell > .reveal-item"));
  if (sectionFlowNodes.length === 0) return;

  if (window.matchMedia?.("(pointer: coarse)")?.matches) {
    sectionFlowNodes.forEach((node) => {
      node.style.setProperty("--reveal-delay", "0ms");
      node.style.setProperty("--section-shift", "0px");
      node.style.setProperty("--section-visibility", "1");
    });
    return;
  }

  sectionFlowNodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(360, index * 85)}ms`);
  });

  const requestUpdate = () => {
    if (sectionFlowRaf) return;
    sectionFlowRaf = window.requestAnimationFrame(updateSectionFlowMotion);
  };

  if (document.body.dataset.sectionFlowBound !== "1") {
    document.body.dataset.sectionFlowBound = "1";
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  requestUpdate();
}

function updateSectionFlowMotion() {
  sectionFlowRaf = 0;
  if (!Array.isArray(sectionFlowNodes) || sectionFlowNodes.length === 0) return;

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    sectionFlowNodes.forEach((node) => {
      node.style.setProperty("--section-shift", "0px");
      node.style.setProperty("--section-visibility", "1");
    });
    return;
  }

  const viewport = Math.max(1, window.innerHeight);
  const halfViewport = viewport / 2;

  sectionFlowNodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distance = (centerY - halfViewport) / halfViewport;
    const clampedDistance = Math.max(-1.2, Math.min(1.2, distance));
    const shift = Math.max(-20, Math.min(20, clampedDistance * -15));
    const visibility = Math.max(0, Math.min(1, 1 - Math.abs(clampedDistance) * 0.82));

    node.style.setProperty("--section-shift", `${shift.toFixed(2)}px`);
    node.style.setProperty("--section-visibility", visibility.toFixed(3));
  });
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

function setupCtaMicroInteractions() {
  if (document.body.dataset.ctaMicroBound === "1") return;
  document.body.dataset.ctaMicroBound = "1";

  const rippleSelector =
    ".hero-link, .hero-btn, .filter-btn, .switch-btn, .story-btn, .service-mini-details-btn";

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

      const target = event.target instanceof Element ? event.target.closest(rippleSelector) : null;
      if (!(target instanceof HTMLElement)) return;

      const rect = target.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const size = Math.max(width, height) * 1.65;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      target.style.setProperty("--ripple-size", `${size.toFixed(2)}px`);
      target.style.setProperty("--ripple-x", `${x.toFixed(2)}px`);
      target.style.setProperty("--ripple-y", `${y.toFixed(2)}px`);

      target.classList.remove("is-rippling");
      void target.offsetWidth;
      target.classList.add("is-rippling");

      window.setTimeout(() => {
        target.classList.remove("is-rippling");
      }, 760);
    },
    { passive: true }
  );
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
    const xPercent = Math.max(0, Math.min(1, x)) * 100;
    const yPercent = Math.max(0, Math.min(1, y)) * 100;

    const rotateY = (x - 0.5) * 2.4;
    const rotateX = (0.5 - y) * 2.4;
    box.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    box.style.setProperty("--glow-x", `${xPercent.toFixed(2)}%`);
    box.style.setProperty("--glow-y", `${yPercent.toFixed(2)}%`);
    box.classList.add("is-hovered");
  });

  box.addEventListener("pointerleave", () => {
    box.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    box.style.setProperty("--glow-x", "50%");
    box.style.setProperty("--glow-y", "50%");
    box.classList.remove("is-hovered");
  });
}

function setupStorySwipeGestures() {
  if (!els.spotlightBox) return;
  if (els.spotlightBox.dataset.storySwipeBound === "1") return;

  const surface = els.spotlightBox;
  surface.dataset.storySwipeBound = "1";

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startedAt = 0;

  const reset = () => {
    pointerId = null;
    startX = 0;
    startY = 0;
    startedAt = 0;
    surface.classList.remove("is-grabbing");
  };

  surface.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button, a, input, label")) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startedAt = performance.now();
    surface.classList.add("is-grabbing");

    if (catalogState.viewMode === "story") {
      stopStoryAutoplay();
    }
  });

  const onPointerUp = (event) => {
    if (pointerId !== event.pointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const elapsed = Math.max(1, performance.now() - startedAt);
    const velocity = Math.abs(deltaX) / elapsed;

    reset();

    if (catalogState.viewMode !== "story") return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const horizontalIntent = absX > absY * 1.2;
    const distanceSwipe = absX >= 44;
    const flickSwipe = absX >= 28 && velocity >= 0.52;

    if (horizontalIntent && (distanceSwipe || flickSwipe)) {
      moveActiveService(deltaX < 0 ? 1 : -1);
    }

    syncStoryAutoplay(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
  };

  surface.addEventListener("pointerup", onPointerUp);
  surface.addEventListener("pointercancel", () => {
    if (pointerId === null) return;
    reset();
    syncStoryAutoplay(getFilteredServiceBlocks(servicesPageData?.serviceBlocks || []));
  });
}

function triggerSpotlightTransition(nextId) {
  const safeId = sanitizeText(nextId);
  if (!safeId || !els.spotlightBox) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    activeSpotlightId = safeId;
    return;
  }
  if (!activeSpotlightId) {
    activeSpotlightId = safeId;
    return;
  }
  if (activeSpotlightId === safeId) return;

  activeSpotlightId = safeId;
  if (spotlightTransitionTimer) {
    window.clearTimeout(spotlightTransitionTimer);
    spotlightTransitionTimer = null;
  }

  els.spotlightBox.classList.remove("is-switching");
  void els.spotlightBox.offsetWidth;
  els.spotlightBox.classList.add("is-switching");
  spotlightTransitionTimer = window.setTimeout(() => {
    els.spotlightBox?.classList.remove("is-switching");
  }, 360);
}

function applyMagneticTargets() {
  if (window.matchMedia?.("(pointer: coarse)")?.matches) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const targets = Array.from(
    document.querySelectorAll(
      ".hero-btn, .hero-link, .filter-btn, .switch-btn, .story-btn, .service-mini-details-btn, .showcase-dot, .rail-dot"
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

      const shiftX = Math.max(-4, Math.min(4, offsetX * 0.05));
      const shiftY = Math.max(-4, Math.min(4, offsetY * 0.05));
      node.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "translate(0px, 0px)";
    });
  });
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

      const category = sanitizeText(block?.category) || "Servizi";
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
            .slice(0, 60)
        : [];
      const isExchangeAccountsBlock = isExchangeAccountsListBlock(id, category, title);

      return {
        id,
        category,
        title,
        description: sanitizeText(block?.description),
        price: sanitizeText(block?.price) || "da EUR 0",
        priceNote: sanitizeServicePriceNoteText(block?.priceNote),
        kpis,
        fintechMetrics: isExchangeAccountsBlock ? [] : fintechMetrics,
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

  const normalizedSupplementaryBlocks = ensureSupplementaryServiceBlocks(serviceBlocks, defaults.serviceBlocks || []);

  return {
    hero,
    socialProof,
    socialPlatforms,
    serviceBlocks: normalizedSupplementaryBlocks,
    closing,
  };
}

function isExchangeAccountsListBlock(id, category, title) {
  const haystack = [id, category, title]
    .map((value) => sanitizeText(value).toLowerCase())
    .join(" ");

  return haystack.includes("exchange") && /\baccounts?\b/.test(haystack);
}

function isExchangeCommissionServiceBlock(id, category, title) {
  const normalizedId = sanitizeText(id).toLowerCase();
  if (normalizedId === "crypto-exchange-services") return true;
  if (normalizedId === "exchange-accounts-services") return false;

  const haystack = [id, category, title]
    .map((value) => sanitizeText(value).toLowerCase())
    .join(" ");
  const hasExchange = haystack.includes("exchange");
  const hasCrypto = haystack.includes("crypto");
  const hasAccounts = /\baccounts?\b/.test(haystack);

  if (!hasExchange || hasAccounts) return false;
  return hasCrypto || sanitizeText(category).toLowerCase() === "exchange crypto";
}

function hasBankingServiceBlock(serviceBlocks) {
  const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
  return blocks.some((block) => {
    const id = sanitizeText(block?.id).toLowerCase();
    return id === "bank-accounts-and-crypto-wallets" || id === "banking-wallet-services";
  });
}

function hasExchangeAccountsServiceBlock(serviceBlocks) {
  const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
  return blocks.some((block) => sanitizeText(block?.id).toLowerCase() === "exchange-accounts-services");
}

function ensureSupplementaryServiceBlocks(serviceBlocks, defaultBlocks) {
  const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
  const defaults = Array.isArray(defaultBlocks) ? defaultBlocks : [];
  const nextBlocks = [...blocks];

  if (!hasExchangeAccountsServiceBlock(nextBlocks)) {
    const defaultExchangeAccounts = defaults.find(
      (block) => sanitizeText(block?.id).toLowerCase() === "exchange-accounts-services"
    );
    if (defaultExchangeAccounts) {
      nextBlocks.push(JSON.parse(JSON.stringify(defaultExchangeAccounts)));
    }
  }

  if (!hasBankingServiceBlock(nextBlocks)) {
    const defaultBanking = defaults.find(
      (block) => sanitizeText(block?.id).toLowerCase() === "bank-accounts-and-crypto-wallets"
    );
    if (defaultBanking) {
      nextBlocks.push(JSON.parse(JSON.stringify(defaultBanking)));
    }
  }

  return nextBlocks;
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

function sanitizeServicePriceNoteText(value) {
  const note = sanitizeText(value);
  if (!note) return "";

  const compact = note.toLowerCase().replace(/\s+/g, " ");
  const hasIncreaseMarker = /(maggiorazion|rincar|aument|supplement|upcharge|mark[\s-]?up)/i.test(compact);
  const hasPlusEuro = /\+\s*\d{1,4}(?:[.,]\d+)?\s*€?/i.test(note);
  if (hasIncreaseMarker || hasPlusEuro) {
    return "";
  }

  return note;
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
