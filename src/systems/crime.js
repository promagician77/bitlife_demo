/**
 * Crime system.
 * Owns: state.crime
 *
 * It resolves whether a crime succeeds. It deliberately does *not* decide what
 * happens when you are caught -- it emits `crime:caught` and the police system
 * takes over. Either system can be replaced without touching the other.
 */
import { crimes } from '../core/registry.js';
import { clamp } from '../core/state.js';

export default {
  id: 'crime',
  order: 70,

  onYear(ctx) {
    const { state } = ctx;
    // Police attention cools off over time.
    state.crime.heat = clamp(state.crime.heat - 6);
  },

  available(state) {
    return crimes.all().filter((c) => state.character.age >= (c.minAge ?? 10));
  },

  /** @returns {{ok:boolean, reason?:string, message?:string}} */
  commit(ctx, crimeId) {
    const { state, rng } = ctx;
    const def = crimes.get(crimeId);
    if (!def) return { ok: false, reason: 'Unknown crime.' };
    if (state.prison.inPrison) return { ok: false, reason: 'You are already locked up.' };
    if (state.character.age < (def.minAge ?? 10)) return { ok: false, reason: `You must be at least ${def.minAge}.` };

    const streetwise = state.skills.streetwise ?? 0;
    const odds = clamp(
      (def.baseOdds ?? 0.5) + streetwise * 0.005 + state.stats.fitness * 0.001 - state.crime.heat * 0.004,
      0.05, 0.93,
    );

    if (rng.chance(odds)) {
      const haul = rng.int(def.payout[0], def.payout[1]);
      const deltas = ctx.effects({
        money: haul,
        heat: def.heat ?? 8,
        skills: { streetwise: rng.int(2, 5) },
        karma: -(def.severity ?? 1) * 3,
        stats: { happiness: 4 },
      });
      state.crime.notoriety = clamp(state.crime.notoriety + (def.severity ?? 1) * 2);
      state.crime.record.push({
        age: state.character.age, crimeId, label: def.name, outcome: 'got away with it',
      });
      ctx.log(`${def.successText} You got away with $${haul.toLocaleString('en-US')}.`, {
        icon: def.icon, tone: 'var(--c-money)', category: 'crime', deltas,
      });
      return { ok: true, message: `+$${haul.toLocaleString('en-US')}` };
    }

    const deltas = ctx.effects({ heat: (def.heat ?? 8) + 10, stats: { happiness: -8 } });
    ctx.log(`${def.failText}`, { icon: '🚨', tone: 'var(--c-danger)', category: 'crime', deltas });
    ctx.bus.emit('crime:caught', { ctx, crime: def });
    return { ok: false, reason: 'You were caught.' };
  },
};
