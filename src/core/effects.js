/**
 * The effect contract.
 *
 * Content (events, activities, crimes, career outcomes) never mutates state
 * directly -- it *declares* an effect object and the engine applies it here.
 * That single choke point is what lets new content be added later without any
 * risk of corrupting a system it knows nothing about.
 *
 * Supported keys (all optional):
 *   money        number            cash delta
 *   debt         number            debt delta
 *   salary       number            salary delta (annual)
 *   stats        { statKey: n }    health/happiness/fitness/mentality/looks/popularity
 *   skills       { skillId: n }    skill levels, 0..100
 *   grades       number            school performance delta
 *   performance  number            job performance delta
 *   jobXp        number            career XP
 *   heat         number            police attention delta
 *   fame|respect|karma  number     reputation deltas
 *   relationship { with, by }      adjust closeness ('with' = id or type)
 *   grantItem    itemId            add to inventory
 *   flags        { key: value }    free-form content flags
 *   fireJob      true              lose current job
 *   die          'cause string'    end the life
 *   log          { text, icon, tone }  extra feed entry
 */
import { STAT_KEYS, clamp } from './state.js';

const STAT_TONE = {
  money: 'var(--c-money)', health: 'var(--c-health)', happiness: 'var(--c-happiness)',
  fitness: 'var(--c-fitness)', mentality: 'var(--c-mentality)', looks: 'var(--c-popularity)',
  popularity: 'var(--c-popularity)', heat: 'var(--c-danger)',
};

const LABEL = {
  money: '💰', health: '❤️', happiness: '😊', fitness: '💪',
  mentality: '🧠', looks: '✨', popularity: '🌟', heat: '👮',
};

/**
 * Apply an effect object.
 * @returns {Array<{key:string,amount:number,label:string,tone:string}>} deltas for the UI
 */
export function applyEffects(ctx, fx) {
  if (!fx) return [];
  const { state, bus } = ctx;
  const deltas = [];
  const push = (key, amount, label) => {
    if (!amount) return;
    deltas.push({ key, amount, label: label ?? `${LABEL[key] ?? ''} ${fmt(amount)}`.trim(), tone: STAT_TONE[key] });
  };

  if (fx.money) {
    state.economy.cash += fx.money;
    if (fx.money > 0) state.economy.lifetimeEarned += fx.money;
    else state.economy.lifetimeSpent += -fx.money;
    push('money', fx.money, `💰 ${fx.money > 0 ? '+' : '-'}$${Math.abs(fx.money).toLocaleString('en-US')}`);
  }
  if (fx.debt)   state.economy.debt = Math.max(0, state.economy.debt + fx.debt);
  if (fx.salary) state.economy.salary = Math.max(0, state.economy.salary + fx.salary);

  if (fx.stats) {
    for (const [key, amount] of Object.entries(fx.stats)) {
      if (!STAT_KEYS.includes(key)) { console.warn(`[effects] unknown stat "${key}"`); continue; }
      const before = state.stats[key];
      state.stats[key] = clamp(before + amount);
      push(key, state.stats[key] - before);
    }
  }

  if (fx.skills) {
    for (const [id, amount] of Object.entries(fx.skills)) {
      const before = state.skills[id] ?? 0;
      state.skills[id] = clamp(before + amount);
      if (state.skills[id] !== before) {
        deltas.push({ key: `skill:${id}`, amount: state.skills[id] - before,
          label: `🎯 ${id} ${fmt(state.skills[id] - before)}`, tone: 'var(--accent-hi)' });
      }
    }
  }

  if (fx.grades)      state.education.grades = clamp(state.education.grades + fx.grades);
  if (fx.performance) state.career.performance = clamp(state.career.performance + fx.performance);
  if (fx.jobXp && state.career.employed) state.career.xp += fx.jobXp;

  if (fx.heat) {
    const before = state.crime.heat;
    state.crime.heat = clamp(before + fx.heat);
    push('heat', state.crime.heat - before);
  }
  if (fx.fame)    state.reputation.fame    = clamp(state.reputation.fame + fx.fame);
  if (fx.respect) state.reputation.respect = clamp(state.reputation.respect + fx.respect);
  if (fx.karma)   state.reputation.karma   = clamp(state.reputation.karma + fx.karma, -100, 100);

  // Cross-system effects go over the bus so this module stays dependency-free.
  if (fx.relationship) bus.emit('relationship:adjust', { ctx, ...fx.relationship });
  if (fx.grantItem)    bus.emit('inventory:grant', { ctx, itemId: fx.grantItem });
  if (fx.fireJob)      bus.emit('career:fire', { ctx, reason: fx.fireJob });

  if (fx.flags) Object.assign(state.flags, fx.flags);

  if (fx.log) ctx.log(fx.log.text, { icon: fx.log.icon, tone: fx.log.tone });

  if (fx.die) bus.emit('life:die', { ctx, cause: fx.die });

  return deltas;
}

const fmt = (n) => (n > 0 ? `+${n}` : `${n}`);

/**
 * Resolve an effect that may be a function of state -- lets content scale
 * rewards, e.g. `money: s => s.economy.salary * 0.1`.
 */
export function resolveEffects(fx, state) {
  if (typeof fx === 'function') return fx(state);
  if (!fx) return null;
  const out = {};
  for (const [k, v] of Object.entries(fx)) out[k] = typeof v === 'function' ? v(state) : v;
  return out;
}
