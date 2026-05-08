const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const srcDir = path.join(ROOT, "data", "maps", "geojson_italian_regions", "simplified");
const outFile = path.join(ROOT, "src", "web", "italy-regions-map.js");

const regionFiles = {
  "valle-daosta": "valledaosta.json",
  piemonte: "piemonte.json",
  liguria: "liguria.json",
  lombardia: "lombardia.json",
  "trentino-alto-adige": "trentino-altoadige.json",
  veneto: "veneto.json",
  "friuli-venezia-giulia": "friuli-venezia-giulia.json",
  "emilia-romagna": "emilia-romagna.json",
  toscana: "toscana.json",
  umbria: "umbria.json",
  marche: "marche.json",
  lazio: "lazio.json",
  abruzzo: "abruzzo.json",
  molise: "molise.json",
  campania: "campania.json",
  puglia: "puglia.json",
  basilicata: "basilicata.json",
  calabria: "calabria.json",
  sardegna: "sardegna.json",
  sicilia: "sicilia.json",
};

function asMultiPolygonCoords(geometry) {
  if (!geometry || !geometry.type || !geometry.coordinates) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function projectLonLat([lon, lat]) {
  const lonRad = (lon * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  return [lonRad, Math.log(Math.tan(Math.PI / 4 + latRad / 2))];
}

function round2(value) {
  return Number(value.toFixed(2));
}

function polygonAreaAndCentroid(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return { area: 0, cx: 0, cy: 0 };

  let a = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const cross = x1 * y2 - x2 * y1;
    a += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }

  a /= 2;
  if (Math.abs(a) < 1e-9) {
    return {
      area: 0,
      cx: ring.reduce((sum, pt) => sum + pt[0], 0) / ring.length,
      cy: ring.reduce((sum, pt) => sum + pt[1], 0) / ring.length,
    };
  }

  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a) };
}

const rawRegions = Object.entries(regionFiles).map(([regionId, filename]) => {
  const raw = JSON.parse(fs.readFileSync(path.join(srcDir, filename), "utf8"));
  const feature = raw?.features?.[0];
  const polygons = asMultiPolygonCoords(feature?.geometry).map((rings) =>
    rings.map((ring) => ring.map(projectLonLat))
  );
  return { regionId, polygons };
});

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

for (const region of rawRegions) {
  for (const polygon of region.polygons) {
    for (const ring of polygon) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
}

const viewWidth = 360;
const viewHeight = 430;
const padding = 18;
const spanX = maxX - minX || 1;
const spanY = maxY - minY || 1;
const scale = Math.min((viewWidth - padding * 2) / spanX, (viewHeight - padding * 2) / spanY);

function transformPoint([x, y]) {
  const tx = padding + (x - minX) * scale;
  const ty = padding + (maxY - y) * scale;
  return [tx, ty];
}

const regionMap = {};

for (const region of rawRegions) {
  const transformedPolygons = region.polygons.map((polygon) => polygon.map((ring) => ring.map(transformPoint)));

  const pathParts = [];
  let centroidArea = 0;
  let centroidXSum = 0;
  let centroidYSum = 0;
  let fallbackMinX = Infinity;
  let fallbackMaxX = -Infinity;
  let fallbackMinY = Infinity;
  let fallbackMaxY = -Infinity;

  for (const polygon of transformedPolygons) {
    for (let ringIndex = 0; ringIndex < polygon.length; ringIndex += 1) {
      const ring = polygon[ringIndex];
      if (!Array.isArray(ring) || ring.length < 2) continue;

      for (const [x, y] of ring) {
        if (x < fallbackMinX) fallbackMinX = x;
        if (x > fallbackMaxX) fallbackMaxX = x;
        if (y < fallbackMinY) fallbackMinY = y;
        if (y > fallbackMaxY) fallbackMaxY = y;
      }

      const [firstX, firstY] = ring[0];
      let d = `M ${round2(firstX)} ${round2(firstY)}`;
      for (let i = 1; i < ring.length; i += 1) {
        const [x, y] = ring[i];
        d += ` L ${round2(x)} ${round2(y)}`;
      }
      d += " Z";
      pathParts.push(d);

      if (ringIndex === 0) {
        const { area, cx, cy } = polygonAreaAndCentroid(ring);
        const weight = Math.abs(area);
        centroidArea += weight;
        centroidXSum += cx * weight;
        centroidYSum += cy * weight;
      }
    }
  }

  const cx = centroidArea > 0 ? centroidXSum / centroidArea : (fallbackMinX + fallbackMaxX) / 2;
  const cy = centroidArea > 0 ? centroidYSum / centroidArea : (fallbackMinY + fallbackMaxY) / 2;

  regionMap[region.regionId] = {
    path: pathParts.join(" "),
    cx: round2(cx),
    cy: round2(cy),
  };
}

const payload = {
  viewBox: `0 0 ${viewWidth} ${viewHeight}`,
  regions: regionMap,
};

const output =
  `/* generated from geojson_italian_regions simplified on ${new Date().toISOString()} */\n` +
  `(function(root){\n` +
  `  root.RIItalyRegionsMap = ${JSON.stringify(payload)};\n` +
  `})(typeof globalThis !== 'undefined' ? globalThis : window);\n`;

fs.writeFileSync(outFile, output, "utf8");
console.log(`Generated ${outFile}`);
