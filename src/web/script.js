
const state = {
  service: null,
  region: null,
};
const VALID_SERVICES = ["meetup", "delivery", "ship"];
const DEFAULT_SUPPORT_TELEGRAM_URL = "https://t.me/ristoranti_italia_support";
const PUBLIC_DATA_ENDPOINT = "/api/public-data";
const PRELOADER_SESSION_KEY = "ri_preloader_seen_v2";

let appData = fallbackData();

const els = {
  serviceOptions: document.getElementById("serviceOptions"),
  selectionStep: document.getElementById("selectionStep"),
  selectionTitle: document.getElementById("selectionTitle"),
  selectionContent: document.getElementById("selectionContent"),
  pointsStep: document.getElementById("pointsStep"),
  pointsTitle: document.getElementById("pointsTitle"),
  pointsContent: document.getElementById("pointsContent"),
  scrollTopBtn: document.getElementById("scrollTopBtn"),
  contactTelegramBtn: document.getElementById("contactTelegramBtn"),
};

setupMobilePreloader();
setupTelegram();
bindEvents();
setupFloatingTools();
void initializeAppData();

async function initializeAppData() {
  normalizeState();
  renderRegionStep();
  renderPointsStep();

  await loadAppDataFromServer();
  normalizeState();
  renderRegionStep();
  renderPointsStep();
}

function bindEvents() {
  els.serviceOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-service]");
    if (!button) return;
    selectService(button.dataset.service);
  });

  els.selectionContent.addEventListener("click", (event) => {
    const regionButton = event.target.closest("[data-region]");
    if (!regionButton || regionButton.disabled) return;
    selectRegion(regionButton.dataset.region);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    void refreshLiveData();
  });
}

function setupTelegram() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();
  tg.MainButton.hide();
}

async function refreshLiveData() {
  await loadAppDataFromServer();
  normalizeState();
  renderRegionStep();
  renderPointsStep();
}

async function loadAppDataFromServer() {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), 2600) : 0;

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
    appData = normalizeDataInput(payload?.data);
    updateSupportLink();
    return;
  } catch {
    appData = loadFallbackAppData();
    updateSupportLink();
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function loadFallbackAppData() {
  return window.RIDataStore?.getData?.() ?? window.RIDataStore?.getDefaultData?.() ?? fallbackData();
}

function normalizeDataInput(input) {
  if (window.RIDataStore?.normalizeData) {
    return window.RIDataStore.normalizeData(input);
  }

  return input && typeof input === "object" ? input : fallbackData();
}

function fallbackData() {
  return {
    serviceLabels: {
      meetup: "Ritiro",
      delivery: "Consegna",
      ship: "Spedizione",
    },
    supportTelegramUrl: DEFAULT_SUPPORT_TELEGRAM_URL,
    regions: [],
  };
}

function selectService(serviceId) {
  const service = normalizeServiceId(serviceId);
  if (!service) return;

  state.service = service;
  state.region = null;

  normalizeState();
  highlightActiveOption(els.serviceOptions, `[data-service='${cssEscape(state.service)}']`);
  renderRegionStep();
  renderPointsStep();
  triggerSelectionHaptic();

  window.requestAnimationFrame(() =>
    focusStepIfNeeded(els.selectionStep, {
      focusSelector: "[data-region]:not([disabled])",
    })
  );
}

function selectRegion(regionId) {
  if (!state.service) return;

  const region = appData.regions.find((item) => item.id === regionId);
  if (!region) return;

  state.region = region.id;

  normalizeState();
  highlightActiveOption(els.selectionContent, `[data-region='${cssEscape(state.region)}']`);
  renderPointsStep();
  triggerSelectionHaptic();

  window.requestAnimationFrame(() =>
    focusStepIfNeeded(els.pointsStep, {
      focusSelector: ".point-link",
    })
  );
}

function normalizeState() {
  state.service = normalizeServiceId(state.service);

  if (!state.service) {
    state.region = null;
    return;
  }

  const regionExists = appData.regions.some((region) => region.id === state.region);
  if (!regionExists) {
    state.region = null;
  }

  if (!state.region) return;

  const activePoints = getActivePointsByRegion(state.region);
  if (activePoints.length === 0) {
    state.region = null;
  }
}

function renderRegionStep() {
  if (!state.service) {
    els.selectionStep.classList.add("hidden");
    return;
  }

  els.selectionTitle.textContent = `Seleziona la regione per ${getServiceLabel(state.service)}`;

  if (!Array.isArray(appData.regions) || appData.regions.length === 0) {
    els.selectionContent.innerHTML = `
      <div class="points-empty">
        Nessuna regione configurata al momento.
      </div>
    `;
    els.selectionStep.classList.remove("hidden");
    return;
  }

  const regionMeta = appData.regions.map((region) => ({
    region,
    activeCount: getActivePointsByRegion(region.id).length,
  }));

  const activeRegions = regionMeta.filter((entry) => entry.activeCount > 0);
  if (!state.region && activeRegions.length === 1) {
    state.region = activeRegions[0].region.id;
  }

  if (state.region) {
    const selected = regionMeta.find((entry) => entry.region.id === state.region);
    if (!selected || selected.activeCount === 0) {
      state.region = null;
    }
  }

  const regionCards = regionMeta
    .map(({ region, activeCount }) => {
      const isDisabled = activeCount === 0;
      return `
        <button
          type="button"
          class="option ${isDisabled ? "is-disabled" : ""}"
          data-region="${escapeHtmlAttr(region.id)}"
          ${isDisabled ? "disabled" : ""}
        >
          <span class="region-name">${escapeHtml(region.name)}</span>
          <span class="region-meta">${activeCount} punti disponibili</span>
          <span class="region-meta">${escapeHtml(region.hubs || "Nessun hub specificato")}</span>
        </button>
      `;
    })
    .join("");

  els.selectionContent.innerHTML = `<div class="region-grid">${regionCards}</div>`;
  els.selectionStep.classList.remove("hidden");

  if (state.region) {
    highlightActiveOption(els.selectionContent, `[data-region='${cssEscape(state.region)}']`);
  }
}

function renderPointsStep() {
  if (!state.service || !state.region) {
    els.pointsStep.classList.add("hidden");
    return;
  }

  const region = appData.regions.find((item) => item.id === state.region);
  if (!region) {
    els.pointsStep.classList.add("hidden");
    return;
  }

  const activePoints = getActivePointsByRegion(region.id);
  els.pointsTitle.textContent = `Punti attivi in ${region.name}`;

  if (activePoints.length === 0) {
    els.pointsContent.innerHTML = `
      <div class="points-empty">
        Nessun punto disponibile per questo servizio nella regione selezionata.
      </div>
    `;
    els.pointsStep.classList.remove("hidden");
    return;
  }

  const cards = activePoints
    .map((point) => {
      const socials = Array.isArray(point.socials)
        ? point.socials
            .map(
              (link) => `
                <a class="point-link" href="${escapeHtmlAttr(link.url)}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(link.label)}
                </a>
              `
            )
            .join("")
        : "";

      const logoHtml = point.logo
        ? `<img src="${escapeHtmlAttr(point.logo)}" alt="Logo ${escapeHtmlAttr(point.name)}" loading="lazy" />`
        : `<span class="point-logo-fallback">${escapeHtml(getInitials(point.name))}</span>`;
      const mediaType = resolvePointMediaType(point.mediaType, point.mediaUrl);
      const mediaHtml = buildPointMediaMarkup(mediaType, point.mediaUrl, point.name);

      return `
        <article class="point-card" aria-label="Punto ${escapeHtmlAttr(point.name)}">
          <header class="point-header">
            <div class="point-logo">${logoHtml}</div>
            <div>
              <h3 class="point-name">${escapeHtml(point.name)}</h3>
              <p class="point-address">${escapeHtml(point.address || "Indirizzo non specificato")}</p>
            </div>
          </header>
          ${mediaHtml ? `<div class="point-media point-media-${mediaType}">${mediaHtml}</div>` : ""}
          <div class="point-details-block">
            ${buildStarMeter(clampStars(point.stars))}
            <p class="point-details-text">${escapeHtml(point.details || "Dettagli non configurati in admin center.")}</p>
          </div>
          <div class="point-links">${socials || `<span class="point-links-empty">Nessun social configurato</span>`}</div>
        </article>
      `;
    })
    .join("");

  els.pointsContent.innerHTML = `<div class="points-grid">${cards}</div>`;
  els.pointsStep.classList.remove("hidden");
}

function getActivePointsByRegion(regionId) {
  const region = appData.regions.find((item) => item.id === regionId);
  if (!region || !state.service) return [];

  return (region.activePoints || []).filter(
    (point) => Array.isArray(point.services) && point.services.includes(state.service)
  );
}

function getServiceLabel(serviceId) {
  return appData.serviceLabels?.[serviceId] || serviceId;
}

function normalizeServiceId(serviceId) {
  if (!serviceId) return null;
  return VALID_SERVICES.includes(serviceId) ? serviceId : null;
}

function setupFloatingTools() {
  updateSupportLink();
  updateScrollTopButton();

  if (els.scrollTopBtn) {
    els.scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  if (els.contactTelegramBtn) {
    els.contactTelegramBtn.addEventListener("click", (event) => {
      const href = els.contactTelegramBtn.getAttribute("href");
      if (!href) {
        event.preventDefault();
        return;
      }

      const tg = window.Telegram?.WebApp;
      if (!tg || typeof tg.openTelegramLink !== "function") return;

      event.preventDefault();
      tg.openTelegramLink(href);
    });
  }

  window.addEventListener("scroll", updateScrollTopButton, { passive: true });
}

function updateSupportLink() {
  if (!els.contactTelegramBtn) return;
  els.contactTelegramBtn.href = getSupportTelegramUrl();
}

function updateScrollTopButton() {
  if (!els.scrollTopBtn) return;
  const isVisible = window.scrollY > 320;
  els.scrollTopBtn.classList.toggle("is-visible", isVisible);
}

function getSupportTelegramUrl() {
  const candidate = String(appData.supportTelegramUrl || "").trim();
  if (isValidTelegramUrl(candidate)) return candidate;
  return DEFAULT_SUPPORT_TELEGRAM_URL;
}

function isValidTelegramUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return (url.protocol === "http:" || url.protocol === "https:") && host === "t.me";
  } catch {
    return false;
  }
}

function highlightActiveOption(container, selector) {
  container.querySelectorAll(".option.active").forEach((node) => node.classList.remove("active"));
  const active = container.querySelector(selector);
  if (active) {
    active.classList.add("active");
  }
}

function focusStepIfNeeded(stepElement, options = {}) {
  if (!stepElement || stepElement.classList.contains("hidden")) return;

  const focusSelector = options.focusSelector || "";

  const applyFocus = () => {
    const target = focusSelector ? stepElement.querySelector(focusSelector) : stepElement;
    if (!target) return;

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.setTimeout(() => target.removeAttribute("tabindex"), 500);
  };

  const rect = stepElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, viewportHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const mostlyVisible = visibleHeight >= Math.min(rect.height * 0.66, viewportHeight * 0.72);

  if (!mostlyVisible) {
    stepElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
    window.setTimeout(applyFocus, 280);
    return;
  }

  applyFocus();
}

function triggerSelectionHaptic() {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;
  if (!haptic || typeof haptic.selectionChanged !== "function") return;

  try {
    haptic.selectionChanged();
  } catch {
    // Ignore haptic runtime errors on unsupported clients.
  }
}

function resolvePointMediaType(typeValue, mediaUrl) {
  const rawUrl = String(mediaUrl || "").trim();
  if (!rawUrl) return "none";

  const normalizedType = String(typeValue || "")
    .trim()
    .toLowerCase();
  if (normalizedType === "photo" || normalizedType === "gif" || normalizedType === "video") {
    return normalizedType;
  }

  return inferMediaTypeFromUrl(rawUrl);
}

function inferMediaTypeFromUrl(mediaUrl) {
  const value = String(mediaUrl || "").trim().toLowerCase();
  if (!value) return "none";
  if (value.startsWith("data:image/gif")) return "gif";
  if (value.startsWith("data:video/")) return "video";
  if (value.startsWith("data:image/")) return "photo";
  if (value.includes(".gif")) return "gif";
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(value)) return "video";
  return "photo";
}

function buildPointMediaMarkup(mediaType, mediaUrl, pointName) {
  const safeUrl = String(mediaUrl || "").trim();
  if (!safeUrl || mediaType === "none") return "";

  if (mediaType === "video") {
    return `
      <video
        src="${escapeHtmlAttr(safeUrl)}"
        muted
        playsinline
        webkit-playsinline
        loop
        autoplay
        preload="metadata"
      ></video>
    `;
  }

  return `<img src="${escapeHtmlAttr(safeUrl)}" alt="Media ${escapeHtmlAttr(pointName || "punto")}" loading="lazy" />`;
}

function buildStarMeter(stars) {
  const slots = Array.from({ length: 3 }, (_, index) => {
    const filled = index < stars;
    return `<span class="point-star ${filled ? "is-filled" : ""}" aria-hidden="true">★</span>`;
  }).join("");

  return `
    <div class="point-stars" aria-label="${stars} stelle su 3">
      <div class="point-stars-row">${slots}</div>
    </div>
  `;
}

function clampStars(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(3, Math.round(num)));
}

function getInitials(name) {
  const parts = String(name || "")
    .split(" ")
    .filter(Boolean);
  if (parts.length === 0) return "PT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }

  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function setupMobilePreloader() {
  const body = document.body;
  const preloader = document.getElementById("mobilePreloader");
  const preloaderFallback = document.getElementById("preloadFallback");
  const preloaderVideo = document.getElementById("preloadVideo");

  const revealImmediately = () => {
    body?.classList.remove("preload-pending", "preload-exit", "preload-video-ready", "preload-video-slow");
    if (preloader && preloader.isConnected) {
      preloader.remove();
    }
  };

  if (!body || !preloader || !preloaderVideo) {
    revealImmediately();
    return;
  }

  const preloaderAlreadySeen = readSessionFlag(PRELOADER_SESSION_KEY);
  if (preloaderAlreadySeen) {
    revealImmediately();
    return;
  }

  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ((!isMobileViewport && !hasCoarsePointer) || prefersReducedMotion) {
    writeSessionFlag(PRELOADER_SESSION_KEY);
    revealImmediately();
    return;
  }

  // Prevent stuck black screen after returning from external app in same session.
  writeSessionFlag(PRELOADER_SESSION_KEY);

  const preloadSeconds = 3.6;
  const exitAnimationMs = 900;
  const maxBootstrapWaitMs = 5200;
  let startedAt = performance.now();
  let isFinished = false;
  let hasFirstFrame = false;
  let wasHidden = false;
  let forceFinishTimer = 0;
  let hardFallbackTimer = 0;
  let playRetryTimer = 0;
  let slowVideoTimer = 0;

  preloaderVideo.muted = true;
  preloaderVideo.defaultMuted = true;
  preloaderVideo.playsInline = true;

  const forceRevealNow = () => {
    if (isFinished) return;
    isFinished = true;
    clearTimeout(forceFinishTimer);
    clearTimeout(hardFallbackTimer);
    clearTimeout(playRetryTimer);
    clearTimeout(slowVideoTimer);
    preloaderVideo.pause();
    revealImmediately();
  };

  const finishPreloader = () => {
    if (isFinished) return;
    isFinished = true;
    clearTimeout(forceFinishTimer);
    clearTimeout(hardFallbackTimer);
    clearTimeout(playRetryTimer);
    clearTimeout(slowVideoTimer);
    preloaderVideo.pause();
    body.classList.add("preload-exit");

    window.setTimeout(() => {
      revealImmediately();
    }, exitAnimationMs);
  };

  forceFinishTimer = window.setTimeout(finishPreloader, preloadSeconds * 1000 + 480);

  const markFirstFrameReady = () => {
    if (hasFirstFrame || isFinished) return;
    hasFirstFrame = true;
    clearTimeout(slowVideoTimer);
    body.classList.add("preload-video-ready");
    body.classList.remove("preload-video-slow");
  };

  const finishWhenAllowed = () => {
    if (isFinished) return;

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, preloadSeconds * 1000 - elapsed);
    if (remaining > 0) {
      window.setTimeout(finishPreloader, remaining);
      return;
    }
    finishPreloader();
  };

  const retryVideoPlayback = () => {
    if (isFinished) return;
    const playPromise = preloaderVideo.play();
    if (!playPromise || typeof playPromise.catch !== "function") return;

    playPromise.catch(() => {
      clearTimeout(playRetryTimer);
      playRetryTimer = window.setTimeout(retryVideoPlayback, 220);
    });
  };

  preloaderVideo.addEventListener(
    "loadedmetadata",
    () => {
      if (preloaderVideo.duration && Number.isFinite(preloaderVideo.duration)) {
        const desiredRate = preloaderVideo.duration / preloadSeconds;
        preloaderVideo.playbackRate = Math.max(0.82, Math.min(1, desiredRate));
      }
    },
    { once: true }
  );

  preloaderVideo.addEventListener(
    "loadeddata",
    () => {
      markFirstFrameReady();
      retryVideoPlayback();
    },
    { once: true }
  );

  preloaderVideo.addEventListener("canplay", markFirstFrameReady);

  preloaderVideo.addEventListener("timeupdate", () => {
    if (!hasFirstFrame && preloaderVideo.currentTime > 0) {
      markFirstFrameReady();
    }
    if (preloaderVideo.currentTime >= preloadSeconds - 0.05) {
      finishWhenAllowed();
    }
  });
  preloaderVideo.addEventListener("ended", finishWhenAllowed, { once: true });

  if (typeof preloaderVideo.requestVideoFrameCallback === "function") {
    preloaderVideo.requestVideoFrameCallback(() => {
      markFirstFrameReady();
    });
  }

  hardFallbackTimer = window.setTimeout(() => {
    if (!isFinished) {
      finishPreloader();
    }
  }, maxBootstrapWaitMs);

  slowVideoTimer = window.setTimeout(() => {
    if (!isFinished && !hasFirstFrame) {
      body.classList.add("preload-video-slow");
    }
  }, 700);

  preloaderVideo.load();
  retryVideoPlayback();

  window.addEventListener("pointerdown", retryVideoPlayback, { once: true, passive: true });
  window.addEventListener("touchstart", retryVideoPlayback, { once: true, passive: true });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && body.classList.contains("preload-pending")) {
      forceRevealNow();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!body.classList.contains("preload-pending")) return;

    if (document.visibilityState === "hidden") {
      wasHidden = true;
      return;
    }

    retryVideoPlayback();

    // Only force-exit if user already left and returned to the same page state.
    if (!wasHidden) return;
    const elapsed = performance.now() - startedAt;
    if (elapsed > 380 && hasFirstFrame) {
      forceRevealNow();
    }
    wasHidden = false;
  });

  if (preloaderFallback && preloaderFallback.complete) {
    preloaderFallback.decoding = "async";
  }

  if (preloaderVideo.readyState >= 2) {
    markFirstFrameReady();
  }
}

function readSessionFlag(key) {
  try {
    return window.sessionStorage?.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key) {
  try {
    window.sessionStorage?.setItem(key, "1");
  } catch {
    // Ignore private-mode/session storage errors.
  }
}
