
const state = {
  service: null,
  region: null,
  compareRegions: [],
  mapScale: 1,
  mapOffsetX: 0,
  mapOffsetY: 0,
  screen: "map",
};
const VALID_SERVICES = ["meetup", "delivery", "ship", "other"];
const REGION_PRIORITY_SERVICES = ["meetup", "delivery"];
const WORKSPACE_SERVICES = ["meetup", "delivery", "ship", "other"];
const HOME_DIRECT_SERVICES = ["ship", "meetup", "other"];
const EXPERIENCE_STEPS = ["service", "region", "points"];
const REGION_SVG_SHAPES = {
  "valle-daosta": {
    path: "M99 44 L121 38 L136 49 L126 64 L102 64 L92 54 Z",
    cx: 114,
    cy: 52,
  },
  piemonte: {
    path: "M82 76 L122 65 L154 78 L146 109 L101 118 L79 99 Z",
    cx: 113,
    cy: 92,
  },
  liguria: {
    path: "M93 118 L128 116 L170 123 L186 132 L169 145 L126 142 L92 132 Z",
    cx: 137,
    cy: 131,
  },
  lombardia: {
    path: "M148 74 L196 67 L229 78 L222 104 L182 113 L149 103 Z",
    cx: 188,
    cy: 90,
  },
  "trentino-alto-adige": {
    path: "M184 42 L222 38 L243 57 L227 79 L191 78 L174 59 Z",
    cx: 210,
    cy: 58,
  },
  veneto: {
    path: "M228 78 L276 76 L304 92 L291 118 L244 120 L221 104 Z",
    cx: 262,
    cy: 97,
  },
  "friuli-venezia-giulia": {
    path: "M304 90 L334 96 L342 118 L320 127 L293 117 Z",
    cx: 320,
    cy: 108,
  },
  "emilia-romagna": {
    path: "M143 118 L187 112 L236 118 L266 126 L258 144 L200 149 L152 143 Z",
    cx: 206,
    cy: 131,
  },
  toscana: {
    path: "M135 145 L170 151 L191 184 L177 221 L143 227 L120 200 L122 169 Z",
    cx: 156,
    cy: 186,
  },
  lazio: {
    path: "M178 184 L208 187 L229 214 L220 249 L191 259 L171 239 L170 210 Z",
    cx: 200,
    cy: 223,
  },
  umbria: {
    path: "M202 167 L226 170 L238 191 L223 214 L202 208 L194 185 Z",
    cx: 216,
    cy: 190,
  },
  marche: {
    path: "M239 171 L270 178 L281 201 L265 229 L236 224 L224 201 Z",
    cx: 252,
    cy: 199,
  },
  abruzzo: {
    path: "M228 214 L257 213 L274 233 L261 258 L229 255 L218 235 Z",
    cx: 246,
    cy: 235,
  },
  molise: {
    path: "M228 255 L254 255 L264 273 L249 289 L226 281 L220 266 Z",
    cx: 242,
    cy: 271,
  },
  campania: {
    path: "M171 241 L197 262 L210 291 L187 317 L159 309 L150 277 Z",
    cx: 179,
    cy: 281,
  },
  basilicata: {
    path: "M209 279 L239 286 L250 312 L231 333 L204 327 L193 302 Z",
    cx: 222,
    cy: 307,
  },
  calabria: {
    path: "M231 332 L252 337 L262 360 L250 389 L230 402 L218 385 L223 359 Z",
    cx: 240,
    cy: 366,
  },
  puglia: {
    path: "M259 258 L292 253 L313 275 L306 307 L279 324 L266 307 L272 285 Z",
    cx: 286,
    cy: 288,
  },
  sardegna: {
    path: "M88 246 L108 236 L126 254 L123 301 L103 324 L84 311 L81 269 Z",
    cx: 104,
    cy: 280,
  },
  sicilia: {
    path: "M178 354 L234 344 L273 358 L251 381 L196 385 L164 370 Z",
    cx: 219,
    cy: 365,
  },
};
const REGION_MAP_FALLBACK_LAYOUT = {
  "valle-daosta": { x: 114, y: 52 },
  piemonte: { x: 113, y: 92 },
  liguria: { x: 137, y: 131 },
  lombardia: { x: 188, y: 90 },
  "trentino-alto-adige": { x: 210, y: 58 },
  veneto: { x: 262, y: 97 },
  "friuli-venezia-giulia": { x: 320, y: 108 },
  "emilia-romagna": { x: 206, y: 131 },
  toscana: { x: 156, y: 186 },
  lazio: { x: 200, y: 223 },
  umbria: { x: 216, y: 190 },
  marche: { x: 252, y: 199 },
  abruzzo: { x: 246, y: 235 },
  molise: { x: 242, y: 271 },
  campania: { x: 179, y: 281 },
  basilicata: { x: 222, y: 307 },
  calabria: { x: 240, y: 366 },
  puglia: { x: 286, y: 288 },
  sardegna: { x: 104, y: 280 },
  sicilia: { x: 219, y: 365 },
};
const ITALY_REGION_NAMES = {
  "valle-daosta": "Valle d'Aosta",
  piemonte: "Piemonte",
  liguria: "Liguria",
  lombardia: "Lombardia",
  "trentino-alto-adige": "Trentino-Alto Adige",
  veneto: "Veneto",
  "friuli-venezia-giulia": "Friuli-Venezia Giulia",
  "emilia-romagna": "Emilia-Romagna",
  toscana: "Toscana",
  umbria: "Umbria",
  marche: "Marche",
  lazio: "Lazio",
  abruzzo: "Abruzzo",
  molise: "Molise",
  campania: "Campania",
  puglia: "Puglia",
  basilicata: "Basilicata",
  calabria: "Calabria",
  sardegna: "Sardegna",
  sicilia: "Sicilia",
};
const MOBILE_REGION_LABELS = {
  "valle-daosta": "VAL D'AOSTA",
  piemonte: "PIEMONTE",
  liguria: "LIGURIA",
  lombardia: "LOMBARDIA",
  "trentino-alto-adige": "TRENTINO",
  veneto: "VENETO",
  "friuli-venezia-giulia": "FRIULI",
  "emilia-romagna": "EMILIA",
  toscana: "TOSCANA",
  umbria: "UMBRIA",
  marche: "MARCHE",
  lazio: "LAZIO",
  abruzzo: "ABRUZZO",
  molise: "MOLISE",
  campania: "CAMPANIA",
  basilicata: "BASILICATA",
  calabria: "CALABRIA",
  puglia: "PUGLIA",
  sardegna: "SARDEGNA",
  sicilia: "SICILIA",
};
const REGION_MAP_VIEWBOX =
  typeof window !== "undefined" &&
  window.RIItalyRegionsMap &&
  typeof window.RIItalyRegionsMap.viewBox === "string"
    ? window.RIItalyRegionsMap.viewBox
    : "0 0 360 430";
const REGION_MAP_DISPLAY_VIEWBOX = "10 10 326 410";
const PUBLIC_DATA_ENDPOINT = "/api/public-data";
const LOGO_PREFETCH_LIMIT = 5;
const warmedLogoOrigins = new Set();
const prefetchedLogoUrls = new Set();
const IS_MAP_ONLY_HOME = document.querySelector(".map-only-app") !== null;

applyGeneratedRegionMapData();

let appData = fallbackData();
let mapPanSession = null;
let activeTiltCard = null;

const els = {
  appFlow: document.querySelector(".flow"),
  serviceStep: document.getElementById("serviceStep"),
  serviceOptions: document.getElementById("serviceOptions"),
  selectionStep: document.getElementById("selectionStep"),
  selectionTitle: document.getElementById("selectionTitle"),
  selectionHint: document.getElementById("selectionHint"),
  selectionContent: document.getElementById("selectionContent"),
  pointsStep: document.getElementById("pointsStep"),
  pointsTitle: document.getElementById("pointsTitle"),
  pointsContent: document.getElementById("pointsContent"),
  heroTelegramLink: document.getElementById("heroTelegramLink"),
  scrollTopBtn: document.getElementById("scrollTopBtn"),
  experienceHud: null,
};

removeExperienceHud();
mountExperienceHud();
setupMobilePreloader();
setupTelegram();
bindEvents();
setupInteractiveUi();
setupFloatingTools();
void initializeAppData();

async function initializeAppData() {
  normalizeState();
  renderHeroSocialLinks();
  renderMapHomeStep();
  renderPointsStep();
  updateExperienceHud();

  await loadAppDataFromServer();
  normalizeState();
  renderHeroSocialLinks();
  renderMapHomeStep();
  renderPointsStep();
  updateExperienceHud();
  window.dispatchEvent(new CustomEvent("ri:app-ready"));
}

function bindEvents() {
  if (els.serviceOptions) {
    els.serviceOptions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-service]");
      if (!button) return;
      selectService(button.dataset.service);
    });
  }

  els.selectionContent.addEventListener("click", (event) => {
    const screenActionButton = event.target.closest("[data-screen-action]");
    if (screenActionButton) {
      runScreenAction(screenActionButton.dataset.screenAction);
      return;
    }

    const regionActionButton = event.target.closest("[data-region-action]");
    if (regionActionButton) {
      runRegionQuickAction(regionActionButton.dataset.regionAction);
      return;
    }

    const compareButton = event.target.closest("[data-compare-region]");
    if (compareButton && !compareButton.disabled) {
      toggleCompareRegion(compareButton.dataset.compareRegion);
      return;
    }

    const mapActionButton = event.target.closest("[data-map-action]");
    if (mapActionButton) {
      runMapAction(mapActionButton.dataset.mapAction);
      return;
    }

    const regionButton = event.target.closest("[data-region]");
    if (!regionButton || regionButton.disabled || regionButton.getAttribute("data-disabled") === "true") return;
    flashRegionPress(regionButton);
    commitRegionSelection(regionButton.dataset.region);
  });

  els.selectionContent.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const regionNode = event.target.closest("[data-region]");
    if (!regionNode || regionNode.getAttribute("data-disabled") === "true") return;
    event.preventDefault();
    flashRegionPress(regionNode);
    commitRegionSelection(regionNode.dataset.region);
  });

  els.selectionContent.addEventListener("pointerdown", (event) => {
    const stage = event.target.closest(".italy-map-stage");
    if (!stage) return;
    const regionNode = event.target.closest("[data-region]");
    if (regionNode && regionNode.getAttribute("data-disabled") !== "true") {
      flashRegionPress(regionNode);
    }
    if (stage.classList.contains("pro-static-map")) return;
    if (event.target.closest("[data-region]") || event.target.closest("[data-map-action]")) return;
    startMapPan(stage, event);
  });

  window.addEventListener("pointermove", handleMapPanMove, { passive: false });
  window.addEventListener("pointerup", stopMapPan);
  window.addEventListener("pointercancel", stopMapPan);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    void refreshLiveData();
  });
}

function setupInteractiveUi() {
  setupServiceCardTilt();
  setupInteractivePressEffects();
  setupAmbientPointer();
  setupPointerAwareSurfaces();
}

function setupServiceCardTilt() {
  if (!els.serviceOptions) return;
  if (isCoarsePointerDevice()) return;

  const resetCard = (card) => {
    if (!(card instanceof HTMLElement)) return;
    card.classList.remove("is-tilt");
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
    card.style.removeProperty("--glow-x");
    card.style.removeProperty("--glow-y");
  };

  els.serviceOptions.addEventListener("pointermove", (event) => {
    const card = event.target.closest("#serviceOptions .option");
    if (!(card instanceof HTMLElement) || card.classList.contains("is-disabled")) return;

    if (activeTiltCard && activeTiltCard !== card) {
      resetCard(activeTiltCard);
    }
    activeTiltCard = card;

    const rect = card.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const px = localX / Math.max(rect.width, 1) - 0.5;
    const py = localY / Math.max(rect.height, 1) - 0.5;
    const tiltX = clampNumber(py * -10, -5.5, 5.5);
    const tiltY = clampNumber(px * 12, -6.5, 6.5);

    card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    card.style.setProperty("--glow-x", `${(localX / rect.width) * 100}%`);
    card.style.setProperty("--glow-y", `${(localY / rect.height) * 100}%`);
    card.classList.add("is-tilt");
  });

  els.serviceOptions.addEventListener("pointerleave", () => {
    if (!activeTiltCard) return;
    resetCard(activeTiltCard);
    activeTiltCard = null;
  });

  els.serviceOptions.addEventListener("pointerup", () => {
    if (!activeTiltCard) return;
    activeTiltCard.classList.remove("is-tilt");
  });
}

function setupInteractivePressEffects() {
  const interactiveSelector =
    ".option, .region-action-btn, .region-compare-btn, .map-control-btn, .map-region-chip, .pro-tab, .pro-rail-btn, .pro-signal-card, .pro-region-row, .pro-primary-action, .map-ux-action, .map-ux-service-btn, .workspace-service-tab, .map-ux-clear, .workspace-back, .workspace-clear, .workspace-region-shortcut, .point-link, .floating-btn, .hero-social-link, .hero-services-link";

  const pop = (node) => {
    if (!(node instanceof HTMLElement)) return;
    node.classList.remove("is-press");
    void node.offsetWidth;
    node.classList.add("is-press");
    window.setTimeout(() => node.classList.remove("is-press"), 220);
  };

  document.addEventListener("pointerdown", (event) => {
    const target = event.target.closest(interactiveSelector);
    if (!(target instanceof HTMLElement)) return;
    if (target.matches(":disabled") || target.getAttribute("aria-disabled") === "true") return;
    if (isCoarsePointerDevice()) return;

    pop(target);
    addRipple(target, event.clientX, event.clientY);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest(interactiveSelector);
    if (!(target instanceof HTMLElement)) return;
    pop(target);
  });
}

function addRipple(host, clientX, clientY) {
  if (!(host instanceof HTMLElement)) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  if (isCoarsePointerDevice()) return;

  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.3;
  const ripple = document.createElement("span");
  ripple.className = "ui-ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${clientX - rect.left}px`;
  ripple.style.top = `${clientY - rect.top}px`;
  host.appendChild(ripple);

  window.setTimeout(() => {
    ripple.remove();
  }, 620);
}

function flashRegionPress(regionNode) {
  if (!regionNode?.classList) return;
  regionNode.classList.remove("is-tapping");

  if (isCoarsePointerDevice()) {
    window.requestAnimationFrame(() => {
      regionNode.classList.add("is-tapping");
      window.setTimeout(() => regionNode.classList?.remove("is-tapping"), 210);
    });
    return;
  }

  void regionNode.getBoundingClientRect?.();
  regionNode.classList.add("is-tapping");
  window.setTimeout(() => regionNode.classList?.remove("is-tapping"), 260);
}

function setupAmbientPointer() {
  if (!els.selectionContent || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  if (isCoarsePointerDevice()) return;

  els.selectionContent.addEventListener(
    "pointermove",
    (event) => {
      const shell = event.target.closest(".static-map-shell");
      if (!(shell instanceof HTMLElement)) return;

      const rect = shell.getBoundingClientRect();
      const x = clampNumber(((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100, 0, 100);
      const y = clampNumber(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100, 0, 100);
      const tiltX = clampNumber((y - 50) * -0.045, -2.2, 2.2);
      const tiltY = clampNumber((x - 50) * 0.055, -2.4, 2.4);

      shell.style.setProperty("--cursor-x", `${x.toFixed(2)}%`);
      shell.style.setProperty("--cursor-y", `${y.toFixed(2)}%`);
      shell.style.setProperty("--map-tilt-x", `${tiltX.toFixed(2)}deg`);
      shell.style.setProperty("--map-tilt-y", `${tiltY.toFixed(2)}deg`);
    },
    { passive: true }
  );

  els.selectionContent.addEventListener(
    "pointerleave",
    (event) => {
      const shell = event.target.closest?.(".static-map-shell") || els.selectionContent.querySelector(".static-map-shell");
      if (!(shell instanceof HTMLElement)) return;
      shell.style.removeProperty("--cursor-x");
      shell.style.removeProperty("--cursor-y");
      shell.style.removeProperty("--map-tilt-x");
      shell.style.removeProperty("--map-tilt-y");
    },
    { passive: true }
  );
}

function setupPointerAwareSurfaces() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  if (isCoarsePointerDevice()) return;

  const surfaceSelector = ".workspace-point-card, .map-ux-dock, .map-ux-action, .map-ux-service-btn, .workspace-service-tab, .point-link, .region-service-chip, .point-service-pill";

  document.addEventListener(
    "pointermove",
    (event) => {
      const surface = event.target.closest(surfaceSelector);
      if (!(surface instanceof HTMLElement)) return;

      const rect = surface.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const x = clampNumber((localX / Math.max(rect.width, 1)) * 100, 0, 100);
      const y = clampNumber((localY / Math.max(rect.height, 1)) * 100, 0, 100);
      const pushX = clampNumber((x - 50) * 0.035, -1.8, 1.8);
      const pushY = clampNumber((y - 50) * 0.035, -1.8, 1.8);

      surface.style.setProperty("--card-x", `${x.toFixed(2)}%`);
      surface.style.setProperty("--card-y", `${y.toFixed(2)}%`);
      surface.style.setProperty("--magnet-x", `${pushX.toFixed(2)}px`);
      surface.style.setProperty("--magnet-y", `${pushY.toFixed(2)}px`);
      surface.classList.add("is-pointer-aware");
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerout",
    (event) => {
      const surface = event.target.closest(surfaceSelector);
      if (!(surface instanceof HTMLElement)) return;
      if (surface.contains(event.relatedTarget)) return;

      surface.classList.remove("is-pointer-aware");
      surface.style.removeProperty("--card-x");
      surface.style.removeProperty("--card-y");
      surface.style.removeProperty("--magnet-x");
      surface.style.removeProperty("--magnet-y");
    },
    { passive: true }
  );
}

function commitRegionSelection(regionId) {
  if (!IS_MAP_ONLY_HOME) {
    selectRegion(regionId);
    return;
  }

  window.setTimeout(() => selectRegion(regionId), isCoarsePointerDevice() ? 145 : 120);
}

function mountExperienceHud() {
  if (!els.appFlow || !els.serviceStep || document.getElementById("experienceHud")) {
    els.experienceHud = document.getElementById("experienceHud");
    return;
  }

  const hud = document.createElement("section");
  hud.id = "experienceHud";
  hud.className = "experience-hud card reveal";
  hud.innerHTML = `
    <div class="experience-hud-top">
      <p class="experience-hud-kicker">Navigatore</p>
      <h2 class="experience-hud-title">Percorso Live</h2>
      <p class="experience-hud-note" data-hud-note>Seleziona un servizio per iniziare.</p>
    </div>
    <div class="experience-hud-stats">
      <article class="experience-stat">
        <p class="experience-stat-label">Regioni</p>
        <p class="experience-stat-value" data-hud-regions>0</p>
      </article>
      <article class="experience-stat">
        <p class="experience-stat-label">Punti attivi</p>
        <p class="experience-stat-value" data-hud-points>0</p>
      </article>
      <article class="experience-stat">
        <p class="experience-stat-label">Servizio</p>
        <p class="experience-stat-value experience-stat-value--text" data-hud-service>--</p>
      </article>
    </div>
    <div class="experience-hud-steps">
      ${EXPERIENCE_STEPS.map(
        (stepId, index) => `
          <span class="experience-step-pill" data-step-pill="${escapeHtmlAttr(stepId)}">
            ${String(index + 1).padStart(2, "0")} ${escapeHtml(stepId)}
          </span>
        `
      ).join("")}
    </div>
  `;

  els.appFlow.insertBefore(hud, els.serviceStep);
  els.experienceHud = hud;
}

function removeExperienceHud() {
  const existing = document.getElementById("experienceHud");
  if (existing?.parentNode) {
    existing.parentNode.removeChild(existing);
  }
  els.experienceHud = null;
}

function updateExperienceHud() {
  const hud = els.experienceHud || document.getElementById("experienceHud");
  if (!hud) return;

  const regionsValue = hud.querySelector("[data-hud-regions]");
  const pointsValue = hud.querySelector("[data-hud-points]");
  const serviceValue = hud.querySelector("[data-hud-service]");
  const noteValue = hud.querySelector("[data-hud-note]");

  const activeRegionsForService = getActiveRegionsForCurrentSelection();
  const activePointsForService = getActivePointsCountForCurrentSelection();

  if (regionsValue) {
    regionsValue.textContent = String(activeRegionsForService);
  }
  if (pointsValue) {
    pointsValue.textContent = String(activePointsForService);
  }
  if (serviceValue) {
    serviceValue.textContent = state.service ? getServiceLabel(state.service) : "--";
  }
  if (noteValue) {
    if (!state.service) {
      noteValue.textContent = "Seleziona un servizio per iniziare.";
    } else if (!state.region) {
      noteValue.textContent = "Scegli una regione dalla mappa o dalla lista.";
    } else {
      noteValue.textContent = "Perfetto, ora esplora i punti attivi e apri i social disponibili.";
    }
  }

  const progress = getJourneyProgressState();
  hud.querySelectorAll("[data-step-pill]").forEach((pill) => {
    const pillId = pill.getAttribute("data-step-pill");
    const stateValue = progress[pillId];
    pill.classList.toggle("is-current", stateValue === "current");
    pill.classList.toggle("is-done", stateValue === "done");
  });
}

function getJourneyProgressState() {
  const stepStates = {
    service: "pending",
    region: "pending",
    points: "pending",
  };

  if (!state.service) {
    stepStates.service = "current";
    return stepStates;
  }

  stepStates.service = "done";

  stepStates.region = state.region ? "done" : "current";
  stepStates.points = state.region ? "current" : "pending";
  return stepStates;
}

function getActiveRegionsForCurrentSelection() {
  if (!Array.isArray(appData.regions)) return 0;

  if (!state.service) {
    return appData.regions.filter((region) => (region.activePoints || []).length > 0).length;
  }

  return appData.regions.filter((region) => getWorkspacePointsByService(region.id, state.service).length > 0).length;
}

function getActivePointsCountForCurrentSelection() {
  if (!state.service) {
    return (appData.regions || []).reduce((acc, region) => acc + (region.activePoints || []).length, 0);
  }

  if (state.region) {
    return getWorkspacePointsByService(state.region, state.service).length;
  }

  return getActivePointsByService(state.service).length;
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
  renderHeroSocialLinks();
  renderMapHomeStep();
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
      meetup: "Meetup",
      delivery: "Delivery",
      ship: "Ship",
      other: "Altro",
    },
    supportTelegramUrl: "https://t.me/SHLC26",
    regions: [],
    otherCategories: {},
    otherCategoryLabels: {},
  };
}

function getAllMapRegions() {
  return Object.keys(ITALY_REGION_NAMES).map((id) => ({
    id,
    name: ITALY_REGION_NAMES[id],
    hubs: "",
    activePoints: [],
  }));
}

function getRegionById(regionId) {
  const id = String(regionId || "").trim();
  if (!id) return null;

  return appData.regions.find((region) => region.id === id) || getAllMapRegions().find((region) => region.id === id) || null;
}

function selectService(serviceId) {
  const service = normalizeServiceId(serviceId);
  if (!service) return;

  state.service = service;
  state.region = null;
  state.compareRegions = [];

  normalizeState();
  if (els.serviceOptions) {
    highlightActiveOption(els.serviceOptions, `[data-service='${cssEscape(state.service)}']`);
  }
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
  const region = getRegionById(regionId);
  if (!region) return;
  if (IS_MAP_ONLY_HOME && getMapSelectablePoints(region).length === 0) return;

  const previousService = REGION_PRIORITY_SERVICES.includes(state.service) ? state.service : null;
  const preservedService =
    IS_MAP_ONLY_HOME && previousService && getWorkspacePointsByService(region.id, previousService).length > 0
      ? previousService
      : null;

  state.region = region.id;
  state.service = IS_MAP_ONLY_HOME ? preservedService : detectBestServiceForRegion(region.id);
  state.compareRegions = [];
  state.screen = IS_MAP_ONLY_HOME && preservedService ? "region" : IS_MAP_ONLY_HOME ? "map" : "region";

  normalizeState();
  renderMapHomeStep();
  renderPointsStep();
  animateSelectedRegionPulse();
  triggerSelectionHaptic();

  if (!IS_MAP_ONLY_HOME) {
    window.requestAnimationFrame(() =>
      focusStepIfNeeded(els.pointsStep, {
        focusSelector: ".point-link",
      })
    );
  }
}

function detectBestServiceForRegion(regionId) {
  const region = appData.regions.find((item) => item.id === regionId);
  if (!region) return null;

  const candidates = IS_MAP_ONLY_HOME ? REGION_PRIORITY_SERVICES : WORKSPACE_SERVICES;
  let bestService = null;
  let bestCount = 0;

  for (const serviceId of candidates) {
    const count = getWorkspacePointsByService(regionId, serviceId).length;
    if (count > bestCount) {
      bestCount = count;
      bestService = serviceId;
    }
  }

  return bestCount > 0 ? bestService : null;
}

function normalizeState() {
  state.service = normalizeServiceId(state.service);
  state.screen = state.screen === "region" ? "region" : "map";

  if (!state.service) {
    state.compareRegions = [];
    if (state.region && !getRegionById(state.region)) {
      state.region = null;
    }
    if (!state.region) {
      state.screen = "map";
    }
    return;
  }

  const regionExists = Boolean(getRegionById(state.region));
  if (!regionExists) {
    state.region = null;
    if (HOME_DIRECT_SERVICES.includes(state.service) && getActivePointsByService(state.service).length > 0) {
      state.compareRegions = [];
      state.screen = "region";
      return;
    }
    state.screen = "map";
  }

  if (!state.region) return;

  if (!REGION_PRIORITY_SERVICES.includes(state.service)) {
    state.service = detectBestServiceForRegion(state.region);
    if (!state.service) {
      state.compareRegions = [];
      return;
    }
  }

  const activePoints = getWorkspacePointsByService(state.region, state.service);
  if (activePoints.length === 0) {
    state.service = detectBestServiceForRegion(state.region);
    if (!state.service) {
      state.compareRegions = [];
      return;
    }
  }

  const validCompare = (state.compareRegions || [])
    .map((id) => String(id || "").trim())
    .filter(Boolean)
    .filter((id, index, arr) => arr.indexOf(id) === index)
    .filter((id) => getActivePointsByRegion(id, state.service).length > 0)
    .slice(0, 2);
  state.compareRegions = validCompare;
}

function renderMapHomeStep() {
  const hadMarkup = Boolean(els.selectionContent?.firstElementChild);

  if (els.selectionHint) {
    els.selectionHint.textContent = "Seleziona una regione dalla mappa.";
  }
  if (els.selectionTitle) {
    els.selectionTitle.textContent = "Mappa interattiva d'Italia";
  }

  const regionMeta = getAllMapRegions().map((region) => {
    const dataRegion = (appData.regions || []).find((item) => item.id === region.id);
    const normalizedRegion = {
      ...region,
      ...dataRegion,
      id: region.id,
      name: dataRegion?.name || region.name,
      activePoints: Array.isArray(dataRegion?.activePoints) ? dataRegion.activePoints : [],
    };
    const activePoints = getMapSelectablePoints(normalizedRegion);

    return {
      region: normalizedRegion,
      activePoints,
      activeCount: activePoints.length,
      totalCount: activePoints.length,
      isDisabled: activePoints.length === 0,
    };
  });

  const selectedMeta = getSelectedRegionMeta(regionMeta);
  if (selectedMeta && REGION_PRIORITY_SERVICES.includes(state.service)) {
    prefetchPointLogos(
      sortPointsByStarsPriority(getActivePointsByRegion(selectedMeta.region.id, state.service)),
      isCoarsePointerDevice() ? 3 : LOGO_PREFETCH_LIMIT
    );
  }
  const mapSvg = buildInteractiveItalySvg(regionMeta, state.region);

  els.selectionContent.innerHTML = `
    <div class="app-screen-stack is-${escapeHtmlAttr(state.screen)}">
      ${buildProfessionalMapScreen(regionMeta, selectedMeta, mapSvg)}
      ${buildRegionWorkspaceScreen(regionMeta, selectedMeta)}
    </div>
  `;

  els.selectionStep.classList.remove("hidden");
  if (hadMarkup) {
    markMapHomeTransition();
  }
  if (state.region) {
    highlightActiveOption(els.selectionContent, `[data-region='${cssEscape(state.region)}']`);
  }
  applyMapViewportTransform();
  updateExperienceHud();
}

function renderRegionStep() {
  if (!state.service) {
    els.selectionStep.classList.add("hidden");
    els.selectionContent.innerHTML = "";
    updateExperienceHud();
    return;
  }

  if (els.selectionHint) {
    els.selectionHint.textContent = "Mappa interattiva: tocca una regione e il sistema mostra subito i punti attivi.";
  }
  els.selectionTitle.textContent = `Seleziona una regione per ${getServiceLabel(state.service)}`;

  if (!Array.isArray(appData.regions) || appData.regions.length === 0) {
    els.selectionContent.innerHTML = `
      <div class="points-empty">
        Nessuna regione configurata al momento.
      </div>
    `;
    els.selectionStep.classList.remove("hidden");
    updateExperienceHud();
    return;
  }

  const regionMeta = appData.regions.map((region) => {
    const activePoints = getActivePointsByRegion(region.id, state.service);
    return {
      region,
      activePoints,
      activeCount: activePoints.length,
      totalCount: Array.isArray(region.activePoints) ? region.activePoints.length : 0,
      isDisabled: activePoints.length === 0,
    };
  });

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

  const selectedMeta = regionMeta.find((entry) => entry.region.id === state.region) || null;

  const mapSvg = buildInteractiveItalySvg(regionMeta, state.region);

  const regionCards = regionMeta
    .map(({ region, activeCount, totalCount }) => {
      const isDisabled = activeCount === 0;
      return `
        <article class="region-card-shell">
          <button
            type="button"
            class="option region-list-option ${isDisabled ? "is-disabled" : ""}"
            data-region="${escapeHtmlAttr(region.id)}"
            ${isDisabled ? "disabled" : ""}
          >
            <span class="region-name">${escapeHtml(region.name)}</span>
            <span class="region-meta">${formatAvailablePointsLabel(activeCount)}</span>
            <span class="region-meta">Totale regione: ${totalCount} ${formatPointWord(totalCount)}</span>
            <span class="region-meta">${escapeHtml(region.hubs || "Nessun hub specificato")}</span>
          </button>
        </article>
      `;
    })
    .join("");
  const explorerClass = state.region ? "italy-explorer is-region-selected" : "italy-explorer";
  const mapStageClass = state.region ? "italy-map-stage is-minimized" : "italy-map-stage";

  els.selectionContent.innerHTML = `
    <div class="${explorerClass}">
      <div class="${mapStageClass}" role="group" aria-label="Mappa interattiva delle regioni italiane">
        <div class="italy-map-controls" aria-label="Controlli mappa">
          <button type="button" class="map-control-btn" data-map-action="zoom-in" aria-label="Zoom in">+</button>
          <button type="button" class="map-control-btn" data-map-action="zoom-out" aria-label="Zoom out">−</button>
          <button type="button" class="map-control-btn" data-map-action="pan-up" aria-label="Sposta in alto">↑</button>
          <button type="button" class="map-control-btn" data-map-action="pan-left" aria-label="Sposta a sinistra">←</button>
          <button type="button" class="map-control-btn" data-map-action="pan-right" aria-label="Sposta a destra">→</button>
          <button type="button" class="map-control-btn" data-map-action="pan-down" aria-label="Sposta in basso">↓</button>
          <button type="button" class="map-control-btn map-control-btn-reset" data-map-action="reset-view" aria-label="Ripristina vista mappa">Reimposta</button>
        </div>
        <div class="italy-map-grid" aria-hidden="true"></div>
        <div class="italy-map-viewport">
          ${mapSvg}
        </div>
      </div>
      ${buildRegionSpotlight(selectedMeta)}
      <div class="region-grid">${regionCards}</div>
    </div>
  `;
  els.selectionStep.classList.remove("hidden");

  if (state.region) {
    highlightActiveOption(els.selectionContent, `[data-region='${cssEscape(state.region)}']`);
  }

  applyMapViewportTransform();
  updateExperienceHud();
}

function renderRegionPreviewStep() {
  if (els.selectionHint) {
    els.selectionHint.textContent =
      "Mappa live: clicca una regione e il sistema seleziona automaticamente il servizio migliore.";
  }
  els.selectionTitle.textContent = "Mappa Live Italia";

  if (!Array.isArray(appData.regions) || appData.regions.length === 0) {
    els.selectionContent.innerHTML = `
      <div class="points-empty">
        Nessuna regione configurata al momento.
      </div>
    `;
    els.selectionStep.classList.remove("hidden");
    return;
  }

  const regionMeta = appData.regions.map((region) => {
    const activePoints = Array.isArray(region.activePoints) ? region.activePoints : [];
    return {
      region,
      activePoints,
      activeCount: activePoints.length,
      totalCount: activePoints.length,
    };
  });

  const mapSvg = buildInteractiveItalySvg(regionMeta, null);
  const regionCards = regionMeta
    .map(({ region, activeCount }) => {
      const isDisabled = activeCount === 0;
      const autoService = detectBestServiceForRegion(region.id);
      const autoServiceLabel = autoService
        ? `Auto servizio: ${getServiceLabel(autoService)}`
        : "Nessun servizio attivo";

      return `
        <article class="region-card-shell">
          <button
            type="button"
            class="option region-list-option ${isDisabled ? "is-disabled" : ""}"
            data-region="${escapeHtmlAttr(region.id)}"
            ${isDisabled ? "disabled" : ""}
          >
            <span class="region-name">${escapeHtml(region.name)}</span>
            <span class="region-meta">${formatAvailablePointsLabel(activeCount)}</span>
            <span class="region-meta">${escapeHtml(autoServiceLabel)}</span>
            <span class="region-meta">${escapeHtml(region.hubs || "Nessun hub specificato")}</span>
          </button>
        </article>
      `;
    })
    .join("");

  els.selectionContent.innerHTML = `
    <div class="preview-hint-pill">Live Preview attivo</div>
    <div class="italy-explorer">
      <div class="italy-map-stage hero-map-live" role="group" aria-label="Mappa live interattiva delle regioni">
        <div class="italy-map-grid" aria-hidden="true"></div>
        <div class="italy-map-viewport">
          ${mapSvg}
        </div>
      </div>
      <article class="region-spotlight">
        <p class="region-spotlight-kicker">Preview Mode</p>
        <h3 class="region-spotlight-title">Seleziona una regione per iniziare subito</h3>
        <p class="region-spotlight-note">Il servizio viene impostato automaticamente in base ai punti attivi della regione.</p>
      </article>
      <div class="region-grid">${regionCards}</div>
    </div>
  `;

  els.selectionStep.classList.remove("hidden");
  applyMapViewportTransform();
}

function runRegionQuickAction(actionId) {
  if (!state.service) return;

  const activeRegionMeta = (appData.regions || [])
    .map((region) => ({
      region,
      activeCount: getActivePointsByRegion(region.id, state.service).length,
    }))
    .filter((entry) => entry.activeCount > 0);

  if (actionId === "reset") {
    state.region = null;
    state.compareRegions = [];
    renderRegionStep();
    renderPointsStep();
    updateExperienceHud();
    return;
  }

  if (actionId === "compare-reset") {
    state.compareRegions = [];
    renderRegionStep();
    updateExperienceHud();
    return;
  }

  if (activeRegionMeta.length === 0) return;

  if (actionId === "best") {
    const best = [...activeRegionMeta].sort((a, b) => b.activeCount - a.activeCount)[0];
    if (best?.region?.id) {
      selectRegion(best.region.id);
    }
    return;
  }

  if (actionId === "random") {
    const pick = activeRegionMeta[Math.floor(Math.random() * activeRegionMeta.length)];
    if (pick?.region?.id) {
      selectRegion(pick.region.id);
    }
  }
}

function runScreenAction(actionId) {
  if (String(actionId || "").startsWith("service:")) {
    const service = normalizeServiceId(String(actionId).slice("service:".length));
    if (!WORKSPACE_SERVICES.includes(service)) return;

    if (!state.region) {
      if (!HOME_DIRECT_SERVICES.includes(service)) return;
      if (getActivePointsByService(service).length === 0) return;

      state.service = service;
      state.region = null;
      state.compareRegions = [];
      state.screen = "region";
      normalizeState();
      renderMapHomeStep();
      renderPointsStep();
      triggerSelectionHaptic();
      return;
    }

    if (!REGION_PRIORITY_SERVICES.includes(service)) return;
    if (getWorkspacePointsByService(state.region, service).length === 0) return;

    state.service = service;
    state.compareRegions = [];
    state.screen = "region";
    normalizeState();
    renderMapHomeStep();
    renderPointsStep();
    triggerSelectionHaptic();
    return;
  }

  if (actionId === "map") {
    if (state.region && !isItalyMapRegionId(state.region)) {
      state.region = null;
      state.compareRegions = [];
      normalizeState();
      renderMapHomeStep();
      renderPointsStep();
      triggerSelectionHaptic();
      return;
    }

    state.screen = "map";
    if (!setMapHomeScreenMode("map")) {
      renderMapHomeStep();
    }
    triggerSelectionHaptic();
    return;
  }

  if (actionId === "region" && state.region) {
    if (!state.service) return;
    state.screen = "region";
    if (!setMapHomeScreenMode("region")) {
      renderMapHomeStep();
    }
    triggerSelectionHaptic();
    return;
  }

  if (actionId === "clear-region") {
    state.region = null;
    state.service = null;
    state.compareRegions = [];
    state.screen = "map";
    renderMapHomeStep();
    renderPointsStep();
    triggerSelectionHaptic();
  }
}

function setMapHomeScreenMode(screen) {
  if (!IS_MAP_ONLY_HOME) return false;
  const nextScreen = screen === "region" ? "region" : "map";
  const stack = els.selectionContent?.querySelector(".app-screen-stack");
  if (!(stack instanceof HTMLElement)) return false;

  stack.classList.toggle("is-map", nextScreen === "map");
  stack.classList.toggle("is-region", nextScreen === "region");
  stack.setAttribute("data-screen", nextScreen);
  return true;
}

function markMapHomeTransition() {
  const content = els.selectionContent;
  if (!(content instanceof HTMLElement)) return;

  content.classList.remove("is-soft-refresh");
  window.requestAnimationFrame(() => {
    content.classList.add("is-soft-refresh");
    window.setTimeout(() => content.classList.remove("is-soft-refresh"), 240);
  });
}

function applyGeneratedRegionMapData() {
  const generated = window.RIItalyRegionsMap?.regions;
  if (!generated || typeof generated !== "object") return;
  if (!isGeneratedRegionMapUsable(generated)) {
    console.warn("Skipping generated region map data: invalid geometry bounds, using fallback map.");
    return;
  }

  for (const [rawKey, shape] of Object.entries(generated)) {
    const key = resolveRegionMapKey(rawKey);
    if (!key || !shape || typeof shape.path !== "string") continue;

    REGION_SVG_SHAPES[key] = {
      path: shape.path,
      cx: Number(shape.cx) || 0,
      cy: Number(shape.cy) || 0,
    };

    REGION_MAP_FALLBACK_LAYOUT[key] = {
      x: Number(shape.cx) || 0,
      y: Number(shape.cy) || 0,
    };
  }
}

function isGeneratedRegionMapUsable(generatedRegions) {
  if (!generatedRegions || typeof generatedRegions !== "object") return false;

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let usableShapes = 0;

  for (const shape of Object.values(generatedRegions)) {
    if (!shape || typeof shape.path !== "string") continue;
    const coords = shape.path.match(/-?\d*\.?\d+/g);
    if (!coords || coords.length < 4) continue;

    for (let i = 0; i + 1 < coords.length; i += 2) {
      const x = Number(coords[i]);
      const y = Number(coords[i + 1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    usableShapes += 1;
  }

  if (usableShapes < 10) return false;
  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
    return false;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 140 || height < 140) return false;

  const ratio = height / Math.max(width, 1);
  return ratio > 0.55 && ratio < 2.5;
}

function resolveRegionMapKey(regionId) {
  const raw = String(regionId || "")
    .trim()
    .toLowerCase();

  if (!raw) return "";

  const aliases = {
    "valle-d-aosta": "valle-daosta",
    "valle-daosta": "valle-daosta",
    "valledaosta": "valle-daosta",
    "trentino-altoadige": "trentino-alto-adige",
    "trentino-alto-adige": "trentino-alto-adige",
    "trentino-alto-adige-sudtirol": "trentino-alto-adige",
    "trentino-alto-adige-sudtirol-": "trentino-alto-adige",
    "friuli venezia giulia": "friuli-venezia-giulia",
  };

  if (aliases[raw]) return aliases[raw];

  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRegionMapLabel(region, regionMapKey) {
  const fullName = String(region?.name || "");
  const mobileLabel = MOBILE_REGION_LABELS[regionMapKey];
  const shouldUseMobileLabel =
    isCoarsePointerDevice() || Boolean(window.matchMedia?.("(max-width: 760px)").matches);

  return shouldUseMobileLabel && mobileLabel ? mobileLabel : fullName;
}

function runMapAction(actionId) {
  const nextScaleStep = 0.14;

  if (actionId === "zoom-in") {
    state.mapScale = clampNumber(state.mapScale + nextScaleStep, 0.9, 2.25);
  } else if (actionId === "zoom-out") {
    state.mapScale = clampNumber(state.mapScale - nextScaleStep, 0.9, 2.25);
  } else if (actionId === "reset-view") {
    state.mapScale = 1;
    state.mapOffsetX = 0;
    state.mapOffsetY = 0;
  } else if (actionId === "pan-left") {
    state.mapOffsetX -= 20;
  } else if (actionId === "pan-right") {
    state.mapOffsetX += 20;
  } else if (actionId === "pan-up") {
    state.mapOffsetY -= 20;
  } else if (actionId === "pan-down") {
    state.mapOffsetY += 20;
  } else {
    return;
  }

  clampMapOffsets();
  applyMapViewportTransform();
}

function startMapPan(stage, event) {
  if (!(stage instanceof HTMLElement)) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;

  mapPanSession = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startOffsetX: state.mapOffsetX,
    startOffsetY: state.mapOffsetY,
  };

  stage.classList.add("is-panning");
}

function handleMapPanMove(event) {
  if (!mapPanSession || event.pointerId !== mapPanSession.pointerId) return;
  event.preventDefault();

  const dx = event.clientX - mapPanSession.startX;
  const dy = event.clientY - mapPanSession.startY;
  state.mapOffsetX = mapPanSession.startOffsetX + dx;
  state.mapOffsetY = mapPanSession.startOffsetY + dy;
  clampMapOffsets();
  applyMapViewportTransform();
}

function stopMapPan(event) {
  if (!mapPanSession) return;
  if (event && event.pointerId !== undefined && event.pointerId !== mapPanSession.pointerId) return;
  mapPanSession = null;
  document.querySelectorAll(".italy-map-stage.is-panning").forEach((stage) => stage.classList.remove("is-panning"));
}

function clampMapOffsets() {
  const limit = Math.round(130 * Math.max(1, state.mapScale - 0.82));
  state.mapOffsetX = clampNumber(state.mapOffsetX, -limit, limit);
  state.mapOffsetY = clampNumber(state.mapOffsetY, -limit, limit);
}

function applyMapViewportTransform() {
  els.selectionContent
    ?.querySelectorAll(".italy-map-viewport")
    .forEach((viewport) => {
      viewport.style.setProperty("--map-scale", String(state.mapScale));
      viewport.style.setProperty("--map-offset-x", `${state.mapOffsetX}px`);
      viewport.style.setProperty("--map-offset-y", `${state.mapOffsetY}px`);
    });
}

function toggleCompareRegion(regionId) {
  const regionKey = String(regionId || "").trim();
  if (!regionKey || !state.service) return;

  const isAvailable = getActivePointsByRegion(regionKey, state.service).length > 0;
  if (!isAvailable) return;

  const next = [...(state.compareRegions || [])];
  const currentIndex = next.indexOf(regionKey);
  if (currentIndex >= 0) {
    next.splice(currentIndex, 1);
  } else {
    if (next.length >= 2) {
      next.shift();
    }
    next.push(regionKey);
  }

  state.compareRegions = next;
  renderRegionStep();
  triggerSelectionHaptic();
}

function buildInteractiveItalySvg(regionMeta, selectedRegionId) {
  let selectedHalo = "";
  const shapes = regionMeta
    .map((entry, index) => {
      const regionId = resolveRegionMapKey(entry.region.id);
      const shape = REGION_SVG_SHAPES[regionId];
      const fallback = REGION_MAP_FALLBACK_LAYOUT[regionId] || {
        x: 70 + (index % 5) * 55,
        y: 70 + Math.floor(index / 5) * 55,
      };
      const isSelected = selectedRegionId === entry.region.id;
      const isCompared = (state.compareRegions || []).includes(entry.region.id);
      const isDisabled = entry.isDisabled === true;
      const heatClass = entry.activeCount >= 3 ? "is-hot" : entry.activeCount === 2 ? "is-warm" : "is-cool";
      const baseClass = `italy-region-shape ${heatClass} ${isDisabled ? "is-disabled" : ""} ${isSelected ? "is-selected" : ""} ${isCompared ? "is-compared" : ""}`;

      if (shape?.path) {
        if (isSelected) {
          selectedHalo = `
            <path
              class="italy-region-halo"
              d="${shape.path}"
              aria-hidden="true"
            />
          `;
        }

        return `
          <g class="italy-region-group">
            <path
              class="${baseClass}"
              data-region="${escapeHtmlAttr(entry.region.id)}"
              data-disabled="${isDisabled ? "true" : "false"}"
              d="${shape.path}"
              role="button"
              tabindex="${isDisabled ? "-1" : "0"}"
              aria-label="${escapeHtmlAttr(entry.region.name)} ${escapeHtmlAttr(formatAvailablePointsLabel(entry.activeCount))}"
            />
            <text class="italy-region-count" x="${shape.cx}" y="${shape.cy}">${entry.activeCount}</text>
          </g>
        `;
      }

      if (isSelected) {
        selectedHalo = `
          <circle
            class="italy-region-halo"
            cx="${fallback.x}"
            cy="${fallback.y}"
            r="20"
            aria-hidden="true"
          ></circle>
        `;
      }

      return `
        <g class="italy-region-group">
          <circle
            class="${baseClass}"
            data-region="${escapeHtmlAttr(entry.region.id)}"
            data-disabled="${isDisabled ? "true" : "false"}"
            cx="${fallback.x}"
            cy="${fallback.y}"
            r="18"
            role="button"
            tabindex="${isDisabled ? "-1" : "0"}"
            aria-label="${escapeHtmlAttr(entry.region.name)} ${escapeHtmlAttr(formatAvailablePointsLabel(entry.activeCount))}"
          ></circle>
          <text class="italy-region-count" x="${fallback.x}" y="${fallback.y}">${entry.activeCount}</text>
        </g>
      `;
    })
    .join("");

  const labels = regionMeta
    .map((entry, index) => {
      const regionId = resolveRegionMapKey(entry.region.id);
      const shape = REGION_SVG_SHAPES[regionId];
      const fallback = REGION_MAP_FALLBACK_LAYOUT[regionId] || {
        x: 70 + (index % 5) * 55,
        y: 70 + Math.floor(index / 5) * 55,
      };
      const lx = shape?.cx ?? fallback.x;
      const ly = shape?.cy ?? fallback.y;
      const isSelected = selectedRegionId === entry.region.id;
      const label = getRegionMapLabel(entry.region, regionId);
      return `
        <text class="italy-region-label ${isSelected ? "is-selected" : ""}" x="${lx}" y="${ly + 10}">${escapeHtml(label)}</text>
      `;
    })
    .join("");

  return `
    <svg class="italy-map-svg" viewBox="${escapeHtmlAttr(REGION_MAP_DISPLAY_VIEWBOX || REGION_MAP_VIEWBOX)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Regioni d'Italia con punti attivi">
      <defs>
        <linearGradient id="italyRegionFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#123629" stop-opacity="0.78" />
          <stop offset="52%" stop-color="#0b211a" stop-opacity="0.62" />
          <stop offset="100%" stop-color="#07110f" stop-opacity="0.82" />
        </linearGradient>
        <linearGradient id="italyRegionWarmFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1f5f43" stop-opacity="0.86" />
          <stop offset="100%" stop-color="#0d241b" stop-opacity="0.72" />
        </linearGradient>
        <linearGradient id="italyRegionHotFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2ee68c" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#10452f" stop-opacity="0.82" />
        </linearGradient>
        <linearGradient id="italyRegionSelectedFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7fff9" stop-opacity="0.96" />
          <stop offset="38%" stop-color="#4dff9d" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#11824f" stop-opacity="0.88" />
        </linearGradient>
        <filter id="italySelectedGlow" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="0" stdDeviation="2.4" flood-color="#f7fff9" flood-opacity="0.92" />
          <feDropShadow dx="0" dy="0" stdDeviation="6.4" flood-color="#32ff8f" flood-opacity="0.68" />
          <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.42" />
        </filter>
        <filter id="italyHaloGlow" x="-55%" y="-55%" width="210%" height="210%" color-interpolation-filters="sRGB">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.15  0 0 0 0 1  0 0 0 0 0.52  0 0 0 0.9 0"
          />
        </filter>
      </defs>
      <g class="italy-region-halo-layer">${selectedHalo}</g>
      <g class="italy-region-layer">${shapes}</g>
      <g class="italy-region-labels">${labels}</g>
    </svg>
  `;
}

function buildHomeRegionPanel(selectedMeta) {
  if (!selectedMeta) {
    return `
      <aside class="map-selected-panel" aria-live="polite">
        <div class="map-panel-head">
          <span class="map-panel-kicker">Italia</span>
          <span class="map-panel-status">20 regioni</span>
        </div>
        <strong class="map-panel-title">Seleziona regione</strong>
        <span class="map-panel-meta">Mappa interattiva nazionale</span>
      </aside>
    `;
  }

  const services = buildRegionServiceMix(selectedMeta.activePoints);
  return `
    <aside class="map-selected-panel is-active" aria-live="polite">
      <div class="map-panel-head">
        <span class="map-panel-kicker">Regione</span>
        <span class="map-panel-status">Selezionata</span>
      </div>
      <strong class="map-panel-title">${escapeHtml(selectedMeta.region.name)}</strong>
      <span class="map-panel-meta">${escapeHtml(formatAvailablePointsLabel(selectedMeta.activeCount))}</span>
      <div class="region-service-mix map-panel-services">${services}</div>
    </aside>
  `;
}

function buildHomeCommandDeck(regionMeta, selectedMeta) {
  const totalRegions = Array.isArray(regionMeta) ? regionMeta.length : 0;
  const activeRegions = regionMeta.filter((entry) => entry.activeCount > 0).length;
  const totalPoints = regionMeta.reduce((sum, entry) => sum + entry.activeCount, 0);
  const selectedName = selectedMeta?.region?.name || "Seleziona regione";
  const selectedCount = selectedMeta ? formatAvailablePointsLabel(selectedMeta.activeCount) : "Mappa interattiva nazionale";
  const selectedServices = selectedMeta ? buildRegionServiceMix(selectedMeta.activePoints) : "";
  const sortedRegions = [...regionMeta].sort((a, b) => a.region.name.localeCompare(b.region.name, "it"));

  const regionChips = sortedRegions
    .map((entry) => {
      const isSelected = selectedMeta?.region?.id === entry.region.id;
      return `
        <button
          type="button"
          class="map-region-chip ${isSelected ? "active" : ""}"
          data-region="${escapeHtmlAttr(entry.region.id)}"
          aria-label="${escapeHtmlAttr(entry.region.name)}"
        >
          <span>${escapeHtml(entry.region.name)}</span>
          <b>${entry.activeCount}</b>
        </button>
      `;
    })
    .join("");

  return `
    <section class="map-command-deck" aria-label="Selezione regioni">
      <article class="map-deck-card map-deck-selected" aria-live="polite">
        <div class="map-panel-head">
          <span class="map-panel-kicker">${selectedMeta ? "Regione" : "Italia"}</span>
          <span class="map-panel-status">${selectedMeta ? "Selezionata" : `${totalRegions} regioni`}</span>
        </div>
        <strong class="map-panel-title">${escapeHtml(selectedName)}</strong>
        <span class="map-panel-meta">${escapeHtml(selectedCount)}</span>
        ${selectedServices ? `<div class="region-service-mix map-panel-services">${selectedServices}</div>` : ""}
      </article>

      <article class="map-deck-card map-region-browser">
        <div class="map-browser-head">
          <span class="map-panel-kicker">Region selector</span>
          <span class="map-browser-count">${activeRegions}/${totalRegions} attive</span>
        </div>
        <div class="map-region-chip-grid">
          ${regionChips}
        </div>
      </article>

      <article class="map-deck-card map-deck-stats">
        <div class="map-stat-block">
          <span>Regioni</span>
          <strong>${totalRegions}</strong>
        </div>
        <div class="map-stat-block">
          <span>Punti</span>
          <strong>${totalPoints}</strong>
        </div>
      </article>
    </section>
  `;
}

function buildProfessionalMapScreen(regionMeta, selectedMeta, mapSvg) {
  return `
    <section class="app-screen app-screen-map pro-screen-map static-map-screen" aria-label="Mappa d'Italia">
      <div class="static-map-shell ${selectedMeta ? "has-region-selection" : ""}">
        <div class="italy-home-map-shell" aria-label="Mappa interattiva delle regioni italiane">
          <div class="italy-map-stage italy-map-stage-home pro-map-stage pro-static-map ${state.region ? "has-selection" : ""}" role="group" aria-label="Seleziona una regione italiana">
            <div class="italy-map-grid" aria-hidden="true"></div>
            <div class="italy-map-viewport">
              ${mapSvg}
            </div>
          </div>
        </div>
        ${buildMapUxOverlay(regionMeta, selectedMeta)}
      </div>
    </section>
  `;
}

function buildMapUxOverlay(regionMeta, selectedMeta) {
  const totalRegions = Array.isArray(regionMeta) ? regionMeta.length : 0;
  const activeRegions = regionMeta.filter((entry) => entry.activeCount > 0).length;
  const totalPoints = regionMeta.reduce((sum, entry) => sum + entry.activeCount, 0);
  const directServiceCounts = getHomeDirectServiceCounts();

  if (selectedMeta) {
    const serviceCounts = getWorkspaceServiceCounts(selectedMeta.region.id);
    const areaLabel = selectedMeta.isExternalArea ? "Area fuori mappa" : "Regione selezionata";
    return `
      <div class="map-ux-layer" aria-live="polite">
        <header class="map-ux-topbar">
          <div class="map-ux-brand">
            <span class="map-ux-mark" aria-hidden="true">RI</span>
            <span>
              <b>Ristoranti d'Italia</b>
              <small>Mappa interattiva</small>
            </span>
          </div>
          <button type="button" class="map-ux-clear" data-screen-action="clear-region" aria-label="Cancella selezione">Cambia</button>
        </header>

        <aside class="map-ux-dock is-selected map-ux-service-dock">
          <div class="map-ux-dock-copy">
            <span class="map-ux-kicker">${areaLabel}</span>
            <strong>${escapeHtml(selectedMeta.region.name)}</strong>
            <p>Scegli un servizio per vedere solo le card disponibili.</p>
            <div class="map-ux-service-choice" aria-label="Scegli servizio">
              ${REGION_PRIORITY_SERVICES.map((serviceId) =>
                buildMapServiceChoiceButton(serviceId, serviceCounts[serviceId] || 0)
              ).join("")}
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  return `
    <div class="map-ux-layer" aria-live="polite">
      <header class="map-ux-topbar">
        <div class="map-ux-brand">
          <span class="map-ux-mark" aria-hidden="true">RI</span>
          <span>
            <b>Ristoranti d'Italia</b>
            <small>Seleziona una regione</small>
          </span>
        </div>
        <div class="map-ux-home-tools">
          <div class="map-ux-mini-stats" aria-label="Statistiche mappa">
            <span><b>${activeRegions}</b> attive</span>
            <span><b>${totalPoints}</b> punti</span>
          </div>
          <div class="map-ux-home-actions" aria-label="Accesso rapido servizi">
            ${HOME_DIRECT_SERVICES.map((serviceId) =>
              buildHomeDirectServiceButton(serviceId, directServiceCounts[serviceId] || 0)
            ).join("")}
          </div>
        </div>
      </header>

      <aside class="map-ux-dock">
        <div class="map-ux-pulse" aria-hidden="true"></div>
        <div class="map-ux-dock-copy">
          <span class="map-ux-kicker">${totalRegions} regioni italiane</span>
          <strong>Tocca una regione</strong>
          <p>La mappa evidenzia la selezione e mostra i punti disponibili.</p>
        </div>
      </aside>
    </div>
  `;
}

function getHomeDirectServiceCounts() {
  return HOME_DIRECT_SERVICES.reduce((counts, serviceId) => {
    counts[serviceId] = getActivePointsByService(serviceId).length;
    return counts;
  }, {});
}

function buildHomeDirectServiceButton(serviceId, count) {
  const isDisabled = count <= 0;
  const label = getServiceLabel(serviceId);
  const hint = serviceId === "ship" ? "Italia / UE" : serviceId === "meetup" ? "Fuori mappa" : "Categorie";
  return `
    <button
      type="button"
      class="map-ux-home-service map-ux-home-service-${escapeHtmlAttr(serviceId)}"
      data-screen-action="service:${escapeHtmlAttr(serviceId)}"
      ${isDisabled ? "disabled" : ""}
      aria-label="${escapeHtmlAttr(label)}: ${escapeHtmlAttr(formatAvailablePointsLabel(count))}"
    >
      ${getServiceIconMarkup(serviceId)}
      <span>
        <b>${escapeHtml(label)}</b>
        <small>${escapeHtml(hint)} / ${escapeHtml(String(count))}</small>
      </span>
    </button>
  `;
}

function buildMapServiceChoiceButton(serviceId, count) {
  const isDisabled = count <= 0;
  const label = getServiceLabel(serviceId);
  const hint = getServiceChoiceHint(serviceId, count);
  return `
    <button
      type="button"
      class="map-ux-service-btn map-ux-service-btn-${escapeHtmlAttr(serviceId)}"
      data-screen-action="service:${escapeHtmlAttr(serviceId)}"
      data-service-kind="${escapeHtmlAttr(serviceId)}"
      ${isDisabled ? "disabled" : ""}
      aria-label="${escapeHtmlAttr(label)}: ${escapeHtmlAttr(formatAvailablePointsLabel(count))}"
    >
      ${getServiceIconMarkup(serviceId)}
      <span>
        <b>${escapeHtml(label)}</b>
        <small>${escapeHtml(formatAvailablePointsLabel(count))}</small>
        <em>${escapeHtml(hint)}</em>
      </span>
    </button>
  `;
}

function getServiceChoiceHint(serviceId, count) {
  if (count <= 0) return "Nessuna card attiva";
  if (serviceId === "ship") return "Spedizione Italia / UE";
  if (serviceId === "other") return "Categorie extra";
  if (serviceId === "delivery") return "Consegna operativa";
  return "Meetup verificati";
}

function buildWorkspaceServiceTabs(currentService, serviceCounts = {}) {
  return `
    <div class="workspace-service-tabs" aria-label="Cambia servizio">
      ${REGION_PRIORITY_SERVICES.map((serviceId) =>
        buildWorkspaceServiceTab(serviceId, serviceCounts[serviceId] || 0, currentService)
      ).join("")}
    </div>
  `;
}

function buildWorkspaceServiceTab(serviceId, count, currentService) {
  const isActive = currentService === serviceId;
  const isDisabled = count <= 0;
  return `
    <button
      type="button"
      class="workspace-service-tab workspace-service-tab-${escapeHtmlAttr(serviceId)} ${isActive ? "is-active" : ""}"
      data-screen-action="service:${escapeHtmlAttr(serviceId)}"
      data-service-kind="${escapeHtmlAttr(serviceId)}"
      aria-pressed="${isActive ? "true" : "false"}"
      ${isDisabled ? "disabled" : ""}
    >
      ${getServiceIconMarkup(serviceId)}
      <span>${escapeHtml(getServiceLabel(serviceId))}</span>
      <b>${count}</b>
    </button>
  `;
}

function buildRegionWorkspaceScreen(regionMeta, selectedMeta) {
  const isDirectService = !selectedMeta && HOME_DIRECT_SERVICES.includes(state.service);
  const isOpen = Boolean(selectedMeta || isDirectService);
  const region = selectedMeta?.region || null;
  const serviceSelected = isDirectService ? HOME_DIRECT_SERVICES.includes(state.service) : REGION_PRIORITY_SERVICES.includes(state.service);
  const serviceCounts = region ? getWorkspaceServiceCounts(region.id) : {};
  const serviceAreaMeta = state.service && state.service !== "other" ? getServiceAreaMeta(state.service, region?.id) : [];
  const directServiceAreas = isDirectService ? serviceAreaMeta : [];
  const activePoints =
    serviceSelected && (selectedMeta || isDirectService)
      ? sortPointsByStarsPriority(
          selectedMeta ? getWorkspacePointsByService(selectedMeta.region.id, state.service) : getActivePointsByService(state.service)
        )
      : [];
  const totalPoints = activePoints.length;
  const serviceMix = serviceSelected ? buildPointServiceBadges([state.service]) : "";
  const priorityLogoLimit = isCoarsePointerDevice() ? 3 : 5;
  const workspaceAreaLabel = selectedMeta?.isExternalArea ? "Area fuori mappa" : "Area regione";
  const nearbyRegions = [...regionMeta]
    .filter((entry) => entry.region.id !== region?.id)
    .map((entry) => {
      const activeCount = serviceSelected ? getRegionalServiceCount(entry.region.id, state.service) : entry.activeCount;
      return { ...entry, activeCount };
    })
    .filter((entry) => entry.activeCount > 0)
    .sort((a, b) => b.activeCount - a.activeCount || a.region.name.localeCompare(b.region.name, "it"))
    .slice(0, 6);
  const nearbyAreas = (serviceSelected && !isDirectService && state.service !== "other" ? serviceAreaMeta : nearbyRegions).slice(0, 6);

  const serviceChooserCard =
    selectedMeta && !serviceSelected
      ? `
        <article class="workspace-service-select">
          <span>Servizio</span>
          <strong>${escapeHtml(region?.name || "Regione")}</strong>
          <p>Scegli una categoria per vedere solo le card disponibili.</p>
          <div class="workspace-service-select-actions">
            ${REGION_PRIORITY_SERVICES.map((serviceId) =>
              buildMapServiceChoiceButton(serviceId, serviceCounts[serviceId] || 0)
            ).join("")}
          </div>
        </article>
      `
      : "";

  const pointCards = serviceChooserCard || (activePoints.length
    ? activePoints
        .map((point, index) => {
          const pointServices = Array.isArray(point.services) ? point.services : [];
          const primaryService = serviceSelected ? state.service : pointServices[0] || "other";
          const fallbackInitials = getInitials(point.name);
          const priorityLogo = index < priorityLogoLimit;
          const logoHtml = point.logo
            ? `<img src="${escapeHtmlAttr(point.logo)}" alt="Logo ${escapeHtmlAttr(point.name)}" width="96" height="96" loading="${
                priorityLogo ? "eager" : "lazy"
              }" decoding="async" fetchpriority="${priorityLogo ? "high" : "auto"}" data-logo-fallback="${escapeHtmlAttr(fallbackInitials)}" />`
            : `<span class="point-logo-fallback">${escapeHtml(fallbackInitials)}</span>`;
          const socials = Array.isArray(point.socials)
            ? point.socials
                .slice(0, 3)
                .map(
                  (link) => `
                    <a class="point-link" href="${escapeHtmlAttr(link.url)}" target="_blank" rel="noopener noreferrer">
                      ${escapeHtml(link.label)}
                    </a>
                  `
                )
                .join("")
            : "";
          const shipCountryText = state.service === "ship" ? getPointShipCountryText(point) : "";
          const categoryText =
            state.service === "other" ? point.categoryLabel || point.category || getServiceLabel("other") : "";
          const pointMeta = [shipCountryText, categoryText].filter(Boolean).join(" / ");

          return `
            <article class="workspace-point-card workspace-point-card-${escapeHtmlAttr(primaryService)}" data-service-kind="${escapeHtmlAttr(
              primaryService
            )}">
              <div class="workspace-point-media">
                <div class="workspace-point-logo">${logoHtml}</div>
                <div class="workspace-point-services">${buildPointServiceBadges(serviceSelected ? [state.service] : point.services)}</div>
              </div>
              <div class="workspace-point-body">
                <span class="workspace-point-type">${escapeHtml(point.categoryLabel || point.category || "Punto")}</span>
                <h3>${escapeHtml(point.name)}</h3>
                ${pointMeta ? `<span class="workspace-point-meta">${escapeHtml(pointMeta)}</span>` : ""}
                <p>${escapeHtml(point.details || point.address || "Dettagli non configurati.")}</p>
                <div class="workspace-point-links">${socials || `<span class="point-links-empty">Nessun social</span>`}</div>
              </div>
            </article>
          `;
        })
        .join("")
    : `
      <article class="workspace-empty">
        <span>Nessun punto attivo</span>
        <strong>${region ? escapeHtml(region.name) : escapeHtml(getServiceLabel(state.service || "other"))}</strong>
      </article>
    `);

  const nearbyButtons = nearbyRegions
    .map(
      (entry) => `
        <button type="button" class="workspace-region-shortcut" data-region="${escapeHtmlAttr(entry.region.id)}">
          <span>${escapeHtml(entry.region.name)}</span>
          <b>${entry.activeCount}</b>
        </button>
      `
    )
    .join("");
  const areaButtons = nearbyAreas
    .map(
      (entry) => `
        <button type="button" class="workspace-region-shortcut" data-region="${escapeHtmlAttr(entry.region.id)}">
          <span>${escapeHtml(entry.region.name)}</span>
          <b>${entry.activeCount}</b>
        </button>
      `
    )
    .join("");
  const directServiceAreaButtons = directServiceAreas
    .map(
      (entry) => `
        <button type="button" class="workspace-region-shortcut" data-region="${escapeHtmlAttr(entry.region.id)}">
          <span>${escapeHtml(entry.region.name)}</span>
          <b>${entry.activeCount}</b>
        </button>
      `
    )
    .join("");

  return `
    <section class="app-screen app-screen-region ${isOpen ? "is-ready" : ""}" aria-label="Dettaglio regione">
      <div class="workspace-shell">
        <header class="workspace-header">
          <button type="button" class="workspace-back" data-screen-action="map" aria-label="Torna alla mappa">←</button>
          <div class="workspace-title-block">
            <span>${isDirectService ? "Servizio rapido" : isOpen ? workspaceAreaLabel : "Nessuna regione"}</span>
            <h2>${escapeHtml(isDirectService ? getServiceLabel(state.service) : region?.name || "Seleziona una regione")}</h2>
          </div>
          <button type="button" class="workspace-clear" data-screen-action="clear-region">Reimposta</button>
        </header>

        <main class="workspace-main">
          <section class="workspace-hero-card">
            <div class="workspace-hero-meta">
              <span class="map-panel-status">${totalPoints} punti</span>
              <span class="map-panel-status">${escapeHtml(state.service ? getServiceLabel(state.service) : "Servizio")}</span>
              <span class="map-panel-status">${isDirectService ? escapeHtml(getDirectServiceScopeLabel(state.service)) : `${regionMeta.length} regioni`}</span>
            </div>
            <h3>${escapeHtml(isDirectService ? getServiceLabel(state.service) : region?.name || "Italia")}</h3>
            <p>${escapeHtml(
              isDirectService
                ? "Accesso rapido dalla home con tutti i punti configurati per questo servizio, inclusi quelli fuori dalla mappa italiana."
                : region?.hubs || "Area regionale con punti, servizi e scorciatoie operative."
            )}</p>
            <div class="region-service-mix workspace-service-mix">${serviceMix}</div>
          </section>

          <section class="workspace-points-panel">
            <div class="workspace-section-head">
              <span>${serviceSelected ? `Punti ${escapeHtml(getServiceLabel(state.service))}` : "Scegli servizio"}</span>
              <strong>${serviceSelected ? totalPoints : sumServiceCounts(serviceCounts)}</strong>
            </div>
            ${selectedMeta ? buildWorkspaceServiceTabs(state.service, serviceCounts) : ""}
            <div class="workspace-point-grid">
              ${pointCards}
            </div>
          </section>

          <aside class="workspace-side-panel">
            <div class="workspace-section-head">
              <span>${isDirectService && state.service !== "other" ? "Aree disponibili" : isDirectService ? "Servizi rapidi" : "Altre aree"}</span>
              <strong>${isDirectService && state.service !== "other" ? directServiceAreas.length : isDirectService ? HOME_DIRECT_SERVICES.length : nearbyAreas.length}</strong>
            </div>
            <div class="workspace-region-list">
              ${
                isDirectService && state.service !== "other"
                  ? directServiceAreaButtons || `<span class="workspace-empty-note">Nessuna area disponibile</span>`
                  : isDirectService
                  ? HOME_DIRECT_SERVICES.map(
                      (serviceId) => `
                        <button type="button" class="workspace-region-shortcut workspace-service-shortcut" data-screen-action="service:${escapeHtmlAttr(
                          serviceId
                        )}">
                          <span>${escapeHtml(getServiceLabel(serviceId))}</span>
                          <b>${getActivePointsByService(serviceId).length}</b>
                        </button>
                      `
                    ).join("")
                  : areaButtons || nearbyButtons
              }
            </div>
          </aside>
        </main>
      </div>
    </section>
  `;
}

function buildRegionSpotlight(selectedMeta) {
  if (!selectedMeta) {
    return `
      <article class="region-spotlight">
        <p class="region-spotlight-kicker">Radar Italia</p>
        <h3 class="region-spotlight-title">Seleziona un pin per vedere i punti attivi</h3>
        <p class="region-spotlight-note">Il pannello mostrerà subito i servizi disponibili per ogni punto della regione.</p>
      </article>
    `;
  }

  const serviceMix = buildRegionServiceMix(selectedMeta.activePoints);
  const pointsPreview = selectedMeta.activePoints
    .slice(0, 4)
    .map((point) => {
      const pointServices = Array.isArray(point.services)
        ? point.services
            .filter((serviceId) => VALID_SERVICES.includes(serviceId))
            .map(
              (serviceId) =>
                `<span class="region-point-service">${escapeHtml(getServiceLabel(serviceId))}</span>`
            )
            .join("")
        : "";

      return `
        <article class="region-point-preview">
          <h4>${escapeHtml(point.name)}</h4>
          <p>${escapeHtml(point.address || point.details || "Dettagli disponibili nel passaggio successivo.")}</p>
          <div class="region-point-services">${pointServices || `<span class="region-point-service">N/D</span>`}</div>
        </article>
      `;
    })
    .join("");

  const morePointsCount = Math.max(0, selectedMeta.activeCount - 4);
  const morePointsLabel =
    morePointsCount > 0
      ? `<p class="region-spotlight-note">+${morePointsCount} altri ${formatPointWord(morePointsCount)} disponibili dopo la selezione.</p>`
      : `<p class="region-spotlight-note">Tutti i punti attivi della regione sono già in anteprima.</p>`;

  return `
    <article class="region-spotlight">
      <p class="region-spotlight-kicker">Regione selezionata</p>
      <h3 class="region-spotlight-title">${escapeHtml(selectedMeta.region.name)}</h3>
      <p class="region-spotlight-note">${escapeHtml(selectedMeta.region.hubs || "Hub non specificati")}</p>
      <div class="region-service-mix">${serviceMix}</div>
      <div class="region-spotlight-points">${pointsPreview}</div>
      ${morePointsLabel}
    </article>
  `;
}

function buildRegionServiceMix(pointsList) {
  const counts = {};
  for (const serviceId of VALID_SERVICES) {
    counts[serviceId] = 0;
  }

  for (const point of pointsList || []) {
    for (const serviceId of point?.services || []) {
      if (!VALID_SERVICES.includes(serviceId)) continue;
      counts[serviceId] += 1;
    }
  }

  return VALID_SERVICES.map((serviceId) => {
    const amount = counts[serviceId] || 0;
    const isActive = amount > 0;
    return `
      <span class="region-service-chip region-service-chip-${escapeHtmlAttr(serviceId)} ${isActive ? "is-active" : ""}">
        ${getServiceIconMarkup(serviceId)}
        <span>${escapeHtml(getServiceLabel(serviceId))}</span>
        <b>${isActive ? "Disponibile" : "Non attivo"}</b>
      </span>
    `;
  }).join("");
}

function renderPointsStep() {
  if (IS_MAP_ONLY_HOME) {
    els.pointsStep?.classList.add("hidden");
    updateExperienceHud();
    return;
  }

  if (!state.service) {
    els.pointsStep.classList.add("hidden");
    updateExperienceHud();
    return;
  }

  if (!state.region) {
    els.pointsStep.classList.add("hidden");
    updateExperienceHud();
    return;
  }

  const region = appData.regions.find((item) => item.id === state.region);
  if (!region) {
    els.pointsStep.classList.add("hidden");
    updateExperienceHud();
    return;
  }

  let activePoints = getActivePointsByRegion(region.id, state.service);
  els.pointsTitle.textContent = `${formatActivePointsTitle(activePoints.length)} in ${region.name} · ${getServiceLabel(state.service)}`;
  const emptyMessage = "Nessun punto disponibile per questo servizio nella regione selezionata.";

  activePoints = sortPointsByStarsPriority(activePoints);
  prefetchPointLogos(activePoints);
  const previousRects = capturePointCardRects(els.pointsContent);

  if (activePoints.length === 0) {
    els.pointsContent.innerHTML = `
      <div class="points-empty">
        ${emptyMessage}
      </div>
    `;
    els.pointsStep.classList.remove("hidden");
    updateExperienceHud();
    return;
  }

  const cardTemplates = activePoints.map((point, index) => {
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

    const fallbackInitials = getInitials(point.name);
    const priorityLogo = index < 4;
    const logoHtml = point.logo
      ? `<img src="${escapeHtmlAttr(point.logo)}" alt="Logo ${escapeHtmlAttr(point.name)}" loading="${
          priorityLogo ? "eager" : "lazy"
        }" decoding="async" fetchpriority="${priorityLogo ? "high" : "auto"}" data-logo-fallback="${escapeHtmlAttr(
          fallbackInitials
        )}" />`
      : `<span class="point-logo-fallback">${escapeHtml(fallbackInitials)}</span>`;
    const mediaType = resolvePointMediaType(point.mediaType, point.mediaUrl);
    const mediaHtml = buildPointMediaMarkup(mediaType, point.mediaUrl, point.name);
    const shipCountryText = getPointShipCountryText(point);
    const serviceBadges = buildPointServiceBadges(point.services);
    const regionBadge = point.regionName
      ? `<span class="point-region-chip">${escapeHtml(point.regionName)}</span>`
      : "";
    const socialCount = Array.isArray(point.socials) ? point.socials.length : 0;

    return {
      category: point.categoryLabel || point.category || "Other",
      html: `
        <article class="point-card" data-point-id="${escapeHtmlAttr(point.id || point.name)}" aria-label="Punto ${escapeHtmlAttr(point.name)}">
          <header class="point-header">
            <div class="point-logo">${logoHtml}</div>
            <div>
              <div class="point-head-meta">
                ${regionBadge}
                <span class="point-social-chip">${socialCount} social</span>
              </div>
              <h3 class="point-name">${escapeHtml(point.name)}</h3>
              ${point.categoryLabel ? `<p class="point-category">${escapeHtml(point.categoryLabel)}</p>` : ""}
              ${shipCountryText ? `<p class="point-ship-country">${escapeHtml(shipCountryText)}</p>` : ""}
            </div>
          </header>
          <div class="point-service-row">${serviceBadges}</div>
          ${mediaHtml ? `<div class="point-media point-media-${mediaType}">${mediaHtml}</div>` : ""}
          <div class="point-details-block">
            ${buildStarMeter(clampStars(point.stars))}
            <p class="point-details-text">${escapeHtml(point.details || "Dettagli non configurati in admin center.")}</p>
          </div>
          <div class="point-links">${socials || `<span class="point-links-empty">Nessun social configurato</span>`}</div>
        </article>
      `,
    };
  });

  const cards = cardTemplates.map((item) => item.html).join("");
  els.pointsContent.innerHTML = `<div class="points-grid">${cards}</div>`;

  applySmartLogoFit(els.pointsContent);
  animatePointCardsFlip(els.pointsContent, previousRects);
  els.pointsStep.classList.remove("hidden");
  updateExperienceHud();
}

function capturePointCardRects(scope) {
  const map = new Map();
  const host = scope instanceof HTMLElement ? scope : document;
  host.querySelectorAll(".point-card[data-point-id]").forEach((card) => {
    const id = card.getAttribute("data-point-id");
    if (!id) return;
    map.set(id, card.getBoundingClientRect());
  });
  return map;
}

function animatePointCardsFlip(scope, previousRects) {
  if (!(scope instanceof HTMLElement) || !(previousRects instanceof Map)) return;

  const cards = [...scope.querySelectorAll(".point-card[data-point-id]")];
  cards.forEach((card, index) => {
    const id = card.getAttribute("data-point-id");
    if (!id) return;
    const next = card.getBoundingClientRect();
    const prev = previousRects.get(id);

    if (prev) {
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      const dw = prev.width ? prev.width / Math.max(next.width, 1) : 1;
      const dh = prev.height ? prev.height / Math.max(next.height, 1) : 1;

      safeAnimate(
        card,
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${dw}, ${dh})`,
            opacity: 0.72,
          },
          {
            transform: "translate(0, 0) scale(1, 1)",
            opacity: 1,
          },
        ],
        {
          duration: 440,
          easing: "cubic-bezier(0.2, 0.9, 0.24, 1)",
          fill: "both",
          delay: Math.min(index * 22, 120),
        }
      );
      return;
    }

    safeAnimate(
      card,
      [
        { transform: "translateY(14px) scale(0.985)", opacity: 0 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      {
        duration: 360,
        easing: "cubic-bezier(0.2, 0.9, 0.24, 1)",
        fill: "both",
        delay: Math.min(index * 28, 150),
      }
    );
  });
}

function animateSelectedRegionPulse() {
  if (isCoarsePointerDevice()) return;

  const selected = els.selectionContent?.querySelector(".italy-region-shape.active, .italy-region-shape.is-selected");
  if (!(selected instanceof SVGElement)) return;

  safeAnimate(
    selected,
    [
      { transform: "scale(1)", filter: "brightness(1)" },
      { transform: "scale(1.04)", filter: "brightness(1.12)" },
      { transform: "scale(1)", filter: "brightness(1)" },
    ],
    {
      duration: 440,
      easing: "cubic-bezier(0.2, 0.9, 0.24, 1)",
      fill: "both",
    }
  );
}

function safeAnimate(node, keyframes, options) {
  if (!node || typeof node.animate !== "function") return null;
  try {
    return node.animate(keyframes, options);
  } catch {
    return null;
  }
}

function getActivePointsByRegion(regionId, serviceId = state.service) {
  const region = appData.regions.find((item) => item.id === regionId);
  const isKnownItalyRegion = isItalyMapRegionId(regionId);
  if ((!region && !isKnownItalyRegion) || !serviceId) return [];

  const localPoints = (region?.activePoints || []).filter((point) => pointHasService(point, serviceId));
  if (serviceId !== "delivery") {
    return localPoints;
  }

  const localIds = new Set(localPoints.map((point) => getPointSourceKey(point, regionId)));
  const deliveryItaliaPoints = getDeliveryItaliaPointsForRegion(regionId).filter(
    (point) => !localIds.has(getPointSourceKey(point, point.sourceRegionId || point.regionId))
  );

  return [...localPoints, ...deliveryItaliaPoints];
}

function pointHasService(point, serviceId) {
  if (!point || !serviceId) return false;
  if (serviceId === "delivery" && point.deliveryItalia === true) return true;
  return Array.isArray(point.services) && point.services.includes(serviceId);
}

function getPointSourceKey(point, fallbackRegionId = "") {
  return `${point?.sourceRegionId || point?.regionId || fallbackRegionId || ""}:${point?.sourcePointId || point?.id || ""}`;
}

function getDeliveryItaliaPointsForRegion(regionId) {
  if (!isItalyMapRegionId(regionId)) return [];

  return (appData.regions || []).flatMap((sourceRegion) =>
    (sourceRegion.activePoints || [])
      .filter((point) => point?.deliveryItalia === true)
      .map((point) => {
        const services = Array.isArray(point.services) && point.services.includes("delivery")
          ? point.services
          : [...(Array.isArray(point.services) ? point.services : []), "delivery"];
        const isLocal = sourceRegion.id === regionId;

        return {
          ...point,
          id: isLocal ? point.id : `${sourceRegion.id}-${point.id}-delivery-italia`,
          sourcePointId: point.id,
          sourceRegionId: sourceRegion.id,
          regionName: sourceRegion.name,
          deliveryItalia: true,
          services,
        };
      })
  );
}

function getSelectedRegionMeta(regionMeta) {
  if (!state.region) return null;

  const mapMeta = Array.isArray(regionMeta) ? regionMeta.find((entry) => entry.region.id === state.region) : null;
  if (mapMeta) return mapMeta;

  const region = getRegionById(state.region);
  if (!region) return null;

  const activePoints = state.service ? getWorkspacePointsByService(region.id, state.service) : getMapSelectablePoints(region);
  const totalCount = Array.isArray(region.activePoints) ? region.activePoints.length : 0;

  return {
    region,
    activePoints,
    activeCount: activePoints.length,
    totalCount,
    isDisabled: activePoints.length === 0,
    isExternalArea: !isItalyMapRegionId(region.id),
  };
}

function isItalyMapRegionId(regionId) {
  return Object.prototype.hasOwnProperty.call(ITALY_REGION_NAMES, String(regionId || ""));
}

function getServiceAreaMeta(serviceId, excludedRegionId = null) {
  if (!serviceId || serviceId === "other") return [];

  return (appData.regions || [])
    .map((region) => {
      const activePoints = getWorkspacePointsByService(region.id, serviceId);
      return {
        region,
        activePoints,
        activeCount: activePoints.length,
        totalCount: Array.isArray(region.activePoints) ? region.activePoints.length : 0,
        isExternalArea: !isItalyMapRegionId(region.id),
      };
    })
    .filter((entry) => entry.region.id !== excludedRegionId && entry.activeCount > 0)
    .sort(
      (a, b) =>
        Number(b.isExternalArea) - Number(a.isExternalArea) ||
        b.activeCount - a.activeCount ||
        a.region.name.localeCompare(b.region.name, "it")
    );
}

function getDirectServiceScopeLabel(serviceId) {
  if (serviceId === "ship" || serviceId === "meetup") return "Italia / UE";
  if (serviceId === "other") return "Categorie";
  return "Tutte le aree";
}

function getMapSelectablePoints(region) {
  const regionId = region?.id;
  if (regionId) {
    return uniquePointsBySource(
      REGION_PRIORITY_SERVICES.flatMap((serviceId) => getActivePointsByRegion(regionId, serviceId)),
      regionId
    );
  }

  const points = Array.isArray(region?.activePoints) ? region.activePoints : [];
  return points.filter((point) => REGION_PRIORITY_SERVICES.some((serviceId) => pointHasService(point, serviceId)));
}

function uniquePointsBySource(points, fallbackRegionId = "") {
  const seen = new Set();
  return (Array.isArray(points) ? points : []).filter((point) => {
    const key = getPointSourceKey(point, fallbackRegionId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getRegionalServiceCount(regionId, serviceId) {
  if (!serviceId) return 0;
  return getActivePointsByRegion(regionId, serviceId).length;
}

function getWorkspacePointsByService(regionId, serviceId = state.service) {
  if (!serviceId) return [];
  if (serviceId === "other") {
    return getOtherWorkspacePoints(regionId);
  }
  return getActivePointsByRegion(regionId, serviceId);
}

function getWorkspaceServiceCounts(regionId) {
  return WORKSPACE_SERVICES.reduce((counts, serviceId) => {
    counts[serviceId] = getWorkspacePointsByService(regionId, serviceId).length;
    return counts;
  }, {});
}

function sumServiceCounts(counts) {
  return Object.values(counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function getOtherWorkspacePoints(regionId) {
  const regionalPoints = getActivePointsByRegion(regionId, "other").map((point) => ({
    ...point,
    category: point.category || "Other",
    categoryLabel: point.categoryLabel || getServiceLabel("other"),
  }));

  return [...regionalPoints, ...getOtherCategoryPoints()];
}

function getOtherCategoryPoints() {
  const categories = appData.otherCategories && typeof appData.otherCategories === "object" ? appData.otherCategories : {};
  const labels =
    appData.otherCategoryLabels && typeof appData.otherCategoryLabels === "object" ? appData.otherCategoryLabels : {};

  return Object.keys(categories).flatMap((categoryId) => {
    const label = labels[categoryId] || categoryId || getServiceLabel("other");
    const points = Array.isArray(categories[categoryId]) ? categories[categoryId] : [];

    return points.map((point, index) => ({
      ...point,
      id: point.id || `${categoryId}-${index + 1}`,
      services: ["other"],
      category: categoryId,
      categoryLabel: label,
    }));
  });
}

function getActivePointsByService(serviceId) {
  if (!serviceId) return [];

  if (serviceId === "other") {
    const regionalOther = (appData.regions || []).flatMap((region) =>
      (region.activePoints || [])
        .filter((point) => Array.isArray(point.services) && point.services.includes("other"))
        .map((point) => ({ ...point, regionName: region.name, categoryLabel: point.categoryLabel || getServiceLabel("other") }))
    );

    return [...regionalOther, ...getOtherCategoryPoints()];
  }

  return (appData.regions || []).flatMap((region) =>
    (region.activePoints || [])
      .filter((point) => pointHasService(point, serviceId))
      .map((point) => ({ ...point, regionName: region.name }))
  );
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

function normalizeShipZoneId(zoneId) {
  const candidate = String(zoneId || "")
    .trim()
    .toLowerCase();
  if (candidate === "italy" || candidate === "eu") {
    return candidate;
  }
  return null;
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
  if (state.service !== "ship") return "";
  const country = String(point?.shipCountry || "").trim();
  if (country) return `Paese di spedizione: ${country}`;

  const originZone = normalizeShipZoneId(point?.shipOrigin);
  if (originZone === "eu") return "Paese di spedizione: UE";
  if (originZone === "italy") return "Paese di spedizione: Italia";
  return "Paese di spedizione: non specificato";
}

function buildPointServiceBadges(services) {
  const list = Array.isArray(services)
    ? services.filter((serviceId, index, arr) => VALID_SERVICES.includes(serviceId) && arr.indexOf(serviceId) === index)
    : [];

  if (list.length === 0) {
    return `<span class="point-service-pill">N/D</span>`;
  }

  return list
    .map(
      (serviceId) => `
        <span class="point-service-pill point-service-pill-${escapeHtmlAttr(serviceId)}">
          ${getServiceIconMarkup(serviceId)}
          <span>${escapeHtml(getServiceLabel(serviceId))}</span>
        </span>
      `
    )
    .join("");
}

function getServiceIconMarkup(serviceId) {
  const iconClass = `service-icon service-icon-${escapeHtmlAttr(serviceId)}`;

  if (serviceId === "meetup") {
    return `
      <i class="${iconClass}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z"></path>
          <circle cx="12" cy="10" r="2.4"></circle>
        </svg>
      </i>
    `;
  }

  if (serviceId === "delivery") {
    return `
      <i class="${iconClass}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M3 7h11v9H3z"></path>
          <path d="M14 10h3.7l3.3 3.4V16h-7z"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <circle cx="18" cy="17" r="2"></circle>
        </svg>
      </i>
    `;
  }

  if (serviceId === "ship") {
    return `
      <i class="${iconClass}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M4 8.2 12 4l8 4.2v8.6L12 21l-8-4.2Z"></path>
          <path d="m4.5 8.5 7.5 4 7.5-4"></path>
          <path d="M12 12.5V21"></path>
        </svg>
      </i>
    `;
  }

  if (serviceId === "other") {
    return `
      <i class="${iconClass}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M5 6.5h14"></path>
          <path d="M5 12h14"></path>
          <path d="M5 17.5h14"></path>
          <circle cx="8" cy="6.5" r="1.4"></circle>
          <circle cx="16" cy="12" r="1.4"></circle>
          <circle cx="11" cy="17.5" r="1.4"></circle>
        </svg>
      </i>
    `;
  }

  return `
    <i class="${iconClass}" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="5"></circle>
      </svg>
    </i>
  `;
}

function renderHeroSocialLinks() {
  if (!els.heroTelegramLink) return;

  const telegramUrl = normalizeTelegramChannelUrl(appData.supportTelegramUrl);
  if (!telegramUrl) {
    els.heroTelegramLink.hidden = true;
    els.heroTelegramLink.removeAttribute("href");
    return;
  }

  els.heroTelegramLink.hidden = false;
  els.heroTelegramLink.href = telegramUrl;
}

function getServiceLabel(serviceId) {
  const forcedLabels = {
    meetup: "Meetup",
    delivery: "Delivery",
    ship: "Ship",
    other: "Other",
  };
  return forcedLabels[serviceId] || appData.serviceLabels?.[serviceId] || serviceId;
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
  container
    .querySelectorAll("[data-service].active, [data-region].active, [data-region-action].active")
    .forEach((node) => node.classList.remove("active"));
  container.querySelectorAll(selector).forEach((node) => node.classList.add("active"));
}

function focusStepIfNeeded(stepElement, options = {}) {
  if (!stepElement || stepElement.classList.contains("hidden")) return;

  const focusSelector = options.focusSelector || "";
  const shouldProgrammaticFocus = !isCoarsePointerDevice();

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
    if (shouldProgrammaticFocus) {
      window.setTimeout(applyFocus, 280);
    }
    return;
  }

  if (shouldProgrammaticFocus) {
    applyFocus();
  }
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

function prefetchPointLogos(points, limit = LOGO_PREFETCH_LIMIT) {
  if (!Array.isArray(points) || points.length === 0) return;

  points
    .map((point) => String(point?.logo || "").trim())
    .filter(isHttpUrl)
    .slice(0, limit)
    .forEach((url) => {
      if (prefetchedLogoUrls.has(url)) return;
      prefetchedLogoUrls.add(url);
      warmLogoOrigin(url);

      const probe = new Image();
      probe.decoding = "async";
      probe.src = url;
    });
}

function warmLogoOrigin(url) {
  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    if (!origin || warmedLogoOrigins.has(origin)) return;

    warmedLogoOrigins.add(origin);
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = origin;
    preconnect.crossOrigin = "anonymous";
    document.head.appendChild(preconnect);
  } catch {
    // Ignore malformed URL.
  }
}

function applySmartLogoFit(scope = document) {
  const host = scope instanceof HTMLElement ? scope : document;
  const logos = host.querySelectorAll(".point-logo img");

  logos.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const wrap = img.closest(".point-logo");
    wrap?.classList.add("is-loading");
    img.classList.remove("is-ready");

    const apply = () => {
      const frame = analyzeLogoContentFrame(img);
      const boost = shouldBoostLogoFrame(frame);
      const mode = boost ? "cover" : resolveLogoFitMode(img);

      img.classList.toggle("point-logo-img--contain", mode === "contain");
      img.classList.toggle("point-logo-img--boost", boost);
      if (boost && frame) {
        img.style.setProperty("--logo-focus-x", `${(frame.centerX * 100).toFixed(2)}%`);
        img.style.setProperty("--logo-focus-y", `${(frame.centerY * 100).toFixed(2)}%`);
        img.style.setProperty("--logo-zoom", calculateLogoBoostScale(frame).toFixed(2));
      } else {
        img.style.removeProperty("--logo-focus-x");
        img.style.removeProperty("--logo-focus-y");
        img.style.removeProperty("--logo-zoom");
      }

      img.classList.add("is-ready");
      wrap?.classList.remove("is-loading");
    };

    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      apply();
      return;
    }

    img.addEventListener("load", apply, { once: true });
    img.addEventListener(
      "error",
      () => {
        const fallback = String(img.dataset.logoFallback || "PT")
          .slice(0, 2)
          .toUpperCase();
        if (wrap) {
          wrap.innerHTML = `<span class="point-logo-fallback">${escapeHtml(fallback)}</span>`;
          wrap.classList.remove("is-loading");
        }
      },
      { once: true }
    );
  });
}

function resolveLogoFitMode(image) {
  const width = Number(image?.naturalWidth || 0);
  const height = Number(image?.naturalHeight || 0);
  if (!width || !height) {
    return "cover";
  }

  const aspectRatio = width / height;
  if (aspectRatio < 0.78 || aspectRatio > 1.28) {
    return "contain";
  }

  return "cover";
}

function analyzeLogoContentFrame(image) {
  const width = Number(image?.naturalWidth || 0);
  const height = Number(image?.naturalHeight || 0);
  if (!width || !height) return null;

  const sampleSize = 64;
  const canvas = document.createElement("canvas");
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  let data;
  try {
    ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
    data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  } catch {
    return null;
  }

  let minX = sampleSize;
  let minY = sampleSize;
  let maxX = -1;
  let maxY = -1;
  let detected = 0;

  for (let y = 0; y < sampleSize; y += 1) {
    for (let x = 0; x < sampleSize; x += 1) {
      const idx = (y * sampleSize + x) * 4;
      const alpha = data[idx + 3];
      if (alpha < 18) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      const isContentPixel = brightness > 26 || saturation > 16;
      if (!isContentPixel) continue;

      detected += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (detected < sampleSize) return null;

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  const coverageX = boxWidth / sampleSize;
  const coverageY = boxHeight / sampleSize;

  return {
    coverageX,
    coverageY,
    area: coverageX * coverageY,
    centerX: (minX + maxX + 1) / (2 * sampleSize),
    centerY: (minY + maxY + 1) / (2 * sampleSize),
  };
}

function shouldBoostLogoFrame(frame) {
  if (!frame) return false;
  return frame.area < 0.46 || frame.coverageX < 0.62 || frame.coverageY < 0.62;
}

function calculateLogoBoostScale(frame) {
  if (!frame) return 1;
  const targetCoverage = 0.86;
  const dominantCoverage = Math.max(frame.coverageX, frame.coverageY, 0.01);
  const rawScale = targetCoverage / dominantCoverage;
  return clampNumber(rawScale, 1.08, 2.05);
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

function clampNumber(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

function isCoarsePointerDevice() {
  return Boolean(window.matchMedia?.("(pointer: coarse)").matches);
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeTelegramChannelUrl(value) {
  const candidate = String(value || "").trim();
  if (!candidate) return "";

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/^\/+/, "");
    if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || host !== "t.me" || !path) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
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

  const preloaderVisibleMs = 5000;
  const preloaderMaxMs = isTelegramClient ? 5600 : 6500;
  const preloaderExitMs = 420;
  let minTimeElapsed = false;
  let appReady = false;
  let preloaderDone = false;

  const finishPreloader = () => {
    if (preloaderDone) return;
    preloaderDone = true;
    body.classList.add("preload-exit");
    window.setTimeout(() => {
      revealImmediately();
    }, preloaderExitMs);
  };

  const finishWhenReady = () => {
    if (preloaderDone) return;
    if (minTimeElapsed && appReady) {
      finishPreloader();
    }
  };

  window.setTimeout(() => {
    minTimeElapsed = true;
    finishWhenReady();
  }, preloaderVisibleMs);
  window.setTimeout(finishPreloader, preloaderMaxMs);

  window.addEventListener(
    "ri:app-ready",
    () => {
      appReady = true;
      finishWhenReady();
    },
    { once: true }
  );

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
