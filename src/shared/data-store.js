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
        badge: "YOSUPPORT Digital Studio",
        title: "I nostri servizi",
        subtitle:
          "Progettiamo ecosistemi digitali completi: bot Telegram avanzati, piattaforme web e strumenti operativi su misura.",
        highlight: "Soluzioni minimal, veloci e amministrabili in tempo reale.",
        primaryCtaLabel: "Richiedi preventivo",
        primaryCtaUrl: "https://t.me/SHLC26",
        secondaryCtaLabel: "Parla con un consulente",
        secondaryCtaUrl: "https://t.me/SHLC26",
      },
      socialProof: {
        title: "Social network europei più richiesti",
        subtitle: "Piani di crescita brand su canali ad alta trazione in Europa.",
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
          category: "Bot Telegram",
          title: "Sviluppo bot per moderazione chat",
          description:
            "Bot dedicati alla moderazione automatica con filtri anti-spam, regole personalizzate e log eventi in tempo reale.",
          price: "da EUR 390",
          priceNote: "setup base + policy personalizzate",
          kpis: ["Delivery da 48h", "Policy su misura", "Uptime 99,9%"],
          accent: "amber",
          featured: true,
          features: [
            "Filtri keyword, flood e anti-link",
            "Ruoli admin e permessi granulari",
            "Report giornalieri automatici",
          ],
        },
        {
          id: "antiscam-community-bots",
          category: "Bot Telegram",
          title: "Sviluppo bot per community antiscam",
          description:
            "Automazioni dedicate all'identificazione precoce di tentativi fraudolenti e alla gestione sicura delle segnalazioni utenti.",
          price: "da EUR 640",
          priceNote: "include configurazione workflow anti-frode",
          kpis: ["False positive < 2%", "Alert real-time", "Escalation 24/7"],
          accent: "rose",
          featured: true,
          features: [
            "Blacklist/whitelist dinamiche",
            "Sistema ticket e raccolta prove",
            "Alert immediati agli amministratori",
          ],
        },
        {
          id: "clean-chat-multimedia-bots",
          category: "Bot Telegram",
          title: "Bot con chat pulita e menu multimediale",
          description:
            "Bot evoluti con menu multimediale, gestione contenuti, onboarding guidato e funzioni modulari espandibili.",
          price: "da EUR 520",
          priceNote: "menu, comandi custom e onboarding",
          kpis: ["Onboarding < 60s", "Menu multimediale", "Comandi modulari"],
          accent: "cyan",
          featured: false,
          features: [
            "Menu visuale con pulsanti dinamici",
            "Gestione media (foto, video, GIF)",
            "Funzioni estendibili su richiesta",
          ],
        },
        {
          id: "telegram-miniapp-websites",
          category: "Web Telegram",
          title: "Siti web integrati in Telegram Mini App",
          description:
            "Realizzazione siti e portali con integrazione Mini App Telegram e gestione amministrativa tramite bot privato dedicato.",
          price: "da EUR 850",
          priceNote: "mini app + pannello admin via bot",
          kpis: ["Admin via bot", "UX mobile-first", "Deploy assistito"],
          accent: "emerald",
          featured: true,
          features: [
            "UX responsive per mobile Telegram",
            "Workflow admin tramite bot personale",
            "Deploy e manutenzione operativa",
          ],
        },
        {
          id: "full-web-applications",
          category: "Web Development",
          title: "Sviluppo web application e utilities",
          description:
            "Progetti full-stack, dashboard operative, automazioni business e utility digitali disegnate su obiettivi concreti.",
          price: "da EUR 1200",
          priceNote: "analisi, sviluppo e rilascio",
          kpis: ["Stack full-stack", "Scalabilità pronta", "Roadmap sprint"],
          accent: "cyan",
          featured: false,
          features: [
            "Architettura modulare e scalabile",
            "Dashboard KPI e ruoli utente",
            "Integrazione API e strumenti esterni",
          ],
        },
        {
          id: "social-media-growth",
          category: "Growth",
          title: "Servizi di crescita social media",
          description:
            "Piani di crescita multi-canale su social europei principali con strategia editoriale, ADV e monitoraggio continuo.",
          price: "da EUR 300 / mese",
          priceNote: "pacchetti mensili personalizzabili",
          kpis: ["CTR +18% medio", "KPI mensili", "ADV ottimizzata"],
          accent: "amber",
          featured: false,
          features: [
            "Analisi target e competitor",
            "Calendario contenuti e ADV",
            "Report performance periodico",
          ],
        },
        {
          id: "crypto-exchange-services",
          category: "Fintech",
          title: "Servizi exchange criptovalute",
          description:
            "Supporto operativo per procedure exchange crypto, flussi di conversione e configurazione processi in ambienti digitali.",
          price: "da EUR 450",
          priceNote: "setup operativo e assistenza flussi",
          kpis: ["Fee da 0,8%", "Spread 1,2%-2,5%", "Settlement 5-15 min"],
          fintechMetrics: [
            { label: "Fee", value: "da 0,8%" },
            { label: "Spread", value: "1,2%-2,5%" },
            { label: "SLA", value: "5-15 min" },
          ],
          accent: "emerald",
          featured: false,
          features: [
            "Setup flussi deposito/prelievo",
            "Procedure operative guidate",
            "Supporto documentale tecnico",
          ],
        },
        {
          id: "banking-wallet-services",
          category: "Fintech",
          title: "Servizi account bancari e crypto wallet",
          description:
            "Assistenza tecnica per configurazione account business e wallet crypto, con attenzione a sicurezza e gestione operativa.",
          price: "da EUR 590",
          priceNote: "onboarding tecnico e sicurezza base",
          kpis: ["Fee service da 1,5%", "Cold storage 95%", "Audit accessi 100%"],
          fintechMetrics: [
            { label: "Fee service", value: "da 1,5%" },
            { label: "Cold storage", value: "95%" },
            { label: "Audit accessi", value: "100%" },
          ],
          accent: "rose",
          featured: false,
          features: [
            "Setup wallet custodial/non-custodial",
            "Procedure sicurezza operative",
            "Checklist di gestione accessi",
          ],
        },
      ],
      closing: {
        title: "Operatività end-to-end",
        description:
          "Dalla fase strategica al rilascio: ogni servizio è progettato per essere controllabile, scalabile e semplice da amministrare.",
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
      .slice(0, 4);
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

    const serviceBlocksInput = Array.isArray(page.serviceBlocks) ? page.serviceBlocks : defaults.serviceBlocks;
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

        return {
          id,
          category: sanitizeString(block?.category) || "Servizi",
          title,
          description: sanitizeString(block?.description),
          price: sanitizeString(block?.price) || "da EUR 0",
          priceNote: sanitizeString(block?.priceNote),
          kpis: normalizeServicePageKpis(block?.kpis, []),
          fintechMetrics: normalizeServicePageFintechMetrics(block?.fintechMetrics, []),
          accent: normalizeServicePageAccent(block?.accent, "amber"),
          featured: Boolean(block?.featured),
          features: normalizeServicePageFeatures(block?.features, []),
        };
      })
      .filter(Boolean);

    const normalizedServiceBlocks = serviceBlocks.length ? serviceBlocks : clone(defaults.serviceBlocks);

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
