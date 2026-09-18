/**
 * Police system -- arrests, charges and sentencing.
 * Listens for `crime:caught`, decides the consequence, and hands custodial
 * sentences to the prison system via `prison:commit`.
 */
import { clamp } from '../core/state.js';

export default {
  id: 'police',
  order: 72,

  init(ctx) { this._wire(ctx); },
  rehydrate(ctx) { this._wire(ctx); },

  _wire(ctx) {
    ctx.bus.on('crime:caught', ({ crime }) => this.arrest(ctx, crime));
  },

  onYear(ctx) {
    const { state, rng } = ctx;
    if (state.prison.inPrison || state.crime.heat < 45) return;

    // High heat means an old case can catch up with you.
    const cold = state.crime.record.filter((r) => r.outcome === 'got away with it');
    if (!cold.length) return;
    if (rng.chance(state.crime.heat * 0.004)) {
      const oldCase = rng.pick(cold);
      ctx.log(`Detectives reopened the ${oldCase.label.toLowerCase()} case from when you were ${oldCase.age}.`, {
        icon: '🔎', tone: 'var(--c-danger)', category: 'crime',
      });
      this.arrest(ctx, { id: oldCase.crimeId, name: oldCase.label, severity: 2, sentence: [1, 3], fine: [500, 4000] });
    }
  },

  /**
   * Arrest, then sentence. Severity plus prior convictions decide whether you
   * walk with a fine, get probation, or go inside.
   */
  arrest(ctx, crime) {
    const { state, rng } = ctx;
    state.crime.arrests += 1;

    const severity = crime.severity ?? 1;
    const priors = state.crime.convictions;

    // A good lawyer is expensive -- money genuinely helps here.
    const acquitOdds = clamp(0.3 - severity * 0.06 - priors * 0.05 +
                             Math.min(0.25, state.economy.cash / 400000), 0.02, 0.6);

    if (rng.chance(acquitOdds)) {
      const fee = Math.min(state.economy.cash, rng.int(500, 6000));
      const deltas = ctx.effects({ money: -fee, stats: { happiness: -4 } });
      state.crime.record.push({ age: state.character.age, crimeId: crime.id, label: crime.name, outcome: 'acquitted' });
      ctx.log(`You were arrested for ${crime.name.toLowerCase()} but your lawyer got you off. Legal fees: $${fee.toLocaleString('en-US')}.`, {
        icon: '⚖️', tone: 'var(--c-warn)', category: 'crime', deltas,
      });
      return;
    }

    state.crime.convictions += 1;
    const custodial = severity >= 3 || (severity === 2 && priors >= 1) || priors >= 3;

    if (!custodial) {
      const fine = rng.int(crime.fine?.[0] ?? 200, crime.fine?.[1] ?? 2500);
      const deltas = ctx.effects({
        money: -Math.min(fine, state.economy.cash),
        debt: Math.max(0, fine - state.economy.cash),
        stats: { happiness: -10, popularity: -4 }, karma: -4,
      });
      state.crime.record.push({ age: state.character.age, crimeId: crime.id, label: crime.name, outcome: `fined $${fine}` });
      ctx.log(`Convicted of ${crime.name.toLowerCase()}. Fined $${fine.toLocaleString('en-US')} and given probation.`, {
        icon: '👮', tone: 'var(--c-danger)', category: 'crime', deltas,
      });
      return;
    }

    const years = rng.int(crime.sentence?.[0] ?? 1, crime.sentence?.[1] ?? 4) + Math.floor(priors / 2);
    state.crime.record.push({ age: state.character.age, crimeId: crime.id, label: crime.name, outcome: `${years}y prison` });
    ctx.bus.emit('prison:commit', { ctx, years, crime });
  },
};
