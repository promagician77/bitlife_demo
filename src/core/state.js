/**
 * Game state shape + helpers.
 *
 * The state object is a plain, JSON-serialisable tree. That is deliberate:
 * the save system can snapshot it with structuredClone and never needs to know
 * which systems exist. Each system owns one branch of the tree and nothing
 * else writes to that branch directly.
 */

export const SCHEMA_VERSION = 1;

export const STAT_KEYS = ['health', 'happiness', 'fitness', 'mentality', 'looks', 'popularity'];

export const STAT_META = {
  health:     { label: 'Health',     icon: '❤️', tone: 'var(--c-health)' },
  happiness:  { label: 'Happiness',  icon: '😊', tone: 'var(--c-happiness)' },
  fitness:    { label: 'Fitness',    icon: '💪', tone: 'var(--c-fitness)' },
  mentality:  { label: 'Mentality',  icon: '🧠', tone: 'var(--c-mentality)' },
  looks:      { label: 'Looks',      icon: '✨',       tone: 'var(--c-popularity)' },
  popularity: { label: 'Popularity', icon: '🌟', tone: 'var(--c-popularity)' },
};

/** Actions the player may take per year before the next birthday. */
export const ACTIONS_PER_YEAR = 4;

/**
 * Build a blank state tree. Systems extend their own branch in their init().
 * @param {object} seedInfo
 */
export function createState({ seed, birthYear }) {
  return {
    meta: {
      schema: SCHEMA_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slot: null,
    },
    rng: { seed, cursor: 0 },

    character: {
      firstName: '', lastName: '', gender: 'male',
      country: '', city: '',
      birthYear, age: 0, alive: true,
      causeOfDeath: null, zodiac: '',
      avatar: '👶',
    },

    stats: { health: 100, happiness: 100, fitness: 60, mentality: 60, looks: 60, popularity: 40 },

    economy: { cash: 0, debt: 0, salary: 0, ledger: [], lifetimeEarned: 0, lifetimeSpent: 0 },

    education: {
      stage: 'none',          // id of the current schools[] entry, or 'none'
      yearInStage: 0,
      grades: 60,             // 0..100, rolling performance
      highestDegree: null,
      major: null,
      transcript: [],         // { stage, label, gradeAvg, year, graduated }
      droppedOut: false,
    },

    career: {
      jobId: null, levelIndex: 0, xp: 0, yearsAtJob: 0,
      performance: 60, employed: false, history: [],
    },

    skills: {},               // skillId -> 0..100

    relationships: [],        // see systems/relationships.js

    crime: {
      heat: 0,                // police attention 0..100
      notoriety: 0,
      record: [],             // { age, crimeId, label, outcome }
      arrests: 0, convictions: 0,
    },

    prison: { inPrison: false, sentence: 0, served: 0, facility: null, escapeAttempts: 0 },

    inventory: [],            // { uid, itemId, name, icon, value, boughtAtAge }

    reputation: { fame: 0, respect: 50, karma: 0 },

    // Per-year bookkeeping
    year: { actionsLeft: ACTIONS_PER_YEAR, usedOnce: {} },

    log: [],                  // life feed entries, newest last
    flags: {},                // free-form booleans/counters set by content
  };
}

/* ── Small shared helpers ────────────────────────────────────────────────── */

export const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export const fullName = (s) => `${s.character.firstName} ${s.character.lastName}`.trim();

export const currentYear = (s) => s.character.birthYear + s.character.age;

/** Net worth = cash + resale value of everything owned - debt. */
export const netWorth = (s) =>
  s.economy.cash - s.economy.debt + s.inventory.reduce((sum, it) => sum + (it.value ?? 0), 0);

/** Compact money formatting: 1250 -> $1.3K, 248500 -> $248.5K, 2.4e6 -> $2.4M */
export function money(n) {
  const neg = n < 0;
  const abs = Math.abs(n);
  let out;
  if (abs >= 1e9)      out = `$${(abs / 1e9).toFixed(1)}B`;
  else if (abs >= 1e6) out = `$${(abs / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  else if (abs >= 1e4) out = `$${(abs / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}K`;
  else                 out = `$${Math.round(abs).toLocaleString('en-US')}`;
  return neg ? `-${out}` : out;
}

export function zodiacFor(month, day) {
  const signs = [
    [20, 'Capricorn', 'Aquarius'], [19, 'Aquarius', 'Pisces'], [21, 'Pisces', 'Aries'],
    [20, 'Aries', 'Taurus'],       [21, 'Taurus', 'Gemini'],   [21, 'Gemini', 'Cancer'],
    [23, 'Cancer', 'Leo'],         [23, 'Leo', 'Virgo'],       [23, 'Virgo', 'Libra'],
    [23, 'Libra', 'Scorpio'],      [22, 'Scorpio', 'Sagittarius'], [22, 'Sagittarius', 'Capricorn'],
  ];
  const [cut, before, after] = signs[month - 1];
  return day < cut ? before : after;
}
