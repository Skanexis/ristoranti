
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
const SHIP_ORIGINS = ["italy", "eu"];
const POINT_SERVICES = ["meetup", "delivery", "ship"];

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
let pointFormSnapshot = "";
let inlineHintCounter = 0;
let draggedRegionId = "";
let draggedPointId = "";
let selectedPointIds = new Set();

const els = {
  adminAuthGate: document.getElementById("adminAuthGate"),
  adminAuthForm: document.getElementById("adminAuthForm"),
  adminLogin: document.getElementById("adminLogin"),
  adminPassword: document.getElementById("adminPassword"),
  adminAuthStatus: document.getElementById("adminAuthStatus"),
  adminApp: document.getElementById("adminApp"),
  adminSectionNav: document.querySelector(".admin-section-nav"),
  servicesPanelFold: document.querySelector("#servicesPanel .admin-panel-fold"),
  regionsPanelFold: document.querySelector("#regionsPanel .admin-panel-fold"),
  pointsPanelFold: document.querySelector("#pointsPanel .admin-panel-fold"),
  toolsPanelFold: document.querySelector("#toolsPanel .admin-panel-fold"),

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
  regionShipOrigin: document.getElementById("regionShipOrigin"),
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
  pointsEditorWrap: document.querySelector("#pointsPanel .points-editor-wrap"),
  pointEditingId: document.getElementById("pointEditingId"),
  pointId: document.getElementById("pointId"),
  pointName: document.getElementById("pointName"),
  pointAddress: document.getElementById("pointAddress"),
  pointShipOrigin: document.getElementById("pointShipOrigin"),
  pointShipCountry: document.getElementById("pointShipCountry"),
  pointDetails: document.getElementById("pointDetails"),
  pointLogo: document.getElementById("pointLogo"),
  pointLogoUploadBtn: document.getElementById("pointLogoUploadBtn"),
  pointLogoFileInput: document.getElementById("pointLogoFileInput"),
  pointLogoClearBtn: document.getElementById("pointLogoClearBtn"),
  pointLogoStatus: document.getElementById("pointLogoStatus"),
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
  pointFormStickyBar: document.getElementById("pointFormStickyBar"),
  pointFormDirtyState: document.getElementById("pointFormDirtyState"),
  pointBlockIdentity: document.getElementById("pointBlockIdentity"),
  socialRows: document.getElementById("socialRows"),
  addSocialBtn: document.getElementById("addSocialBtn"),
  clearSocialsBtn: document.getElementById("clearSocialsBtn"),
  bulkSelectionCount: document.getElementById("bulkSelectionCount"),
  bulkSelectVisibleBtn: document.getElementById("bulkSelectVisibleBtn"),
  bulkClearSelectionBtn: document.getElementById("bulkClearSelectionBtn"),
  bulkServiceSelect: document.getElementById("bulkServiceSelect"),
  bulkServiceAction: document.getElementById("bulkServiceAction"),
  bulkApplyServiceBtn: document.getElementById("bulkApplyServiceBtn"),
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
  collapseAdminPanels();
  resetRegionForm();
  resetPointForm();
  setupPointFormCollapsibles();
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

function collapseAdminPanels() {
  [els.servicesPanelFold, els.regionsPanelFold, els.pointsPanelFold, els.toolsPanelFold].forEach((panel) => {
    if (panel) {
      panel.open = false;
    }
  });
}

function openAdminPanel(panelElement) {
  if (panelElement) {
    panelElement.open = true;
  }
}

function focusPointEditorForm(field = els.pointName) {
  openAdminPanel(els.pointsPanelFold);
  if (els.pointBlockIdentity) {
    els.pointBlockIdentity.open = true;
  }

  const editorTarget = els.pointsEditorWrap || els.pointForm;
  if (editorTarget && typeof editorTarget.scrollIntoView === "function") {
    editorTarget.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  window.setTimeout(() => {
    safeFocus(field);
  }, 180);
}

function getPanelFoldBySectionId(sectionId) {
  if (sectionId === "servicesPanel") return els.servicesPanelFold;
  if (sectionId === "regionsPanel") return els.regionsPanelFold;
  if (sectionId === "pointsPanel") return els.pointsPanelFold;
  if (sectionId === "toolsPanel") return els.toolsPanelFold;
  return null;
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
  if (els.adminSectionNav) {
    els.adminSectionNav.addEventListener("click", (event) => {
      const link = event.target.closest(".admin-nav-link[href^='#']");
      if (!link) return;
      const sectionId = String(link.getAttribute("href") || "").replace(/^#/, "");
      const panel = getPanelFoldBySectionId(sectionId);
      openAdminPanel(panel);
    });
  }

  els.servicesForm.addEventListener("submit", handleServicesSubmit);
  els.resetServicesBtn.addEventListener("click", handleServicesReset);
  els.serviceSupportTelegram.addEventListener("input", () => {
    validateSupportTelegramInline();
  });
  els.serviceSupportTelegram.addEventListener("blur", () => {
    validateSupportTelegramInline();
  });

  els.regionForm.addEventListener("submit", handleRegionSubmit);
  els.regionCancelEdit.addEventListener("click", resetRegionForm);
  els.regionList.addEventListener("click", handleRegionActions);
  els.regionList.addEventListener("dragstart", handleRegionDragStart);
  els.regionList.addEventListener("dragover", handleRegionDragOver);
  els.regionList.addEventListener("drop", handleRegionDrop);
  els.regionList.addEventListener("dragend", clearRegionDragState);
  els.regionList.addEventListener("dragleave", handleRegionDragLeave);
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
      openAdminPanel(els.regionsPanelFold);
      resetRegionForm();
      safeFocus(els.regionName);
    });
  }

  if (els.regionSearch) {
    els.regionSearch.addEventListener("input", renderRegionList);
  }

  els.pointRegionSelect.addEventListener("change", () => {
    openAdminPanel(els.pointsPanelFold);
    editingPointId = null;
    selectedPointIds.clear();
    resetPointForm();
    syncShipCountryFieldState();
    validatePointShipCountryInline();
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
      focusPointEditorForm(els.pointName);
    });
  }

  els.pointForm.addEventListener("submit", handlePointSubmit);
  els.pointCancelEdit.addEventListener("click", handlePointCancelEdit);
  els.pointsList.addEventListener("click", handlePointActions);
  els.pointsList.addEventListener("change", handlePointSelectionChange);
  els.pointsList.addEventListener("dragstart", handlePointDragStart);
  els.pointsList.addEventListener("dragover", handlePointDragOver);
  els.pointsList.addEventListener("drop", handlePointDrop);
  els.pointsList.addEventListener("dragend", clearPointDragState);
  els.pointsList.addEventListener("dragleave", handlePointDragLeave);
  els.pointForm.addEventListener("input", clearPointFormErrors);
  els.pointForm.addEventListener("change", clearPointFormErrors);

  if (els.bulkSelectVisibleBtn) {
    els.bulkSelectVisibleBtn.addEventListener("click", handleBulkSelectVisible);
  }
  if (els.bulkClearSelectionBtn) {
    els.bulkClearSelectionBtn.addEventListener("click", handleBulkClearSelection);
  }
  if (els.bulkApplyServiceBtn) {
    els.bulkApplyServiceBtn.addEventListener("click", handleBulkApplyService);
  }

  els.pointId.addEventListener("input", () => {
    pointIdTouched = true;
    renderPointPreview();
    updatePointFormDirtyState();
  });
  els.pointName.addEventListener("input", () => {
    if (!pointIdTouched) {
      els.pointId.value = slugify(els.pointName.value);
    }
    renderPointPreview();
    updatePointFormDirtyState();
  });
  els.pointAddress.addEventListener("input", () => {
    renderPointPreview();
    updatePointFormDirtyState();
  });
  if (els.pointShipOrigin) {
    els.pointShipOrigin.addEventListener("change", () => {
      syncShipCountryFieldState();
      validatePointShipCountryInline();
      renderPointPreview();
      updatePointFormDirtyState();
    });
  }
  if (els.pointShipCountry) {
    els.pointShipCountry.addEventListener("input", () => {
      renderPointPreview();
      validatePointShipCountryInline();
      updatePointFormDirtyState();
    });
  }
  els.pointDetails.addEventListener("input", () => {
    renderPointPreview();
    updatePointFormDirtyState();
  });
  els.pointLogo.addEventListener("input", () => {
    renderPointPreview();
    validatePointLogoInline();
    updatePointFormDirtyState();
  });
  if (els.pointLogoUploadBtn && els.pointLogoFileInput) {
    els.pointLogoUploadBtn.addEventListener("click", () => {
      els.pointLogoFileInput.click();
    });
    els.pointLogoFileInput.addEventListener("change", () => {
      void handlePointLogoUpload();
    });
  }
  if (els.pointLogoClearBtn) {
    els.pointLogoClearBtn.addEventListener("click", () => {
      els.pointLogo.value = "";
      if (els.pointLogoFileInput) {
        els.pointLogoFileInput.value = "";
      }
      setPointLogoStatus("Logo rimosso.");
      validatePointLogoInline();
      renderPointPreview();
      updatePointFormDirtyState();
    });
  }
  els.pointMediaType.addEventListener("change", () => {
    renderPointPreview();
    validatePointMediaUrlInline();
    updatePointFormDirtyState();
  });
  els.pointMediaUrl.addEventListener("input", () => {
    renderPointPreview();
    validatePointMediaUrlInline();
    updatePointFormDirtyState();
  });
  els.pointStars.addEventListener("change", () => {
    renderPointPreview();
    updatePointFormDirtyState();
  });
  els.pointForm
    .querySelectorAll("input[name='services']")
    .forEach((checkbox) =>
      checkbox.addEventListener("change", () => {
        syncShipCountryFieldState();
        validatePointShipCountryInline();
        renderPointPreview();
        updatePointFormDirtyState();
      })
    );

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
    validatePointMediaUrlInline();
    renderPointPreview();
    updatePointFormDirtyState();
  });

  els.addSocialBtn.addEventListener("click", () => {
    addSocialRow();
    validateAllSocialRowsInline();
    updatePointFormDirtyState();
  });
  els.clearSocialsBtn.addEventListener("click", () => {
    els.socialRows.innerHTML = "";
    addSocialRow();
    validateAllSocialRowsInline();
    renderPointPreview();
    updatePointFormDirtyState();
  });
  els.socialRows.addEventListener("click", (event) => {
    const btn = event.target.closest(".social-remove");
    if (!btn) return;
    btn.closest(".social-row")?.remove();
    if (els.socialRows.children.length === 0) {
      addSocialRow();
    }
    validateAllSocialRowsInline();
    renderPointPreview();
    updatePointFormDirtyState();
  });
  els.socialRows.addEventListener("input", (event) => {
    const row = event.target?.closest?.(".social-row");
    if (row) {
      validateSocialRowInline(row);
    }
    renderPointPreview();
    updatePointFormDirtyState();
  });

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
  validateSupportTelegramInline();
}

function handleServicesSubmit(event) {
  event.preventDefault();
  const meetup = els.serviceMeetup.value.trim();
  const delivery = els.serviceDelivery.value.trim();
  const ship = els.serviceShip.value.trim();
  const supportTelegram = els.serviceSupportTelegram.value.trim();

  if (!meetup || !delivery || !ship || !supportTelegram) {
    setStatus("Le etichette servizi non possono essere vuote.", "error");
    validateSupportTelegramInline();
    return;
  }

  const telegramValidation = validateSupportTelegramInline();
  if (!telegramValidation.valid) {
    setStatus(telegramValidation.message || "URL supporto Telegram non valido. Usa formato https://t.me/username.", "error");
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
  validateSupportTelegramInline();
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
      const pointsCount = Array.isArray(region.activePoints) ? region.activePoints.length : 0;
      const isActive = region.id === selectedRegionId;
      const isEditing = region.id === editingRegionId;

      return `
        <article class="admin-item admin-item-sortable ${isActive ? "is-active" : ""} ${isEditing ? "is-editing" : ""}" data-region-id="${escapeHtmlAttr(
          region.id
        )}" draggable="true">
          <div class="admin-item-top">
            <p class="admin-item-title">${escapeHtml(region.name)}</p>
            <p class="admin-item-id">${escapeHtml(region.id)}</p>
          </div>
          <p class="admin-item-meta">Hub: ${escapeHtml(region.hubs || "Non impostati")}</p>
          <div class="admin-item-tags">
            <span class="mini-chip">${formatPointCount(pointsCount)}</span>
            ${isActive ? `<span class="mini-chip">Regione attiva</span>` : ""}
            ${isEditing ? `<span class="mini-chip">In modifica</span>` : ""}
          </div>
          <p class="admin-item-drag-hint">Trascina la card per ordinare.</p>
          <div class="admin-item-actions">
            <button class="admin-btn" data-region-action="manage-points" data-region-id="${escapeHtmlAttr(
              region.id
            )}">Apri punti</button>
            <button class="admin-btn admin-btn-secondary" data-region-action="edit" data-region-id="${escapeHtmlAttr(
              region.id
            )}">Modifica</button>
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
    openAdminPanel(els.regionsPanelFold);
    editingRegionId = region.id;
    regionIdTouched = true;
    els.regionEditingId.value = region.id;
    els.regionId.value = region.id;
    els.regionName.value = region.name;
    els.regionHubs.value = region.hubs || "";
    if (els.regionShipOrigin) {
      els.regionShipOrigin.value = getRegionShipOrigin(region);
    }
    updateRegionFormUi();
    safeFocus(els.regionName);
    renderRegionList();
    setStatus(`Modifica regione: ${region.name}`, "warn");
    return;
  }

  if (action === "manage-points") {
    openAdminPanel(els.pointsPanelFold);
    els.pointRegionSelect.value = region.id;
    editingPointId = null;
    selectedPointIds.clear();
    resetPointForm();
    renderRegionList();
    renderPointsList();
    renderPointsContext();
    scrollToPointsPanel();
    setStatus(`Gestione punti per ${region.name}`);
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

function handleRegionDragStart(event) {
  const regionCard = event.target.closest(".admin-item-sortable[data-region-id]");
  if (!regionCard || event.target.closest(".admin-item-actions")) {
    event.preventDefault();
    return;
  }

  draggedRegionId = regionCard.dataset.regionId || "";
  if (!draggedRegionId) {
    event.preventDefault();
    return;
  }

  regionCard.classList.add("is-dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedRegionId);
  }
}

function handleRegionDragOver(event) {
  if (!draggedRegionId) return;
  event.preventDefault();

  const targetCard = event.target.closest(".admin-item-sortable[data-region-id]");
  clearRegionDropMarkers();

  if (!targetCard || targetCard.dataset.regionId === draggedRegionId) {
    const sortableCards = Array.from(els.regionList.querySelectorAll(".admin-item-sortable[data-region-id]")).filter(
      (card) => card.dataset.regionId !== draggedRegionId
    );
    const lastCard = sortableCards[sortableCards.length - 1];
    if (lastCard) {
      lastCard.classList.add("drop-after");
    }
    return;
  }

  const dropPosition = getDropPosition(event, targetCard);
  targetCard.classList.add(dropPosition === "before" ? "drop-before" : "drop-after");
}

function handleRegionDrop(event) {
  if (!draggedRegionId) return;
  event.preventDefault();

  const targetCard = event.target.closest(".admin-item-sortable[data-region-id]");
  const sourceIndex = data.regions.findIndex((region) => region.id === draggedRegionId);
  if (sourceIndex < 0) {
    clearRegionDragState();
    return;
  }

  const draggedRegion = data.regions[sourceIndex];
  let targetId = targetCard?.dataset.regionId || "";
  let dropPosition = "after";

  if (targetCard) {
    dropPosition = getDropPosition(event, targetCard);
  } else {
    const sortableCards = Array.from(els.regionList.querySelectorAll(".admin-item-sortable[data-region-id]")).filter(
      (card) => card.dataset.regionId !== draggedRegionId
    );
    const lastCard = sortableCards[sortableCards.length - 1];
    if (lastCard) {
      targetId = lastCard.dataset.regionId || "";
      dropPosition = "after";
    }
  }

  if (!targetId || targetId === draggedRegionId) {
    clearRegionDragState();
    return;
  }

  const targetIndex = data.regions.findIndex((region) => region.id === targetId);
  if (targetIndex < 0) {
    clearRegionDragState();
    return;
  }

  let destinationIndex = targetIndex + (dropPosition === "after" ? 1 : 0);
  if (sourceIndex < destinationIndex) {
    destinationIndex -= 1;
  }

  if (destinationIndex === sourceIndex) {
    clearRegionDragState();
    return;
  }

  moveArrayItem(data.regions, sourceIndex, destinationIndex);
  clearRegionDragState();
  renderRegionList();
  persistData(`Ordine regioni aggiornato: ${draggedRegion.name}`);
}

function handleRegionDragLeave(event) {
  if (!draggedRegionId) return;
  if (event.currentTarget === event.target) {
    clearRegionDropMarkers();
  }
}

function clearRegionDropMarkers() {
  els.regionList
    .querySelectorAll(".admin-item-sortable.drop-before, .admin-item-sortable.drop-after")
    .forEach((card) => card.classList.remove("drop-before", "drop-after"));
}

function clearRegionDragState() {
  draggedRegionId = "";
  clearRegionDropMarkers();
  els.regionList
    .querySelectorAll(".admin-item-sortable.is-dragging")
    .forEach((card) => card.classList.remove("is-dragging"));
}

function handleRegionSubmit(event) {
  event.preventDefault();

  const id = slugify(els.regionId.value);
  const name = els.regionName.value.trim();
  const hubs = els.regionHubs.value.trim();
  const editingRegion = editingRegionId ? data.regions.find((item) => item.id === editingRegionId) : null;
  const shipOrigin = els.regionShipOrigin
    ? normalizeShipOrigin(els.regionShipOrigin.value)
    : getRegionShipOrigin(editingRegion);

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
    region.shipOrigin = shipOrigin;
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
    shipOrigin,
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
  if (els.regionShipOrigin) {
    els.regionShipOrigin.value = "italy";
  }
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
  const label = formatPointCount(pointsCount);
  els.pointsContextHint.textContent = `Regione attiva: ${region.name}. ${label} configurati.`;

  if (els.pointCreateNew) {
    els.pointCreateNew.disabled = false;
  }
}

function getFilteredPoints(region) {
  if (!region) return [];

  const points = Array.isArray(region.activePoints) ? region.activePoints : [];
  const search = els.pointSearch.value.trim().toLowerCase();
  const serviceFilter = els.pointServiceFilter.value;
  const starFilter = els.pointStarFilter.value;

  return points.filter((point) => {
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
}

function prunePointSelection(region) {
  if (!region || !Array.isArray(region.activePoints)) {
    selectedPointIds.clear();
    return;
  }

  const validIds = new Set(region.activePoints.map((point) => point.id));
  selectedPointIds.forEach((id) => {
    if (!validIds.has(id)) {
      selectedPointIds.delete(id);
    }
  });
}

function syncPointsBulkUi(region, filteredPoints = []) {
  if (!region) {
    selectedPointIds.clear();
  } else {
    prunePointSelection(region);
  }

  const visibleIds = filteredPoints.map((point) => point.id);
  const selectedCount = selectedPointIds.size;
  const visibleSelectedCount = visibleIds.filter((id) => selectedPointIds.has(id)).length;
  const hasVisible = visibleIds.length > 0;
  const allVisibleSelected = hasVisible && visibleSelectedCount === visibleIds.length;

  if (els.bulkSelectionCount) {
    els.bulkSelectionCount.textContent = selectedCount > 0 ? `${selectedCount} selezionati` : "Nessun punto selezionato";
  }

  if (els.bulkSelectVisibleBtn) {
    els.bulkSelectVisibleBtn.disabled = !region || !hasVisible;
    els.bulkSelectVisibleBtn.textContent = allVisibleSelected ? "Deseleziona visibili" : "Seleziona visibili";
  }

  if (els.bulkClearSelectionBtn) {
    els.bulkClearSelectionBtn.disabled = selectedCount === 0;
  }

  if (els.bulkApplyServiceBtn) {
    els.bulkApplyServiceBtn.disabled = !region || selectedCount === 0;
  }
}

function renderPointsList() {
  const region = getSelectedRegion();
  if (!region) {
    syncPointsBulkUi(null, []);
    els.pointsListCount.textContent = "0 punti";
    els.pointsList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Seleziona o crea una regione per gestire i punti.</p>
      </article>
    `;
    return;
  }

  const points = Array.isArray(region.activePoints) ? region.activePoints : [];
  const filtered = getFilteredPoints(region);
  prunePointSelection(region);

  els.pointsListCount.textContent = `${formatPointCount(filtered.length)} / ${formatPointCount(points.length)}`;

  if (filtered.length === 0) {
    syncPointsBulkUi(region, filtered);
    els.pointsList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Nessun punto trovato con i filtri attuali.</p>
      </article>
    `;
    return;
  }

  els.pointsList.innerHTML = filtered
    .map((point) => {
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
      const isSelected = selectedPointIds.has(point.id);
      const hasShip = Array.isArray(point.services) && point.services.includes("ship");
      const shipOrigin = resolvePointShipOrigin(point, region);
      const shipOriginLabel = getShipOriginLabel(shipOrigin);
      const shipCountry = String(point.shipCountry || "").trim();
      const showShipCountry = hasShip && shipOrigin === "eu";

      return `
        <article class="admin-item admin-item-sortable ${isEditing ? "is-editing" : ""} ${isSelected ? "is-selected" : ""}" data-point-id="${escapeHtmlAttr(
          point.id
        )}" draggable="true">
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
            ${hasShip ? `<span class="mini-chip">Ship ${escapeHtml(shipOriginLabel)}</span>` : ""}
            ${showShipCountry ? `<span class="mini-chip">Paese Ship ${escapeHtml(shipCountry || "Non impostato")}</span>` : ""}
          </div>
          <div class="admin-item-tags">${services || `<span class="mini-chip">Nessun servizio</span>`}</div>
          <label class="point-select-control" aria-label="Seleziona punto ${escapeHtmlAttr(point.name || point.id || "punto")}">
            <input
              type="checkbox"
              class="point-select-toggle"
              data-point-id="${escapeHtmlAttr(point.id)}"
              ${isSelected ? "checked" : ""}
            />
            <span>Seleziona</span>
          </label>
          <p class="admin-item-drag-hint">Trascina la card per ordinare.</p>
          <div class="admin-item-actions">
            <button class="admin-btn" data-point-action="edit" data-point-id="${escapeHtmlAttr(point.id)}">Modifica</button>
            <button class="admin-btn admin-btn-secondary" data-point-action="duplicate" data-point-id="${escapeHtmlAttr(
              point.id
            )}">Duplica</button>
            <button class="admin-btn admin-btn-danger" data-point-action="delete" data-point-id="${escapeHtmlAttr(
              point.id
            )}">Elimina</button>
          </div>
        </article>
      `;
    })
    .join("");

  syncPointsBulkUi(region, filtered);
}

function handlePointActions(event) {
  if (event.target.closest(".point-select-control")) {
    return;
  }

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
    focusPointEditorForm(els.pointName);
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

  if (action === "delete") {
    const ok = window.confirm(`Eliminare il punto "${point.name}"?`);
    if (!ok) return;
    region.activePoints = region.activePoints.filter((item) => item.id !== point.id);
    selectedPointIds.delete(point.id);
    if (editingPointId === point.id) {
      resetPointForm();
    }
    persistData(`Punto eliminato: ${point.name}`, "warn", region.id);
  }
}

function handlePointSelectionChange(event) {
  const checkbox = event.target.closest(".point-select-toggle");
  if (!checkbox) return;

  const pointId = String(checkbox.dataset.pointId || "");
  if (!pointId) return;

  if (checkbox.checked) {
    selectedPointIds.add(pointId);
  } else {
    selectedPointIds.delete(pointId);
  }

  const pointCard = checkbox.closest(".admin-item[data-point-id]");
  if (pointCard) {
    pointCard.classList.toggle("is-selected", checkbox.checked);
  }

  const region = getSelectedRegion();
  const filtered = getFilteredPoints(region);
  syncPointsBulkUi(region, filtered);
}

function handleBulkSelectVisible() {
  const region = getSelectedRegion();
  if (!region) {
    setStatus("Seleziona una regione prima delle azioni massive.", "error");
    return;
  }

  const visiblePoints = getFilteredPoints(region);
  if (visiblePoints.length === 0) {
    setStatus("Nessun punto visibile da selezionare.", "warn");
    return;
  }

  const visibleIds = visiblePoints.map((point) => point.id);
  const allVisibleSelected = visibleIds.every((id) => selectedPointIds.has(id));

  if (allVisibleSelected) {
    visibleIds.forEach((id) => selectedPointIds.delete(id));
  } else {
    visibleIds.forEach((id) => selectedPointIds.add(id));
  }

  renderPointsList();
}

function handleBulkClearSelection() {
  selectedPointIds.clear();
  renderPointsList();
}

function handleBulkApplyService() {
  const region = getSelectedRegion();
  if (!region || !Array.isArray(region.activePoints)) {
    setStatus("Seleziona una regione prima delle azioni massive.", "error");
    return;
  }

  prunePointSelection(region);
  if (selectedPointIds.size === 0) {
    setStatus("Seleziona almeno un punto.", "error");
    return;
  }

  const service = String(els.bulkServiceSelect?.value || "");
  const action = String(els.bulkServiceAction?.value || "");

  if (!POINT_SERVICES.includes(service)) {
    setStatus("Servizio bulk non valido.", "error");
    return;
  }
  if (action !== "enable" && action !== "disable") {
    setStatus("Azione bulk non valida.", "error");
    return;
  }

  const selectedSet = new Set(selectedPointIds);
  let updated = 0;
  let skipped = 0;
  let skippedMinService = 0;

  region.activePoints.forEach((point) => {
    if (!selectedSet.has(point.id)) return;

    const currentServicesRaw = Array.isArray(point.services) ? point.services : [];
    const currentServices = Array.from(new Set(currentServicesRaw.filter((item) => POINT_SERVICES.includes(item))));
    const safeCurrentServices = currentServices.length > 0 ? currentServices : ["meetup"];
    const hasService = safeCurrentServices.includes(service);

    if (action === "enable") {
      if (hasService) {
        skipped += 1;
        return;
      }
      point.services = [...safeCurrentServices, service];
      if (service === "ship") {
        point.shipOrigin = resolvePointShipOrigin(point, region);
      }
      updated += 1;
      return;
    }

    if (!hasService) {
      skipped += 1;
      return;
    }

    if (safeCurrentServices.length <= 1) {
      skipped += 1;
      skippedMinService += 1;
      return;
    }

    point.services = safeCurrentServices.filter((item) => item !== service);
    if (service === "ship") {
      point.shipOrigin = "italy";
      point.shipCountry = "";
    }
    updated += 1;
  });

  if (updated === 0) {
    if (action === "disable" && skippedMinService > 0) {
      setStatus("Impossibile rimuovere l'ultimo servizio da alcuni punti selezionati.", "warn");
      return;
    }
    setStatus("Nessun punto aggiornato con questa azione.", "warn");
    return;
  }

  const serviceLabel = getServiceLabel(service);
  const actionLabel = action === "enable" ? "abilitato" : "disabilitato";
  const extra = skipped > 0 ? ` (${skipped} saltati)` : "";
  persistData(`Bulk: ${serviceLabel} ${actionLabel} su ${updated} punti${extra}.`, "success", region.id);
}

function handlePointDragStart(event) {
  const pointCard = event.target.closest(".admin-item-sortable[data-point-id]");
  if (!pointCard || event.target.closest(".admin-item-actions") || event.target.closest(".point-select-control")) {
    event.preventDefault();
    return;
  }

  draggedPointId = pointCard.dataset.pointId || "";
  if (!draggedPointId) {
    event.preventDefault();
    return;
  }

  pointCard.classList.add("is-dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedPointId);
  }
}

function handlePointDragOver(event) {
  if (!draggedPointId) return;
  event.preventDefault();

  const targetCard = event.target.closest(".admin-item-sortable[data-point-id]");
  clearPointDropMarkers();

  if (!targetCard || targetCard.dataset.pointId === draggedPointId) {
    const sortableCards = Array.from(els.pointsList.querySelectorAll(".admin-item-sortable[data-point-id]")).filter(
      (card) => card.dataset.pointId !== draggedPointId
    );
    const lastCard = sortableCards[sortableCards.length - 1];
    if (lastCard) {
      lastCard.classList.add("drop-after");
    }
    return;
  }

  const dropPosition = getDropPosition(event, targetCard);
  targetCard.classList.add(dropPosition === "before" ? "drop-before" : "drop-after");
}

function handlePointDrop(event) {
  if (!draggedPointId) return;
  event.preventDefault();

  const region = getSelectedRegion();
  if (!region || !Array.isArray(region.activePoints)) {
    clearPointDragState();
    return;
  }

  const targetCard = event.target.closest(".admin-item-sortable[data-point-id]");
  const sourceIndex = region.activePoints.findIndex((point) => point.id === draggedPointId);
  if (sourceIndex < 0) {
    clearPointDragState();
    return;
  }

  const draggedPoint = region.activePoints[sourceIndex];
  let targetId = targetCard?.dataset.pointId || "";
  let dropPosition = "after";

  if (targetCard) {
    dropPosition = getDropPosition(event, targetCard);
  } else {
    const sortableCards = Array.from(els.pointsList.querySelectorAll(".admin-item-sortable[data-point-id]")).filter(
      (card) => card.dataset.pointId !== draggedPointId
    );
    const lastCard = sortableCards[sortableCards.length - 1];
    if (lastCard) {
      targetId = lastCard.dataset.pointId || "";
      dropPosition = "after";
    }
  }

  if (!targetId || targetId === draggedPointId) {
    clearPointDragState();
    return;
  }

  const targetIndex = region.activePoints.findIndex((point) => point.id === targetId);
  if (targetIndex < 0) {
    clearPointDragState();
    return;
  }

  let destinationIndex = targetIndex + (dropPosition === "after" ? 1 : 0);
  if (sourceIndex < destinationIndex) {
    destinationIndex -= 1;
  }

  if (destinationIndex === sourceIndex) {
    clearPointDragState();
    return;
  }

  moveArrayItem(region.activePoints, sourceIndex, destinationIndex);
  clearPointDragState();
  renderPointsList();
  persistData(`Ordine punti aggiornato: ${draggedPoint.name}`, "success", region.id);
}

function handlePointDragLeave(event) {
  if (!draggedPointId) return;
  if (event.currentTarget === event.target) {
    clearPointDropMarkers();
  }
}

function clearPointDropMarkers() {
  els.pointsList
    .querySelectorAll(".admin-item-sortable.drop-before, .admin-item-sortable.drop-after")
    .forEach((card) => card.classList.remove("drop-before", "drop-after"));
}

function clearPointDragState() {
  draggedPointId = "";
  clearPointDropMarkers();
  els.pointsList
    .querySelectorAll(".admin-item-sortable.is-dragging")
    .forEach((card) => card.classList.remove("is-dragging"));
}

function handlePointSubmit(event) {
  event.preventDefault();
  clearPointFormErrors();
  validatePointInlineFields();

  const region = getSelectedRegion();
  if (!region) {
    revealPointFieldError(els.pointRegionSelect, "Seleziona prima una regione.");
    return;
  }

  const id = slugify(els.pointId.value);
  const name = els.pointName.value.trim();
  const address = els.pointAddress.value.trim();
  const selectedShipOrigin = normalizeShipOrigin(els.pointShipOrigin?.value);
  const shipCountry = String(els.pointShipCountry?.value || "").trim();
  const details = els.pointDetails.value.trim();
  const logo = els.pointLogo.value.trim();
  const mediaType = normalizeMediaType(els.pointMediaType.value);
  const mediaUrl = els.pointMediaUrl.value.trim();
  const resolvedMediaType = resolvePointMediaType(mediaType, mediaUrl);
  const stars = clampStars(els.pointStars.value);

  if (!id) {
    revealPointFieldError(els.pointId, "Compila ID e nome del punto.");
    return;
  }

  if (!name) {
    revealPointFieldError(els.pointName, "Compila ID e nome del punto.");
    return;
  }

  if (logo && !isUrlOrPath(logo)) {
    revealPointFieldError(els.pointLogo, "Logo URL non valido. Usa URL completo o path relativo.");
    return;
  }

  if (mediaType !== "none" && !mediaUrl) {
    revealPointFieldError(els.pointMediaUrl, "Se scegli un tipo media, inserisci URL oppure carica un file.");
    return;
  }

  if (mediaUrl && !isUrlOrPath(mediaUrl)) {
    revealPointFieldError(els.pointMediaUrl, "Media URL non valido. Usa URL completo, path relativo o data URL.");
    return;
  }

  const selectedServices = Array.from(els.pointForm.querySelectorAll("input[name='services']:checked")).map(
    (input) => input.value
  );
  const services = selectedServices.length > 0 ? selectedServices : ["meetup"];
  const isShipEnabled = services.includes("ship");
  const pointShipOrigin = isShipEnabled ? selectedShipOrigin : "italy";
  const needsShipCountry = isShipEnabled && pointShipOrigin === "eu";

  if (needsShipCountry && !shipCountry) {
    revealPointFieldError(els.pointShipCountry, "Per punti Ship da UE inserisci il paese di spedizione.");
    return;
  }

  if (needsShipCountry && !isValidShipCountryName(shipCountry)) {
    revealPointFieldError(els.pointShipCountry, "Inserisci un paese valido (solo lettere, spazi o trattini).");
    return;
  }

  const socials = collectSocialRows();
  if (!socials.ok) {
    revealPointFieldError(socials.errorElement || els.socialRows, socials.message);
    return;
  }

  if (editingPointId) {
    const previousPointId = editingPointId;
    const point = region.activePoints.find((item) => item.id === previousPointId);
    if (!point) {
      setStatus("Punto in modifica non trovato.", "error");
      return;
    }

    const conflict = region.activePoints.some((item) => item.id === id && item.id !== previousPointId);
    if (conflict) {
      revealPointFieldError(els.pointId, "ID punto gia in uso nella regione.");
      return;
    }

    point.id = id;
    point.name = name;
    point.address = address;
    point.shipOrigin = pointShipOrigin;
    point.shipCountry = needsShipCountry ? shipCountry : "";
    point.details = details;
    point.logo = logo;
    point.mediaType = resolvedMediaType;
    point.mediaUrl = mediaUrl;
    point.stars = stars;
    point.services = services;
    point.socials = socials.items;
    editingPointId = id;
    if (selectedPointIds.has(previousPointId)) {
      selectedPointIds.delete(previousPointId);
      selectedPointIds.add(id);
    }

    persistData(`Punto aggiornato: ${name}`, "success", region.id);
    resetPointForm();
    return;
  }

  const exists = region.activePoints.some((item) => item.id === id);
  if (exists) {
    revealPointFieldError(els.pointId, "ID punto gia in uso nella regione.");
    return;
  }

  region.activePoints.push({
    id,
    name,
    address,
    shipOrigin: pointShipOrigin,
    shipCountry: needsShipCountry ? shipCountry : "",
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
  const region = getSelectedRegion();
  editingPointId = point.id;
  pointIdTouched = true;
  els.pointEditingId.value = point.id;
  els.pointId.value = point.id || "";
  els.pointName.value = point.name || "";
  els.pointAddress.value = point.address || "";
  if (els.pointShipOrigin) {
    els.pointShipOrigin.value = resolvePointShipOrigin(point, region);
  }
  if (els.pointShipCountry) {
    els.pointShipCountry.value = point.shipCountry || "";
  }
  els.pointDetails.value = point.details || "";
  els.pointLogo.value = point.logo || "";
  els.pointMediaType.value = resolvePointMediaType(point.mediaType, point.mediaUrl);
  els.pointMediaUrl.value = point.mediaUrl || "";
  els.pointStars.value = String(clampStars(point.stars));
  setPointLogoStatus("");
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

  syncShipCountryFieldState();
  clearPointFormErrors();
  updatePointFormUi();
  renderPointsList();
  renderPointPreview();
  capturePointFormSnapshot();
  validatePointInlineFields();
}

function resetPointForm() {
  const region = getSelectedRegion();
  editingPointId = null;
  pointIdTouched = false;
  els.pointEditingId.value = "";
  els.pointForm.reset();
  els.pointMediaType.value = "none";
  els.pointMediaUrl.value = "";
  if (els.pointLogoFileInput) {
    els.pointLogoFileInput.value = "";
  }
  if (els.pointMediaFileInput) {
    els.pointMediaFileInput.value = "";
  }
  setPointLogoStatus("");
  setPointMediaStatus("");
  els.pointStars.value = "0";
  els.pointForm
    .querySelectorAll("input[name='services']")
    .forEach((checkbox) => (checkbox.checked = checkbox.value === "meetup"));
  if (els.pointShipOrigin) {
    els.pointShipOrigin.value = getRegionShipOrigin(region);
  }
  if (els.pointShipCountry) {
    els.pointShipCountry.value = "";
  }
  els.socialRows.innerHTML = "";
  addSocialRow();
  syncShipCountryFieldState();
  clearPointFormErrors();
  updatePointFormUi();
  renderPointsList();
  renderPointPreview();
  capturePointFormSnapshot();
  validatePointInlineFields();
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

function setupPointFormCollapsibles() {
  if (!els.pointForm) return;
  const collapsibles = els.pointForm.querySelectorAll(".admin-collapsible");
  collapsibles.forEach((block) => {
    const summary = block.querySelector(".admin-collapsible-summary");
    if (!summary) return;
    summary.setAttribute("role", "button");
  });
}

function serializePointFormState() {
  if (!els.pointForm) return "";

  const servicesSnapshot = Array.from(els.pointForm.querySelectorAll("input[name='services']"))
    .map((checkbox) => `${checkbox.value}:${checkbox.checked ? "1" : "0"}`)
    .join("|");
  const socialsSnapshot = Array.from(els.socialRows.querySelectorAll(".social-row"))
    .map((row) => {
      const label = row.querySelector(".social-label")?.value.trim() || "";
      const url = row.querySelector(".social-url")?.value.trim() || "";
      return `${label}=>${url}`;
    })
    .join("||");

  return JSON.stringify({
    id: els.pointId.value.trim(),
    name: els.pointName.value.trim(),
    address: els.pointAddress.value.trim(),
    shipOrigin: normalizeShipOrigin(els.pointShipOrigin?.value),
    shipCountry: String(els.pointShipCountry?.value || "").trim(),
    details: els.pointDetails.value.trim(),
    logo: els.pointLogo.value.trim(),
    mediaType: els.pointMediaType.value,
    mediaUrl: els.pointMediaUrl.value.trim(),
    stars: els.pointStars.value,
    servicesSnapshot,
    socialsSnapshot,
  });
}

function capturePointFormSnapshot() {
  pointFormSnapshot = serializePointFormState();
  updatePointFormDirtyState();
}

function isPointFormDirty() {
  return serializePointFormState() !== pointFormSnapshot;
}

function updatePointFormDirtyState() {
  if (!els.pointForm || !els.pointFormDirtyState) return;

  const dirty = isPointFormDirty();
  els.pointForm.classList.toggle("is-dirty", dirty);
  if (els.pointFormStickyBar) {
    els.pointFormStickyBar.dataset.dirty = dirty ? "true" : "false";
  }
  els.pointFormDirtyState.textContent = dirty ? "Есть несохранённые изменения" : "Nessuna modifica";
}

function handlePointCancelEdit() {
  if (isPointFormDirty()) {
    const ok = window.confirm("Annullare le modifiche non salvate?");
    if (!ok) return;
  }
  resetPointForm();
}

function clearPointFormErrors() {
  if (els.pointRegionSelect) {
    els.pointRegionSelect.classList.remove("admin-error-field");
  }
  if (!els.pointForm) return;
  els.pointForm.querySelectorAll(".admin-error-field").forEach((node) => node.classList.remove("admin-error-field"));
  els.pointForm.querySelectorAll(".admin-error-row").forEach((node) => node.classList.remove("admin-error-row"));
}

function revealPointFieldError(target, message) {
  setStatus(message, "error");
  openAdminPanel(els.pointsPanelFold);
  if (!target || !(target instanceof HTMLElement)) return;

  const collapsible = target.closest(".admin-collapsible");
  if (collapsible && collapsible.tagName === "DETAILS") {
    collapsible.open = true;
  }

  const field = target.matches("input, select, textarea")
    ? target
    : target.querySelector?.("input, select, textarea");
  if (field) {
    field.classList.add("admin-error-field");
  }

  const row = target.closest(".social-row");
  if (row) {
    row.classList.add("admin-error-row");
  }

  const scrollTarget = target.closest(".social-row, label, .admin-form-block") || target;
  window.requestAnimationFrame(() => {
    scrollTarget.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    if (field && typeof field.focus === "function") {
      window.setTimeout(() => {
        field.focus({ preventScroll: true });
      }, 180);
    }
  });
}

function ensureInlineValidationHint(field) {
  if (!field || !(field instanceof HTMLElement)) return null;

  if (!field.dataset.inlineHintId) {
    inlineHintCounter += 1;
    const base = field.id ? `${field.id}-inline` : "inline-field";
    field.dataset.inlineHintId = `${base}-${inlineHintCounter}`;
  }

  const hintId = field.dataset.inlineHintId;
  let hint = document.getElementById(hintId);
  if (!hint) {
    hint = document.createElement("p");
    hint.id = hintId;
    hint.className = "admin-inline-validation";
    hint.dataset.tone = "neutral";
    hint.hidden = true;
    hint.setAttribute("aria-live", "polite");
    field.insertAdjacentElement("afterend", hint);
  }

  const ariaDescribedBy = (field.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!ariaDescribedBy.includes(hintId)) {
    ariaDescribedBy.push(hintId);
    field.setAttribute("aria-describedby", ariaDescribedBy.join(" "));
  }

  return hint;
}

function setInlineFieldValidation(field, tone = "neutral", message = "") {
  if (!field || !(field instanceof HTMLElement)) {
    return { valid: true, message: "" };
  }

  const hint = ensureInlineValidationHint(field);
  const normalizedTone = tone === "error" ? "error" : tone === "success" ? "success" : "neutral";

  if (hint) {
    hint.textContent = message || "";
    hint.dataset.tone = normalizedTone;
    hint.hidden = !message;
  }

  field.classList.remove("admin-inline-invalid", "admin-inline-valid");
  field.removeAttribute("aria-invalid");

  if (normalizedTone === "error") {
    field.classList.add("admin-inline-invalid");
    field.setAttribute("aria-invalid", "true");
  } else if (normalizedTone === "success") {
    field.classList.add("admin-inline-valid");
  }

  return { valid: normalizedTone !== "error", message };
}

function validateSupportTelegramInline() {
  const field = els.serviceSupportTelegram;
  const value = String(field?.value || "").trim();

  if (!value) {
    return setInlineFieldValidation(
      field,
      "error",
      "Inserisci il link supporto (formato: https://t.me/username)."
    );
  }

  if (!isValidAbsoluteUrl(value)) {
    return setInlineFieldValidation(field, "error", "URL non valido. Usa formato https://t.me/username.");
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/^\/+/, "");
    if (host !== "t.me") {
      return setInlineFieldValidation(field, "error", "Dominio non valido. Usa solo t.me.");
    }
    if (!path) {
      return setInlineFieldValidation(field, "error", "Aggiungi username dopo t.me/.");
    }
  } catch {
    return setInlineFieldValidation(field, "error", "URL Telegram non valido.");
  }

  return setInlineFieldValidation(field, "success", "Link Telegram valido.");
}

function validatePointLogoInline() {
  const field = els.pointLogo;
  const value = String(field?.value || "").trim();

  if (!value) {
    return setInlineFieldValidation(field, "neutral", "Opzionale: URL https://... oppure path /assets/logo.png.");
  }

  if (!isUrlOrPath(value)) {
    return setInlineFieldValidation(field, "error", "Logo non valido. Usa URL completo o path relativo.");
  }

  return setInlineFieldValidation(field, "success", "Logo valido.");
}

function validatePointMediaUrlInline() {
  const field = els.pointMediaUrl;
  const mediaType = normalizeMediaType(els.pointMediaType?.value);
  const mediaUrl = String(field?.value || "").trim();
  const hasMediaType = mediaType !== "none";

  if (hasMediaType && !mediaUrl) {
    return setInlineFieldValidation(field, "error", "Inserisci URL media o carica un file.");
  }

  if (!mediaUrl) {
    return setInlineFieldValidation(field, "neutral", "Supporta URL https://..., path relativo o data URL.");
  }

  if (!isUrlOrPath(mediaUrl)) {
    return setInlineFieldValidation(field, "error", "Media URL non valido. Usa URL completo, path o data URL.");
  }

  return setInlineFieldValidation(field, "success", "Media URL valido.");
}

function isValidShipCountryName(value) {
  const candidate = String(value || "").trim();
  if (candidate.length < 2 || candidate.length > 56) return false;
  return /^[A-Za-zÀ-ÖØ-öø-ÿ'. -]+$/.test(candidate);
}

function validatePointShipCountryInline() {
  const field = els.pointShipCountry;
  if (!field) return { valid: true, message: "" };

  const region = getSelectedRegion();
  const shipSelected = hasShipServiceSelected();
  const pointShipOrigin = normalizeShipOrigin(els.pointShipOrigin?.value);
  const isRequired = Boolean(region) && shipSelected && pointShipOrigin === "eu";
  const value = String(field.value || "").trim();

  if (!region || !shipSelected) {
    return setInlineFieldValidation(field, "neutral", "Attiva il servizio Ship per scegliere il paese.");
  }

  if (!isRequired) {
    return setInlineFieldValidation(field, "neutral", "Richiesto solo per punti Ship da altri paesi UE.");
  }

  if (!value) {
    return setInlineFieldValidation(field, "error", "Campo obbligatorio per Ship da UE.");
  }

  if (!isValidShipCountryName(value)) {
    return setInlineFieldValidation(field, "error", "Inserisci un paese valido (solo lettere, spazi o trattini).");
  }

  return setInlineFieldValidation(field, "success", "Paese Ship valido.");
}

function setSocialRowInlineValidation(row, message = "", tone = "neutral", errorElement = null) {
  if (!row) return;
  const labelInput = row.querySelector(".social-label");
  const urlInput = row.querySelector(".social-url");
  const hint = row.querySelector(".social-row-hint");

  if (labelInput) {
    labelInput.classList.remove("admin-inline-invalid", "admin-inline-valid");
    labelInput.removeAttribute("aria-invalid");
  }
  if (urlInput) {
    urlInput.classList.remove("admin-inline-invalid", "admin-inline-valid");
    urlInput.removeAttribute("aria-invalid");
  }

  if (hint) {
    hint.textContent = message || "";
    hint.dataset.tone = tone;
    hint.hidden = !message;
  }

  if (tone === "error" && errorElement instanceof HTMLElement) {
    errorElement.classList.add("admin-inline-invalid");
    errorElement.setAttribute("aria-invalid", "true");
  }
}

function validateSocialRowInline(row) {
  const labelInput = row?.querySelector(".social-label");
  const urlInput = row?.querySelector(".social-url");
  const label = labelInput?.value.trim() || "";
  const url = urlInput?.value.trim() || "";

  if (!label && !url) {
    setSocialRowInlineValidation(row);
    return { ok: true, item: null };
  }

  if (!label) {
    const message = "Inserisci etichetta social.";
    setSocialRowInlineValidation(row, message, "error", labelInput);
    return { ok: false, message: "Ogni social deve avere etichetta e URL.", errorElement: labelInput };
  }

  if (!url) {
    const message = "Inserisci URL social completo.";
    setSocialRowInlineValidation(row, message, "error", urlInput);
    return { ok: false, message: "Ogni social deve avere etichetta e URL.", errorElement: urlInput };
  }

  if (!isValidAbsoluteUrl(url)) {
    const message = "URL social non valido. Usa https://...";
    setSocialRowInlineValidation(row, message, "error", urlInput);
    return { ok: false, message: `URL social non valido: ${url}`, errorElement: urlInput };
  }

  setSocialRowInlineValidation(row);
  return { ok: true, item: { label, url } };
}

function validateAllSocialRowsInline() {
  const rows = Array.from(els.socialRows.querySelectorAll(".social-row"));
  for (const row of rows) {
    const validation = validateSocialRowInline(row);
    if (!validation.ok) {
      return validation;
    }
  }
  return { ok: true };
}

function validatePointInlineFields() {
  validatePointLogoInline();
  validatePointMediaUrlInline();
  validatePointShipCountryInline();
  validateAllSocialRowsInline();
}

function collectSocialRows() {
  const rows = Array.from(els.socialRows.querySelectorAll(".social-row"));
  const items = [];

  for (const row of rows) {
    const validation = validateSocialRowInline(row);
    if (!validation.ok) {
      return {
        ok: false,
        message: validation.message,
        errorElement: validation.errorElement,
      };
    }
    if (validation.item) {
      items.push(validation.item);
    }
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
    <p class="admin-inline-validation social-row-hint" data-tone="neutral" hidden></p>
  `;
  els.socialRows.appendChild(row);
  validateSocialRowInline(row);
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
  const shipCountry = String(els.pointShipCountry?.value || "").trim();
  const details = els.pointDetails.value.trim();
  const logo = els.pointLogo.value.trim();
  const mediaType = normalizeMediaType(els.pointMediaType.value);
  const mediaUrl = els.pointMediaUrl.value.trim();
  const resolvedMediaType = resolvePointMediaType(mediaType, mediaUrl);
  const stars = clampStars(els.pointStars.value);
  const services = Array.from(els.pointForm.querySelectorAll("input[name='services']:checked")).map(
    (input) => input.value
  );
  const pointShipOrigin = getPointShipOriginValue();
  const hasShipService = services.includes("ship");
  const shipOriginLabel = getShipOriginLabel(pointShipOrigin);
  const showShipCountry = hasShipService && pointShipOrigin === "eu";
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
          ${hasShipService ? `<p class="preview-meta">Origine Ship: ${escapeHtml(shipOriginLabel)}</p>` : ""}
          ${
            showShipCountry
              ? `<p class="preview-meta">Paese Ship: ${escapeHtml(shipCountry || "Non impostato")}</p>`
              : ""
          }
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
    validatePointMediaUrlInline();
    renderPointPreview();
    updatePointFormDirtyState();
  } catch (error) {
    setPointMediaStatus(error?.message || "Caricamento fallito. Riprova con un altro file.", "error");
  } finally {
    els.pointMediaFileInput.value = "";
  }
}

async function handlePointLogoUpload() {
  const file = els.pointLogoFileInput?.files?.[0];
  if (!file) return;

  const mimeType = resolveUploadMimeType(file);
  if (!mimeType.startsWith("image/")) {
    setPointLogoStatus("Formato non supportato. Usa un'immagine (JPG, PNG, WEBP, GIF).", "error");
    els.pointLogoFileInput.value = "";
    return;
  }

  if (file.size > MEDIA_FILE_LIMIT_BYTES) {
    setPointLogoStatus(`File troppo grande (${formatBytes(file.size)}). Limite: ${formatBytes(MEDIA_FILE_LIMIT_BYTES)}.`, "error");
    els.pointLogoFileInput.value = "";
    return;
  }

  try {
    setPointLogoStatus("Caricamento logo in corso...");
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
    if (!uploadedUrl) {
      throw new Error("URL logo non ricevuto dal server.");
    }

    els.pointLogo.value = uploadedUrl;
    setPointLogoStatus(`Logo caricato: ${file.name} (${formatBytes(file.size)})`, "success");
    validatePointLogoInline();
    renderPointPreview();
    updatePointFormDirtyState();
  } catch (error) {
    setPointLogoStatus(error?.message || "Caricamento logo fallito. Riprova con un altro file.", "error");
  } finally {
    els.pointLogoFileInput.value = "";
  }
}

function setPointLogoStatus(message, tone = "") {
  if (!els.pointLogoStatus) return;
  els.pointLogoStatus.textContent = message || "";
  if (tone) {
    els.pointLogoStatus.dataset.tone = tone;
  } else {
    delete els.pointLogoStatus.dataset.tone;
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

function normalizeShipOrigin(value) {
  const candidate = String(value || "")
    .trim()
    .toLowerCase();
  if (candidate === "ue") return "eu";
  return SHIP_ORIGINS.includes(candidate) ? candidate : "italy";
}

function getRegionShipOrigin(region) {
  return normalizeShipOrigin(region?.shipOrigin);
}

function getShipOriginLabel(originValue) {
  return normalizeShipOrigin(originValue) === "eu" ? "UE" : "Italia";
}

function resolvePointShipOrigin(point, region = getSelectedRegion()) {
  return normalizeShipOrigin(point?.shipOrigin || region?.shipOrigin);
}

function getPointShipOriginLabel(point, region = getSelectedRegion()) {
  return getShipOriginLabel(resolvePointShipOrigin(point, region));
}

function getPointShipOriginValue() {
  return normalizeShipOrigin(els.pointShipOrigin?.value);
}

function hasShipServiceSelected() {
  return Array.from(els.pointForm.querySelectorAll("input[name='services']:checked")).some(
    (input) => input.value === "ship"
  );
}

function syncShipCountryFieldState() {
  const hasRegion = Boolean(getSelectedRegion());
  const shipSelected = hasRegion && hasShipServiceSelected();

  if (els.pointShipOrigin) {
    els.pointShipOrigin.disabled = !shipSelected;
    els.pointShipOrigin.required = shipSelected;

    const originWrapper = els.pointShipOrigin.closest("label");
    if (originWrapper) {
      originWrapper.classList.toggle("admin-field-disabled", !shipSelected);
    }

    if (!shipSelected) {
      els.pointShipOrigin.value = "italy";
    }
  }

  if (!els.pointShipCountry) return;

  const shouldEnableCountry = shipSelected && getPointShipOriginValue() === "eu";
  els.pointShipCountry.disabled = !shouldEnableCountry;
  els.pointShipCountry.required = shouldEnableCountry;

  const wrapper = els.pointShipCountry.closest("label");
  if (wrapper) {
    wrapper.classList.toggle("admin-field-disabled", !shouldEnableCountry);
  }

  if (!shouldEnableCountry) {
    els.pointShipCountry.value = "";
  }
}

function formatPointCount(count) {
  const value = Number(count) || 0;
  return value === 1 ? "1 punto" : `${value} punti`;
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

function getDropPosition(event, targetElement) {
  const rect = targetElement.getBoundingClientRect();
  const midpoint = rect.top + rect.height / 2;
  return event.clientY < midpoint ? "before" : "after";
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
