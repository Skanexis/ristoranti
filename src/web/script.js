
const state = {
  service: null,
  region: null,
  shipZone: null,
};
const VALID_SERVICES = ["meetup", "delivery", "ship"];
const SHIP_ZONES = [
  {
    id: "italy",
    title: "Ship da Italia",
    hint: "Spedizione dai punti presenti in Italia",
  },
  {
    id: "eu",
    title: "Ship da UE",
    hint: "Spedizione da altri paesi dell'Unione Europea",
  },
];
const PUBLIC_DATA_ENDPOINT = "/api/public-data";

let appData = fallbackData();

const els = {
  serviceOptions: document.getElementById("serviceOptions"),
  selectionStep: document.getElementById("selectionStep"),
  selectionTitle: document.getElementById("selectionTitle"),
  selectionHint: document.getElementById("selectionHint"),
  selectionContent: document.getElementById("selectionContent"),
  pointsStep: document.getElementById("pointsStep"),
  pointsTitle: document.getElementById("pointsTitle"),
  pointsContent: document.getElementById("pointsContent"),
  scrollTopBtn: document.getElementById("scrollTopBtn"),
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
    const shipZoneButton = event.target.closest("[data-ship-zone]");
    if (shipZoneButton && !shipZoneButton.disabled) {
      selectShipZone(shipZoneButton.dataset.shipZone);
      return;
    }

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
    return;
  } catch {
    appData = loadFallbackAppData();
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
    regions: [],
  };
}

function selectService(serviceId) {
  const service = normalizeServiceId(serviceId);
  if (!service) return;

  state.service = service;
  state.region = null;
  state.shipZone = null;

  normalizeState();
  highlightActiveOption(els.serviceOptions, `[data-service='${cssEscape(state.service)}']`);
  renderRegionStep();
  renderPointsStep();
  triggerSelectionHaptic();

  window.requestAnimationFrame(() =>
    focusStepIfNeeded(els.selectionStep, {
      focusSelector: "[data-region]:not([disabled]), [data-ship-zone]:not([disabled])",
    })
  );
}

function selectRegion(regionId) {
  if (!state.service || state.service === "ship") return;

  const region = appData.regions.find((item) => item.id === regionId);
  if (!region) return;

  state.region = region.id;
  state.shipZone = null;

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

function selectShipZone(zoneId) {
  if (state.service !== "ship") return;

  const normalizedZone = normalizeShipZoneId(zoneId);
  if (!normalizedZone) return;

  state.shipZone = normalizedZone;
  state.region = null;

  normalizeState();
  highlightActiveOption(els.selectionContent, `[data-ship-zone='${cssEscape(state.shipZone)}']`);
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
  state.shipZone = normalizeShipZoneId(state.shipZone);

  if (!state.service) {
    state.region = null;
    state.shipZone = null;
    return;
  }

  if (state.service === "ship") {
    state.region = null;
    if (!state.shipZone) return;

    const activeShipPoints = getActiveShipPointsByZone(state.shipZone);
    if (activeShipPoints.length === 0) {
      state.shipZone = null;
    }
    return;
  }

  state.shipZone = null;

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

  if (state.service === "ship") {
    renderShipZoneStep();
    return;
  }

  if (els.selectionHint) {
    els.selectionHint.textContent = "Le regioni non attive vengono disabilitate automaticamente.";
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
          <span class="region-meta">${formatAvailablePointsLabel(activeCount)}</span>
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

function renderShipZoneStep() {
  if (els.selectionHint) {
    els.selectionHint.textContent = "Scegli se spedire da Italia o da altri paesi dell'Unione Europea.";
  }
  els.selectionTitle.textContent = "Seleziona l'origine per Ship";

  const zoneMeta = SHIP_ZONES.map((zone) => ({
    ...zone,
    activeCount: getActiveShipPointsByZone(zone.id).length,
  }));

  const activeZones = zoneMeta.filter((zone) => zone.activeCount > 0);
  if (!state.shipZone && activeZones.length === 1) {
    state.shipZone = activeZones[0].id;
  }

  if (state.shipZone) {
    const selected = zoneMeta.find((zone) => zone.id === state.shipZone);
    if (!selected || selected.activeCount === 0) {
      state.shipZone = null;
    }
  }

  const zoneCards = zoneMeta
    .map((zone) => {
      const isDisabled = zone.activeCount === 0;
      return `
        <button
          type="button"
          class="option ${isDisabled ? "is-disabled" : ""}"
          data-ship-zone="${escapeHtmlAttr(zone.id)}"
          ${isDisabled ? "disabled" : ""}
        >
          <span class="region-name">${escapeHtml(zone.title)}</span>
          <span class="region-meta">${formatAvailablePointsLabel(zone.activeCount)}</span>
          <span class="region-meta">${escapeHtml(zone.hint)}</span>
        </button>
      `;
    })
    .join("");

  els.selectionContent.innerHTML = `<div class="region-grid">${zoneCards}</div>`;
  els.selectionStep.classList.remove("hidden");

  if (state.shipZone) {
    highlightActiveOption(els.selectionContent, `[data-ship-zone='${cssEscape(state.shipZone)}']`);
  }
}

function renderPointsStep() {
  if (!state.service) {
    els.pointsStep.classList.add("hidden");
    return;
  }

  let activePoints = [];
  let emptyMessage = "";

  if (state.service === "ship") {
    if (!state.shipZone) {
      els.pointsStep.classList.add("hidden");
      return;
    }
    const shipZoneLabel = getShipZoneLabel(state.shipZone);
    activePoints = getActiveShipPointsByZone(state.shipZone);
    els.pointsTitle.textContent = `${formatActivePointsTitle(activePoints.length)} - Ship da ${shipZoneLabel}`;
    emptyMessage = "Nessun punto disponibile per questa origine di spedizione.";
  } else {
    if (!state.region) {
      els.pointsStep.classList.add("hidden");
      return;
    }

    const region = appData.regions.find((item) => item.id === state.region);
    if (!region) {
      els.pointsStep.classList.add("hidden");
      return;
    }

    activePoints = getActivePointsByRegion(region.id);
    els.pointsTitle.textContent = `${formatActivePointsTitle(activePoints.length)} in ${region.name}`;
    emptyMessage = "Nessun punto disponibile per questo servizio nella regione selezionata.";
  }

  activePoints = sortPointsByStarsPriority(activePoints);

  if (activePoints.length === 0) {
    els.pointsContent.innerHTML = `
      <div class="points-empty">
        ${emptyMessage}
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
      const shipCountryText = getPointShipCountryText(point);

      return `
        <article class="point-card" aria-label="Punto ${escapeHtmlAttr(point.name)}">
          <header class="point-header">
            <div class="point-logo">${logoHtml}</div>
            <div>
              <h3 class="point-name">${escapeHtml(point.name)}</h3>
              ${shipCountryText ? `<p class="point-ship-country">${escapeHtml(shipCountryText)}</p>` : ""}
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

function getActivePointsByRegion(regionId, serviceId = state.service) {
  const region = appData.regions.find((item) => item.id === regionId);
  if (!region || !serviceId) return [];

  return (region.activePoints || []).filter(
    (point) => Array.isArray(point.services) && point.services.includes(serviceId)
  );
}

function getActiveShipPointsByZone(zoneId) {
  const normalizedZone = normalizeShipZoneId(zoneId);
  if (!normalizedZone) return [];

  const result = [];
  for (const region of appData.regions || []) {
    const regionPoints = getActivePointsByRegion(region.id, "ship");
    for (const point of regionPoints) {
      if (resolveShipZoneForPoint(point, region) !== normalizedZone) continue;
      result.push({
        ...point,
        regionName: region.name,
      });
    }
  }

  return result;
}

function sortPointsByStarsPriority(points) {
  if (!Array.isArray(points) || points.length <= 1) {
    return Array.isArray(points) ? points : [];
  }

  return points
    .map((point, index) => ({ point, index }))
    .sort((a, b) => {
      const starsDiff = clampStars(b.point?.stars) - clampStars(a.point?.stars);
      if (starsDiff !== 0) return starsDiff;
      return a.index - b.index;
    })
    .map((entry) => entry.point);
}

function resolveShipZoneForPoint(point, region) {
  const explicitZone = normalizeShipZoneId(point?.shipOrigin);
  if (explicitZone) return explicitZone;

  const regionZone = normalizeShipZoneId(region?.shipOrigin);
  if (regionZone) return regionZone;

  const probe = `${region?.id || ""} ${region?.name || ""} ${region?.hubs || ""}`.toLowerCase();
  if (/\b(ue|eu|unione europea|european union)\b/.test(probe)) {
    return "eu";
  }

  return "italy";
}

function normalizeShipZoneId(zoneId) {
  const candidate = String(zoneId || "")
    .trim()
    .toLowerCase();
  if (candidate === "italy" || candidate === "eu") {
    return candidate;
  }
  return null;
}

function getShipZoneLabel(zoneId) {
  const zone = SHIP_ZONES.find((item) => item.id === zoneId);
  return zone?.id === "eu" ? "UE" : "Italia";
}

function formatPointWord(count) {
  return Number(count) === 1 ? "punto" : "punti";
}

function formatAvailablePointsLabel(count) {
  const availabilityWord = Number(count) === 1 ? "disponibile" : "disponibili";
  return `${count} ${formatPointWord(count)} ${availabilityWord}`;
}

function formatActivePointsTitle(count) {
  return Number(count) === 1 ? "Punto attivo" : "Punti attivi";
}

function getPointShipCountryText(point) {
  if (state.service !== "ship" || state.shipZone !== "eu") return "";
  const country = String(point?.shipCountry || "").trim();
  if (!country) {
    return "Paese di spedizione: non specificato";
  }
  return `Paese di spedizione: ${country}`;
}

function getServiceLabel(serviceId) {
  return appData.serviceLabels?.[serviceId] || serviceId;
}

function normalizeServiceId(serviceId) {
  if (!serviceId) return null;
  return VALID_SERVICES.includes(serviceId) ? serviceId : null;
}

function setupFloatingTools() {
  updateScrollTopButton();

  if (els.scrollTopBtn) {
    els.scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("scroll", updateScrollTopButton, { passive: true });
}

function updateScrollTopButton() {
  if (!els.scrollTopBtn) return;
  const isVisible = window.scrollY > 320;
  els.scrollTopBtn.classList.toggle("is-visible", isVisible);
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
  const hasStar = clampStars(stars) === 1;
  if (!hasStar) {
    return "";
  }
  const starIcon = `<span class="point-star ${hasStar ? "is-filled" : ""}" aria-hidden="true">★</span>`;
  const label = hasStar ? `<span class="point-star-label">Platinum</span>` : "";

  return `
    <div class="point-stars ${hasStar ? "is-starred" : ""}" aria-label="${hasStar ? "Punto premium" : "Punto standard"}">
      <div class="point-stars-row">${starIcon}${label}</div>
    </div>
  `;
}

function clampStars(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(1, Math.round(num)));
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

  const revealImmediately = () => {
    body?.classList.remove(
      "preload-pending",
      "preload-exit"
    );
    if (preloader && preloader.isConnected) {
      preloader.remove();
    }
  };

  if (!body || !preloader) {
    revealImmediately();
    return;
  }

  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTelegramClient = isTelegramWebView();

  if ((!isMobileViewport && !hasCoarsePointer) || prefersReducedMotion) {
    revealImmediately();
    return;
  }

  const preloaderVisibleMs = isTelegramClient ? 850 : 1200;
  const preloaderExitMs = 300;
  let preloaderDone = false;

  const finishPreloader = () => {
    if (preloaderDone) return;
    preloaderDone = true;
    body.classList.add("preload-exit");
    window.setTimeout(() => {
      revealImmediately();
    }, preloaderExitMs);
  };

  window.setTimeout(finishPreloader, preloaderVisibleMs);

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && body.classList.contains("preload-pending")) {
      finishPreloader();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!body.classList.contains("preload-pending")) return;
    if (document.visibilityState === "visible") {
      finishPreloader();
    }
  });
}

function isTelegramWebView() {
  const ua = String(navigator.userAgent || "");
  if (/Telegram/i.test(ua) || Boolean(window.Telegram?.WebApp)) {
    return true;
  }

  try {
    const params = new URLSearchParams(window.location.search || "");
    for (const key of params.keys()) {
      if (key.indexOf("tgWebApp") === 0) {
        return true;
      }
    }
  } catch {
    // Ignore malformed URL state.
  }

  return false;
}
