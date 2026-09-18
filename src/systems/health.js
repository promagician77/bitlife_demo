/**
 * Health system -- natural stat drift, illness and mortality.
 * Owns: the yearly decay curve and the death roll.
 */
import { clamp } from '../core/state.js';

/** Base annual mortality before the health modifier. */
function baseMortality(age) {
  if (age < 1)  return 0.003;
  if (age < 18) return 0.0005;
  if (age < 40) return 0.0011;
  if (age < 55) return 0.004;
  if (age < 65) return 0.011;
  if (age < 75) return 0.030;
  if (age < 85) return 0.075;
  if (age < 95) return 0.17;
  return 0.35;
}

const NATURAL_CAUSES = [
  'Natural causes.', 'A heart attack took them in their sleep.',
  'Complications from a long illness.', 'A stroke.', 'Old age, peacefully at home.',
];

const ILLNESSES = [
  { name: 'the flu',        health: -6,  happiness: -4 },
  { name: 'a broken arm',   health: -9,  fitness: -6 },
  { name: 'food poisoning', health: -5,  happiness: -6 },
  { name: 'pneumonia',      health: -14, fitness: -5 },
  { name: 'a slipped disc', health: -11, fitness: -9 },
];

export default {
  id: 'health',
  order: 20,

  onYear(ctx) {
    const { state, rng } = ctx;
    const age = state.character.age;
    const s = state.stats;

    /* 1. Natural drift ---------------------------------------------------- */
    // Growing up builds a body up to a natural ceiling; past that it takes
    // deliberate training, so the gym stays worth doing.
    if (age < 16)      s.fitness = clamp(s.fitness + (s.fitness < 68 ? rng.int(1, 3) : rng.int(0, 1)));
    else if (age > 30) s.fitness = clamp(s.fitness - (age > 60 ? 1.6 : 0.8));

    if (age > 30)  s.health = clamp(s.health - (age > 70 ? 2.2 : age > 50 ? 1.2 : 0.6));
    if (age > 32)  s.looks  = clamp(s.looks - (age > 60 ? 1.6 : 0.8));
    if (age > 65)  s.mentality = clamp(s.mentality - 1);

    // The body repairs itself between knocks — less so with every decade.
    if (s.health < 92) s.health = clamp(s.health + (age < 45 ? 1.4 : age < 65 ? 0.8 : 0.3) + s.fitness * 0.018);

    // Poor fitness drags health down; good fitness props it up.
    if (s.fitness < 30) s.health = clamp(s.health - 1.5);
    if (s.fitness > 75) s.health = clamp(s.health + 1);

    // Happiness slowly reverts to the mean.
    s.happiness = clamp(s.happiness + (s.happiness > 55 ? -1 : 1));

    /* 2. Random illness --------------------------------------------------- */
    const illnessChance = 0.055 + Math.max(0, 55 - s.health) * 0.003 + (age > 60 ? 0.07 : 0);
    if (rng.chance(illnessChance)) {
      const illness = rng.pick(ILLNESSES);
      const deltas = ctx.effects({
        stats: { health: illness.health, happiness: illness.happiness ?? 0, fitness: illness.fitness ?? 0 },
      });
      ctx.log(`You came down with ${illness.name}.`, {
        icon: '🤒', tone: 'var(--c-danger)', category: 'health', deltas,
      });
    }

    /* 3. Mortality -------------------------------------------------------- */
    if (s.health <= 0) {
      ctx.bus.emit('life:die', { ctx, cause: 'Their health finally gave out.' });
      return;
    }
    const risk = baseMortality(age) * (1 + Math.max(0, 70 - s.health) / 60);
    if (rng.chance(risk)) {
      ctx.bus.emit('life:die', { ctx, cause: rng.pick(NATURAL_CAUSES) });
    }
  },
};
