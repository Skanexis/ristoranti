
const store = window.RIDataStore;
const FALLBACK_SERVICE_LABELS = {
  meetup: "Ritiro",
  delivery: "Consegna",
  ship: "Spedizione",
  other: "Altro",
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
const OTHER_CATEGORIES = ["antiscam", "lifestyle", "digitalSystems"];
const OTHER_CATEGORY_LABELS = {
  antiscam: "Antiscam",
  lifestyle: "Lifestyle",
  digitalSystems: "Digital Systems",
};
const SERVICE_BLOCK_ACCENTS = ["amber", "cyan", "emerald", "rose"];
const EXCHANGE_FINTECH_TIERS = [
  { label: "Fino a 750€", value: "11%" },
  { label: "Fino a 1.500€", value: "9%" },
  { label: "Fino a 5.000€", value: "5%" },
  { label: "Fino a 10.000€", value: "3,5%" },
];
const FALLBACK_SERVICES_PAGE = {
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
    title: "Social network europei più richiesti",
    subtitle: "Strategie growth su piattaforme ad alta trazione.",
  },
  socialPlatforms: [
    { id: "instagram", name: "Instagram", focus: "Reels, Stories e ADV" },
    { id: "tiktok", name: "TikTok", focus: "Video strategy e community" },
    { id: "facebook", name: "Facebook", focus: "Campagne local e lead" },
    { id: "youtube", name: "YouTube", focus: "Long form + Shorts" },
    { id: "telegram", name: "Telegram", focus: "Community private" },
    { id: "linkedin", name: "LinkedIn", focus: "Lead B2B e autorevolezza" },
    { id: "x", name: "X", focus: "Comunicazione real-time" },
  ],
  serviceBlocks: [
    {
      id: "chat-moderation-bots",
      category: "Programmazione",
      title: "Bot per moderazione chat",
      description:
        "Sviluppo di bot dedicati alla moderazione di chat e community, progettati per migliorare controllo, ordine e gestione degli utenti.",
      price: "a partire da 65€",
      priceNote: "Mantenimento: 5€ al mese",
      accent: "amber",
      featured: true,
      features: [
        "Moderazione automatica dei messaggi",
        "Gestione regole e permessi base",
        "Supporto operativo continuativo",
      ],
    },
    {
      id: "advanced-multimedia-menu-bots",
      category: "Programmazione",
      title: "Bot avanzati con menu multimediale",
      description:
        "Realizzazione di bot completi con funzionalità avanzate, ideali per community strutturate e progetti professionali.",
      price: "a partire da 150€",
      priceNote: "Mantenimento: 10€ al mese",
      accent: "cyan",
      featured: true,
      features: [
        "Menu multimediale",
        "Chat pulita",
        "Gestione categorie e sottocategorie",
        "Pannello amministrativo semplice e intuitivo",
        "Organizzazione chiara di contenuti e sezioni",
      ],
    },
    {
      id: "antiscam-community-bots",
      category: "Programmazione",
      title: "Bot per community Anti-Scam",
      description:
        "Sviluppo di bot specifici per community anti-truffa, pensati per supportare moderazione, controllo e gestione operativa della community.",
      price: "a partire da 180€",
      priceNote: "Mantenimento: 10€ al mese",
      accent: "rose",
      featured: false,
      features: [
        "Moderazione operativa dedicata",
        "Controllo segnalazioni community",
        "Supporto anti-truffa strutturato",
      ],
    },
    {
      id: "telegram-miniapp-web-bot-suite",
      category: "Programmazione",
      title: "Mini App Telegram + sito web + bot personale",
      description:
        "Soluzione completa per chi desidera un sistema moderno, veloce e pratico: Mini App Telegram, sito web e bot personale per gestione rapida via Telegram.",
      price: "a partire da 260€",
      priceNote: "Mantenimento: 15€ al mese",
      accent: "emerald",
      featured: true,
      features: [
        "Mini App Telegram integrata",
        "Sito web professionale",
        "Bot personale per amministrazione rapida",
        "Workflow operativo semplificato",
      ],
    },
    {
      id: "crypto-exchange-services",
      category: "Exchange Crypto",
      title: "Servizio Exchange Crypto",
      description:
        "Servizio di exchange crypto con commissioni calcolate in base all'importo dell'operazione e condizioni trasparenti.",
      price: "Commissioni variabili per importo",
      priceNote: "Importo minimo: 350€",
      fintechMetrics: [
        { label: "Fino a 750€", value: "11%" },
        { label: "Fino a 1.500€", value: "9%" },
        { label: "Fino a 5.000€", value: "5%" },
        { label: "Fino a 10.000€", value: "3,5%" },
      ],
      accent: "emerald",
      featured: true,
      features: [
        "Commissioni per fascia di importo",
        "Condizioni operative chiare",
        "Gestione professionale dell'operazione",
      ],
    },
    {
      id: "exchange-accounts-services",
      category: "Account Exchange",
      title: "Account Exchange disponibili",
      description:
        "Disponibilita di account exchange con listino trasparente per piattaforma, aggiornabile da admin.",
      price: "da 250€",
      priceNote: "",
      bankPriceList: [
        { bank: "Binance", price: "250€" },
        { bank: "Coinbase", price: "250€" },
        { bank: "Kucoin", price: "250€" },
        { bank: "Crypto", price: "250€" },
        { bank: "Bitnovo", price: "250€" },
        { bank: "Nexo", price: "250€" },
        { bank: "Kraken", price: "250€" },
        { bank: "Wirex", price: "250€" },
        { bank: "Trade Republic (Emulatore)", price: "250€" },
        { bank: "Bybit", price: "250€" },
        { bank: "Bitget", price: "250€" },
        { bank: "Robinhood", price: "250€" },
        { bank: "Exchange nome a scelta", price: "300€" },
      ],
      accent: "cyan",
      featured: false,
      features: [
        "Elenco exchange disponibili con prezzo per piattaforma",
        "Listino aggiornabile dalla sezione admin",
        "Supporto operativo nella scelta del provider",
      ],
    },
    {
      id: "bank-accounts-and-crypto-wallets",
      category: "Account Bancari",
      title: "Servizi account bancari e crypto wallet",
      description:
        "Disponibilita di account bancari e wallet crypto con listino trasparente per provider, gestibile da admin.",
      price: "da 250€",
      priceNote: "",
      bankPriceList: [
        { bank: "Bitsa", price: "250€" },
        { bank: "Yap", price: "250€" },
        { bank: "Paysera", price: "250€" },
        { bank: "Tinaba", price: "250€" },
        { bank: "Wise", price: "300€" },
        { bank: "Bankera", price: "300€" },
        { bank: "Isybank", price: "350€" },
        { bank: "Buddybank", price: "350€" },
        { bank: "Illimity", price: "350€" },
        { bank: "BBVA", price: "350€" },
        { bank: "Hype", price: "400€" },
        { bank: "Hello bank!", price: "400€" },
        { bank: "Fineco", price: "400€" },
        { bank: "UniCredit", price: "400€" },
        { bank: "Intesa Sanpaolo", price: "400€" },
        { bank: "iCard", price: "400€" },
        { bank: "N26 (Emulatore)", price: "400€" },
        { bank: "BPER", price: "400€" },
        { bank: "Credit Agricole", price: "400€" },
        { bank: "Credem", price: "400€" },
        { bank: "Banco BPM", price: "400€" },
        { bank: "Yuh", price: "400€" },
        { bank: "Bunq (Emulatore)", price: "400€" },
        { bank: "Vivid (Emulatore)", price: "400€" },
        { bank: "Findomestic", price: "450€" },
        { bank: "Mediolanum", price: "450€" },
        { bank: "Postepay", price: "500€" },
        { bank: "Revolut (Emulatore)", price: "500€" },
        { bank: "Conto nome a scelta", price: "800€+" },
      ],
      accent: "rose",
      featured: false,
      features: [
        "Elenco banche disponibili con prezzo per provider",
        "Listino aggiornabile dalla sezione admin",
        "Supporto operativo in fase di selezione",
      ],
    },
  ],
  closing: {
    title: "Servizio chiaro e professionale",
    description: "Ogni soluzione è presentata in modo trasparente, con prezzi chiari e supporto continuo.",
  },
};
const FALLBACK_SERVICES_BOT = {
  enabled: true,
  assistantName: "Consulente YOSUPPORT AI",
  model: "gpt-4o-mini",
  systemPrompt:
    "Sei il consulente commerciale ufficiale YOSUPPORT. Rispondi in italiano in modo professionale e conciso, proponi solo i servizi reali disponibili, non inventare prezzi o funzioni e raccogli progressivamente i dati ordine: nome, servizio richiesto, budget, dettagli progetto e contatto.",
  operatorLabel: "Parla con operatore",
  operatorUrl: "https://t.me/SHLC26",
  operatorFallbackMessage:
    "Se preferisci supporto umano immediato, puoi contattare direttamente un operatore tramite il link dedicato.",
  handoffKeywords: ["operatore", "supporto umano", "assistenza umana", "parlare con umano", "manager"],
  correctionRules: [],
};

const storeDefaultData = store?.getDefaultData?.() ?? {};
const defaultServiceLabels = storeDefaultData.serviceLabels ?? FALLBACK_SERVICE_LABELS;
const defaultSupportTelegramUrl = storeDefaultData.supportTelegramUrl ?? "https://t.me/SHLC26";
const defaultServicesPageConfig =
  storeDefaultData.servicesPage && typeof storeDefaultData.servicesPage === "object"
    ? storeDefaultData.servicesPage
    : FALLBACK_SERVICES_PAGE;
const defaultServicesBotConfig =
  storeDefaultData.servicesBot && typeof storeDefaultData.servicesBot === "object"
    ? storeDefaultData.servicesBot
    : FALLBACK_SERVICES_BOT;

let data = store?.getData?.() ?? {
  serviceLabels: defaultServiceLabels,
  supportTelegramUrl: defaultSupportTelegramUrl,
  regions: [],
  otherCategories: {
    antiscam: [],
    lifestyle: [],
    digitalSystems: [],
  },
  servicesPage: cloneSimple(defaultServicesPageConfig),
  servicesBot: cloneSimple(defaultServicesBotConfig),
};

data.otherCategories = data.otherCategories || {
  antiscam: [],
  lifestyle: [],
  digitalSystems: [],
};
data.servicesPage = data.servicesPage || cloneSimple(defaultServicesPageConfig);
data.servicesBot = data.servicesBot || cloneSimple(defaultServicesBotConfig);
let editingRegionId = null;
let editingPointId = null;
let editingServiceBlockId = null;
let otherPointMode = { category: null, editingPointId: null };
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
let activeAdminPage = "dashboard";

const ADMIN_PAGE_META = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Panoramica KPI e scorciatoie operative.",
  },
  services: {
    title: "Servizi",
    subtitle: "Gestione etichette operative e link canale Telegram.",
  },
  "services-page": {
    title: "I Nostri Servizi",
    subtitle: "Controllo completo della pagina servizi: hero, blocchi, prezzi e social europei.",
  },
  regions: {
    title: "Regioni",
    subtitle: "Creazione e ordinamento delle regioni disponibili.",
  },
  points: {
    title: "Punti",
    subtitle: "Workflow completo per punti, media, ship e social.",
  },
  data: {
    title: "Strumenti dati",
    subtitle: "Backup, import e reset in sicurezza.",
  },
  other: {
    title: "Other",
    subtitle: "Gestione sottocategorie e punti Other con form completo.",
  },
};

const ADMIN_PAGE_ALIAS = {
  dashboard: "dashboard",
  services: "services",
  "services-page": "services-page",
  servicespage: "services-page",
  servicepage: "services-page",
  regions: "regions",
  points: "points",
  other: "other",
  data: "data",
  servicespanel: "services",
  servicespagepanel: "services-page",
  servicepagepanel: "services-page",
  regionspanel: "regions",
  pointspanel: "points",
  otherpanel: "other",
  toolspanel: "data",
  tools: "data",
};

const els = {
  adminAuthGate: document.getElementById("adminAuthGate"),
  adminAuthForm: document.getElementById("adminAuthForm"),
  adminLogin: document.getElementById("adminLogin"),
  adminPassword: document.getElementById("adminPassword"),
  adminAuthStatus: document.getElementById("adminAuthStatus"),
  adminApp: document.getElementById("adminApp"),
  adminSidebarNav: document.getElementById("adminSidebarNav"),
  adminPageTitle: document.getElementById("adminPageTitle"),
  adminPageSubtitle: document.getElementById("adminPageSubtitle"),
  servicesPanelFold: document.querySelector("#servicesPanel .admin-panel-fold"),
  servicesPagePanelFold: document.querySelector("#servicesPagePanel .admin-panel-fold"),
  regionsPanelFold: document.querySelector("#regionsPanel .admin-panel-fold"),
  pointsPanelFold: document.querySelector("#pointsPanel .admin-panel-fold"),
  toolsPanelFold: document.querySelector("#toolsPanel .admin-panel-fold"),

  kpiRegions: document.getElementById("kpiRegions"),
  kpiPoints: document.getElementById("kpiPoints"),
  kpiAverageStars: document.getElementById("kpiAverageStars"),
  kpiMeetup: document.getElementById("kpiMeetup"),
  kpiDelivery: document.getElementById("kpiDelivery"),
  kpiShip: document.getElementById("kpiShip"),
  kpiOther: document.getElementById("kpiOther"),

  quickExportBtn: document.getElementById("quickExportBtn"),
  logoutAdminBtn: document.getElementById("logoutAdminBtn"),
  servicesForm: document.getElementById("servicesForm"),
  serviceMeetup: document.getElementById("serviceMeetup"),
  serviceDelivery: document.getElementById("serviceDelivery"),
  serviceShip: document.getElementById("serviceShip"),
  serviceOther: document.getElementById("serviceOther"),
  serviceSupportTelegram: document.getElementById("serviceSupportTelegram"),
  resetServicesBtn: document.getElementById("resetServicesBtn"),
  servicesPageHeroForm: document.getElementById("servicesPageHeroForm"),
  servicesHeroBadge: document.getElementById("servicesHeroBadge"),
  servicesHeroTitle: document.getElementById("servicesHeroTitle"),
  servicesHeroSubtitle: document.getElementById("servicesHeroSubtitle"),
  servicesHeroHighlight: document.getElementById("servicesHeroHighlight"),
  servicesHeroPrimaryLabel: document.getElementById("servicesHeroPrimaryLabel"),
  servicesHeroPrimaryUrl: document.getElementById("servicesHeroPrimaryUrl"),
  servicesHeroSecondaryLabel: document.getElementById("servicesHeroSecondaryLabel"),
  servicesHeroSecondaryUrl: document.getElementById("servicesHeroSecondaryUrl"),
  servicesClosingTitle: document.getElementById("servicesClosingTitle"),
  servicesClosingDescription: document.getElementById("servicesClosingDescription"),
  servicesSocialForm: document.getElementById("servicesSocialForm"),
  servicesSocialTitle: document.getElementById("servicesSocialTitle"),
  servicesSocialSubtitle: document.getElementById("servicesSocialSubtitle"),
  servicesSocialPlatformsInput: document.getElementById("servicesSocialPlatformsInput"),
  servicesBotForm: document.getElementById("servicesBotForm"),
  servicesBotEnabled: document.getElementById("servicesBotEnabled"),
  servicesBotAssistantName: document.getElementById("servicesBotAssistantName"),
  servicesBotModel: document.getElementById("servicesBotModel"),
  servicesBotSystemPrompt: document.getElementById("servicesBotSystemPrompt"),
  servicesBotOperatorLabel: document.getElementById("servicesBotOperatorLabel"),
  servicesBotOperatorUrl: document.getElementById("servicesBotOperatorUrl"),
  servicesBotOperatorFallbackMessage: document.getElementById("servicesBotOperatorFallbackMessage"),
  servicesBotHandoffKeywords: document.getElementById("servicesBotHandoffKeywords"),
  servicesBotCorrections: document.getElementById("servicesBotCorrections"),
  serviceBlockCreateNew: document.getElementById("serviceBlockCreateNew"),
  serviceBlocksList: document.getElementById("servicesBlocksList"),
  serviceBlocksCount: document.getElementById("serviceBlocksCount"),
  serviceBlockForm: document.getElementById("serviceBlockForm"),
  serviceBlockEditingId: document.getElementById("serviceBlockEditingId"),
  serviceBlockFormTitle: document.getElementById("serviceBlockFormTitle"),
  serviceBlockId: document.getElementById("serviceBlockId"),
  serviceBlockCategory: document.getElementById("serviceBlockCategory"),
  serviceBlockTitle: document.getElementById("serviceBlockTitle"),
  serviceBlockDescription: document.getElementById("serviceBlockDescription"),
  serviceBlockPrice: document.getElementById("serviceBlockPrice"),
  serviceBlockPriceNote: document.getElementById("serviceBlockPriceNote"),
  serviceBlockAccent: document.getElementById("serviceBlockAccent"),
  serviceBlockFeatured: document.getElementById("serviceBlockFeatured"),
  serviceBlockFeatures: document.getElementById("serviceBlockFeatures"),
  serviceBlockKpis: document.getElementById("serviceBlockKpis"),
  serviceBlockFintechMetrics: document.getElementById("serviceBlockFintechMetrics"),
  serviceBlockBankPriceList: document.getElementById("serviceBlockBankPriceList"),
  serviceBlockSubmitBtn: document.getElementById("serviceBlockSubmitBtn"),
  serviceBlockCancelBtn: document.getElementById("serviceBlockCancelBtn"),

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
  otherPanelFold: document.querySelector("#otherPanel .admin-panel-fold"),
  pointRegionSelect: document.getElementById("pointRegionSelect"),
  pointSearch: document.getElementById("pointSearch"),
  pointServiceFilter: document.getElementById("pointServiceFilter"),
  pointStarFilter: document.getElementById("pointStarFilter"),
  otherCategoryConfig: document.getElementById("otherCategoryConfig"),
  otherNewCategoryId: document.getElementById("otherNewCategoryId"),
  otherNewCategoryLabel: document.getElementById("otherNewCategoryLabel"),
  otherAddCategoryBtn: document.getElementById("otherAddCategoryBtn"),
  otherCategoryList: document.getElementById("otherCategoryList"),
  otherCategoriesContainer: document.getElementById("otherCategoriesContainer"),
  pointCreateNew: document.getElementById("pointCreateNew"),
  pointsContextHint: document.getElementById("pointsContextHint"),
  pointForm: document.getElementById("pointForm"),
  pointsEditorWrap: document.querySelector("#pointsPanel .points-editor-wrap"),
  pointEditingId: document.getElementById("pointEditingId"),
  pointId: document.getElementById("pointId"),
  pointName: document.getElementById("pointName"),
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
  pointOtherCategoryHint: document.getElementById("pointOtherCategoryHint"),
  pointServicesFieldset: document.querySelector("#pointForm .admin-services"),
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
  initAdminPageRouting();
  collapseAdminPanels();
  resetRegionForm();
  resetPointForm();
  setupPointFormCollapsibles();
  refreshAdminUI();
  setAdminPage(resolveAdminPageFromHash(), { updateHash: true, focus: false });
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
  [
    els.servicesPanelFold,
    els.servicesPagePanelFold,
    els.regionsPanelFold,
    els.pointsPanelFold,
    els.otherPanelFold,
    els.toolsPanelFold,
  ].forEach((panel) => {
    if (panel) {
      panel.open = true;
    }
  });
}

function openAdminPanel(panelElement) {
  if (panelElement) {
    panelElement.open = true;
  }
}

function normalizeAdminPageId(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "")
    .replace(/^\//, "");
  return ADMIN_PAGE_ALIAS[key] || null;
}

function resolveAdminPageFromHash() {
  const fromHash = normalizeAdminPageId(window.location.hash);
  return fromHash || "dashboard";
}

function updateAdminPageHeader(pageId) {
  const meta = ADMIN_PAGE_META[pageId] || ADMIN_PAGE_META.dashboard;
  if (els.adminPageTitle) {
    els.adminPageTitle.textContent = meta.title;
  }
  if (els.adminPageSubtitle) {
    els.adminPageSubtitle.textContent = meta.subtitle;
  }
}

function focusAdminPage(pageId, preferredTarget = null) {
  if (preferredTarget) {
    safeFocus(preferredTarget);
    return;
  }

  if (pageId === "dashboard") {
    safeFocus(els.quickExportBtn);
    return;
  }

  if (pageId === "services") {
    safeFocus(els.serviceMeetup);
    return;
  }

  if (pageId === "services-page") {
    safeFocus(els.servicesHeroTitle || els.servicesPageHeroForm);
    return;
  }

  if (pageId === "regions") {
    safeFocus(els.regionName || els.regionCreateNew);
    return;
  }

  if (pageId === "points") {
    if (editingPointId) {
      safeFocus(els.pointName);
      return;
    }
    safeFocus(els.pointCreateNew || els.pointName);
    return;
  }

  if (pageId === "data") {
    safeFocus(els.exportDataBtn);
    return;
  }

  if (pageId === "other") {
    safeFocus(els.otherNewCategoryId || els.otherCategoriesContainer);
    return;
  }
}

function setAdminPage(pageId, options = {}) {
  const resolved = normalizeAdminPageId(pageId) || "dashboard";
  const updateHash = options.updateHash !== false;
  const focus = options.focus !== false;
  const focusTarget = options.focusTarget || null;

  const pages = Array.from(document.querySelectorAll(".admin-page[data-admin-page]"));
  pages.forEach((page) => {
    const pageKey = normalizeAdminPageId(page.dataset.adminPage);
    const isActive = pageKey === resolved;
    page.hidden = !isActive;
    page.classList.toggle("is-active", isActive);
  });

  if (els.adminSidebarNav) {
    els.adminSidebarNav.querySelectorAll("[data-admin-page]").forEach((link) => {
      const linkKey = normalizeAdminPageId(link.dataset.adminPage);
      const isActive = linkKey === resolved;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (resolved === "services") openAdminPanel(els.servicesPanelFold);
  if (resolved === "services-page") openAdminPanel(els.servicesPagePanelFold);
  if (resolved === "regions") openAdminPanel(els.regionsPanelFold);
  if (resolved === "points") openAdminPanel(els.pointsPanelFold);
  if (resolved === "other") openAdminPanel(els.otherPanelFold);
  if (resolved === "data") openAdminPanel(els.toolsPanelFold);

  activeAdminPage = resolved;
  updateAdminPageHeader(resolved);

  if (updateHash) {
    const targetHash = `#${resolved}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, "", targetHash);
    }
  }

  if (focus) {
    window.requestAnimationFrame(() => {
      focusAdminPage(resolved, focusTarget);
    });
  }
}

function initAdminPageRouting() {
  if (els.adminSidebarNav) {
    els.adminSidebarNav.addEventListener("click", (event) => {
      const link = event.target.closest("[data-admin-page]");
      if (!link) return;
      event.preventDefault();
      const targetPage = normalizeAdminPageId(link.dataset.adminPage) || "dashboard";
      setAdminPage(targetPage, { updateHash: true, focus: true });
    });
  }

  window.addEventListener("hashchange", () => {
    setAdminPage(resolveAdminPageFromHash(), { updateHash: false, focus: true });
  });
}

function focusPointEditorForm(field = els.pointName) {
  setAdminPage("points", { updateHash: true, focus: false });
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

function setOtherPointMode(category) {
  otherPointMode.category = category;
  otherPointMode.editingPointId = null;
  if (els.pointOtherCategoryHint) {
    const label = data.otherCategoryLabels?.[category] || category;
    els.pointOtherCategoryHint.textContent = `Categoria Other: ${label}`;
    els.pointOtherCategoryHint.hidden = false;
  }

  if (els.pointForm) {
    els.pointForm.dataset.otherCategory = category;
    els.pointForm.querySelectorAll("input[name='services']").forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.disabled = true;
    });
  }
  if (els.pointServicesFieldset) {
    els.pointServicesFieldset.classList.add("admin-field-disabled");
  }

  if (els.pointRegionSelect) {
    els.pointRegionSelect.disabled = true;
  }

  updatePointFormUi();
  syncShipCountryFieldState();
  validatePointShipCountryInline();
  renderPointsContext();
  renderPointPreview();

  setStatus(`Creazione punto Other in categoria: ${data.otherCategoryLabels?.[category] || category}`, "info");
}

function clearOtherPointMode() {
  otherPointMode.category = null;
  otherPointMode.editingPointId = null;
  if (els.pointOtherCategoryHint) {
    els.pointOtherCategoryHint.textContent = "";
    els.pointOtherCategoryHint.hidden = true;
  }

  if (els.pointForm) {
    delete els.pointForm.dataset.otherCategory;
    els.pointForm.querySelectorAll("input[name='services']").forEach((checkbox) => {
      checkbox.disabled = false;
    });
  }
  if (els.pointServicesFieldset) {
    els.pointServicesFieldset.classList.remove("admin-field-disabled");
  }

  if (els.pointRegionSelect) {
    els.pointRegionSelect.disabled = false;
  }

  updatePointFormUi();
  syncShipCountryFieldState();
  validatePointShipCountryInline();
  renderPointsContext();
  renderPointPreview();
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
  els.serviceSupportTelegram.addEventListener("input", () => {
    validateSupportTelegramInline();
  });
  els.serviceSupportTelegram.addEventListener("blur", () => {
    validateSupportTelegramInline();
  });
  if (els.servicesPageHeroForm) {
    els.servicesPageHeroForm.addEventListener("submit", handleServicesPageHeroSubmit);
  }
  if (els.servicesSocialForm) {
    els.servicesSocialForm.addEventListener("submit", handleServicesPageSocialSubmit);
  }
  if (els.servicesBotForm) {
    els.servicesBotForm.addEventListener("submit", handleServicesBotSubmit);
  }
  if (els.serviceBlockCreateNew) {
    els.serviceBlockCreateNew.addEventListener("click", () => {
      resetServiceBlockForm();
      setAdminPage("services-page", { updateHash: true, focus: false });
      safeFocus(els.serviceBlockTitle);
    });
  }
  if (els.serviceBlocksList) {
    els.serviceBlocksList.addEventListener("click", handleServiceBlockActions);
  }
  if (els.serviceBlockForm) {
    els.serviceBlockForm.addEventListener("submit", handleServiceBlockSubmit);
  }
  if (els.serviceBlockCancelBtn) {
    els.serviceBlockCancelBtn.addEventListener("click", () => {
      resetServiceBlockForm();
      setStatus("Editor blocco servizio ripristinato.", "info");
    });
  }

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
      setAdminPage("regions", { updateHash: true, focus: false });
      resetRegionForm();
      safeFocus(els.regionName);
    });
  }

  if (els.regionSearch) {
    els.regionSearch.addEventListener("input", renderRegionList);
  }

  // Other categories fields (dynamic)
  if (els.otherAddCategoryBtn) {
    els.otherAddCategoryBtn.addEventListener("click", () => {
      const categoryId = String(els.otherNewCategoryId?.value || "").trim().toLowerCase();
      const categoryLabel = String(els.otherNewCategoryLabel?.value || "").trim();

      if (!categoryId || !categoryLabel) {
        setStatus("Inserisci ID e label validi per la nuova categoria.", "error");
        return;
      }

      if (!/^[a-z0-9_-]+$/.test(categoryId)) {
        setStatus("L'ID categoria può contenere solo lettere, numeri, underscore e trattini.", "error");
        return;
      }

      ensureOtherCategories();
      if (data.otherCategories[categoryId]) {
        setStatus(`Categoria '${categoryId}' già esiste.`, "error");
        return;
      }

      data.otherCategories[categoryId] = [];
      data.otherCategoryLabels[categoryId] = categoryLabel;
      els.otherNewCategoryId.value = "";
      els.otherNewCategoryLabel.value = "";
      renderOtherPage();
      renderKpi();
      persistData(`Categoria '${categoryLabel}' aggiunta a Other.`, "success");
    });
  }

  if (els.otherCategoryList) {
    els.otherCategoryList.addEventListener("input", (event) => {
      const target = event.target.closest(".other-category-config-label");
      if (!target) return;
      const category = target.dataset.category;
      const label = String(target.value || "").trim();
      if (!category) return;
      if (!label) return;
      data.otherCategoryLabels = data.otherCategoryLabels || {};
      data.otherCategoryLabels[category] = label;
      renderOtherCategoryConfig();
      renderOtherPage();
      persistData(`Label della categoria '${category}' aggiornata.`, "success");
    });

    els.otherCategoryList.addEventListener("click", (event) => {
      const del = event.target.closest(".other-category-delete");
      if (!del) return;
      const category = del.dataset.category;
      if (!category) return;

      if (OTHER_CATEGORIES.includes(category)) {
        setStatus("Le categorie built-in non possono essere rimosse.", "error");
        return;
      }

      delete data.otherCategories[category];
      delete data.otherCategoryLabels[category];
      renderOtherPage();
      renderKpi();
      persistData(`Categoria '${category}' rimossa da Other.`, "warn");
    });
  }

  if (els.otherCategoriesContainer) {
    els.otherCategoriesContainer.addEventListener("click", (event) => {
      const openFullBtn = event.target.closest(".other-point-open-full");
      if (openFullBtn) {
        const category = openFullBtn.dataset.category;
        if (category) {
          resetPointForm();
          setOtherPointMode(category);
          focusPointEditorForm(els.pointName);
        }
        return;
      }

      const editBtn = event.target.closest(".other-point-edit");
      if (editBtn) {
        const category = editBtn.dataset.category;
        const pointId = editBtn.dataset.pointId;
        if (category && pointId) {
          openOtherPointEditor(category, pointId);
        }
        return;
      }

      const deleteBtn = event.target.closest(".other-point-delete");
      if (deleteBtn) {
        const category = deleteBtn.dataset.category;
        const pointId = deleteBtn.dataset.pointId;
        if (category && pointId) {
          removeOtherPoint(category, pointId);
        }
      }
    });
  }

  els.pointRegionSelect.addEventListener("change", () => {
    clearOtherPointMode();
    setAdminPage("points", { updateHash: true, focus: false });
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
      clearOtherPointMode();
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
  renderServicesPageEditor();
  renderServicesBotEditor();
  renderRegionSelect(preferredRegionId || els.pointRegionSelect.value);
  renderRegionList();
  renderPointsList();
  renderKpi();
  renderPointsContext();
  renderOtherPage();
  if (isAdminBooted) {
    setAdminPage(activeAdminPage || resolveAdminPageFromHash(), { updateHash: false, focus: false });
  }
}

function renderServicesForm() {
  els.serviceMeetup.value = data.serviceLabels?.meetup || defaultServiceLabels.meetup;
  els.serviceDelivery.value = data.serviceLabels?.delivery || defaultServiceLabels.delivery;
  els.serviceShip.value = data.serviceLabels?.ship || defaultServiceLabels.ship;
  els.serviceOther.value = data.serviceLabels?.other || defaultServiceLabels.other;
  els.serviceSupportTelegram.value = data.supportTelegramUrl || defaultSupportTelegramUrl;
  validateSupportTelegramInline();
}

function handleServicesSubmit(event) {
  event.preventDefault();
  const meetup = els.serviceMeetup.value.trim();
  const delivery = els.serviceDelivery.value.trim();
  const ship = els.serviceShip.value.trim();
  const other = els.serviceOther.value.trim();
  const supportTelegram = els.serviceSupportTelegram.value.trim();

  if (!meetup || !delivery || !ship || !other || !supportTelegram) {
    setStatus("Le etichette servizi non possono essere vuote.", "error");
    validateSupportTelegramInline();
    return;
  }

  const telegramValidation = validateSupportTelegramInline();
  if (!telegramValidation.valid) {
    setStatus(telegramValidation.message || "URL canale Telegram non valido. Usa formato https://t.me/username.", "error");
    return;
  }

  data.serviceLabels = {
    meetup,
    delivery,
    ship,
    other,
  };
  data.supportTelegramUrl = supportTelegram;
  persistData("Etichette servizi aggiornate.");
}

function handleServicesReset() {
  els.serviceMeetup.value = defaultServiceLabels.meetup;
  els.serviceDelivery.value = defaultServiceLabels.delivery;
  els.serviceShip.value = defaultServiceLabels.ship;
  els.serviceOther.value = defaultServiceLabels.other;
  els.serviceSupportTelegram.value = defaultSupportTelegramUrl;
  data.serviceLabels = {
    ...defaultServiceLabels,
  };
  data.supportTelegramUrl = defaultSupportTelegramUrl;
  validateSupportTelegramInline();
  persistData("Etichette servizi ripristinate.");
}

function ensureServicesPageConfig() {
  const defaults = cloneSimple(defaultServicesPageConfig);
  const source = data.servicesPage && typeof data.servicesPage === "object" ? data.servicesPage : {};

  const heroRaw = source.hero && typeof source.hero === "object" ? source.hero : {};
  const socialProofRaw = source.socialProof && typeof source.socialProof === "object" ? source.socialProof : {};
  const closingRaw = source.closing && typeof source.closing === "object" ? source.closing : {};

  const heroDefaults = defaults.hero || {};
  const socialDefaults = defaults.socialProof || {};
  const closingDefaults = defaults.closing || {};

  source.hero = {
    badge: String(heroRaw.badge || "").trim() || String(heroDefaults.badge || "").trim(),
    title: String(heroRaw.title || "").trim() || String(heroDefaults.title || "").trim(),
    subtitle: String(heroRaw.subtitle || "").trim() || String(heroDefaults.subtitle || "").trim(),
    highlight: String(heroRaw.highlight || "").trim() || String(heroDefaults.highlight || "").trim(),
    primaryCtaLabel:
      String(heroRaw.primaryCtaLabel || "").trim() || String(heroDefaults.primaryCtaLabel || "").trim(),
    primaryCtaUrl: normalizeAbsoluteHttpUrl(heroRaw.primaryCtaUrl, heroDefaults.primaryCtaUrl),
    secondaryCtaLabel:
      String(heroRaw.secondaryCtaLabel || "").trim() || String(heroDefaults.secondaryCtaLabel || "").trim(),
    secondaryCtaUrl: normalizeAbsoluteHttpUrl(heroRaw.secondaryCtaUrl, heroDefaults.secondaryCtaUrl),
  };

  source.socialProof = {
    title: String(socialProofRaw.title || "").trim() || String(socialDefaults.title || "").trim(),
    subtitle: String(socialProofRaw.subtitle || "").trim() || String(socialDefaults.subtitle || "").trim(),
  };

  const socialPlatformsInput = Array.isArray(source.socialPlatforms) ? source.socialPlatforms : defaults.socialPlatforms || [];
  const seenPlatformIds = new Set();
  const normalizedPlatforms = [];
  socialPlatformsInput.forEach((platform, index) => {
    const name = String(platform?.name || "").trim();
    if (!name) return;

    const rawId = String(platform?.id || "").trim();
    const baseId = slugify(rawId || name || `platform-${index + 1}`) || `platform-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (seenPlatformIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    seenPlatformIds.add(id);

    normalizedPlatforms.push({
      id,
      name,
      focus: String(platform?.focus || "").trim(),
    });
  });

  source.socialPlatforms = normalizedPlatforms.length ? normalizedPlatforms : cloneSimple(defaults.socialPlatforms || []);

  const blocksInput = Array.isArray(source.serviceBlocks) ? source.serviceBlocks : defaults.serviceBlocks || [];
  const seenBlockIds = new Set();
  const normalizedBlocks = [];
  blocksInput.forEach((rawBlock, index) => {
    const block = normalizeServiceBlock(rawBlock, index);
    if (!block) return;

    const baseId = block.id;
    let id = baseId;
    let suffix = 2;
    while (seenBlockIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    seenBlockIds.add(id);
    block.id = id;
    normalizedBlocks.push(block);
  });

  const normalizedSupplementaryBlocks = ensureSupplementaryServiceBlocks(normalizedBlocks, defaults.serviceBlocks || []);
  source.serviceBlocks = normalizedSupplementaryBlocks.length
    ? normalizedSupplementaryBlocks
    : cloneSimple(defaults.serviceBlocks || []);

  source.closing = {
    title: String(closingRaw.title || "").trim() || String(closingDefaults.title || "").trim(),
    description: String(closingRaw.description || "").trim() || String(closingDefaults.description || "").trim(),
  };

  data.servicesPage = source;
}

function normalizeServicesBotKeywords(input, fallbackKeywords = []) {
  const source = Array.isArray(input) ? input : fallbackKeywords;
  const keywords = [];
  const seen = new Set();

  source.forEach((entry) => {
    const value = String(entry || "")
      .trim()
      .toLowerCase();
    if (!value || seen.has(value)) return;
    seen.add(value);
    keywords.push(value);
  });

  return keywords.slice(0, 20);
}

function normalizeServicesBotCorrectionRules(input, fallbackRules = []) {
  const source = Array.isArray(input) ? input : fallbackRules;
  const rules = [];
  const seenIds = new Set();

  source.forEach((entry, index) => {
    const trigger = String(entry?.trigger || entry?.question || entry?.pattern || "")
      .trim()
      .toLowerCase();
    const answer = String(entry?.answer || entry?.response || entry?.output || "").trim();
    if (!trigger || !answer) return;

    const rawId = String(entry?.id || "").trim();
    const baseId = slugify(rawId || trigger || `rule-${index + 1}`) || `rule-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    seenIds.add(id);

    rules.push({ id, trigger, answer });
  });

  return rules.slice(0, 80);
}

function ensureServicesBotConfig() {
  const defaults = cloneSimple(defaultServicesBotConfig);
  const source = data.servicesBot && typeof data.servicesBot === "object" ? data.servicesBot : {};

  const assistantName = String(source.assistantName || defaults.assistantName || "")
    .trim()
    .slice(0, 80);
  const model = String(source.model || defaults.model || "")
    .trim()
    .slice(0, 80);
  const systemPrompt = String(source.systemPrompt || defaults.systemPrompt || "")
    .trim()
    .slice(0, 6000);
  const operatorLabel = String(source.operatorLabel || defaults.operatorLabel || "")
    .trim()
    .slice(0, 80);
  const operatorFallbackMessage = String(source.operatorFallbackMessage || defaults.operatorFallbackMessage || "")
    .trim()
    .slice(0, 500);
  const operatorFallbackUrl = source.operatorUrl || defaults.operatorUrl || data.supportTelegramUrl || defaultSupportTelegramUrl;

  source.enabled = typeof source.enabled === "boolean" ? source.enabled : Boolean(defaults.enabled);
  source.assistantName = assistantName || defaults.assistantName;
  source.model = model || defaults.model;
  source.systemPrompt = systemPrompt || defaults.systemPrompt;
  source.operatorLabel = operatorLabel || defaults.operatorLabel;
  source.operatorUrl = normalizeAbsoluteHttpUrl(source.operatorUrl, operatorFallbackUrl);
  source.operatorFallbackMessage = operatorFallbackMessage || defaults.operatorFallbackMessage;
  source.handoffKeywords = normalizeServicesBotKeywords(source.handoffKeywords, defaults.handoffKeywords || []);
  source.correctionRules = normalizeServicesBotCorrectionRules(source.correctionRules, defaults.correctionRules || []);

  data.servicesBot = source;
}

function normalizeServiceBlock(block, index = 0) {
  const source = block && typeof block === "object" ? block : {};
  const title = String(source.title || "").trim();
  if (!title) return null;

  const rawId = String(source.id || "").trim();
  const id = slugify(rawId || title || `service-${index + 1}`) || `service-${index + 1}`;
  const category = String(source.category || "").trim();
  const accentValue = String(source.accent || "")
    .trim()
    .toLowerCase();
  const accent = SERVICE_BLOCK_ACCENTS.includes(accentValue) ? accentValue : SERVICE_BLOCK_ACCENTS[0];
  const features = Array.isArray(source.features)
    ? source.features.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8)
    : [];
  const kpis = Array.isArray(source.kpis)
    ? source.kpis.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 4)
    : [];
  const fintechMetrics = Array.isArray(source.fintechMetrics)
    ? source.fintechMetrics
        .map((item) => {
          const label = String(item?.label || "").trim();
          const value = String(item?.value || "").trim();
          if (!label || !value) return null;
          return { label, value };
        })
        .filter(Boolean)
        .slice(0, 8)
    : [];
  const bankPriceList = Array.isArray(source.bankPriceList)
    ? source.bankPriceList
        .map((item) => {
          const bank = String(item?.bank || item?.name || "").trim();
          const price = String(item?.price || item?.value || "").trim();
          if (!bank || !price) return null;
          return { bank, price };
        })
        .filter(Boolean)
        .slice(0, 60)
    : [];
  const normalizedFintechMetrics = shouldApplyExchangeTierDefaults({
    id,
    category,
    title,
    fintechMetrics,
  })
    ? cloneSimple(EXCHANGE_FINTECH_TIERS)
    : fintechMetrics;
  const isExchangeAccountsBlock = isExchangeAccountsListBlock(id, category, title);

  return {
    id,
    category: category || "Servizi",
    title,
    description: String(source.description || "").trim(),
    price: String(source.price || "").trim() || "da EUR 0",
    priceNote: sanitizeServicePriceNoteText(source.priceNote),
    accent,
    featured: Boolean(source.featured),
    features,
    kpis,
    fintechMetrics: isExchangeAccountsBlock ? [] : normalizedFintechMetrics,
    bankPriceList,
  };
}

function sanitizeServicePriceNoteText(value) {
  const note = String(value || "").trim();
  if (!note) return "";

  const compact = note.toLowerCase().replace(/\s+/g, " ");
  const hasIncreaseMarker = /(maggiorazion|rincar|aument|supplement|upcharge|mark[\s-]?up)/i.test(compact);
  const hasPlusEuro = /\+\s*\d{1,4}(?:[.,]\d+)?\s*€?/i.test(note);
  if (hasIncreaseMarker || hasPlusEuro) {
    return "";
  }

  return note;
}

function shouldApplyExchangeTierDefaults({ id, category, title, fintechMetrics }) {
  if (!isExchangeServiceBlock(id, category, title)) return false;
  if (!Array.isArray(fintechMetrics) || fintechMetrics.length === 0) return true;
  return isLegacyExchangeFintechMetrics(fintechMetrics);
}

function isExchangeAccountsListBlock(id, category, title) {
  const haystack = [id, category, title]
    .map((value) => String(value || "").trim().toLowerCase())
    .join(" ");

  return haystack.includes("exchange") && /\baccounts?\b/.test(haystack);
}

function isExchangeServiceBlock(id, category, title) {
  const normalizedId = String(id || "")
    .trim()
    .toLowerCase();
  if (normalizedId === "crypto-exchange-services") return true;
  if (normalizedId === "exchange-accounts-services") return false;

  const haystack = [id, category, title]
    .map((value) => String(value || "").trim().toLowerCase())
    .join(" ");
  const hasExchange = haystack.includes("exchange");
  const hasCrypto = haystack.includes("crypto");
  const hasAccounts = /\baccounts?\b/.test(haystack);

  if (!hasExchange || hasAccounts) return false;
  return hasCrypto || String(category || "").trim().toLowerCase() === "exchange crypto";
}

function isLegacyExchangeFintechMetrics(fintechMetrics) {
  const metrics = Array.isArray(fintechMetrics) ? fintechMetrics : [];
  if (metrics.length > 3) return false;

  return metrics.every((metric) => {
    const label = String(metric?.label || "").trim().toLowerCase();
    return label.startsWith("fee") || label.startsWith("spread") || label.startsWith("sla") || label.startsWith("settlement");
  });
}

function hasBankingServiceBlock(serviceBlocks) {
  const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
  return blocks.some((block) => {
    const id = String(block?.id || "")
      .trim()
      .toLowerCase();
    return id === "bank-accounts-and-crypto-wallets" || id === "banking-wallet-services";
  });
}

function hasExchangeAccountsServiceBlock(serviceBlocks) {
  const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
  return blocks.some((block) => {
    const id = String(block?.id || "")
      .trim()
      .toLowerCase();
    return id === "exchange-accounts-services";
  });
}

function ensureSupplementaryServiceBlocks(serviceBlocks, defaultBlocks) {
  const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
  const defaults = Array.isArray(defaultBlocks) ? defaultBlocks : [];
  const nextBlocks = [...blocks];

  if (!hasExchangeAccountsServiceBlock(nextBlocks)) {
    const defaultExchangeAccounts = defaults.find(
      (block) =>
        String(block?.id || "")
          .trim()
          .toLowerCase() === "exchange-accounts-services"
    );
    if (defaultExchangeAccounts) {
      nextBlocks.push(cloneSimple(defaultExchangeAccounts));
    }
  }

  if (!hasBankingServiceBlock(nextBlocks)) {
    const defaultBanking = defaults.find(
      (block) =>
        String(block?.id || "")
          .trim()
          .toLowerCase() === "bank-accounts-and-crypto-wallets"
    );
    if (defaultBanking) {
      nextBlocks.push(cloneSimple(defaultBanking));
    }
  }

  return nextBlocks;
}

function renderServicesPageEditor() {
  ensureServicesPageConfig();
  const page = data.servicesPage;

  if (els.servicesHeroBadge) els.servicesHeroBadge.value = page.hero.badge || "";
  if (els.servicesHeroTitle) els.servicesHeroTitle.value = page.hero.title || "";
  if (els.servicesHeroSubtitle) els.servicesHeroSubtitle.value = page.hero.subtitle || "";
  if (els.servicesHeroHighlight) els.servicesHeroHighlight.value = page.hero.highlight || "";
  if (els.servicesHeroPrimaryLabel) els.servicesHeroPrimaryLabel.value = page.hero.primaryCtaLabel || "";
  if (els.servicesHeroPrimaryUrl) els.servicesHeroPrimaryUrl.value = page.hero.primaryCtaUrl || "";
  if (els.servicesHeroSecondaryLabel) els.servicesHeroSecondaryLabel.value = page.hero.secondaryCtaLabel || "";
  if (els.servicesHeroSecondaryUrl) els.servicesHeroSecondaryUrl.value = page.hero.secondaryCtaUrl || "";
  if (els.servicesClosingTitle) els.servicesClosingTitle.value = page.closing.title || "";
  if (els.servicesClosingDescription) els.servicesClosingDescription.value = page.closing.description || "";

  if (els.servicesSocialTitle) els.servicesSocialTitle.value = page.socialProof.title || "";
  if (els.servicesSocialSubtitle) els.servicesSocialSubtitle.value = page.socialProof.subtitle || "";
  if (els.servicesSocialPlatformsInput) {
    els.servicesSocialPlatformsInput.value = page.socialPlatforms
      .map((platform) => `${platform.name}${platform.focus ? `|${platform.focus}` : ""}`)
      .join("\n");
  }

  renderServiceBlocksList();
  if (editingServiceBlockId) {
    const active = page.serviceBlocks.find((block) => block.id === editingServiceBlockId);
    if (active) {
      fillServiceBlockForm(active);
      return;
    }
  }
  resetServiceBlockForm();
}

function renderServicesBotEditor() {
  ensureServicesBotConfig();
  const bot = data.servicesBot;

  if (els.servicesBotEnabled) {
    els.servicesBotEnabled.checked = Boolean(bot.enabled);
  }
  if (els.servicesBotAssistantName) {
    els.servicesBotAssistantName.value = bot.assistantName || "";
  }
  if (els.servicesBotModel) {
    els.servicesBotModel.value = bot.model || "";
  }
  if (els.servicesBotSystemPrompt) {
    els.servicesBotSystemPrompt.value = bot.systemPrompt || "";
  }
  if (els.servicesBotOperatorLabel) {
    els.servicesBotOperatorLabel.value = bot.operatorLabel || "";
  }
  if (els.servicesBotOperatorUrl) {
    els.servicesBotOperatorUrl.value = bot.operatorUrl || "";
  }
  if (els.servicesBotOperatorFallbackMessage) {
    els.servicesBotOperatorFallbackMessage.value = bot.operatorFallbackMessage || "";
  }
  if (els.servicesBotHandoffKeywords) {
    els.servicesBotHandoffKeywords.value = Array.isArray(bot.handoffKeywords) ? bot.handoffKeywords.join("\n") : "";
  }
  if (els.servicesBotCorrections) {
    els.servicesBotCorrections.value = Array.isArray(bot.correctionRules)
      ? bot.correctionRules.map((rule) => `${rule.trigger}|${rule.answer}`).join("\n")
      : "";
  }
}

function renderServiceBlocksList() {
  if (!els.serviceBlocksList) return;
  ensureServicesPageConfig();

  const blocks = Array.isArray(data.servicesPage?.serviceBlocks) ? data.servicesPage.serviceBlocks : [];
  if (els.serviceBlocksCount) {
    els.serviceBlocksCount.textContent = `${blocks.length} ${blocks.length === 1 ? "blocco" : "blocchi"}`;
  }

  if (blocks.length === 0) {
    els.serviceBlocksList.innerHTML = `
      <article class="admin-item">
        <p class="admin-empty">Nessun blocco configurato.</p>
      </article>
    `;
    return;
  }

  els.serviceBlocksList.innerHTML = blocks
    .map((block, index) => {
      const featureCount = Array.isArray(block.features) ? block.features.length : 0;
      const kpiCount = Array.isArray(block.kpis) ? block.kpis.length : 0;
      const fintechMetricCount = Array.isArray(block.fintechMetrics) ? block.fintechMetrics.length : 0;
      const bankPriceCount = Array.isArray(block.bankPriceList) ? block.bankPriceList.length : 0;
      const editingClass = block.id === editingServiceBlockId ? "is-editing" : "";
      return `
        <article class="admin-item ${editingClass}" data-service-block-id="${escapeHtmlAttr(block.id)}">
          <div class="admin-item-top">
            <p class="admin-item-title">${escapeHtml(block.title)}</p>
            <p class="admin-item-id">${escapeHtml(block.id)}</p>
          </div>
          <p class="admin-item-meta">${escapeHtml(block.category)} • ${escapeHtml(block.price || "Prezzo non impostato")}</p>
          <div class="admin-item-tags">
            <span class="mini-chip">${escapeHtml(block.accent || "amber")}</span>
            <span class="mini-chip">${featureCount} ${featureCount === 1 ? "feature" : "features"}</span>
            ${kpiCount ? `<span class="mini-chip">${kpiCount} metriche</span>` : ""}
            ${fintechMetricCount ? `<span class="mini-chip">Fintech ${fintechMetricCount}</span>` : ""}
            ${bankPriceCount ? `<span class="mini-chip">Banche ${bankPriceCount}</span>` : ""}
            ${block.featured ? `<span class="mini-chip">Top service</span>` : ""}
          </div>
          <div class="admin-item-actions">
            <button class="admin-btn admin-btn-secondary" data-service-block-action="up" data-service-block-id="${escapeHtmlAttr(
              block.id
            )}" ${index === 0 ? "disabled" : ""}>Su</button>
            <button class="admin-btn admin-btn-secondary" data-service-block-action="down" data-service-block-id="${escapeHtmlAttr(
              block.id
            )}" ${index === blocks.length - 1 ? "disabled" : ""}>Giù</button>
            <button class="admin-btn" data-service-block-action="edit" data-service-block-id="${escapeHtmlAttr(
              block.id
            )}">Modifica</button>
            <button class="admin-btn admin-btn-danger" data-service-block-action="delete" data-service-block-id="${escapeHtmlAttr(
              block.id
            )}">Elimina</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateServiceBlockFormUi() {
  if (els.serviceBlockFormTitle) {
    els.serviceBlockFormTitle.textContent = editingServiceBlockId
      ? "Modifica blocco servizio"
      : "Nuovo blocco servizio";
  }
  if (els.serviceBlockSubmitBtn) {
    els.serviceBlockSubmitBtn.textContent = editingServiceBlockId ? "Salva modifiche" : "Aggiungi blocco";
  }
}

function fillServiceBlockForm(block) {
  if (!els.serviceBlockForm) return;
  editingServiceBlockId = block.id;
  if (els.serviceBlockEditingId) els.serviceBlockEditingId.value = block.id;
  if (els.serviceBlockId) els.serviceBlockId.value = block.id || "";
  if (els.serviceBlockCategory) els.serviceBlockCategory.value = block.category || "";
  if (els.serviceBlockTitle) els.serviceBlockTitle.value = block.title || "";
  if (els.serviceBlockDescription) els.serviceBlockDescription.value = block.description || "";
  if (els.serviceBlockPrice) els.serviceBlockPrice.value = block.price || "";
  if (els.serviceBlockPriceNote) els.serviceBlockPriceNote.value = block.priceNote || "";
  if (els.serviceBlockAccent) {
    els.serviceBlockAccent.value = SERVICE_BLOCK_ACCENTS.includes(block.accent) ? block.accent : SERVICE_BLOCK_ACCENTS[0];
  }
  if (els.serviceBlockFeatured) {
    els.serviceBlockFeatured.checked = Boolean(block.featured);
  }
  if (els.serviceBlockFeatures) {
    els.serviceBlockFeatures.value = Array.isArray(block.features) ? block.features.join("\n") : "";
  }
  if (els.serviceBlockKpis) {
    els.serviceBlockKpis.value = Array.isArray(block.kpis) ? block.kpis.join("\n") : "";
  }
  if (els.serviceBlockFintechMetrics) {
    els.serviceBlockFintechMetrics.value = Array.isArray(block.fintechMetrics)
      ? block.fintechMetrics.map((item) => `${item.label}|${item.value}`).join("\n")
      : "";
  }
  if (els.serviceBlockBankPriceList) {
    els.serviceBlockBankPriceList.value = Array.isArray(block.bankPriceList)
      ? block.bankPriceList.map((item) => `${item.bank}|${item.price}`).join("\n")
      : "";
  }
  updateServiceBlockFormUi();
}

function resetServiceBlockForm() {
  editingServiceBlockId = null;
  if (els.serviceBlockEditingId) {
    els.serviceBlockEditingId.value = "";
  }
  if (els.serviceBlockForm) {
    els.serviceBlockForm.reset();
  }
  if (els.serviceBlockAccent) {
    els.serviceBlockAccent.value = SERVICE_BLOCK_ACCENTS[0];
  }
  if (els.serviceBlockFeatured) {
    els.serviceBlockFeatured.checked = false;
  }
  if (els.serviceBlockKpis) {
    els.serviceBlockKpis.value = "";
  }
  if (els.serviceBlockFintechMetrics) {
    els.serviceBlockFintechMetrics.value = "";
  }
  if (els.serviceBlockBankPriceList) {
    els.serviceBlockBankPriceList.value = "";
  }
  updateServiceBlockFormUi();
  renderServiceBlocksList();
}

function parseSocialPlatformsText(value) {
  const seen = new Set();
  return String(value || "")
    .split(/\r?\n/g)
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .map((line, index) => {
      const [namePart, ...focusParts] = line.split("|");
      const name = String(namePart || "").trim();
      const focus = String(focusParts.join("|") || "").trim();
      if (!name) return null;

      const baseId = slugify(name) || `platform-${index + 1}`;
      let id = baseId;
      let suffix = 2;
      while (seen.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
      seen.add(id);

      return { id, name, focus };
    })
    .filter(Boolean);
}

function parseServicesBotKeywordsText(value) {
  const rows = String(value || "")
    .split(/\r?\n/g)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);

  return normalizeServicesBotKeywords(rows, []);
}

function parseServicesBotCorrectionRuleLine(line) {
  const source = String(line || "").trim();
  if (!source) return null;

  const pipeSeparatorIndex = source.indexOf("|");
  const colonSeparatorIndex = source.indexOf(":");
  const separatorIndex = pipeSeparatorIndex > 0 ? pipeSeparatorIndex : colonSeparatorIndex > 0 ? colonSeparatorIndex : -1;
  if (separatorIndex <= 0) return null;

  const trigger = source.slice(0, separatorIndex).trim().toLowerCase();
  const answer = source.slice(separatorIndex + 1).trim();
  if (!trigger || !answer) return null;

  return { trigger, answer };
}

function parseServicesBotCorrectionsText(value) {
  const rows = String(value || "")
    .split(/\r?\n/g)
    .map((entry) => parseServicesBotCorrectionRuleLine(entry))
    .filter(Boolean);

  return normalizeServicesBotCorrectionRules(rows, []);
}

function parseServiceFeaturesText(value) {
  return String(value || "")
    .split(/\r?\n/g)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function parseServiceKpisText(value) {
  return String(value || "")
    .split(/\r?\n/g)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function parseServiceFintechMetricsText(value) {
  return String(value || "")
    .split(/\r?\n/g)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .map((line, index) => parseFintechMetricLine(line, index))
    .filter(Boolean)
    .slice(0, 8);
}

function parseServiceBankPriceListText(value) {
  return String(value || "")
    .split(/\r?\n/g)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .map((line) => parseServiceBankPriceLine(line))
    .filter(Boolean)
    .slice(0, 60);
}

function parseServiceBankPriceLine(line) {
  const source = String(line || "").trim();
  if (!source) return null;

  const pipeSeparatorIndex = source.indexOf("|");
  const colonSeparatorIndex = source.indexOf(":");
  const separatorIndex = pipeSeparatorIndex > 0 ? pipeSeparatorIndex : colonSeparatorIndex > 0 ? colonSeparatorIndex : -1;
  if (separatorIndex <= 0) return null;

  const bank = source.slice(0, separatorIndex).trim();
  const price = source.slice(separatorIndex + 1).trim();
  if (!bank || !price) return null;

  return { bank, price };
}

function parseFintechMetricLine(line, index) {
  const source = String(line || "").trim();
  if (!source) return null;

  const pipeSeparatorIndex = source.indexOf("|");
  const colonSeparatorIndex = source.indexOf(":");
  const separatorIndex = pipeSeparatorIndex > 0 ? pipeSeparatorIndex : colonSeparatorIndex > 0 ? colonSeparatorIndex : -1;

  if (separatorIndex > 0) {
    const label = source.slice(0, separatorIndex).trim();
    const value = source.slice(separatorIndex + 1).trim();
    if (!label || !value) return null;
    return { label, value };
  }

  return inferFintechMetricLine(source, index);
}

function inferFintechMetricLine(source, index) {
  const raw = String(source || "").trim();
  if (!raw) return null;

  const percentEndingMatch = raw.match(/^(.*?)(\d+(?:[.,]\d+)?\s*%)$/);
  if (percentEndingMatch) {
    const label = String(percentEndingMatch[1] || "").trim().replace(/[:|-]+$/g, "").trim();
    const value = String(percentEndingMatch[2] || "").trim();
    if (label && value) {
      return { label, value };
    }
  }

  const lower = raw.toLowerCase();
  const presets = [
    { label: "Fee", probes: ["fee", "commissione"] },
    { label: "Spread", probes: ["spread"] },
    { label: "SLA", probes: ["sla", "settlement"] },
    { label: "Cold storage", probes: ["cold storage"] },
    { label: "Audit accessi", probes: ["audit accessi", "audit"] },
  ];

  for (const preset of presets) {
    const startingProbe = preset.probes.find((probe) => lower.startsWith(probe));
    if (startingProbe) {
      const value = raw.slice(startingProbe.length).replace(/^[-:\s]+/, "").trim();
      return {
        label: preset.label,
        value: value || raw,
      };
    }

    if (preset.probes.some((probe) => lower.includes(probe))) {
      return {
        label: preset.label,
        value: raw,
      };
    }
  }

  return {
    label: `Metrica ${index + 1}`,
    value: raw,
  };
}

function handleServicesPageHeroSubmit(event) {
  event.preventDefault();
  ensureServicesPageConfig();

  const badge = String(els.servicesHeroBadge?.value || "").trim();
  const title = String(els.servicesHeroTitle?.value || "").trim();
  const subtitle = String(els.servicesHeroSubtitle?.value || "").trim();
  const highlight = String(els.servicesHeroHighlight?.value || "").trim();
  const primaryLabel = String(els.servicesHeroPrimaryLabel?.value || "").trim();
  const primaryUrl = String(els.servicesHeroPrimaryUrl?.value || "").trim();
  const secondaryLabel = String(els.servicesHeroSecondaryLabel?.value || "").trim();
  const secondaryUrl = String(els.servicesHeroSecondaryUrl?.value || "").trim();
  const closingTitle = String(els.servicesClosingTitle?.value || "").trim();
  const closingDescription = String(els.servicesClosingDescription?.value || "").trim();

  if (!badge || !title || !subtitle || !primaryLabel || !primaryUrl || !closingTitle || !closingDescription) {
    setStatus("Compila tutti i campi obbligatori di hero e closing.", "error");
    return;
  }

  if (!isValidAbsoluteUrl(primaryUrl)) {
    setStatus("URL CTA primaria non valido. Usa un link completo https://...", "error");
    return;
  }

  if ((secondaryLabel || secondaryUrl) && (!secondaryLabel || !secondaryUrl)) {
    setStatus("Per la CTA secondaria inserisci sia label che URL.", "error");
    return;
  }
  if (secondaryUrl && !isValidAbsoluteUrl(secondaryUrl)) {
    setStatus("URL CTA secondaria non valido. Usa un link completo https://...", "error");
    return;
  }

  data.servicesPage.hero = {
    badge,
    title,
    subtitle,
    highlight,
    primaryCtaLabel: primaryLabel,
    primaryCtaUrl: primaryUrl,
    secondaryCtaLabel: secondaryLabel,
    secondaryCtaUrl: secondaryUrl,
  };
  data.servicesPage.closing = {
    title: closingTitle,
    description: closingDescription,
  };

  persistData("Contenuti hero/closing della pagina servizi aggiornati.");
}

function handleServicesPageSocialSubmit(event) {
  event.preventDefault();
  ensureServicesPageConfig();

  const title = String(els.servicesSocialTitle?.value || "").trim();
  const subtitle = String(els.servicesSocialSubtitle?.value || "").trim();
  const platforms = parseSocialPlatformsText(els.servicesSocialPlatformsInput?.value || "");

  if (!title) {
    setStatus("Inserisci un titolo per la sezione social.", "error");
    return;
  }
  if (platforms.length === 0) {
    setStatus("Inserisci almeno una piattaforma social (Nome|Focus).", "error");
    return;
  }

  data.servicesPage.socialProof = {
    title,
    subtitle,
  };
  data.servicesPage.socialPlatforms = platforms;

  persistData("Sezione social della pagina servizi aggiornata.");
}

function handleServicesBotSubmit(event) {
  event.preventDefault();
  ensureServicesBotConfig();

  const enabled = Boolean(els.servicesBotEnabled?.checked);
  const assistantName = String(els.servicesBotAssistantName?.value || "")
    .trim()
    .slice(0, 80);
  const model = String(els.servicesBotModel?.value || "")
    .trim()
    .slice(0, 80);
  const systemPrompt = String(els.servicesBotSystemPrompt?.value || "")
    .trim()
    .slice(0, 6000);
  const operatorLabel = String(els.servicesBotOperatorLabel?.value || "")
    .trim()
    .slice(0, 80);
  const operatorUrl = String(els.servicesBotOperatorUrl?.value || "").trim();
  const operatorFallbackMessage = String(els.servicesBotOperatorFallbackMessage?.value || "")
    .trim()
    .slice(0, 500);
  const handoffKeywords = parseServicesBotKeywordsText(els.servicesBotHandoffKeywords?.value || "");
  const correctionRules = parseServicesBotCorrectionsText(els.servicesBotCorrections?.value || "");

  if (!assistantName || !model || !systemPrompt || !operatorLabel || !operatorUrl || !operatorFallbackMessage) {
    setStatus("Compila tutti i campi principali del consulente AI.", "error");
    return;
  }

  if (!isValidAbsoluteUrl(operatorUrl)) {
    setStatus("URL operatore non valido. Usa un link completo https://...", "error");
    return;
  }

  data.servicesBot = {
    enabled,
    assistantName,
    model,
    systemPrompt,
    operatorLabel,
    operatorUrl,
    operatorFallbackMessage,
    handoffKeywords,
    correctionRules,
  };

  persistData("Configurazione AI consulente aggiornata.");
}

function handleServiceBlockSubmit(event) {
  event.preventDefault();
  ensureServicesPageConfig();

  const rawId = String(els.serviceBlockId?.value || "").trim();
  const category = String(els.serviceBlockCategory?.value || "").trim();
  const title = String(els.serviceBlockTitle?.value || "").trim();
  const description = String(els.serviceBlockDescription?.value || "").trim();
  const price = String(els.serviceBlockPrice?.value || "").trim();
  const priceNote = sanitizeServicePriceNoteText(els.serviceBlockPriceNote?.value);
  const accent = String(els.serviceBlockAccent?.value || "")
    .trim()
    .toLowerCase();
  const featured = Boolean(els.serviceBlockFeatured?.checked);
  const features = parseServiceFeaturesText(els.serviceBlockFeatures?.value || "");
  const kpis = parseServiceKpisText(els.serviceBlockKpis?.value || "");
  const fintechMetrics = parseServiceFintechMetricsText(els.serviceBlockFintechMetrics?.value || "");
  const bankPriceList = parseServiceBankPriceListText(els.serviceBlockBankPriceList?.value || "");

  if (!category || !title || !description || !price) {
    setStatus("Compila categoria, titolo, descrizione e prezzo del blocco servizio.", "error");
    return;
  }

  const normalizedAccent = SERVICE_BLOCK_ACCENTS.includes(accent) ? accent : SERVICE_BLOCK_ACCENTS[0];
  const blocks = data.servicesPage.serviceBlocks || [];
  const requestedId = slugify(rawId || title) || `service-${Date.now()}`;
  const editingId = editingServiceBlockId;
  let nextId = requestedId;
  let suffix = 2;

  while (blocks.some((block) => block.id === nextId && block.id !== editingId)) {
    nextId = `${requestedId}-${suffix}`;
    suffix += 1;
  }

  const payload = {
    id: nextId,
    category,
    title,
    description,
    price,
    priceNote,
    accent: normalizedAccent,
    featured,
    features,
    kpis,
    fintechMetrics,
    bankPriceList,
  };

  if (editingId) {
    const targetIndex = blocks.findIndex((block) => block.id === editingId);
    if (targetIndex >= 0) {
      blocks[targetIndex] = payload;
    } else {
      blocks.push(payload);
    }
    setStatus(`Blocco servizio '${title}' aggiornato.`, "success");
  } else {
    blocks.push(payload);
    setStatus(`Blocco servizio '${title}' aggiunto.`, "success");
  }

  data.servicesPage.serviceBlocks = blocks;
  resetServiceBlockForm();
  persistData("Blocchi servizi aggiornati.");
}

function handleServiceBlockActions(event) {
  const button = event.target.closest("[data-service-block-action]");
  if (!button) return;

  const action = button.dataset.serviceBlockAction;
  const blockId = button.dataset.serviceBlockId;
  if (!action || !blockId) return;

  ensureServicesPageConfig();
  const blocks = data.servicesPage.serviceBlocks || [];
  const index = blocks.findIndex((block) => block.id === blockId);
  if (index < 0) return;

  if (action === "edit") {
    fillServiceBlockForm(blocks[index]);
    safeFocus(els.serviceBlockTitle);
    renderServiceBlocksList();
    return;
  }

  if (action === "delete") {
    const ok = window.confirm(`Eliminare il blocco servizio '${blocks[index].title}'?`);
    if (!ok) return;
    blocks.splice(index, 1);
    if (editingServiceBlockId === blockId) {
      resetServiceBlockForm();
    }
    data.servicesPage.serviceBlocks = blocks;
    persistData("Blocco servizio eliminato.", "warn");
    return;
  }

  if (action === "up" && index > 0) {
    moveArrayItem(blocks, index, index - 1);
    data.servicesPage.serviceBlocks = blocks;
    persistData("Ordine blocchi servizi aggiornato.");
    return;
  }

  if (action === "down" && index < blocks.length - 1) {
    moveArrayItem(blocks, index, index + 1);
    data.servicesPage.serviceBlocks = blocks;
    persistData("Ordine blocchi servizi aggiornato.");
  }
}

function normalizeAbsoluteHttpUrl(value, fallback = "") {
  const candidate = String(value || "").trim();
  if (candidate && isValidAbsoluteUrl(candidate)) {
    return candidate;
  }

  const fallbackValue = String(fallback || "").trim();
  if (fallbackValue && isValidAbsoluteUrl(fallbackValue)) {
    return fallbackValue;
  }

  return "";
}

function renderKpi() {
  const allPoints = data.regions.flatMap((region) => region.activePoints || []);
  const otherPoints = Object.values(data.otherCategories || {}).flatMap((arr) => arr || []);
  const serviceCoverage = {
    meetup: 0,
    delivery: 0,
    ship: 0,
    other: otherPoints.length,
  };
  let starredPoints = 0;

  allPoints.forEach((point) => {
    starredPoints += clampStars(point.stars);
    (point.services || []).forEach((service) => {
      if (serviceCoverage[service] !== undefined) {
        serviceCoverage[service] += 1;
      }
    });
  });

  otherPoints.forEach((point) => {
    starredPoints += clampStars(point.stars);
  });

  els.kpiRegions.textContent = String(data.regions.length);
  els.kpiPoints.textContent = String(allPoints.length);
  els.kpiAverageStars.textContent = String(starredPoints);
  els.kpiMeetup.textContent = String(serviceCoverage.meetup);
  els.kpiDelivery.textContent = String(serviceCoverage.delivery);
  els.kpiShip.textContent = String(serviceCoverage.ship);
  if (els.kpiOther) {
    els.kpiOther.textContent = String(serviceCoverage.other);
  }
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
    setAdminPage("regions", { updateHash: true, focus: false });
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
    setAdminPage("points", { updateHash: true, focus: false });
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

  if (otherPointMode.category) {
    const label = data.otherCategoryLabels?.[otherPointMode.category] || otherPointMode.category;
    els.pointsContextHint.textContent = `Modalità Other: ${label}. Usa il form per aggiungere o modificare punti Other.`;
    if (els.pointCreateNew) {
      els.pointCreateNew.disabled = true;
    }
    if (els.pointRegionSelect) {
      els.pointRegionSelect.disabled = true;
    }
    return;
  }

  const region = getSelectedRegion();
  if (!region) {
    els.pointsContextHint.textContent = "Seleziona una regione per gestire i punti attivi.";
    if (els.pointCreateNew) {
      els.pointCreateNew.disabled = true;
    }
    if (els.pointRegionSelect) {
      els.pointRegionSelect.disabled = false;
    }
    return;
  }

  const pointsCount = Array.isArray(region.activePoints) ? region.activePoints.length : 0;
  const countLabel = formatPointCount(pointsCount);
  els.pointsContextHint.textContent = `Regione attiva: ${region.name}. ${countLabel} configurati.`;

  if (els.pointCreateNew) {
    els.pointCreateNew.disabled = false;
  }
  if (els.pointRegionSelect) {
    els.pointRegionSelect.disabled = false;
  }
}

function ensureOtherCategories() {
  data.otherCategories = data.otherCategories || {
    antiscam: [],
    lifestyle: [],
    digitalSystems: [],
  };

  data.otherCategoryLabels = data.otherCategoryLabels || {
    antiscam: "Antiscam",
    lifestyle: "Lifestyle",
    digitalSystems: "Digital Systems",
  };

  for (const category of OTHER_CATEGORIES) {
    if (!Array.isArray(data.otherCategories[category])) {
      data.otherCategories[category] = [];
    }
    if (!data.otherCategoryLabels[category]) {
      data.otherCategoryLabels[category] = OTHER_CATEGORY_LABELS[category] || category;
    }
  }
}

function renderOtherCategoryConfig() {
  if (!els.otherCategoryList) return;
  ensureOtherCategories();

  const categories = Object.keys(data.otherCategories || {}).sort((a, b) => {
    const aName = data.otherCategoryLabels?.[a] || a;
    const bName = data.otherCategoryLabels?.[b] || b;
    return aName.localeCompare(bName, "it", { sensitivity: "base" });
  });

  if (categories.length === 0) {
    els.otherCategoryList.innerHTML = "<p class='admin-empty'>Nessuna categoria Other configurata.</p>";
    return;
  }

  els.otherCategoryList.innerHTML = categories
    .map((category) => {
      const label = data.otherCategoryLabels?.[category] || category;
      const fixed = OTHER_CATEGORIES.includes(category);

      return `
        <div class="other-category-config-item" data-category="${escapeHtmlAttr(category)}">
          <span class="other-category-config-id">${escapeHtml(category)}</span>
          <input
            class="other-category-config-label"
            type="text"
            value="${escapeHtmlAttr(label)}"
            data-category="${escapeHtmlAttr(category)}"
            placeholder="Nome categoria"
            ${fixed ? "disabled" : ""}
          />
          ${fixed ? "" : `<button class="admin-btn admin-btn-danger other-category-delete" data-category="${escapeHtmlAttr(category)}">Elimina</button>`}
        </div>
      `;
    })
    .join("\n");
}

function renderOtherPage() {
  ensureOtherCategories();
  renderOtherCategoryConfig();

  if (!els.otherCategoriesContainer) return;

  const categories = Object.keys(data.otherCategories || {}).sort((a, b) => {
    const aName = data.otherCategoryLabels?.[a] || a;
    const bName = data.otherCategoryLabels?.[b] || b;
    return aName.localeCompare(bName, "it", { sensitivity: "base" });
  });

  if (categories.length === 0) {
    els.otherCategoriesContainer.innerHTML = "<p class='admin-empty'>Nessuna categoria Other configurata.</p>";
    return;
  }

  els.otherCategoriesContainer.innerHTML = categories
    .map((category) => {
      const categoryLabel = data.otherCategoryLabels?.[category] || category;
      const points = Array.isArray(data.otherCategories[category]) ? data.otherCategories[category] : [];

      const pointsHtml = points.length
        ? points
            .map((point) => {
              const starMark = point.stars === 1 ? "★" : "☆";
              const logoHtml = point.logo ? `<img src="${escapeHtmlAttr(point.logo)}" alt="Logo ${escapeHtmlAttr(point.name)}" class="other-point-logo-preview" />` : "";
              const mediaType = resolvePointMediaType(point.mediaType, point.mediaUrl);
              const mediaLabel = mediaType === "none" ? "NO" : mediaType.toUpperCase();
              const socialsCount = Array.isArray(point.socials) ? point.socials.length : 0;

              return `
                <article class="admin-item other-point-item">
                  <div class="admin-item-top">
                    <div class="other-point-identity">
                      ${logoHtml}
                      <div>
                        <p class="admin-item-title">${escapeHtml(point.name)}</p>
                        <p class="admin-item-id">${escapeHtml(point.id)}</p>
                      </div>
                    </div>
                    <p class="other-point-stars">${starMark}</p>
                  </div>
                  <div class="admin-item-tags">
                    <span class="mini-chip">Social ${socialsCount}</span>
                    <span class="mini-chip">Media ${mediaLabel}</span>
                  </div>
                  <p class="admin-item-meta">${escapeHtml(point.details || "Nessun dettaglio")}</p>
                  <div class="admin-item-actions">
                    <button class="admin-btn other-point-edit" data-category="${escapeHtmlAttr(category)}" data-point-id="${escapeHtmlAttr(point.id)}">Modifica</button>
                    <button class="admin-btn admin-btn-danger other-point-delete" data-category="${escapeHtmlAttr(category)}" data-point-id="${escapeHtmlAttr(point.id)}">Elimina</button>
                  </div>
                </article>
              `;
            })
            .join("")
        : `<article class="admin-item"><p class="admin-empty">Nessun punto in ${escapeHtml(categoryLabel)}</p></article>`;

      return `
        <section class="other-category" data-category="${escapeHtmlAttr(category)}">
          <h3>${escapeHtml(categoryLabel)} <small>(${escapeHtml(category)})</small></h3>
          <div class="other-list">${pointsHtml}</div>

          <div class="admin-form-actions" style="margin-top: 0.75rem;">
            <button class="admin-btn other-point-open-full" type="button" data-category="${escapeHtmlAttr(category)}">Aggiungi punto con form completo</button>
          </div>
        </section>
      `;
    })
    .join("\n");
}

function openOtherPointEditor(category, pointId) {
  ensureOtherCategories();

  const categoryPoints = data.otherCategories?.[category];
  if (!Array.isArray(categoryPoints)) {
    setStatus("Categoria Other non trovata.", "error");
    return;
  }

  const point = categoryPoints.find((item) => item.id === pointId);
  if (!point) {
    setStatus("Punto Other non trovato.", "error");
    return;
  }

  resetPointForm();
  setOtherPointMode(category);
  fillPointForm(point);
  otherPointMode.editingPointId = point.id;
  updatePointFormUi();
  focusPointEditorForm(els.pointName);
  setStatus(`Modifica punto Other: ${point.name}`, "warn");
}

function addOtherPoint(category) {
  const section = els.otherCategoriesContainer?.querySelector(`.other-category[data-category='${cssEscape(category)}']`);
  if (!section) {
    setStatus(`Categoria ${category} non trovata.`, "error");
    return;
  }

  const idInput = section.querySelector(".other-point-id");
  const nameInput = section.querySelector(".other-point-name");
  const detailsInput = section.querySelector(".other-point-details");
  const logoInput = section.querySelector(".other-point-logo");
  const starsInput = section.querySelector(".other-point-stars");

  if (!nameInput || !detailsInput || !starsInput) return;

  const customId = String(idInput?.value || "").trim();
  const name = String(nameInput.value || "").trim();
  const details = String(detailsInput.value || "").trim();
  const logo = String(logoInput?.value || "").trim();
  const stars = Number(starsInput.value) === 1 ? 1 : 0;

  if (!name) {
    const label = data.otherCategoryLabels?.[category] || category;
    setStatus(`Inserisci un nome valido per la categoria ${label}.`, "error");
    return;
  }

  ensureOtherCategories();

  const targetArray = data.otherCategories[category] || [];

  let id = customId ? slugify(customId) : makeUniqueOtherPointId(name, targetArray);
  if (!id) id = makeUniqueOtherPointId(name, targetArray);
  if (targetArray.some((point) => point.id === id)) {
    id = makeUniqueOtherPointId(id, targetArray);
  }

  targetArray.push({
    id,
    name,
    details,
    logo,
    stars,
    services: ["other"],
  });

  data.otherCategories[category] = targetArray;
  nameInput.value = "";
  detailsInput.value = "";
  renderOtherPage();
  renderKpi();
  persistData(`Nuovo punto ${data.otherCategoryLabels?.[category] || category} aggiunto.`, "success");
}

function removeOtherPoint(category, pointId) {
  ensureOtherCategories();

  data.otherCategories[category] = (data.otherCategories[category] || []).filter((point) => point.id !== pointId);
  renderOtherPage();
  renderKpi();
  persistData(`Punto rimosso da ${data.otherCategoryLabels?.[category] || category}.`, "warn");
}

function makeUniqueOtherPointId(baseName, points) {
  const normalizedBase = slugify(baseName) || "other-point";
  let candidate = normalizedBase;
  let suffix = 1;
  while (points.some((point) => point.id === candidate)) {
    suffix += 1;
    candidate = `${normalizedBase}-${suffix}`;
  }
  return candidate;
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
      String(point.id || "").toLowerCase().includes(search);
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
      const starsChip = starsValue === 1 ? `<span class="mini-chip">Stella ★ Platinum</span>` : "";
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
          <div class="admin-item-tags">
            ${starsChip}
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

  const isOtherMode = Boolean(otherPointMode.category);
  const region = getSelectedRegion();
  if (!isOtherMode && !region) {
    revealPointFieldError(els.pointRegionSelect, "Seleziona prima una regione.");
    return;
  }

  const id = slugify(els.pointId.value);
  const name = els.pointName.value.trim();
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

  const selectedServices = getPointFormSelectedServices();
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

  const activeCategory = otherPointMode.category;
  const isEditingOther = Boolean(otherPointMode.editingPointId);
  const editingId = isEditingOther ? otherPointMode.editingPointId : editingPointId;

  if (isOtherMode) {
    ensureOtherCategories();
    const categoryPoints = data.otherCategories[activeCategory] || [];

    if (isEditingOther) {
      const pointIndex = categoryPoints.findIndex((item) => item.id === editingId);
      if (pointIndex < 0) {
        setStatus("Punto Other in modifica non trovato.", "error");
        return;
      }

      const conflict = categoryPoints.some((item) => item.id === id && item.id !== editingId);
      if (conflict) {
        revealPointFieldError(els.pointId, "ID punto gia in uso nella categoria Other.");
        return;
      }

      categoryPoints[pointIndex] = {
        ...categoryPoints[pointIndex],
        id,
        name,
        details,
        logo,
        mediaType: resolvedMediaType,
        mediaUrl,
        stars,
        services,
        socials: socials.items,
      };

      data.otherCategories[activeCategory] = categoryPoints;
      otherPointMode.editingPointId = id;
      persistData(`Punto Other aggiornato: ${name}`, "success");
      resetPointForm();
      clearOtherPointMode();
      renderOtherPage();
      renderKpi();
      setAdminPage("other", { updateHash: true, focus: false });
      return;
    }

    const exists = categoryPoints.some((item) => item.id === id);
    if (exists) {
      revealPointFieldError(els.pointId, "ID punto gia in uso nella categoria Other.");
      return;
    }

    categoryPoints.push({
      id,
      name,
      details,
      logo,
      mediaType: resolvedMediaType,
      mediaUrl,
      stars,
      services,
      socials: socials.items,
    });

    data.otherCategories[activeCategory] = categoryPoints;
    persistData(`Punto Other creato: ${name}`, "success");
    resetPointForm();
    clearOtherPointMode();
    renderOtherPage();
    renderKpi();
    setAdminPage("other", { updateHash: true, focus: false });
    return;
  }

  // Existing region point flow
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
    delete point.address;
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

  const serviceSet = new Set(otherPointMode.category ? ["other"] : point.services || []);
  els.pointForm.querySelectorAll("input[name='services']").forEach((checkbox) => {
    checkbox.checked = serviceSet.has(checkbox.value);
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
  const isOtherMode = Boolean(otherPointMode.category);
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
  els.pointForm.querySelectorAll("input[name='services']").forEach((checkbox) => {
    checkbox.checked = !isOtherMode && checkbox.value === "meetup";
    checkbox.disabled = isOtherMode;
  });
  if (els.pointServicesFieldset) {
    els.pointServicesFieldset.classList.toggle("admin-field-disabled", isOtherMode);
  }
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

  const isOtherMode = Boolean(otherPointMode.category);
  const isEditingOther = Boolean(otherPointMode.editingPointId || editingPointId);

  if (isOtherMode) {
    els.pointFormTitle.textContent = isEditingOther ? "Modifica punto Other" : "Nuovo punto Other";
    els.pointSubmitBtn.textContent = isEditingOther ? "Salva punto Other" : "Aggiungi punto Other";
    return;
  }

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

  const servicesSnapshot = getPointFormSelectedServices().join("|");
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
    shipOrigin: normalizeShipOrigin(els.pointShipOrigin?.value),
    shipCountry: String(els.pointShipCountry?.value || "").trim(),
    details: els.pointDetails.value.trim(),
    logo: els.pointLogo.value.trim(),
    mediaType: els.pointMediaType.value,
    mediaUrl: els.pointMediaUrl.value.trim(),
    stars: els.pointStars.value,
    otherCategory: otherPointMode.category || "",
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
  setAdminPage("points", { updateHash: true, focus: false });
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
      "Inserisci il link del canale (formato: https://t.me/username)."
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

  return setInlineFieldValidation(field, "success", "Link canale Telegram valido.");
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
  const isOtherMode = Boolean(otherPointMode.category);
  if (!region && !isOtherMode) {
    els.pointPreview.innerHTML = `<p class="preview-empty">Seleziona una regione per creare anteprima.</p>`;
    return;
  }

  const name = els.pointName.value.trim();
  const id = slugify(els.pointId.value);
  const shipCountry = String(els.pointShipCountry?.value || "").trim();
  const details = els.pointDetails.value.trim();
  const logo = els.pointLogo.value.trim();
  const mediaType = normalizeMediaType(els.pointMediaType.value);
  const mediaUrl = els.pointMediaUrl.value.trim();
  const resolvedMediaType = resolvePointMediaType(mediaType, mediaUrl);
  const stars = clampStars(els.pointStars.value);
  const services = getPointFormSelectedServices();
  const pointShipOrigin = getPointShipOriginValue();
  const hasShipService = services.includes("ship");
  const shipOriginLabel = getShipOriginLabel(pointShipOrigin);
  const showShipCountry = hasShipService && pointShipOrigin === "eu";
  const socials = Array.from(els.socialRows.querySelectorAll(".social-row"))
    .map((row) => row.querySelector(".social-label")?.value.trim() || "")
    .filter(Boolean);

  if (
    !name &&
    !id &&
    !details &&
    !logo &&
    !mediaUrl &&
    socials.length === 0 &&
    !editingPointId &&
    !otherPointMode.editingPointId
  ) {
    els.pointPreview.innerHTML = `<p class="preview-empty">Compila il form per vedere l'anteprima live.</p>`;
    return;
  }

  const logoHtml = logo
    ? `<img src="${escapeHtmlAttr(logo)}" alt="Logo preview" loading="lazy" />`
    : `<span>${escapeHtml(getInitials(name || "Punto"))}</span>`;
  const mediaHtml = buildMediaPreviewMarkup(resolvedMediaType, mediaUrl, name || "Punto");
  const starsHtml = stars === 1 ? "★ Platinum" : "";
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
      ${starsHtml ? `<p class="preview-stars">${starsHtml}</p>` : ""}
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
    otherCategories: {
      antiscam: [],
      lifestyle: [],
      digitalSystems: [],
    },
    otherCategoryLabels: {
      antiscam: "Antiscam",
      lifestyle: "Lifestyle",
      digitalSystems: "Digital Systems",
    },
    servicesPage: cloneSimple(defaultServicesPageConfig),
    servicesBot: cloneSimple(defaultServicesBotConfig),
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

function getPointFormSelectedServices() {
  if (otherPointMode.category) {
    return ["other"];
  }

  if (!els.pointForm) {
    return [];
  }

  return Array.from(els.pointForm.querySelectorAll("input[name='services']:checked"))
    .map((input) => input.value)
    .filter((serviceId) => POINT_SERVICES.includes(serviceId));
}

function hasShipServiceSelected() {
  return getPointFormSelectedServices().includes("ship");
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

function cloneSimple(value) {
  return JSON.parse(JSON.stringify(value));
}

function clonePoint(point) {
  return JSON.parse(JSON.stringify(point));
}

function clampStars(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(1, Math.round(num)));
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
