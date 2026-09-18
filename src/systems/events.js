/**
 * Event system -- the thing that makes each life feel different.
 * Runs last so events can react to everything that happened this year.
 *
 * Events are pure data in the `events` registry. An event either:
 *   - resolves itself (has `effects`), or
 *   - asks the player something (has `choices`), in which case it is queued as
 *     a prompt and the UI presents it before the next year can start.
 */
import { events } from '../core/registry.js';
import { fullName } from '../core/state.js';

/** Fill {first}, {last}, {name}, {city}, {country} in event copy. */
export function tpl(text, state) {
  if (typeof text === 'function') text = text(state);
  return String(text ?? '')
    .replace(/\{first\}/g, state.character.firstName)
    .replace(/\{last\}/g, state.character.lastName)
    .replace(/\{name\}/g, fullName(state))
    .replace(/\{city\}/g, state.character.city)
    .replace(/\{country\}/g, state.character.country);
}

export default {
  id: 'events',
  order: 90,

  onYear(ctx) {
    const { state, rng } = ctx;
    if (!state.character.alive) return;

    const pool = this.eligible(state);
    if (!pool.length) return;

    // One event most years, occasionally two.
    const count = rng.chance(0.28) ? 2 : 1;
    const fired = new Set();

    for (let i = 0; i < count; i++) {
      const candidates = pool.filter((e) => !fired.has(e.id));
      const event = rng.weighted(candidates);
      if (!event) break;
      fired.add(event.id);
      this.fire(ctx, event);
    }
  },

  /** Events whose gates all pass for the current state. */
  eligible(state) {
    return events.filter((e) => {
      if (state.prison.inPrison && !e.inPrison) return false;
      if (!state.prison.inPrison && e.prisonOnly) return false;
      if (e.minAge !== undefined && state.character.age < e.minAge) return false;
      if (e.maxAge !== undefined && state.character.age > e.maxAge) return false;
      if (e.once && state.flags[`evt:${e.id}`]) return false;
      if (e.requiresJob && !state.career.employed) return false;
      if (e.requiresSchool && state.education.stage === 'none') return false;
      if (typeof e.when === 'function' && !e.when(state)) return false;
      return true;
    });
  },

  fire(ctx, event) {
    const { state } = ctx;
    if (event.once) state.flags[`evt:${event.id}`] = true;

    if (!event.choices?.length) {
      const deltas = ctx.effects(event.effects);
      ctx.log(tpl(event.text, state), {
        icon: event.icon ?? '✨', tone: event.tone, category: event.category ?? 'event', deltas,
      });
      return;
    }

    ctx.prompt({
      id: event.id,
      icon: event.icon ?? '❓',
      title: tpl(event.title ?? 'Life happens', state),
      text: tpl(event.text, state),
      choices: event.choices.map((c) => ({ label: tpl(c.label, state), hint: c.hint ? tpl(c.hint, state) : null })),
      onChoose: (innerCtx, _choice, index) => this.resolveChoice(innerCtx, event, index),
    });
  },

  /** Apply the player's answer to an interactive event. */
  resolveChoice(ctx, event, index) {
    const { state, rng } = ctx;
    const choice = event.choices[index];
    if (!choice) return null;

    let outcome = choice;
    if (choice.odds !== undefined) {
      const odds = typeof choice.odds === 'function' ? choice.odds(state) : choice.odds;
      outcome = rng.chance(odds) ? (choice.success ?? choice) : (choice.failure ?? choice);
    }

    const deltas = ctx.effects(outcome.effects);
    const text = tpl(outcome.text ?? event.text, state);
    ctx.log(text, {
      icon: outcome.icon ?? event.icon ?? '✨',
      tone: outcome.tone ?? event.tone,
      category: event.category ?? 'event',
      deltas,
    });
    return { text, deltas, icon: outcome.icon ?? event.icon ?? '✨' };
  },
};
