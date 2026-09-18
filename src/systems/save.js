/**
 * Save / load system.
 * Owns: persistence. It snapshots the whole state tree, so it never needs to
 * know which systems exist -- add a system tomorrow and its branch is saved
 * automatically.
 *
 * Stored payload:
 *   { schema, savedAt, summary, state }
 * `summary` is a denormalised header so the slot list renders without having
 * to parse the full save.
 */
import { SCHEMA_VERSION, fullName, netWorth } from '../core/state.js';
import { careers } from '../core/registry.js';

const PREFIX = 'lifequest:slot:';
export const SLOT_COUNT = 3;
export const AUTOSAVE_SLOT = 0;

/**
 * Schema migrations. Key = the version you are migrating *from*.
 * Keeping these here means an old save never breaks a new build.
 */
const MIGRATIONS = {
  // 0: (state) => { state.newBranch = {}; return state; },
};

function storage() {
  try {
    const probe = '__lq__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;   // Private mode / storage blocked: the game still plays.
  }
}

function summarise(state) {
  const job = state.career.employed ? careers.get(state.career.jobId) : null;
  return {
    name: fullName(state),
    age: state.character.age,
    avatar: state.character.avatar,
    city: state.character.city,
    country: state.character.country,
    job: job ? job.levels[state.career.levelIndex].title : (state.character.age < 18 ? 'Student' : 'Unemployed'),
    netWorth: netWorth(state),
    alive: state.character.alive,
  };
}

export default {
  id: 'save',
  order: 999,

  /** Autosave at the end of every year. */
  onYear(ctx) { this.write(AUTOSAVE_SLOT, ctx.state); },

  /** @returns {boolean} */
  get available() { return storage() !== null; },

  write(slot, state) {
    const store = storage();
    if (!store) return { ok: false, reason: 'Storage is not available in this browser.' };
    state.meta.slot = slot;
    state.meta.updatedAt = Date.now();
    const payload = {
      schema: SCHEMA_VERSION,
      savedAt: Date.now(),
      summary: summarise(state),
      state,
    };
    try {
      store.setItem(PREFIX + slot, JSON.stringify(payload));
      return { ok: true };
    } catch (err) {
      console.error('[save] write failed', err);
      return { ok: false, reason: 'Could not write the save (storage full?).' };
    }
  },

  read(slot) {
    const store = storage();
    if (!store) return null;
    const raw = store.getItem(PREFIX + slot);
    if (!raw) return null;
    try {
      const payload = JSON.parse(raw);
      return this.migrate(payload);
    } catch (err) {
      console.error(`[save] slot ${slot} is corrupt`, err);
      return null;
    }
  },

  /** Walk a save forward to the current schema version. */
  migrate(payload) {
    let version = payload.schema ?? 0;
    while (version < SCHEMA_VERSION) {
      const step = MIGRATIONS[version];
      if (!step) { console.warn(`[save] no migration from schema ${version}; loading as-is`); break; }
      payload.state = step(payload.state);
      version += 1;
    }
    payload.schema = version;
    return payload;
  },

  /** Slot headers for the save/load screen. */
  slots() {
    return Array.from({ length: SLOT_COUNT }, (_, i) => {
      const payload = this.read(i);
      return {
        index: i,
        isAutosave: i === AUTOSAVE_SLOT,
        empty: !payload,
        savedAt: payload?.savedAt ?? null,
        summary: payload?.summary ?? null,
      };
    });
  },

  erase(slot) {
    storage()?.removeItem(PREFIX + slot);
    return { ok: true };
  },

  /* ── portable saves (useful for a demo: share a life as text) ──────────── */

  exportSlot(slot) {
    const payload = this.read(slot);
    return payload ? btoa(encodeURIComponent(JSON.stringify(payload))) : null;
  },

  importString(slot, encoded) {
    try {
      const payload = JSON.parse(decodeURIComponent(atob(encoded)));
      if (!payload?.state?.character) throw new Error('not a LifeQuest save');
      storage()?.setItem(PREFIX + slot, JSON.stringify(this.migrate(payload)));
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'That is not a valid LifeQuest save code.' };
    }
  },
};
