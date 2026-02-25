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
            services: ["meetup", "delivery", "ship"],
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
  };

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function clampStars(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.min(3, Math.round(num)));
  }

  function sanitizeString(value) {
    return typeof value === "string" ? value.trim() : "";
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

  function normalizeData(raw) {
    const data = raw && typeof raw === "object" ? raw : {};

    const serviceLabels =
      data.serviceLabels && typeof data.serviceLabels === "object"
        ? {
            meetup: sanitizeString(data.serviceLabels.meetup) || "Ritiro",
            delivery: sanitizeString(data.serviceLabels.delivery) || "Consegna",
            ship: sanitizeString(data.serviceLabels.ship) || "Spedizione",
          }
        : clone(DEFAULT_DATA.serviceLabels);
    const supportTelegramUrl = normalizeSupportTelegramUrl(data.supportTelegramUrl);

    const regions = Array.isArray(data.regions)
      ? data.regions.map((region, index) => {
          const regionId = sanitizeString(region?.id) || `regione-${index + 1}`;
          const activePoints = Array.isArray(region?.activePoints)
            ? region.activePoints.map((point, pointIndex) => {
                const socials = Array.isArray(point?.socials)
                  ? point.socials
                      .map((link) => ({
                        label: sanitizeString(link?.label),
                        url: sanitizeString(link?.url),
                      }))
                      .filter((link) => link.label && link.url)
                  : [];

                const services = Array.isArray(point?.services)
                  ? point.services.filter((service) =>
                      ["meetup", "delivery", "ship"].includes(service)
                    )
                  : [];
                const mediaUrl = sanitizeString(point?.mediaUrl);
                const mediaType = resolveMediaType(point?.mediaType, mediaUrl);

                return {
                  id: sanitizeString(point?.id) || `${regionId}-point-${pointIndex + 1}`,
                  name: sanitizeString(point?.name) || "Nuovo punto",
                  address: sanitizeString(point?.address),
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

    return { serviceLabels, supportTelegramUrl, regions };
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
