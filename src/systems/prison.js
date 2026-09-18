/**
 * Prison system.
 * Owns: state.prison
 *
 * Runs early in the pipeline (order 15) so that education, career and economy
 * all see an up-to-date `inPrison` flag for the year being simulated.
 */
import { clamp } from '../core/state.js';

const FACILITIES = ['Ravenhill Correctional', 'Northgate State Prison', 'Bellmont Penitentiary'];

export default {
  id: 'prison',
  order: 15,

  init(ctx) { this._wire(ctx); },
  rehydrate(ctx) { this._wire(ctx); },

  _wire(ctx) {
    ctx.bus.on('prison:commit', ({ years, crime }) => this.commit(ctx, years, crime));
  },

  commit(ctx, years, crime) {
    const { state, rng } = ctx;
    Object.assign(state.prison, {
      inPrison: true, sentence: years, served: 0,
      facility: rng.pick(FACILITIES), escapeAttempts: 0,
    });
    const deltas = ctx.effects({
      stats: { happiness: -28, popularity: -15 }, karma: -6, fireJob: 'You lost your job when you were sentenced.',
    });
    ctx.log(`You were sentenced to ${years} year${years > 1 ? 's' : ''} at ${state.prison.facility} for ${crime?.name?.toLowerCase() ?? 'your crimes'}.`, {
      icon: '👮', tone: 'var(--c-danger)', category: 'milestone', deltas,
    });
    ctx.bus.emit('prison:entered', { ctx, years });
  },

  onYear(ctx) {
    const { state, rng } = ctx;
    if (!state.prison.inPrison) return;

    state.prison.served += 1;

    // Life inside is hard on you.
    const deltas = ctx.effects({
      stats: { happiness: -6, health: -3, mentality: -2, fitness: rng.chance(0.5) ? 3 : -1 },
      skills: { streetwise: rng.int(2, 6) },
    });
    ctx.log(`You served a year at ${state.prison.facility}. (${state.prison.served}/${state.prison.sentence})`, {
      icon: '⛓️', tone: 'var(--c-danger)', category: 'prison', deltas,
    });

    // Something happens inside roughly every other year.
    if (rng.chance(0.4)) {
      const bad = rng.chance(0.6);
      const fx = bad
        ? { stats: { health: -rng.int(4, 14), happiness: -5 } }
        : { skills: { streetwise: rng.int(3, 7) }, stats: { fitness: 5 } };
      const d = ctx.effects(fx);
      ctx.log(bad ? 'You got into a fight in the yard.' : 'You made a useful contact inside.', {
        icon: bad ? '🤕' : '🤝', tone: bad ? 'var(--c-danger)' : 'var(--accent-hi)',
        category: 'prison', deltas: d,
      });
    }

    if (state.prison.served >= state.prison.sentence) this.release(ctx, 'You served your full sentence.');
  },

  release(ctx, reason) {
    const { state } = ctx;
    Object.assign(state.prison, { inPrison: false, sentence: 0, served: 0, facility: null });
    const deltas = ctx.effects({ stats: { happiness: 20 }, heat: -30 });
    ctx.log(`You walked out of prison a free person. ${reason}`, {
      icon: '🔓', tone: 'var(--c-money)', category: 'milestone', deltas,
    });
    ctx.bus.emit('prison:released', { ctx });
  },

  /* ── player actions ────────────────────────────────────────────────────── */

  requestParole(ctx) {
    const { state, rng } = ctx;
    if (!state.prison.inPrison) return { ok: false, reason: 'You are not in prison.' };
    const fraction = state.prison.served / Math.max(1, state.prison.sentence);
    const odds = clamp(fraction * 0.7 - state.crime.convictions * 0.05, 0.03, 0.8);
    if (rng.chance(odds)) {
      this.release(ctx, 'The parole board approved your release.');
      return { ok: true, message: 'Parole granted.' };
    }
    ctx.effects({ stats: { happiness: -6 } });
    ctx.log('The parole board denied your request.', {
      icon: '📋', tone: 'var(--c-danger)', category: 'prison',
    });
    return { ok: false, reason: 'Parole denied.' };
  },

  attemptEscape(ctx) {
    const { state, rng } = ctx;
    if (!state.prison.inPrison) return { ok: false, reason: 'You are not in prison.' };
    state.prison.escapeAttempts += 1;
    const odds = clamp(0.12 + (state.skills.streetwise ?? 0) * 0.004 + state.stats.fitness * 0.002
                       - state.prison.escapeAttempts * 0.05, 0.02, 0.55);
    if (rng.chance(odds)) {
      Object.assign(state.prison, { inPrison: false, sentence: 0, served: 0, facility: null });
      const deltas = ctx.effects({ heat: 40, stats: { happiness: 12 }, skills: { streetwise: 8 } });
      ctx.log('You escaped! You are a wanted fugitive now.', {
        icon: '🏃', tone: 'var(--c-warn)', category: 'milestone', deltas,
      });
      return { ok: true, message: 'You are out — and wanted.' };
    }
    state.prison.sentence += rng.int(1, 3);
    const deltas = ctx.effects({ stats: { health: -rng.int(5, 15), happiness: -10 } });
    ctx.log('Your escape attempt failed. Time was added to your sentence.', {
      icon: '🚨', tone: 'var(--c-danger)', category: 'prison', deltas,
    });
    return { ok: false, reason: 'You were caught.' };
  },
};
