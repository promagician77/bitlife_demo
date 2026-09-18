/**
 * Reputation system.
 * Owns: state.reputation — fame, respect and karma.
 *
 * Nothing else writes here directly; other systems nudge it through effects
 * (`fame`, `respect`, `karma`) or by emitting events this system listens to.
 */
import { clamp } from '../core/state.js';

export const FAME_TIERS = [
  [0,  'Unknown'], [15, 'Locally known'], [35, 'Recognised'],
  [60, 'Well known'], [80, 'Famous'], [95, 'Household name'],
];

export default {
  id: 'reputation',
  order: 80,

  init(ctx) { this._wire(ctx); },
  rehydrate(ctx) { this._wire(ctx); },

  _wire(ctx) {
    ctx.bus.on('career:promoted', () => { ctx.state.reputation.fame = clamp(ctx.state.reputation.fame + 2); });
    ctx.bus.on('education:graduated', () => { ctx.state.reputation.respect = clamp(ctx.state.reputation.respect + 4); });
    ctx.bus.on('prison:entered', () => { ctx.state.reputation.respect = clamp(ctx.state.reputation.respect - 25); });
  },

  onYear(ctx) {
    const { state } = ctx;
    const rep = state.reputation;

    // Fame fades unless something keeps it alive.
    rep.fame = clamp(rep.fame - 1.5);

    // Popularity tracks fame and respect loosely.
    const pull = (rep.fame * 0.4 + rep.respect * 0.3) - state.stats.popularity;
    state.stats.popularity = clamp(state.stats.popularity + Math.sign(pull) * Math.min(2, Math.abs(pull) * 0.15));

    // A criminal record erodes how people see you.
    if (state.crime.convictions > 0) rep.respect = clamp(rep.respect - 0.5);
  },

  tier(fame) {
    let label = 'Unknown';
    for (const [min, name] of FAME_TIERS) if (fame >= min) label = name;
    return label;
  },
};
