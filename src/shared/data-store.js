(function initRIDataStore(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.RIDataStore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function createRIDataStore() {
  const STORAGE_KEY = "ri_site_data_v1";

  const DEFAULT_DATA = {
    serviceLabels: {
      meetup: "Ritiro",
      delivery: "Consegna",
      ship: "Spedizione",
      other: "Altro",
    },
    supportTelegramUrl: "https://t.me/SHLC26",
    regions: [
      {
        id: "lombardia",
        name: "Lombardia",
        hubs: "Milano, Bergamo, Brescia",
        activePoints: [
          {
            id: "mi-duomo",
            name: "Milano Duomo Hub",
            address: "Via Torino 18, Milano",
            logo: "",
            stars: 3,
            services: ["meetup", "delivery", "ship", "other"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_milano" },
              { label: "Telegram", url: "https://t.me/ristoranti_italia_milano" },
              { label: "Sito", url: "https://example.com/milano-duomo" },
            ],
          },
          {
            id: "bg-stazione",
            name: "Bergamo Stazione Point",
            address: "Piazzale Marconi 6, Bergamo",
            logo: "",
            stars: 2,
            services: ["meetup", "delivery"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_bergamo" },
              { label: "Facebook", url: "https://facebook.com/ristoranti.italia.bergamo" },
            ],
          },
        ],
      },
      {
        id: "lazio",
        name: "Lazio",
        hubs: "Roma, Latina",
        activePoints: [
          {
            id: "roma-centro",
            name: "Roma Centro Lounge",
            address: "Via Cavour 51, Roma",
            logo: "",
            stars: 3,
            services: ["meetup", "delivery", "ship"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_roma" },
              { label: "TikTok", url: "https://www.tiktok.com/@ristoranti.italia.roma" },
              { label: "Sito", url: "https://example.com/roma-centro" },
            ],
          },
          {
            id: "latina-nord",
            name: "Latina Nord Point",
            address: "Viale XXI Aprile 14, Latina",
            logo: "",
            stars: 1,
            services: ["delivery"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_latina" },
              { label: "Telegram", url: "https://t.me/ristoranti_italia_latina" },
            ],
          },
        ],
      },
      {
        id: "veneto",
        name: "Veneto",
        hubs: "Venezia, Verona",
        activePoints: [
          {
            id: "venezia-mestre",
            name: "Venezia Mestre Dock",
            address: "Corso del Popolo 22, Mestre",
            logo: "",
            stars: 2,
            services: ["meetup", "ship"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_venezia" },
              { label: "Sito", url: "https://example.com/venezia-mestre" },
            ],
          },
          {
            id: "verona-arena",
            name: "Verona Arena Point",
            address: "Via Leoncino 29, Verona",
            logo: "",
            stars: 1,
            services: ["meetup", "delivery"],
            socials: [
              { label: "Facebook", url: "https://facebook.com/ristoranti.italia.verona" },
              { label: "Telegram", url: "https://t.me/ristoranti_italia_verona" },
            ],
          },
        ],
      },
      {
        id: "emilia-romagna",
        name: "Emilia-Romagna",
        hubs: "Bologna, Parma",
        activePoints: [
          {
            id: "bologna-porta",
            name: "Bologna Porta Hub",
            address: "Via dell'Indipendenza 73, Bologna",
            logo: "",
            stars: 3,
            services: ["meetup", "delivery", "ship"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_bologna" },
              { label: "TikTok", url: "https://www.tiktok.com/@ristoranti.italia.bologna" },
            ],
          },
          {
            id: "parma-centro",
            name: "Parma Centro Point",
            address: "Strada Garibaldi 10, Parma",
            logo: "",
            stars: 1,
            services: ["delivery"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_parma" },
              { label: "Sito", url: "https://example.com/parma-centro" },
            ],
          },
        ],
      },
      {
        id: "piemonte",
        name: "Piemonte",
        hubs: "Torino, Novara",
        activePoints: [
          {
            id: "torino-sanpaolo",
            name: "Torino San Paolo Hub",
            address: "Corso Francia 44, Torino",
            logo: "",
            stars: 2,
            services: ["meetup", "delivery", "ship"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_torino" },
              { label: "Telegram", url: "https://t.me/ristoranti_italia_torino" },
              { label: "Sito", url: "https://example.com/torino-sanpaolo" },
            ],
          },
        ],
      },
      {
        id: "toscana",
        name: "Toscana",
        hubs: "Firenze, Pisa",
        activePoints: [
          {
            id: "firenze-santa-maria",
            name: "Firenze Santa Maria Point",
            address: "Via dei Cerretani 38, Firenze",
            logo: "",
            stars: 2,
            services: ["meetup", "delivery"],
            socials: [
              { label: "Instagram", url: "https://instagram.com/ristoranti_italia_firenze" },
              { label: "Facebook", url: "https://facebook.com/ristoranti.italia.firenze" },
            ],
          },
          {
            id: "pisa-porto",
            name: "Pisa Porto Logistic",
            address: "Via Aurelia 12, Pisa",
            logo: "",
            stars: 1,
            services: ["ship"],
            socials: [
              { label: "Telegram", url: "https://t.me/ristoranti_italia_pisa" },
              { label: "Sito", url: "https://example.com/pisa-porto" },
            ],
          },
        ],
      },
    ],
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
    servicesPage: {
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
        title: "Canali digitali europei più richiesti",
        subtitle: "Supporto operativo e presenza multi-canale per progetti professionali.",
      },
      socialPlatforms: [
        {
          id: "instagram",
          name: "Instagram",
          focus: "Reels, Stories, ADV performance e branding visuale",
        },
        {
          id: "tiktok",
          name: "TikTok",
          focus: "Strategie short video e posizionamento organico",
        },
        {
          id: "facebook",
          name: "Facebook",
          focus: "Campagne geolocalizzate e community management",
        },
        {
          id: "youtube",
          name: "YouTube",
          focus: "Long-form, Shorts e funnel contenuti",
        },
        {
          id: "telegram",
          name: "Telegram",
          focus: "Canali premium, community private e automazioni",
        },
        {
          id: "linkedin",
          name: "LinkedIn",
          focus: "Lead generation B2B e autorevolezza professionale",
        },
        {
          id: "x",
          name: "X",
          focus: "Comunicazione real-time e amplificazione topic",
        },
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
        description:
          "Ogni soluzione è presentata in modo trasparente, con prezzi chiari, mantenimento definito e supporto continuo.",
      },
    },
  };

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function clampStars(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.min(1, Math.round(num)));
  }

  function sanitizeString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function slugify(value) {
    return sanitizeString(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeSocials(value) {
    if (!Array.isArray(value)) return [];

    return value
      .map((link) => ({
        label: sanitizeString(link?.label),
        url: sanitizeString(link?.url),
      }))
      .filter((link) => link.label && link.url);
  }

  function normalizeShipOrigin(value) {
    const candidate = sanitizeString(value).toLowerCase();
    if (candidate === "eu" || candidate === "ue") return "eu";
    return "italy";
  }

  function normalizeShipCountry(value) {
    return sanitizeString(value).slice(0, 64);
  }

  function normalizeMediaType(value) {
    const candidate = sanitizeString(value).toLowerCase();
    if (candidate === "photo" || candidate === "gif" || candidate === "video" || candidate === "none") {
      return candidate;
    }
    return "none";
  }

  function inferMediaTypeFromUrl(value) {
    const mediaUrl = sanitizeString(value).toLowerCase();
    if (!mediaUrl) return "none";
    if (mediaUrl.startsWith("data:image/gif")) return "gif";
    if (mediaUrl.startsWith("data:video/")) return "video";
    if (mediaUrl.startsWith("data:image/")) return "photo";
    if (mediaUrl.includes(".gif")) return "gif";
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(mediaUrl)) return "video";
    return "photo";
  }

  function resolveMediaType(typeValue, mediaUrl) {
    const normalizedType = normalizeMediaType(typeValue);
    if (!mediaUrl) return "none";
    if (normalizedType !== "none") return normalizedType;
    return inferMediaTypeFromUrl(mediaUrl);
  }

  function normalizeSupportTelegramUrl(value) {
    const candidate = sanitizeString(value);
    if (!candidate) return DEFAULT_DATA.supportTelegramUrl;

    try {
      const parsed = new URL(candidate);
      const host = parsed.hostname.replace(/^www\./, "");
      if ((parsed.protocol === "http:" || parsed.protocol === "https:") && host === "t.me") {
        return parsed.toString();
      }
    } catch {
      // Ignore invalid URL and fallback to default.
    }

    return DEFAULT_DATA.supportTelegramUrl;
  }

  function normalizeAbsoluteUrl(value, fallback) {
    const candidate = sanitizeString(value);
    if (!candidate) return sanitizeString(fallback);

    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
      // Ignore invalid url and use fallback.
    }

    return sanitizeString(fallback);
  }

  function normalizeServicePageAccent(value, fallback = "amber") {
    const candidate = sanitizeString(value).toLowerCase();
    if (["amber", "cyan", "emerald", "rose"].includes(candidate)) {
      return candidate;
    }
    return fallback;
  }

  function normalizeServicePageFeatures(value, fallbackFeatures = []) {
    const source = Array.isArray(value) ? value : fallbackFeatures;
    return source
      .map((entry) => sanitizeString(entry))
      .filter(Boolean)
      .slice(0, 8);
  }

  function normalizeServicePageKpis(value, fallbackKpis = []) {
    const source = Array.isArray(value) ? value : fallbackKpis;
    return source
      .map((entry) => sanitizeString(entry))
      .filter(Boolean)
      .slice(0, 4);
  }

  function normalizeServicePageFintechMetrics(value, fallbackMetrics = []) {
    const source = Array.isArray(value) ? value : fallbackMetrics;
    return source
      .map((entry) => {
        const label = sanitizeString(entry?.label);
        const metricValue = sanitizeString(entry?.value);
        if (!label || !metricValue) return null;
        return {
          label,
          value: metricValue,
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  function normalizeServicePageBankPriceList(value, fallbackList = []) {
    const source = Array.isArray(value) ? value : fallbackList;
    return source
      .map((entry) => {
        const bank = sanitizeString(entry?.bank || entry?.name);
        const price = sanitizeString(entry?.price || entry?.value);
        if (!bank || !price) return null;
        return {
          bank,
          price,
        };
      })
      .filter(Boolean)
      .slice(0, 60);
  }

  function sanitizeServicePagePriceNote(value) {
    const note = sanitizeString(value);
    if (!note) return "";

    const compact = note.toLowerCase().replace(/\s+/g, " ");
    const hasIncreaseMarker = /(maggiorazion|rincar|aument|supplement|upcharge|mark[\s-]?up)/i.test(compact);
    const hasPlusEuro = /\+\s*\d{1,4}(?:[.,]\d+)?\s*€?/i.test(note);
    if (hasIncreaseMarker || hasPlusEuro) {
      return "";
    }

    return note;
  }

  function isExchangeAccountsListBlock(id, category, title) {
    const haystack = [id, category, title]
      .map((value) => sanitizeString(value).toLowerCase())
      .join(" ");

    return haystack.includes("exchange") && /\baccounts?\b/.test(haystack);
  }

  function hasBankingServiceBlock(serviceBlocks) {
    const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
    return blocks.some((block) => {
      const id = sanitizeString(block?.id).toLowerCase();
      return id === "bank-accounts-and-crypto-wallets" || id === "banking-wallet-services";
    });
  }

  function hasExchangeAccountsServiceBlock(serviceBlocks) {
    const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
    return blocks.some((block) => sanitizeString(block?.id).toLowerCase() === "exchange-accounts-services");
  }

  function ensureSupplementaryServiceBlocks(serviceBlocks, defaultBlocks) {
    const blocks = Array.isArray(serviceBlocks) ? serviceBlocks : [];
    const defaults = Array.isArray(defaultBlocks) ? defaultBlocks : [];
    const nextBlocks = [...blocks];

    if (!hasExchangeAccountsServiceBlock(nextBlocks)) {
      const defaultExchangeAccounts = defaults.find(
        (block) => sanitizeString(block?.id).toLowerCase() === "exchange-accounts-services"
      );
      if (defaultExchangeAccounts) {
        nextBlocks.push(clone(defaultExchangeAccounts));
      }
    }

    if (!hasBankingServiceBlock(nextBlocks)) {
      const defaultBanking = defaults.find(
        (block) => sanitizeString(block?.id).toLowerCase() === "bank-accounts-and-crypto-wallets"
      );
      if (defaultBanking) {
        nextBlocks.push(clone(defaultBanking));
      }
    }

    return nextBlocks;
  }

  function shouldApplyOfficialServicesPreset(rawBlocks) {
    if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) return true;

    const ids = rawBlocks
      .map((block) => sanitizeString(block?.id).toLowerCase())
      .filter(Boolean);
    if (ids.length === 0) return true;

    const legacyMarkers = [
      "clean-chat-multimedia-bots",
      "telegram-miniapp-websites",
      "full-web-applications",
      "social-media-growth",
      "banking-wallet-services",
    ];

    return ids.some((id) => legacyMarkers.includes(id));
  }

  function normalizeServicesPage(rawPage) {
    const defaults = DEFAULT_DATA.servicesPage;
    const page = rawPage && typeof rawPage === "object" ? rawPage : {};
    const heroRaw = page.hero && typeof page.hero === "object" ? page.hero : {};
    const socialProofRaw = page.socialProof && typeof page.socialProof === "object" ? page.socialProof : {};
    const closingRaw = page.closing && typeof page.closing === "object" ? page.closing : {};

    const hero = {
      badge: sanitizeString(heroRaw.badge) || defaults.hero.badge,
      title: sanitizeString(heroRaw.title) || defaults.hero.title,
      subtitle: sanitizeString(heroRaw.subtitle) || defaults.hero.subtitle,
      highlight: sanitizeString(heroRaw.highlight) || defaults.hero.highlight,
      primaryCtaLabel: sanitizeString(heroRaw.primaryCtaLabel) || defaults.hero.primaryCtaLabel,
      primaryCtaUrl: normalizeAbsoluteUrl(heroRaw.primaryCtaUrl, defaults.hero.primaryCtaUrl),
      secondaryCtaLabel: sanitizeString(heroRaw.secondaryCtaLabel) || defaults.hero.secondaryCtaLabel,
      secondaryCtaUrl: normalizeAbsoluteUrl(heroRaw.secondaryCtaUrl, defaults.hero.secondaryCtaUrl),
    };

    const socialProof = {
      title: sanitizeString(socialProofRaw.title) || defaults.socialProof.title,
      subtitle: sanitizeString(socialProofRaw.subtitle) || defaults.socialProof.subtitle,
    };

    const socialPlatformsInput = Array.isArray(page.socialPlatforms) ? page.socialPlatforms : defaults.socialPlatforms;
    const knownPlatformIds = new Set();
    const socialPlatforms = socialPlatformsInput
      .map((platform, index) => {
        const name = sanitizeString(platform?.name);
        if (!name) return null;

        const fallbackId = slugify(`${name}-${index + 1}`) || `platform-${index + 1}`;
        let id = sanitizeString(platform?.id) || fallbackId;
        id = slugify(id) || fallbackId;

        if (knownPlatformIds.has(id)) {
          id = `${id}-${index + 1}`;
        }
        knownPlatformIds.add(id);

        return {
          id,
          name,
          focus: sanitizeString(platform?.focus),
        };
      })
      .filter(Boolean);

    const normalizedSocialPlatforms = socialPlatforms.length ? socialPlatforms : clone(defaults.socialPlatforms);

    const serviceBlocksInput = shouldApplyOfficialServicesPreset(page.serviceBlocks)
      ? defaults.serviceBlocks
      : Array.isArray(page.serviceBlocks)
        ? page.serviceBlocks
        : defaults.serviceBlocks;
    const knownBlockIds = new Set();
    const serviceBlocks = serviceBlocksInput
      .map((block, index) => {
        const title = sanitizeString(block?.title);
        if (!title) return null;

        const fallbackId = slugify(`${title}-${index + 1}`) || `service-${index + 1}`;
        let id = sanitizeString(block?.id) || fallbackId;
        id = slugify(id) || fallbackId;

        if (knownBlockIds.has(id)) {
          id = `${id}-${index + 1}`;
        }
        knownBlockIds.add(id);
        const category = sanitizeString(block?.category) || "Servizi";
        const fintechMetrics = normalizeServicePageFintechMetrics(block?.fintechMetrics, []);
        const isExchangeAccountsBlock = isExchangeAccountsListBlock(id, category, title);

        return {
          id,
          category,
          title,
          description: sanitizeString(block?.description),
          price: sanitizeString(block?.price) || "da EUR 0",
          priceNote: sanitizeServicePagePriceNote(block?.priceNote),
          kpis: normalizeServicePageKpis(block?.kpis, []),
          fintechMetrics: isExchangeAccountsBlock ? [] : fintechMetrics,
          bankPriceList: normalizeServicePageBankPriceList(block?.bankPriceList, []),
          accent: normalizeServicePageAccent(block?.accent, "amber"),
          featured: Boolean(block?.featured),
          features: normalizeServicePageFeatures(block?.features, []),
        };
      })
      .filter(Boolean);

    const normalizedSupplementaryBlocks = ensureSupplementaryServiceBlocks(serviceBlocks, defaults.serviceBlocks);
    const normalizedServiceBlocks = normalizedSupplementaryBlocks.length
      ? normalizedSupplementaryBlocks
      : clone(defaults.serviceBlocks);

    const closing = {
      title: sanitizeString(closingRaw.title) || defaults.closing.title,
      description: sanitizeString(closingRaw.description) || defaults.closing.description,
    };

    return {
      hero,
      socialProof,
      socialPlatforms: normalizedSocialPlatforms,
      serviceBlocks: normalizedServiceBlocks,
      closing,
    };
  }

  function normalizeData(raw) {
    const data = raw && typeof raw === "object" ? raw : {};

    const serviceLabels =
      data.serviceLabels && typeof data.serviceLabels === "object"
        ? {
            meetup: sanitizeString(data.serviceLabels.meetup) || "Ritiro",
            delivery: sanitizeString(data.serviceLabels.delivery) || "Consegna",
            ship: sanitizeString(data.serviceLabels.ship) || "Spedizione",
            other: sanitizeString(data.serviceLabels.other) || "Altro",
          }
        : clone(DEFAULT_DATA.serviceLabels);
    const supportTelegramUrl = normalizeSupportTelegramUrl(data.supportTelegramUrl);

    const regions = Array.isArray(data.regions)
      ? data.regions.map((region, index) => {
          const regionId = sanitizeString(region?.id) || `regione-${index + 1}`;
          const activePoints = Array.isArray(region?.activePoints)
            ? region.activePoints.map((point, pointIndex) => {
                const socials = normalizeSocials(point?.socials);

                const services = Array.isArray(point?.services)
                  ? point.services.filter((service) =>
                      ["meetup", "delivery", "ship", "other"].includes(service)
                    )
                  : [];
                const mediaUrl = sanitizeString(point?.mediaUrl);
                const mediaType = resolveMediaType(point?.mediaType, mediaUrl);

                return {
                  id: sanitizeString(point?.id) || `${regionId}-point-${pointIndex + 1}`,
                  name: sanitizeString(point?.name) || "Nuovo punto",
                  address: sanitizeString(point?.address),
                  shipOrigin: normalizeShipOrigin(point?.shipOrigin || region?.shipOrigin),
                  shipCountry: normalizeShipCountry(point?.shipCountry),
                  details: sanitizeString(point?.details),
                  logo: sanitizeString(point?.logo),
                  mediaType,
                  mediaUrl,
                  stars: clampStars(point?.stars),
                  services: services.length > 0 ? services : ["meetup"],
                  socials,
                };
              })
            : [];

          return {
            id: regionId,
            name: sanitizeString(region?.name) || `Regione ${index + 1}`,
            hubs: sanitizeString(region?.hubs),
            shipOrigin: normalizeShipOrigin(region?.shipOrigin),
            activePoints,
          };
        })
      : clone(DEFAULT_DATA.regions);

    const otherCategories = {};
    const otherCategoryLabels = {
      antiscam: "Antiscam",
      lifestyle: "Lifestyle",
      digitalSystems: "Digital Systems",
    };

    if (data.otherCategoryLabels && typeof data.otherCategoryLabels === "object") {
      for (const key of Object.keys(data.otherCategoryLabels)) {
        const label = sanitizeString(data.otherCategoryLabels[key]);
        if (label) {
          otherCategoryLabels[key] = label;
        }
      }
    }

    if (data.otherCategories && typeof data.otherCategories === "object") {
      for (const [rawCategory, rawPoints] of Object.entries(data.otherCategories)) {
        const categoryId = sanitizeString(rawCategory);
        if (!categoryId) continue;

        const items = Array.isArray(rawPoints) ? rawPoints : [];
        otherCategories[categoryId] = items
          .map((point, index) => {
            const name = sanitizeString(point?.name);
            const fallbackId = slugify(`${categoryId}-${index + 1}`) || `${categoryId}-${index + 1}`;
            const id = sanitizeString(point?.id) || fallbackId;
            if (!name) return null;

            const mediaUrl = sanitizeString(point?.mediaUrl);
            const mediaType = resolveMediaType(point?.mediaType, mediaUrl);
            const socials = normalizeSocials(point?.socials);

            return {
              id,
              name,
              shipOrigin: normalizeShipOrigin(point?.shipOrigin),
              shipCountry: normalizeShipCountry(point?.shipCountry),
              details: sanitizeString(point?.details),
              logo: sanitizeString(point?.logo),
              mediaType,
              mediaUrl,
              stars: clampStars(point?.stars),
              services: ["other"],
              socials,
            };
          })
          .filter(Boolean);

        if (!otherCategoryLabels[categoryId]) {
          otherCategoryLabels[categoryId] = categoryId;
        }
      }
    }

    // Ensure known categories exist when not present
    for (const category of ["antiscam", "lifestyle", "digitalSystems"]) {
      if (!Array.isArray(otherCategories[category])) {
        otherCategories[category] = [];
      }
      if (!otherCategoryLabels[category]) {
        otherCategoryLabels[category] = category;
      }
    }

    const servicesPage = normalizeServicesPage(data.servicesPage);

    return { serviceLabels, supportTelegramUrl, regions, otherCategories, otherCategoryLabels, servicesPage };
  }

  function canUseLocalStorage() {
    try {
      return typeof localStorage !== "undefined";
    } catch {
      return false;
    }
  }

  function getData() {
    if (!canUseLocalStorage()) {
      return clone(DEFAULT_DATA);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_DATA);
      const parsed = JSON.parse(raw);
      return normalizeData(parsed);
    } catch {
      return clone(DEFAULT_DATA);
    }
  }

  function saveData(nextData) {
    const normalized = normalizeData(nextData);
    if (!canUseLocalStorage()) {
      return normalized;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function resetData() {
    const baseline = clone(DEFAULT_DATA);
    if (!canUseLocalStorage()) {
      return baseline;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
    return baseline;
  }

  return {
    STORAGE_KEY,
    getDefaultData: () => clone(DEFAULT_DATA),
    getData,
    saveData,
    resetData,
    normalizeData,
  };
});
