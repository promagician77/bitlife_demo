/**
 * Scene art.
 *
 * Hand-drawn inline SVG rather than bitmaps: it stays crisp on every DPI, the
 * whole set weighs a few KB, it needs no network request and it re-themes from
 * the same palette as the rest of the app.
 *
 * Every scene draws into a 160x96 viewBox and is sliced to fill its container,
 * so the same artwork works as a 64x48 list thumbnail and as a full-width
 * banner. Add a scene by adding one entry to SCENES.
 */
import { raw } from './dom.js';

/* Gradient ids must be unique per document, so each render gets a suffix. */
let uid = 0;

/** Deterministic pseudo-random, so a skyline looks the same on every render. */
const rand = (seed) => {
  let t = (seed * 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Lit windows scattered over a building face. */
function windows(x, y, w, h, seed, fill = '#ffd68a') {
  const out = [];
  const cols = Math.max(1, Math.floor(w / 7));
  const rows = Math.max(1, Math.floor(h / 9));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const n = rand(seed + c * 31 + r * 17);
      if (n < 0.45) continue;
      out.push(`<rect x="${(x + 3 + c * 7).toFixed(1)}" y="${(y + 4 + r * 9).toFixed(1)}"
        width="3" height="4" rx=".6" fill="${fill}" opacity="${(0.35 + n * 0.55).toFixed(2)}"/>`);
    }
  }
  return out.join('');
}

const stars = (seed, count = 14) => Array.from({ length: count }, (_, i) => {
  const x = rand(seed + i) * 160;
  const y = rand(seed + i + 99) * 42;
  const r = 0.4 + rand(seed + i + 7) * 0.7;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"
    fill="#fff" opacity="${(0.25 + rand(seed + i + 3) * 0.6).toFixed(2)}"/>`;
}).join('');

/* ── the scenes ──────────────────────────────────────────────────────────── */

const SCENES = {
  /** Career — a night skyline. */
  city: (u) => `
    <defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#22306b"/><stop offset=".55" stop-color="#16224a"/>
        <stop offset="1" stop-color="#0a0f22"/>
      </linearGradient>
      <linearGradient id="${u}glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#60a5fa" stop-opacity=".45"/>
        <stop offset="1" stop-color="#60a5fa" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}sky)"/>
    ${stars(11)}
    <circle cx="128" cy="22" r="9" fill="#e8eeff" opacity=".9"/>
    <circle cx="124" cy="19" r="9" fill="#16224a" opacity=".95"/>
    <rect y="60" width="160" height="36" fill="url(#${u}glow)"/>
    <g fill="#0d1733">
      <rect x="-2" y="52" width="24" height="44"/><rect x="24" y="44" width="20" height="52"/>
      <rect x="46" y="58" width="16" height="38"/><rect x="118" y="50" width="22" height="46"/>
      <rect x="142" y="60" width="20" height="36"/>
    </g>
    <g fill="#132145">
      <rect x="64" y="34" width="22" height="62"/><rect x="88" y="46" width="14" height="50"/>
      <rect x="104" y="40" width="12" height="56"/>
      <path d="M64 34h22l-11-9z"/>
    </g>
    ${windows(-2, 52, 24, 44, 3)}${windows(24, 44, 20, 52, 9)}${windows(64, 34, 22, 62, 21)}
    ${windows(104, 40, 12, 56, 33)}${windows(118, 50, 22, 46, 41)}${windows(142, 60, 20, 36, 55)}
    <rect y="92" width="160" height="4" fill="#070b18"/>`,

  /** Education — a school building at dusk. */
  campus: (u) => `
    <defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2b3f7a"/><stop offset="1" stop-color="#101a38"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}sky)"/>
    ${stars(71, 9)}
    <rect y="74" width="160" height="22" fill="#12301f"/>
    <rect y="74" width="160" height="3" fill="#1b4429"/>
    <g fill="#1b2a52">
      <rect x="38" y="36" width="84" height="40"/>
      <path d="M34 36 80 16l46 20z"/>
      <rect x="30" y="34" width="100" height="4" rx="1"/>
    </g>
    <g fill="#0c1734">
      <rect x="46" y="46" width="8" height="30"/><rect x="62" y="46" width="8" height="30"/>
      <rect x="90" y="46" width="8" height="30"/><rect x="106" y="46" width="8" height="30"/>
    </g>
    <rect x="74" y="52" width="12" height="24" rx="1" fill="#f5b642" opacity=".8"/>
    <circle cx="80" cy="28" r="5" fill="#0c1734"/>
    <circle cx="80" cy="28" r="3.6" fill="#e8eeff"/>
    <path d="M80 26v2.4l1.6 1" stroke="#0c1734" stroke-width=".8" fill="none" stroke-linecap="round"/>
    <g fill="#16351f">
      <circle cx="18" cy="66" r="10"/><rect x="16.5" y="66" width="3" height="10"/>
      <circle cx="142" cy="68" r="8"/><rect x="140.5" y="68" width="3" height="8"/>
    </g>`,

  /** Relationships — two figures against a sunset. */
  romance: (u) => `
    <defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3b2a6b"/><stop offset=".45" stop-color="#b8527a"/>
        <stop offset=".72" stop-color="#f0885a"/><stop offset="1" stop-color="#ffc178"/>
      </linearGradient>
      <linearGradient id="${u}sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7a3a63"/><stop offset="1" stop-color="#2a1740"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}sky)"/>
    <circle cx="80" cy="62" r="20" fill="#ffe9a8" opacity=".95"/>
    <rect y="62" width="160" height="34" fill="url(#${u}sea)"/>
    <g fill="#ffd38a" opacity=".5">
      <rect x="66" y="68" width="28" height="1.6" rx=".8"/>
      <rect x="70" y="74" width="20" height="1.4" rx=".7"/>
      <rect x="64" y="80" width="32" height="1.2" rx=".6"/>
      <rect x="72" y="86" width="16" height="1" rx=".5"/>
    </g>
    <g fill="#23122e">
      <circle cx="64" cy="48" r="5"/><path d="M59 54h10l3 30H56z"/>
      <circle cx="94" cy="46" r="5.4"/><path d="M88.6 52h11l3 32H85.6z"/>
      <path d="M69 60h20v3.5H69z"/>
      <rect y="88" width="160" height="8"/>
    </g>`,

  /** Activities and skills — a running track and a dumbbell. */
  training: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0f3b33"/><stop offset="1" stop-color="#0a1c2c"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <g fill="none" stroke="#2dd4bf" stroke-linecap="round">
      <path d="M-10 84c30-26 62-30 94-14" stroke-width="2.4" opacity=".55"/>
      <path d="M-10 94c34-30 72-34 110-16" stroke-width="2" opacity=".32"/>
      <path d="M-10 74c26-22 52-26 78-12" stroke-width="1.6" opacity=".2"/>
    </g>
    <circle cx="124" cy="30" r="22" fill="#38bdf8" opacity=".14"/>
    <g fill="#e6f7ff">
      <rect x="66" y="42" width="34" height="7" rx="3.5"/>
      <rect x="56" y="36" width="9" height="19" rx="3"/>
      <rect x="101" y="36" width="9" height="19" rx="3"/>
      <rect x="48" y="40" width="7" height="11" rx="2.5" opacity=".8"/>
      <rect x="111" y="40" width="7" height="11" rx="2.5" opacity=".8"/>
    </g>
    <circle cx="30" cy="26" r="7" fill="#fbbf24" opacity=".85"/>`,

  /** Assets — a shopfront. */
  market: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a2f16"/><stop offset="1" stop-color="#171226"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <rect x="18" y="30" width="124" height="66" rx="3" fill="#1d1830"/>
    <g>
      <path d="M14 30h132v14H14z" fill="#e0a13a"/>
      <g fill="#2b1f12" opacity=".55">
        <rect x="26" y="30" width="12" height="14"/><rect x="50" y="30" width="12" height="14"/>
        <rect x="74" y="30" width="12" height="14"/><rect x="98" y="30" width="12" height="14"/>
        <rect x="122" y="30" width="12" height="14"/>
      </g>
      <path d="M14 44h132l-6 6H20z" fill="#b57c25"/>
    </g>
    <rect x="28" y="56" width="42" height="30" rx="2" fill="#f5d17a" opacity=".22"/>
    <rect x="28" y="56" width="42" height="30" rx="2" fill="none" stroke="#f5d17a" stroke-opacity=".45"/>
    <rect x="92" y="56" width="26" height="40" rx="2" fill="#0f0b1c"/>
    <circle cx="113" cy="76" r="1.6" fill="#f5d17a"/>
    <g fill="#f5b642">
      <ellipse cx="126" cy="84" rx="9" ry="3"/><rect x="117" y="76" width="18" height="8"/>
      <ellipse cx="126" cy="76" rx="9" ry="3" fill="#ffd36e"/>
    </g>
    <rect y="92" width="160" height="4" fill="#0b0814"/>`,

  /** Criminality — a lamplit alley. */
  night: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1d1030"/><stop offset="1" stop-color="#08060f"/>
      </linearGradient>
      <linearGradient id="${u}cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/>
        <stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <g fill="#140c24">
      <rect x="-4" y="8" width="46" height="88"/><rect x="120" y="0" width="44" height="96"/>
    </g>
    ${windows(-4, 12, 46, 70, 5, '#8b7bd8')}${windows(120, 6, 44, 76, 13, '#8b7bd8')}
    <path d="M112 26 96 96h44L128 26z" fill="url(#${u}cone)"/>
    <g fill="#241634">
      <rect x="116" y="22" width="3" height="60"/>
      <path d="M108 20h20v4h-20z"/>
    </g>
    <circle cx="118" cy="24" r="4.5" fill="#ffe4a3"/>
    <g fill="#05040a">
      <circle cx="70" cy="54" r="8"/>
      <path d="M62 56c0-5 4-9 8-9s8 4 8 9l4 40H58z"/>
      <path d="M62 50c1-7 5-10 8-10s7 3 8 10c-5-3-11-3-16 0z"/>
    </g>
    <rect y="90" width="160" height="6" fill="#0d0818"/>`,

  /** Career banner — police. */
  police: (u) => `
    <defs>
      <linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#15224d"/><stop offset="1" stop-color="#080d1e"/>
      </linearGradient>
      <radialGradient id="${u}red"><stop offset="0" stop-color="#ff5a5a" stop-opacity=".85"/>
        <stop offset="1" stop-color="#ff5a5a" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}blue"><stop offset="0" stop-color="#5aa0ff" stop-opacity=".85"/>
        <stop offset="1" stop-color="#5aa0ff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}sky)"/>
    ${stars(23, 8)}
    <g fill="#101a3a">
      <rect x="0" y="26" width="30" height="52"/><rect x="132" y="20" width="32" height="58"/>
    </g>
    ${windows(0, 26, 30, 50, 61)}${windows(132, 20, 32, 56, 77)}
    <circle cx="58" cy="40" r="26" fill="url(#${u}red)"/>
    <circle cx="98" cy="40" r="26" fill="url(#${u}blue)"/>
    <rect y="76" width="160" height="20" fill="#0a1024"/>
    <g fill="#e9eefb">
      <path d="M36 74c0-5 4-9 9-9h6l8-10h38l8 10h6c5 0 9 4 9 9v6H36z"/>
    </g>
    <path d="M62 56h32l6 9H56z" fill="#9db4dd"/>
    <path d="M78 55v10h-22z" fill="#1b3a7a" opacity=".55"/>
    <g fill="#1b3a7a"><rect x="60" y="68" width="40" height="7" rx="2"/></g>
    <rect x="70" y="47" width="20" height="6" rx="2.4" fill="#0f1c3c"/>
    <rect x="70" y="47" width="10" height="6" rx="2.4" fill="#ff5a5a"/>
    <rect x="80" y="47" width="10" height="6" rx="2.4" fill="#5aa0ff"/>
    <g fill="#0b1024"><circle cx="52" cy="80" r="6"/><circle cx="108" cy="80" r="6"/></g>
    <g fill="#5b6e97"><circle cx="52" cy="80" r="2.4"/><circle cx="108" cy="80" r="2.4"/></g>`,

  /** Career banner — software. */
  code: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0c3b3a"/><stop offset="1" stop-color="#091626"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <circle cx="126" cy="24" r="30" fill="#2dd4bf" opacity=".12"/>
    <rect x="34" y="18" width="92" height="56" rx="4" fill="#0a1220" stroke="#1d3b52"/>
    <rect x="38" y="22" width="84" height="48" rx="2" fill="#071019"/>
    <g fill="#2dd4bf">
      <rect x="44" y="28" width="18" height="2.6" rx="1.3" opacity=".9"/>
      <rect x="66" y="28" width="26" height="2.6" rx="1.3" opacity=".45"/>
      <rect x="50" y="36" width="30" height="2.6" rx="1.3" opacity=".7" fill="#7dd3fc"/>
      <rect x="84" y="36" width="14" height="2.6" rx="1.3" opacity=".4"/>
      <rect x="50" y="44" width="20" height="2.6" rx="1.3" opacity=".55" fill="#c084fc"/>
      <rect x="74" y="44" width="30" height="2.6" rx="1.3" opacity=".35"/>
      <rect x="44" y="52" width="24" height="2.6" rx="1.3" opacity=".8"/>
      <rect x="72" y="52" width="10" height="2.6" rx="1.3" opacity=".3"/>
      <rect x="44" y="60" width="6" height="2.6" rx="1.3"/>
    </g>
    <rect x="52" y="60" width="2" height="2.6" fill="#fff" opacity=".9"/>
    <path d="M72 74h16l3 10H69z" fill="#14283a"/>
    <rect x="58" y="84" width="44" height="4" rx="2" fill="#1d3b52"/>`,

  /** Career banner — culinary. */
  kitchen: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4a1f12"/><stop offset="1" stop-color="#180c14"/>
      </linearGradient>
      <radialGradient id="${u}fire"><stop offset="0" stop-color="#ffd166" stop-opacity=".9"/>
        <stop offset="1" stop-color="#ff6b35" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <circle cx="80" cy="62" r="40" fill="url(#${u}fire)"/>
    <g fill="#0f0a12"><rect y="78" width="160" height="18"/></g>
    <g fill="#f4b04a">
      <path d="M62 34c0-8 6-13 12-12 3-6 12-6 15 0 7-2 13 4 12 12-1 5-5 7-5 7H67s-5-2-5-7z" opacity=".95"/>
      <rect x="67" y="42" width="27" height="7" rx="1.5"/>
    </g>
    <g>
      <path d="M52 62h50a4 4 0 0 1 4 4c0 8-8 14-18 14H66c-10 0-18-6-18-14a4 4 0 0 1 4-4z" fill="#22252e"/>
      <rect x="100" y="60" width="34" height="5" rx="2.5" fill="#2c313d"/>
      <ellipse cx="77" cy="62" rx="27" ry="4" fill="#33394a"/>
    </g>
    <g fill="#ff8c42" opacity=".9">
      <path d="M70 58c-4-4-2-8 1-11-1 5 4 5 4 10 0 2-2 3-5 1z"/>
      <path d="M82 57c-3-3-1-6 1-8-1 4 3 4 3 7 0 2-2 2-4 1z"/>
    </g>`,

  /** Career banner — retail. */
  retail: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3b1f6b"/><stop offset="1" stop-color="#140c26"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <g fill="#1d1236">
      <rect x="10" y="26" width="42" height="58" rx="2"/><rect x="108" y="26" width="42" height="58" rx="2"/>
    </g>
    <g fill="#c084fc" opacity=".5">
      <rect x="14" y="36" width="34" height="3" rx="1.5"/><rect x="14" y="52" width="34" height="3" rx="1.5"/>
      <rect x="14" y="68" width="34" height="3" rx="1.5"/>
      <rect x="112" y="36" width="34" height="3" rx="1.5"/><rect x="112" y="52" width="34" height="3" rx="1.5"/>
      <rect x="112" y="68" width="34" height="3" rx="1.5"/>
    </g>
    <g fill="#8b5cf6" opacity=".75">
      <rect x="18" y="28" width="7" height="8" rx="1"/><rect x="30" y="30" width="9" height="6" rx="1"/>
      <rect x="116" y="44" width="8" height="8" rx="1"/><rect x="130" y="60" width="9" height="8" rx="1"/>
      <rect x="20" y="60" width="10" height="8" rx="1"/>
    </g>
    <g fill="#e9d5ff">
      <path d="M62 44h6l6 26h26l6-18H74" fill="none" stroke="#e9d5ff" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="82" cy="78" r="4"/><circle cx="98" cy="78" r="4"/>
    </g>
    <rect y="86" width="160" height="10" fill="#0d0718"/>`,

  /** Career banner — teaching. */
  classroom: (u) => `
    <defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#123846"/><stop offset="1" stop-color="#0a1622"/>
      </linearGradient>
    </defs>
    <rect width="160" height="96" fill="url(#${u}bg)"/>
    <rect x="22" y="14" width="116" height="54" rx="3" fill="#123024" stroke="#2a5a41" stroke-width="2"/>
    <g fill="none" stroke="#dff3e6" stroke-linecap="round" opacity=".8">
      <path d="M32 28h40" stroke-width="2.4"/>
      <path d="M32 38h56" stroke-width="1.6" opacity=".6"/>
      <path d="M32 46h30" stroke-width="1.6" opacity=".6"/>
      <path d="M100 30l10 12-10 12" stroke-width="2.4" opacity=".9"/>
      <path d="M118 42h12" stroke-width="2.4" opacity=".9"/>
    </g>
    <rect x="22" y="66" width="116" height="5" rx="2" fill="#2a5a41"/>
    <rect x="34" y="70" width="14" height="3" rx="1.5" fill="#e8f4ff"/>
    <g fill="#8b3a2e">
      <circle cx="120" cy="66" r="6"/><path d="M119 60c0-2 2-3 3-4-1 2 0 3 0 4z" fill="#3f7a3a"/>
    </g>
    <rect y="80" width="160" height="16" fill="#0a1622"/>
    <g fill="#16303f"><rect x="14" y="78" width="40" height="6" rx="2"/><rect x="106" y="78" width="40" height="6" rx="2"/></g>`,
};

/**
 * Render a scene.
 * @param {string} name key of SCENES
 * @param {string} className applied to the <svg>
 */
export function art(name, className = 'art') {
  const draw = SCENES[name];
  if (!draw) return raw('');
  const u = `a${(uid++).toString(36)}_`;
  return raw(
    `<svg class="${className}" viewBox="0 0 160 96" preserveAspectRatio="xMidYMid slice"
          role="presentation" aria-hidden="true" focusable="false">${draw(u)}</svg>`,
  );
}

export const hasArt = (name) => name in SCENES;
export const artNames = () => Object.keys(SCENES);
