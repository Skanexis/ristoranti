
const store = window.RIDataStore;
const FALLBACK_SERVICE_LABELS = {
  meetup: "Ritiro",
  delivery: "Consegna",
  ship: "Spedizione",
};
const API = {
  session: "/api/admin/session",
  login: "/api/admin/login",
  logout: "/api/admin/logout",
  data: "/api/admin/data",
  reset: "/api/admin/reset",
  uploadMedia: "/api/admin/upload-media",
};
const MEDIA_FILE_LIMIT_BYTES = 8 * 1024 * 1024;
const MEDIA_TYPES = ["none", "photo", "gif", "video"];

const defaultServiceLabels = store?.getDefaultData?.()?.serviceLabels ?? FALLBACK_SERVICE_LABELS;
const defaultSupportTelegramUrl =
  store?.getDefaultData?.()?.supportTelegramUrl ?? "https://t.me/SHLC26";

let data = store?.getData?.() ?? {
  serviceLabels: defaultServiceLabels,
  supportTelegramUrl: defaultSupportTelegramUrl,
  regions: [],
};
let editingRegionId = null;
let editingPointId = null;
let regionIdTouched = false;
let pointIdTouched = false;
let statusTimer = null;
let isAdminBooted = false;
let csrfToken = "";

const els = {
  adminAuthGate: document.getElementById("adminAuthGate"),
  adminAuthForm: document.getElementById("adminAuthForm"),
  adminLogin: document.getElementById("adminLogin"),
  adminPassword: document.getElementById("adminPassword"),
  adminAuthStatus: document.getElementById("adminAuthStatus"),
  adminApp: document.getElementById("adminApp"),

  kpiRegions: document.getElementById("kpiRegions"),
  kpiPoints: document.getElementById("kpiPoints"),
  kpiAverageStars: document.getElementById("kpiAverageStars"),
  kpiMeetup: document.getElementById("kpiMeetup"),
  kpiDelivery: document.getElementById("kpiDelivery"),
  kpiShip: document.getElementById("kpiShip"),

  quickExportBtn: document.getElementById("quickExportBtn"),
  logoutAdminBtn: document.getElementById("logoutAdminBtn"),
  servicesForm: document.getElementById("servicesForm"),
  serviceMeetup: document.getElementById("serviceMeetup"),
  serviceDelivery: document.getElementById("serviceDelivery"),
  serviceShip: document.getElementById("serviceShip"),
  serviceSupportTelegram: document.getElementById("serviceSupportTelegram"),
  resetServicesBtn: document.getElementById("resetServicesBtn"),

  regionForm: document.getElementById("regionForm"),
  regionEditingId: document.getElementById("regionEditingId"),
  regionId: document.getElementById("regionId"),
  regionName: document.getElementById("regionName"),
  regionHubs: document.getElementById("regionHubs"),
  regionCancelEdit: document.getElementById("regionCancelEdit"),
  regionList: document.getElementById("regionList"),
  regionSearch: document.getElementById("regionSearch"),
  regionCreateNew: document.getElementById("regionCreateNew"),
  regionFormTitle: document.getElementById("regionFormTitle"),
  regionSubmitBtn: document.getElementById("regionSubmitBtn"),

  pointsPanel: document.getElementById("pointsPanel"),
  pointRegionSelect: document.getElementById("pointRegionSelect"),
  pointSearch: document.getElementById("pointSearch"),
  pointServiceFilter: document.getElementById("pointServiceFilter"),
  pointStarFilter: document.getElementById("pointStarFilter"),
  pointCreateNew: document.getElementById("pointCreateNew"),
  pointsContextHint: document.getElementById("pointsContextHint"),
  pointForm: document.getElementById("pointForm"),
  pointEditingId: document.getElementById("pointEditingId"),
  pointId: document.getElementById("pointId"),
  pointName: document.getElementById("pointName"),
  pointAddress: document.getElementById("pointAddress"),
  pointDetails: document.getElementById("pointDetails"),
  pointLogo: document.getElementById("pointLogo"),
  pointMediaType: document.getElementById("pointMediaType"),
  pointMediaUrl: document.getElementById("pointMediaUrl"),
  pointMediaUploadBtn: document.getElementById("pointMediaUploadBtn"),
  pointMediaFileInput: document.getElementById("pointMediaFileInput"),
  pointMediaClearBtn: document.getElementById("pointMediaClearBtn"),
  pointMediaStatus: document.getElementById("pointMediaStatus"),
  pointStars: document.getElementById("pointStars"),
  pointCancelEdit: document.getElementById("pointCancelEdit"),
  pointFormTitle: document.getElementById("pointFormTitle"),
  pointSubmitBtn: document.getElementById("pointSubmitBtn"),
  socialRows: document.getElementById("socialRows"),
  addSocialBtn: document.getElementById("addSocialBtn"),
  clearSocialsBtn: document.getElementById("clearSocialsBtn"),
  pointsList: document.getElementById("pointsList"),
  pointsListCount: document.getElementById("pointsListCount"),
  pointPreview: document.getElementById("pointPreview"),

  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  importFileBtn: document.getElementById("importFileBtn"),
  importFileInput: document.getElementById("importFileInput"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  dataJson: document.getElementById("dataJson"),
  adminStatus: document.getElementById("adminStatus"),
};

void initAdminAuth();

async function initAdminAuth() {
  if (!els.adminAuthForm || !els.adminAuthGate || !els.adminApp) {
    const loaded = await loadAdminDataFromServer();
    if (!loaded) {
      setStatus("Impossibile caricare i dati admin dal server.", "error", true);
      return;
    }
    bootAdmin();
    return;
  }

  els.adminAuthForm.addEventListener("submit", handleAdminAuthSubmit);

  const session = await fetchAdminSession();
  if (session.authenticated) {
    csrfToken = session.csrfToken || readCsrfTokenFromCookie();
    unlockAdmin();
    const loaded = await loadAdminDataFromServer();
    if (!loaded) {
      lockAdmin();
      setAuthStatus("Sessione valida ma caricamento dati fallito.", "error");
      return;
    }
    bootAdmin();
    return;
  }

  lockAdmin();
}

function bootAdmin() {
  if (isAdminBooted) return;
  isAdminBooted = true;

  bindAdminEvents();
  resetRegionForm();
  resetPointForm();
  refreshAdminUI();
  setStatus("Admin center pronto.", "success");
}

async function handleAdminAuthSubmit(event) {
  event.preventDefault();

  const login = (els.adminLogin?.value || "").trim();
  const password = (els.adminPassword?.value || "").trim();

  if (!login || !password) {
    setAuthStatus("Inserisci login e password.", "error");
    return;
  }

  try {
    const loginPayload = await apiRequest(API.login, {
      method: "POST",
      body: { login, password },
    });
    csrfToken = loginPayload.csrfToken || readCsrfTokenFromCookie();
  } catch (error) {
    if (els.adminPassword) {
      els.adminPassword.value = "";
    }
    setAuthStatus(error?.message || "Credenziali non valide.", "error");
    return;
  }

  unlockAdmin();
  const loaded = await loadAdminDataFromServer();
  if (!loaded) {
    const sessionCheck = await fetchAdminSession();
    const sessionMissing = !sessionCheck?.authenticated;
    setAuthStatus(
      sessionMissing
        ? "Login ok, ma sessione bloccata dal browser. Usa HTTPS e riapri la pagina."
        : "Accesso effettuato, ma i dati non sono disponibili.",
      "error"
    );
    lockAdmin();
    return;
  }

  if (els.adminPassword) {
    els.adminPassword.value = "";
  }
  if (els.adminAuthForm) {
    els.adminAuthForm.reset();
  }
  setAuthStatus("");
  bootAdmin();
}

function lockAdmin() {
  setAdminVisibility(false);
  window.setTimeout(() => els.adminLogin?.focus(), 0);
}

function unlockAdmin() {
  setAdminVisibility(true);
}

function setAuthStatus(message, tone = "") {
  if (!els.adminAuthStatus) return;
  els.adminAuthStatus.textContent = message;
  if (tone) {
    els.adminAuthStatus.dataset.tone = tone;
  } else {
    delete els.adminAuthStatus.dataset.tone;
  }
}

function setAdminVisibility(isUnlocked) {
  if (els.adminAuthGate) {
    els.adminAuthGate.hidden = isUnlocked;
    els.adminAuthGate.style.setProperty("display", isUnlocked ? "none" : "grid", "important");
    els.adminAuthGate.setAttribute("aria-hidden", isUnlocked ? "true" : "false");
  }

  if (els.adminApp) {
    els.adminApp.hidden = !isUnlocked;
    els.adminApp.style.setProperty("display", isUnlocked ? "grid" : "none", "important");
    els.adminApp.setAttribute("aria-hidden", isUnlocked ? "false" : "true");
  }
}
function bindAdminEvents() {
  els.quickExportBtn.addEventListener("click", () => exportJson(true));
  els.logoutAdminBtn.addEventListener("click", async () => {
    try {
      await apiRequest(API.logout, { method: "POST", requiresCsrf: true });
    } catch {
      // Even if the request fails, force a clean reload to close the panel state.
    }
    window.location.reload();
  });

  els.servicesForm.addEventListener("submit", handleServicesSubmit);
  els.resetServicesBtn.addEventListener("click", handleServicesReset);

  els.regionForm.addEventListener("submit", handleRegionSubmit);
  els.regionCancelEdit.addEventListener("click", resetRegionForm);
  els.regionList.addEventListener("click", handleRegionActions);
  els.regionId.addEventListener("input", () => {
    regionIdTouched = true;
  });
  els.regionName.addEventListener("input", () => {
    if (!regionIdTouched) {
      els.regionId.value = slugify(els.regionName.value);
    }
  });

  if (els.regionCreateNew) {
    els.regionCreateNew.addEventListener("click", () => {
      resetRegionForm();
      safeFocus(els.regionName);
    });
  }

  if (els.regionSearch) {
    els.regionSearch.addEventListener("input", renderRegionList);
  }

  els.pointRegionSelect.addEventListener("change", () => {
    editingPointId = null;
    resetPointForm();
    renderRegionList();
    renderPointsList();
    renderPointsContext();
  });
  els.pointSearch.addEventListener("input", renderPointsList);
  els.pointServiceFilter.addEventListener("change", renderPointsList);
  els.pointStarFilter.addEventListener("change", renderPointsList);

  if (els.pointCreateNew) {
    els.pointCreateNew.addEventListener("click", () => {
      const region = getSelectedRegion();
      if (!region) {
        setStatus("Crea o seleziona una regione prima di aggiungere un punto.", "error");
        return;
      }
      resetPointForm();
      safeFocus(els.pointName);
    });
  }

  els.pointForm.addEventListener("submit", handlePointSubmit);
  els.pointCancelEdit.addEventListener("click", resetPointForm);
  els.pointsList.addEventListener("click", handlePointActions);

  els.pointId.addEventListener("input", () => {
    pointIdTouched = true;
    renderPointPreview();
  });
  els.pointName.addEventListener("input", () => {
    if (!pointIdTouched) {
      els.pointId.value = slugify(els.pointName.value);
    }
    renderPointPreview();
  });
  els.pointAddress.addEventListener("input", renderPointPreview);
  els.pointDetails.addEventListener("input", renderPointPreview);
  els.pointLogo.addEventListener("input", renderPointPreview);
  els.pointMediaType.addEventListener("change", renderPointPreview);
  els.pointMediaUrl.addEventListener("input", renderPointPreview);
  els.pointStars.addEventListener("change", renderPointPreview);
  els.pointForm
    .querySelectorAll("input[name='services']")
    .forEach((checkbox) => checkbox.addEventListener("change", renderPointPreview));

  els.pointMediaUploadBtn.addEventListener("click", () => {
    els.pointMediaFileInput.click();
  });
  els.pointMediaFileInput.addEventListener("change", () => {
    void handlePointMediaUpload();
  });
  els.pointMediaClearBtn.addEventListener("click", () => {
    els.pointMediaType.value = "none";
    els.pointMediaUrl.value = "";
    if (els.pointMediaFileInput) {
      els.pointMediaFileInput.value = "";
    }
    setPointMediaStatus("Media rimossa.");
    renderPointPreview();
  });

  els.addSocialBtn.addEventListener("click", () => addSocialRow());
  els.clearSocialsBtn.addEventListener("click", () => {
    els.socialRows.innerHTML = "";
    addSocialRow();
    renderPointPreview();
  });
  els.socialRows.addEventListener("click", (event) => {
    const btn = event.target.closest(".social-remove");
    if (!btn) return;
    btn.closest(".social-row")?.remove();
    if (els.socialRows.children.length === 0) {
      addSocialRow();
    }
    renderPointPreview();
  });
  els.socialRows.addEventListener("input", renderPointPreview);

  els.exportDataBtn.addEventListener("click", () => exportJson(true));
  els.importDataBtn.addEventListener("click", () => {
    void handleImportFromText();
  });
  els.importFileBtn.addEventListener("click", () => els.importFileInput.click());
  els.importFileInput.addEventListener("change", (event) => {
    void handleImportFromFile(event);
  });

  els.resetDataBtn.addEventListener("click", async () => {
    const ok = window.confirm("Resettare tutti i dati ai valori di default?");
    if (!ok) return;
    try {
      const response = await apiRequest(API.reset, { method: "POST", requiresCsrf: true });
      data = normalizeInputData(response.data);
    } catch (error) {
      setStatus(error?.message || "Reset non riuscito.", "error");
      return;
    }
    resetRegionForm();
    resetPointForm();
    refreshAdminUI();
    setStatus("Dati ripristinati ai valori di default.", "warn");
  });
}

function refreshAdminUI(preferredRegionId = "") {
  renderServicesForm();
  renderRegionSelect(preferredRegionId || els.pointRegionSelect.value);
  renderRegionList();
  renderPointsList();
  renderKpi();
  renderPointsContext();
}

function renderServicesForm() {
  els.serviceMeetup.value = data.serviceLabels?.meetup || defaultServiceLabels.meetup;
  els.serviceDelivery.value = data.serviceLabels?.delivery || defaultServiceLabels.delivery;
  els.serviceShip.value = data.serviceLabels?.ship || defaultServiceLabels.ship;
  els.serviceSupportTelegram.value = data.supportTelegramUrl || defaultSupportTelegramUrl;
}

function handleServicesSubmit(event) {
  event.preventDefault();
  const meetup = els.serviceMeetup.value.trim();
  const delivery = els.serviceDelivery.value.trim();
  const ship = els.serviceShip.value.trim();
  const supportTelegram = els.serviceSupportTelegram.value.trim();

  if (!meetup || !delivery || !ship || !supportTelegram) {
    setStatus("Le etichette servizi non possono essere vuote.", "error");
    return;
  }

  if (!isValidTelegramUrl(supportTelegram)) {
    setStatus("URL supporto Telegram non valido. Usa formato https://t.me/username.", "error");
    return;
  }

  data.serviceLabels = {
    meetup,
    delivery,
    ship,
  };
  data.supportTelegramUrl = supportTelegram;
  persistData("Etichette servizi aggiornate.");
}

function handleServicesReset() {
  els.serviceMeetup.value = defaultServiceLabels.meetup;
  els.serviceDelivery.value = defaultServiceLabels.delivery;
  els.serviceShip.value = defaultServiceLabels.ship;
  els.serviceSupportTelegram.value = defaultSupportTelegramUrl;
  data.serviceLabels = {
    ...defaultServiceLabels,
  };
  data.supportTelegramUrl = defaultSupportTelegramUrl;
  persistData("Etichette servizi ripristinate.");
}

function renderKpi() {
  const allPoints = data.regions.flatMap((region) => region.activePoints || []);
  const serviceCoverage = {
    meetup: 0,
    delivery: 0,
    ship: 0,
  };
  let starsTotal = 0;

  allPoints.forEach((point) => {
    starsTotal += clampStars(point.stars);
    (point.services || []).forEach((service) => {
      if (serviceCoverage[service] !== undefined) {
        serviceCoverage[service] += 1;
      }
    });
  });

  const averageStars = allPoints.length > 0 ? (starsTotal / allPoints.length).toFixed(1) : "0.0";
  els.kpiRegions.textContent = String(data.regions.length);
  els.kpiPoints.textContent = String(allPoints.length);
  els.kpiAverageStars.textContent = `${averageStars} / 3`;
  els.kpiMeetup.textContent = String(serviceCoverage.meetup);
  els.kpiDelivery.textContent = String(serviceCoverage.delivery);
  els.kpiShip.textContent = String(serviceCoverage.ship);
}

function renderRegionSelect(preferredRegionId) {
  const options = data.regions
    .map((region) => `<option value="${escapeHtmlAttr(region.id)}">${escapeHtml(region.name)}</option>`)
    .join("");

  els.pointRegionSelect.innerHTML = options || `<option value="">Nessuna regione</option>`;

  if (!data.regions.length) {
    els.pointRegionSelect.value = "";
    return;
  }

  const fallbackId = data.regions[0].id;
  const selectedId = data.regions.some((region) => region.id === preferredRegionId)
    ? preferredRegionId
    : fallbackId;
  els.pointRegionSelect.value = selectedId;
}
function renderRegionList() {
  if (data.regions.length === 0) {
    els.regionList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Nessuna regione configurata.</p>
      </article>
    `;
    return;
  }

  const search = (els.regionSearch?.value || "").trim().toLowerCase();
  const selectedRegionId = els.pointRegionSelect.value;

  const filteredRegions = data.regions.filter((region) => {
    if (!search) return true;
    return [region.name, region.id, region.hubs]
      .filter(Boolean)
      .some((part) => String(part).toLowerCase().includes(search));
  });

  if (!filteredRegions.length) {
    els.regionList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Nessuna regione trovata con questo filtro.</p>
      </article>
    `;
    return;
  }

  els.regionList.innerHTML = filteredRegions
    .map((region) => {
      const listIndex = data.regions.findIndex((item) => item.id === region.id);
      const pointsCount = Array.isArray(region.activePoints) ? region.activePoints.length : 0;
      const isActive = region.id === selectedRegionId;
      const isEditing = region.id === editingRegionId;

      return `
        <article class="admin-item ${isActive ? "is-active" : ""} ${isEditing ? "is-editing" : ""}" data-region-id="${escapeHtmlAttr(
          region.id
        )}">
          <div class="admin-item-top">
            <p class="admin-item-title">${escapeHtml(region.name)}</p>
            <p class="admin-item-id">${escapeHtml(region.id)}</p>
          </div>
          <p class="admin-item-meta">Hub: ${escapeHtml(region.hubs || "Non impostati")}</p>
          <div class="admin-item-tags">
            <span class="mini-chip">${pointsCount} punti</span>
            ${isActive ? `<span class="mini-chip">Regione attiva</span>` : ""}
            ${isEditing ? `<span class="mini-chip">In modifica</span>` : ""}
          </div>
          <div class="admin-item-actions">
            <button class="admin-btn" data-region-action="manage-points" data-region-id="${escapeHtmlAttr(
              region.id
            )}">Apri punti</button>
            <button class="admin-btn admin-btn-secondary" data-region-action="edit" data-region-id="${escapeHtmlAttr(
              region.id
            )}">Modifica</button>
            <button class="admin-btn admin-btn-secondary" data-region-action="up" data-region-id="${escapeHtmlAttr(region.id)}" ${
              listIndex === 0 ? "disabled" : ""
            }>Su</button>
            <button class="admin-btn admin-btn-secondary" data-region-action="down" data-region-id="${escapeHtmlAttr(region.id)}" ${
              listIndex === data.regions.length - 1 ? "disabled" : ""
            }>Giu</button>
            <button class="admin-btn admin-btn-danger" data-region-action="delete" data-region-id="${escapeHtmlAttr(
              region.id
            )}">Elimina</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function handleRegionActions(event) {
  const actionButton = event.target.closest("[data-region-action]");
  const regionCard = event.target.closest(".admin-item[data-region-id]");

  const regionId = actionButton?.dataset.regionId || regionCard?.dataset.regionId;
  let action = actionButton?.dataset.regionAction || "";

  if (!regionId) return;
  if (!action && regionCard) {
    action = "manage-points";
  }

  const index = data.regions.findIndex((region) => region.id === regionId);
  if (index < 0) return;

  const region = data.regions[index];

  if (action === "edit") {
    editingRegionId = region.id;
    regionIdTouched = true;
    els.regionEditingId.value = region.id;
    els.regionId.value = region.id;
    els.regionName.value = region.name;
    els.regionHubs.value = region.hubs || "";
    updateRegionFormUi();
    safeFocus(els.regionName);
    renderRegionList();
    setStatus(`Modifica regione: ${region.name}`, "warn");
    return;
  }

  if (action === "manage-points") {
    els.pointRegionSelect.value = region.id;
    editingPointId = null;
    resetPointForm();
    renderRegionList();
    renderPointsList();
    renderPointsContext();
    scrollToPointsPanel();
    setStatus(`Gestione punti per ${region.name}`);
    return;
  }

  if (action === "up" && index > 0) {
    moveArrayItem(data.regions, index, index - 1);
    persistData(`Regione spostata: ${region.name}`);
    return;
  }

  if (action === "down" && index < data.regions.length - 1) {
    moveArrayItem(data.regions, index, index + 1);
    persistData(`Regione spostata: ${region.name}`);
    return;
  }

  if (action === "delete") {
    const ok = window.confirm(`Eliminare la regione "${region.name}" e tutti i suoi punti?`);
    if (!ok) return;
    data.regions = data.regions.filter((item) => item.id !== region.id);
    if (editingRegionId === region.id) {
      resetRegionForm();
    }
    if (els.pointRegionSelect.value === region.id) {
      resetPointForm();
    }
    persistData(`Regione eliminata: ${region.name}`, "warn");
  }
}

function handleRegionSubmit(event) {
  event.preventDefault();

  const id = slugify(els.regionId.value);
  const name = els.regionName.value.trim();
  const hubs = els.regionHubs.value.trim();

  if (!id || !name) {
    setStatus("Compila ID e nome regione.", "error");
    return;
  }

  if (editingRegionId) {
    const region = data.regions.find((item) => item.id === editingRegionId);
    if (!region) {
      setStatus("Regione in modifica non trovata.", "error");
      return;
    }

    const conflict = data.regions.some((item) => item.id === id && item.id !== editingRegionId);
    if (conflict) {
      setStatus("ID regione gia in uso.", "error");
      return;
    }

    const oldId = region.id;
    region.id = id;
    region.name = name;
    region.hubs = hubs;
    editingRegionId = id;

    if (els.pointRegionSelect.value === oldId) {
      els.pointRegionSelect.value = id;
    }

    persistData(`Regione aggiornata: ${name}`, "success", id);
    resetRegionForm();
    return;
  }

  const exists = data.regions.some((item) => item.id === id);
  if (exists) {
    setStatus("ID regione gia in uso.", "error");
    return;
  }

  data.regions.push({
    id,
    name,
    hubs,
    activePoints: [],
  });
  persistData(`Regione creata: ${name}`, "success", id);
  resetRegionForm();
}

function resetRegionForm() {
  editingRegionId = null;
  regionIdTouched = false;
  els.regionEditingId.value = "";
  els.regionForm.reset();
  updateRegionFormUi();
}

function updateRegionFormUi() {
  if (!els.regionFormTitle || !els.regionSubmitBtn) return;

  if (editingRegionId) {
    els.regionFormTitle.textContent = "Modifica regione";
    els.regionSubmitBtn.textContent = "Salva modifiche";
  } else {
    els.regionFormTitle.textContent = "Nuova regione";
    els.regionSubmitBtn.textContent = "Aggiungi regione";
  }
}

function renderPointsContext() {
  if (!els.pointsContextHint) return;

  const region = getSelectedRegion();
  if (!region) {
    els.pointsContextHint.textContent = "Seleziona una regione per gestire i punti attivi.";
    if (els.pointCreateNew) {
      els.pointCreateNew.disabled = true;
    }
    return;
  }

  const pointsCount = Array.isArray(region.activePoints) ? region.activePoints.length : 0;
  const label = pointsCount === 1 ? "1 punto" : `${pointsCount} punti`;
  els.pointsContextHint.textContent = `Regione attiva: ${region.name}. ${label} configurati.`;

  if (els.pointCreateNew) {
    els.pointCreateNew.disabled = false;
  }
}
function renderPointsList() {
  const region = getSelectedRegion();
  if (!region) {
    els.pointsListCount.textContent = "0 punti";
    els.pointsList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Seleziona o crea una regione per gestire i punti.</p>
      </article>
    `;
    return;
  }

  const points = Array.isArray(region.activePoints) ? region.activePoints : [];
  const search = els.pointSearch.value.trim().toLowerCase();
  const serviceFilter = els.pointServiceFilter.value;
  const starFilter = els.pointStarFilter.value;

  const filtered = points.filter((point) => {
    const matchesSearch =
      !search ||
      String(point.name || "").toLowerCase().includes(search) ||
      String(point.id || "").toLowerCase().includes(search) ||
      String(point.address || "").toLowerCase().includes(search);
    const matchesService =
      serviceFilter === "all" || (Array.isArray(point.services) && point.services.includes(serviceFilter));
    const matchesStars = starFilter === "all" || String(clampStars(point.stars)) === starFilter;
    return matchesSearch && matchesService && matchesStars;
  });

  els.pointsListCount.textContent = `${filtered.length} / ${points.length} punti`;

  if (filtered.length === 0) {
    els.pointsList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Nessun punto trovato con i filtri attuali.</p>
      </article>
    `;
    return;
  }

  els.pointsList.innerHTML = filtered
    .map((point) => {
      const pointIndex = points.findIndex((item) => item.id === point.id);
      const services = (point.services || [])
        .map((service) => `<span class="mini-chip">${escapeHtml(getServiceLabel(service))}</span>`)
        .join("");
      const socialsCount = Array.isArray(point.socials) ? point.socials.length : 0;
      const hasDetails = Boolean(String(point.details || "").trim());
      const mediaType = resolvePointMediaType(point.mediaType, point.mediaUrl);
      const mediaLabel = mediaType === "none" ? "NO" : mediaType.toUpperCase();
      const starsValue = clampStars(point.stars);
      const starsText = starsValue > 0 ? "★".repeat(starsValue) : "—";
      const isEditing = point.id === editingPointId;

      return `
        <article class="admin-item ${isEditing ? "is-editing" : ""}" data-point-id="${escapeHtmlAttr(point.id)}">
          <div class="admin-item-top">
            <p class="admin-item-title">${escapeHtml(point.name || "Punto senza nome")}</p>
            <p class="admin-item-id">${escapeHtml(point.id || "n/a")}</p>
          </div>
          <p class="admin-item-meta">${escapeHtml(point.address || "Indirizzo non specificato")}</p>
          <div class="admin-item-tags">
            <span class="mini-chip">Stelle ${starsText}</span>
            <span class="mini-chip">Social ${socialsCount}</span>
            <span class="mini-chip">Retro ${hasDetails ? "OK" : "NO"}</span>
            <span class="mini-chip">Media ${mediaLabel}</span>
          </div>
          <div class="admin-item-tags">${services || `<span class="mini-chip">Nessun servizio</span>`}</div>
          <div class="admin-item-actions">
            <button class="admin-btn" data-point-action="edit" data-point-id="${escapeHtmlAttr(point.id)}">Modifica</button>
            <button class="admin-btn admin-btn-secondary" data-point-action="duplicate" data-point-id="${escapeHtmlAttr(
              point.id
            )}">Duplica</button>
            <button class="admin-btn admin-btn-secondary" data-point-action="up" data-point-id="${escapeHtmlAttr(point.id)}" ${
              pointIndex === 0 ? "disabled" : ""
            }>Su</button>
            <button class="admin-btn admin-btn-secondary" data-point-action="down" data-point-id="${escapeHtmlAttr(point.id)}" ${
              pointIndex === points.length - 1 ? "disabled" : ""
            }>Giu</button>
            <button class="admin-btn admin-btn-danger" data-point-action="delete" data-point-id="${escapeHtmlAttr(
              point.id
            )}">Elimina</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function handlePointActions(event) {
  const button = event.target.closest("[data-point-action]");
  const pointCard = event.target.closest(".admin-item[data-point-id]");

  const region = getSelectedRegion();
  if (!region) return;

  const pointId = button?.dataset.pointId || pointCard?.dataset.pointId;
  let action = button?.dataset.pointAction || "";

  if (!pointId) return;
  if (!action && pointCard) {
    action = "edit";
  }

  const pointIndex = region.activePoints.findIndex((item) => item.id === pointId);
  if (pointIndex < 0) return;

  const point = region.activePoints[pointIndex];

  if (action === "edit") {
    fillPointForm(point);
    safeFocus(els.pointName);
    setStatus(`Modifica punto: ${point.name}`, "warn");
    return;
  }

  if (action === "duplicate") {
    const baseId = `${point.id}-copy`;
    const duplicatedId = makeUniquePointId(baseId, region.activePoints);
    const duplicatedPoint = {
      ...clonePoint(point),
      id: duplicatedId,
      name: `${point.name} Copia`,
    };
    region.activePoints.splice(pointIndex + 1, 0, duplicatedPoint);
    persistData(`Punto duplicato: ${duplicatedPoint.name}`, "success", region.id);
    return;
  }

  if (action === "up" && pointIndex > 0) {
    moveArrayItem(region.activePoints, pointIndex, pointIndex - 1);
    persistData(`Ordine aggiornato per ${point.name}`, "success", region.id);
    return;
  }

  if (action === "down" && pointIndex < region.activePoints.length - 1) {
    moveArrayItem(region.activePoints, pointIndex, pointIndex + 1);
    persistData(`Ordine aggiornato per ${point.name}`, "success", region.id);
    return;
  }

  if (action === "delete") {
    const ok = window.confirm(`Eliminare il punto "${point.name}"?`);
    if (!ok) return;
    region.activePoints = region.activePoints.filter((item) => item.id !== point.id);
    if (editingPointId === point.id) {
      resetPointForm();
    }
    persistData(`Punto eliminato: ${point.name}`, "warn", region.id);
  }
}

function handlePointSubmit(event) {
  event.preventDefault();

  const region = getSelectedRegion();
  if (!region) {
    setStatus("Seleziona prima una regione.", "error");
    return;
  }

  const id = slugify(els.pointId.value);
  const name = els.pointName.value.trim();
  const address = els.pointAddress.value.trim();
  const details = els.pointDetails.value.trim();
  const logo = els.pointLogo.value.trim();
  const mediaType = normalizeMediaType(els.pointMediaType.value);
  const mediaUrl = els.pointMediaUrl.value.trim();
  const resolvedMediaType = resolvePointMediaType(mediaType, mediaUrl);
  const stars = clampStars(els.pointStars.value);

  if (!id || !name) {
    setStatus("Compila ID e nome del punto.", "error");
    return;
  }

  if (logo && !isUrlOrPath(logo)) {
    setStatus("Logo URL non valido. Usa URL completo o path relativo.", "error");
    return;
  }

  if (mediaType !== "none" && !mediaUrl) {
    setStatus("Se scegli un tipo media, inserisci URL oppure carica un file.", "error");
    return;
  }

  if (mediaUrl && !isUrlOrPath(mediaUrl)) {
    setStatus("Media URL non valido. Usa URL completo, path relativo o data URL.", "error");
    return;
  }

  const selectedServices = Array.from(els.pointForm.querySelectorAll("input[name='services']:checked")).map(
    (input) => input.value
  );
  const services = selectedServices.length > 0 ? selectedServices : ["meetup"];

  const socials = collectSocialRows();
  if (!socials.ok) {
    setStatus(socials.message, "error");
    return;
  }

  if (editingPointId) {
    const point = region.activePoints.find((item) => item.id === editingPointId);
    if (!point) {
      setStatus("Punto in modifica non trovato.", "error");
      return;
    }

    const conflict = region.activePoints.some((item) => item.id === id && item.id !== editingPointId);
    if (conflict) {
      setStatus("ID punto gia in uso nella regione.", "error");
      return;
    }

    point.id = id;
    point.name = name;
    point.address = address;
    point.details = details;
    point.logo = logo;
    point.mediaType = resolvedMediaType;
    point.mediaUrl = mediaUrl;
    point.stars = stars;
    point.services = services;
    point.socials = socials.items;
    editingPointId = id;

    persistData(`Punto aggiornato: ${name}`, "success", region.id);
    resetPointForm();
    return;
  }

  const exists = region.activePoints.some((item) => item.id === id);
  if (exists) {
    setStatus("ID punto gia in uso nella regione.", "error");
    return;
  }

  region.activePoints.push({
    id,
    name,
    address,
    details,
    logo,
    mediaType: resolvedMediaType,
    mediaUrl,
    stars,
    services,
    socials: socials.items,
  });
  persistData(`Punto creato: ${name}`, "success", region.id);
  resetPointForm();
}

function fillPointForm(point) {
  editingPointId = point.id;
  pointIdTouched = true;
  els.pointEditingId.value = point.id;
  els.pointId.value = point.id || "";
  els.pointName.value = point.name || "";
  els.pointAddress.value = point.address || "";
  els.pointDetails.value = point.details || "";
  els.pointLogo.value = point.logo || "";
  els.pointMediaType.value = resolvePointMediaType(point.mediaType, point.mediaUrl);
  els.pointMediaUrl.value = point.mediaUrl || "";
  els.pointStars.value = String(clampStars(point.stars));
  setPointMediaStatus("");

  els.pointForm.querySelectorAll("input[name='services']").forEach((checkbox) => {
    checkbox.checked = point.services?.includes(checkbox.value) ?? false;
  });

  els.socialRows.innerHTML = "";
  if (Array.isArray(point.socials) && point.socials.length > 0) {
    point.socials.forEach((social) => addSocialRow(social.label, social.url));
  } else {
    addSocialRow();
  }

  updatePointFormUi();
  renderPointsList();
  renderPointPreview();
}

function resetPointForm() {
  editingPointId = null;
  pointIdTouched = false;
  els.pointEditingId.value = "";
  els.pointForm.reset();
  els.pointMediaType.value = "none";
  els.pointMediaUrl.value = "";
  if (els.pointMediaFileInput) {
    els.pointMediaFileInput.value = "";
  }
  setPointMediaStatus("");
  els.pointStars.value = "0";
  els.pointForm
    .querySelectorAll("input[name='services']")
    .forEach((checkbox) => (checkbox.checked = checkbox.value === "meetup"));
  els.socialRows.innerHTML = "";
  addSocialRow();
  updatePointFormUi();
  renderPointsList();
  renderPointPreview();
}

function updatePointFormUi() {
  if (!els.pointFormTitle || !els.pointSubmitBtn) return;

  if (editingPointId) {
    els.pointFormTitle.textContent = "Modifica punto";
    els.pointSubmitBtn.textContent = "Salva modifiche";
  } else {
    els.pointFormTitle.textContent = "Nuovo punto";
    els.pointSubmitBtn.textContent = "Aggiungi punto";
  }
}
function collectSocialRows() {
  const rows = Array.from(els.socialRows.querySelectorAll(".social-row"));
  const items = [];

  for (const row of rows) {
    const label = row.querySelector(".social-label")?.value.trim() || "";
    const url = row.querySelector(".social-url")?.value.trim() || "";

    if (!label && !url) {
      continue;
    }

    if (!label || !url) {
      return {
        ok: false,
        message: "Ogni social deve avere etichetta e URL.",
      };
    }

    if (!isValidAbsoluteUrl(url)) {
      return {
        ok: false,
        message: `URL social non valido: ${url}`,
      };
    }

    items.push({ label, url });
  }

  return { ok: true, items };
}

function addSocialRow(label = "", url = "") {
  const row = document.createElement("div");
  row.className = "social-row";
  row.innerHTML = `
    <input class="social-label" type="text" list="socialLabelOptions" placeholder="Etichetta (Instagram)" value="${escapeHtmlAttr(
      label
    )}" />
    <input class="social-url" type="url" placeholder="https://..." value="${escapeHtmlAttr(url)}" />
    <button type="button" class="admin-btn admin-btn-danger social-remove">X</button>
  `;
  els.socialRows.appendChild(row);
}

function renderPointPreview() {
  const region = getSelectedRegion();
  if (!region) {
    els.pointPreview.innerHTML = `<p class="preview-empty">Seleziona una regione per creare anteprima.</p>`;
    return;
  }

  const name = els.pointName.value.trim();
  const id = slugify(els.pointId.value);
  const address = els.pointAddress.value.trim();
  const details = els.pointDetails.value.trim();
  const logo = els.pointLogo.value.trim();
  const mediaType = normalizeMediaType(els.pointMediaType.value);
  const mediaUrl = els.pointMediaUrl.value.trim();
  const resolvedMediaType = resolvePointMediaType(mediaType, mediaUrl);
  const stars = clampStars(els.pointStars.value);
  const services = Array.from(els.pointForm.querySelectorAll("input[name='services']:checked")).map(
    (input) => input.value
  );
  const socials = Array.from(els.socialRows.querySelectorAll(".social-row"))
    .map((row) => row.querySelector(".social-label")?.value.trim() || "")
    .filter(Boolean);

  if (!name && !id && !address && !details && !logo && !mediaUrl && socials.length === 0 && !editingPointId) {
    els.pointPreview.innerHTML = `<p class="preview-empty">Compila il form per vedere l'anteprima live.</p>`;
    return;
  }

  const logoHtml = logo
    ? `<img src="${escapeHtmlAttr(logo)}" alt="Logo preview" loading="lazy" />`
    : `<span>${escapeHtml(getInitials(name || "Punto"))}</span>`;
  const mediaHtml = buildMediaPreviewMarkup(resolvedMediaType, mediaUrl, name || "Punto");
  const starsHtml = stars > 0 ? "★".repeat(stars) : "Nessuna stella";
  const servicesHtml = services
    .map((service) => `<span class="mini-chip">${escapeHtml(getServiceLabel(service))}</span>`)
    .join("");
  const socialsHtml = socials
    .map((label) => `<span class="mini-chip">${escapeHtml(label)}</span>`)
    .join("");

  els.pointPreview.innerHTML = `
    <article class="preview-card">
      <header class="preview-head">
        <div class="preview-logo">${logoHtml}</div>
        <div>
          <p class="preview-name">${escapeHtml(name || "Nuovo punto")}</p>
          <p class="preview-meta">${escapeHtml(address || "Indirizzo non specificato")}</p>
        </div>
      </header>
      ${mediaHtml ? `<div class="preview-media">${mediaHtml}</div>` : ""}
      <p class="preview-meta">${escapeHtml(details || "Dettagli retro card non impostati.")}</p>
      <p class="preview-stars">${starsHtml}</p>
      <div class="preview-chips">${servicesHtml || `<span class="mini-chip">Nessun servizio</span>`}</div>
      <div class="preview-chips">${socialsHtml || `<span class="mini-chip">Nessun social</span>`}</div>
    </article>
  `;
}

async function handlePointMediaUpload() {
  const file = els.pointMediaFileInput?.files?.[0];
  if (!file) return;

  const mimeType = resolveUploadMimeType(file);
  const isMediaTypeValid = mimeType.startsWith("image/") || mimeType.startsWith("video/");
  if (!isMediaTypeValid) {
    setPointMediaStatus("Formato non supportato. Usa foto, GIF o video.", "error");
    els.pointMediaFileInput.value = "";
    return;
  }

  if (file.size > MEDIA_FILE_LIMIT_BYTES) {
    setPointMediaStatus(`File troppo grande (${formatBytes(file.size)}). Limite: ${formatBytes(MEDIA_FILE_LIMIT_BYTES)}.`, "error");
    els.pointMediaFileInput.value = "";
    return;
  }

  try {
    setPointMediaStatus("Caricamento media in corso...");
    const dataUrl = await readFileAsDataUrl(file);
    const base64 = extractBase64Payload(dataUrl);
    const payload = await apiRequest(API.uploadMedia, {
      method: "POST",
      requiresCsrf: true,
      body: {
        fileName: file.name,
        mimeType,
        base64,
      },
    });
    if (payload?.csrfToken) {
      csrfToken = payload.csrfToken;
    }

    const uploadedUrl = String(payload?.url || "").trim();
    const uploadedType = resolvePointMediaType(payload?.mediaType, uploadedUrl);
    if (!uploadedUrl) {
      throw new Error("URL media non ricevuto dal server.");
    }

    els.pointMediaType.value = uploadedType;
    els.pointMediaUrl.value = uploadedUrl;
    setPointMediaStatus(`Caricato su server: ${file.name} (${formatBytes(file.size)})`, "success");
    renderPointPreview();
  } catch (error) {
    setPointMediaStatus(error?.message || "Caricamento fallito. Riprova con un altro file.", "error");
  } finally {
    els.pointMediaFileInput.value = "";
  }
}

function setPointMediaStatus(message, tone = "") {
  if (!els.pointMediaStatus) return;
  els.pointMediaStatus.textContent = message || "";
  if (tone) {
    els.pointMediaStatus.dataset.tone = tone;
  } else {
    delete els.pointMediaStatus.dataset.tone;
  }
}

function normalizeMediaType(value) {
  const candidate = String(value || "")
    .trim()
    .toLowerCase();
  return MEDIA_TYPES.includes(candidate) ? candidate : "none";
}

function resolvePointMediaType(typeValue, mediaUrl) {
  const normalizedType = normalizeMediaType(typeValue);
  const rawUrl = String(mediaUrl || "").trim();
  if (!rawUrl) return "none";
  if (normalizedType !== "none") return normalizedType;
  return inferMediaTypeFromUrl(rawUrl);
}

function inferMediaTypeFromFile(file) {
  const mimeType = String(file?.type || "").toLowerCase();
  const fileName = String(file?.name || "").toLowerCase();

  if (mimeType.includes("gif") || fileName.endsWith(".gif")) return "gif";
  if (mimeType.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(fileName)) return "video";
  return "photo";
}

function resolveUploadMimeType(file) {
  const mimeType = String(file?.type || "")
    .trim()
    .toLowerCase();
  if (mimeType) return mimeType;

  const fileName = String(file?.name || "").toLowerCase();
  if (fileName.endsWith(".gif")) return "image/gif";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
  if (fileName.endsWith(".webm")) return "video/webm";
  if (fileName.endsWith(".mov")) return "video/quicktime";
  if (fileName.endsWith(".mp4") || fileName.endsWith(".m4v")) return "video/mp4";
  return "";
}

function extractBase64Payload(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const commaIndex = raw.indexOf(",");
  if (commaIndex < 0) return "";
  return raw.slice(commaIndex + 1).trim();
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

function buildMediaPreviewMarkup(mediaType, mediaUrl, pointName) {
  const safeUrl = String(mediaUrl || "").trim();
  if (!safeUrl || mediaType === "none") return "";

  if (mediaType === "video") {
    return `
      <video src="${escapeHtmlAttr(safeUrl)}" muted playsinline loop autoplay preload="metadata" controlslist="nodownload noplaybackrate">
      </video>
    `;
  }

  return `<img src="${escapeHtmlAttr(safeUrl)}" alt="Media ${escapeHtmlAttr(pointName)}" loading="lazy" />`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function exportJson(download = true) {
  const normalized = normalizeInputData(data);
  const json = JSON.stringify(normalized, null, 2);
  els.dataJson.value = json;
  if (download) {
    downloadJsonFile(json, `ristoranti-italia-backup-${timestampNow()}.json`);
    setStatus("Backup esportato.", "success");
    return;
  }
  setStatus("JSON preparato.", "success");
}

async function handleImportFromText() {
  const raw = els.dataJson.value.trim();
  if (!raw) {
    setStatus("Incolla un JSON valido prima di importare.", "error");
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeInputData(parsed);
    const saved = await saveDataToServer(normalized);
    data = saved;
    resetRegionForm();
    resetPointForm();
    refreshAdminUI();
    setStatus("JSON importato con successo.");
  } catch (error) {
    setStatus(error?.message || "JSON non valido. Controlla la sintassi.", "error");
  }
}

async function handleImportFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    els.dataJson.value = text;
    await handleImportFromText();
  } catch (error) {
    setStatus(error?.message || "Errore durante la lettura del file.", "error");
  } finally {
    event.target.value = "";
  }
}

function persistData(message, tone = "success", preferredRegionId = els.pointRegionSelect.value) {
  const normalized = normalizeInputData(data);

  saveDataToServer(normalized)
    .then((savedData) => {
      data = savedData;
      refreshAdminUI(preferredRegionId);
      setStatus(message, tone);
    })
    .catch((error) => {
      setStatus(error?.message || "Errore durante il salvataggio.", "error");
    });
}

async function fetchAdminSession() {
  try {
    const payload = await apiRequest(API.session);
    if (payload.authenticated && payload.csrfToken) {
      csrfToken = payload.csrfToken;
    }
    return payload;
  } catch {
    return { authenticated: false };
  }
}

async function loadAdminDataFromServer() {
  try {
    const payload = await apiRequest(API.data);
    if (payload.csrfToken) {
      csrfToken = payload.csrfToken;
    } else if (!csrfToken) {
      csrfToken = readCsrfTokenFromCookie();
    }
    data = normalizeInputData(payload.data);
    return true;
  } catch {
    return false;
  }
}

async function saveDataToServer(nextData) {
  const normalized = normalizeInputData(nextData);
  const payload = await apiRequest(API.data, {
    method: "PUT",
    body: { data: normalized },
    requiresCsrf: true,
  });

  if (payload.csrfToken) {
    csrfToken = payload.csrfToken;
  } else if (!csrfToken) {
    csrfToken = readCsrfTokenFromCookie();
  }

  return normalizeInputData(payload.data);
}

function normalizeInputData(input) {
  if (store?.normalizeData) {
    return store.normalizeData(input);
  }

  if (input && typeof input === "object") {
    return input;
  }

  return {
    serviceLabels: defaultServiceLabels,
    supportTelegramUrl: defaultSupportTelegramUrl,
    regions: [],
  };
}

async function apiRequest(url, options = {}) {
  const method = options.method || "GET";
  const headers = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.requiresCsrf) {
    headers["x-csrf-token"] = csrfToken || readCsrfTokenFromCookie();
  }

  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage = payload?.error || `Richiesta fallita (${response.status}).`;
    if (response.status === 401 && els.adminAuthGate && els.adminApp) {
      csrfToken = "";
      lockAdmin();
      setAuthStatus("Sessione scaduta. Accedi di nuovo.", "error");
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return payload ?? {};
}
function readCsrfTokenFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)ri_admin_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function getSelectedRegion() {
  const regionId = els.pointRegionSelect.value;
  return data.regions.find((item) => item.id === regionId);
}

function getServiceLabel(serviceId) {
  return data.serviceLabels?.[serviceId] || defaultServiceLabels[serviceId] || serviceId;
}

function makeUniquePointId(baseId, points) {
  const normalizedBase = slugify(baseId) || "nuovo-punto";
  if (!points.some((point) => point.id === normalizedBase)) {
    return normalizedBase;
  }

  let counter = 2;
  let candidate = `${normalizedBase}-${counter}`;
  while (points.some((point) => point.id === candidate)) {
    counter += 1;
    candidate = `${normalizedBase}-${counter}`;
  }
  return candidate;
}

function moveArrayItem(list, fromIndex, toIndex) {
  const copy = list.splice(fromIndex, 1)[0];
  list.splice(toIndex, 0, copy);
}

function clonePoint(point) {
  return JSON.parse(JSON.stringify(point));
}

function clampStars(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(3, Math.round(num)));
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getInitials(name) {
  const parts = String(name || "")
    .split(" ")
    .filter(Boolean);
  if (parts.length === 0) return "PT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function isValidAbsoluteUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidTelegramUrl(value) {
  if (!isValidAbsoluteUrl(value)) return false;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, "");
    return host === "t.me";
  } catch {
    return false;
  }
}

function isUrlOrPath(value) {
  const candidate = String(value || "").trim();
  if (!candidate) return false;
  if (candidate.startsWith("data:")) return true;
  if (isValidAbsoluteUrl(candidate)) return true;
  return (
    candidate.startsWith("./") ||
    candidate.startsWith("../") ||
    candidate.startsWith("/") ||
    candidate.startsWith("assets/")
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}

function downloadJsonFile(content, fileName) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function timestampNow() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function setStatus(message, tone = "success", sticky = false) {
  if (!els.adminStatus) return;

  clearTimeout(statusTimer);
  els.adminStatus.textContent = message;
  els.adminStatus.dataset.tone = tone;

  if (sticky) return;
  statusTimer = window.setTimeout(() => {
    if (!els.adminStatus) return;
    els.adminStatus.textContent = "";
    els.adminStatus.dataset.tone = "";
  }, 5200);
}

function safeFocus(element) {
  if (!element || typeof element.focus !== "function") return;
  window.setTimeout(() => {
    element.focus();
  }, 0);
}

function scrollToPointsPanel() {
  if (!els.pointsPanel || typeof els.pointsPanel.scrollIntoView !== "function") return;
  els.pointsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}
