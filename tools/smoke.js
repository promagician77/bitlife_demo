/**
 * Headless smoke test.
 *
 * Runs whole lives through the engine with no browser, which is possible only
 * because src/core and src/systems have no DOM dependency. Run with:
 *   node tools/smoke.js
 */
import { loadContent } from '../src/content/index.js';
import { Engine } from '../src/core/engine.js';
import { bus } from '../src/core/bus.js';
import { systems } from '../src/systems/index.js';
import { careers, events, crimes, activities } from '../src/core/registry.js';
import { fullName, netWorth, money } from '../src/core/state.js';
import {
  career as careerSystem, education as eduSystem, activities as activitySystem,
  crime as crimeSystem, skills as skillSystem, relationships as relSystem,
} from '../src/systems/index.js';

// localStorage is absent in node; the save system is built to cope.
globalThis.window = globalThis.window ?? {};

loadContent();

const LIVES = 40;
let failures = 0;
let totalYears = 0;
const reached = { job: 0, degree: 0, prison: 0, partner: 0, promoted: 0 };

for (let n = 0; n < LIVES; n++) {
  const engine = new Engine({ bus: new (bus.constructor)() });
  for (const system of systems) engine.use(system);
  const state = engine.newGame({ seed: 1000 + n * 7919, birthYear: 1996 });

  let guard = 0;
  while (state.character.alive && guard++ < 120) {
    const { prompts } = engine.advanceYear();

    // Always answer prompts, picking a random option.
    while (engine.prompts.length) {
      const prompt = engine.prompts[0];
      engine.resolvePrompt(Math.floor(engine.rng.next() * prompt.choices.length));
    }
    void prompts;

    if (!state.character.alive) break;

    // Exercise player actions the way a real session would.
    const act = () => state.year.actionsLeft > 0;

    if (act() && state.education.stage !== 'none' && engine.rng.chance(0.4)) {
      engine.spendAction('study'); eduSystem.study(engine.ctx);
    }
    if (act() && state.character.age === 18 && eduSystem.canEnroll(state, 'university').ok) {
      eduSystem.enroll(engine.ctx, 'university', 'Computer Science');
    }
    if (act() && !state.career.employed && state.character.age >= 18) {
      const open = careers.all().filter((c) => careerSystem.canApply(state, c.id).ok);
      if (open.length) {
        engine.spendAction();
        careerSystem.apply(engine.ctx, engine.rng.pick(open).id);
      }
    }
    if (act() && state.career.employed && engine.rng.chance(0.5)) {
      const def = careers.get(state.career.jobId);
      if (def.tasks?.length) {
        engine.spendAction();
        careerSystem.runTask(engine.ctx, engine.rng.pick(def.tasks).id);
      }
    }
    if (act() && engine.rng.chance(0.5)) {
      const open = activitySystem.list(state).filter((a) => activitySystem.canRun(state, a.id).ok);
      if (open.length) { engine.spendAction(); activitySystem.run(engine.ctx, engine.rng.pick(open).id); }
    }
    if (act() && state.character.age >= 16 && engine.rng.chance(0.3)) {
      engine.spendAction('findLove');
      relSystem.findLove(engine.ctx);
    }
    if (act() && engine.rng.chance(0.3)) {
      const open = skillSystem.all().filter((s) => (s.minAge ?? 0) <= state.character.age);
      if (open.length) { engine.spendAction(); skillSystem.train(engine.ctx, engine.rng.pick(open).id); }
    }
    if (act() && engine.rng.chance(0.14) && !state.prison.inPrison) {
      const open = crimeSystem.available(state);
      if (open.length) { engine.spendAction(); crimeSystem.commit(engine.ctx, engine.rng.pick(open).id); }
    }
  }

  totalYears += state.character.age;
  if (state.career.history.length || state.career.employed) reached.job++;
  if (state.education.highestDegree) reached.degree++;
  if (state.crime.record.some((r) => String(r.outcome).includes('prison'))) reached.prison++;
  if (state.career.levelIndex > 0 || state.career.history.some((h) => h.title)) reached.promoted++;
  if (state.relationships.some((r) => r.kind === 'romance')) reached.partner++;

  if (!state.character.causeOfDeath && guard >= 120) {
    console.error(`life ${n}: never died in 120 years`); failures++;
  }
  for (const [key, value] of Object.entries(state.stats)) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      console.error(`life ${n}: stat ${key} out of range: ${value}`); failures++;
    }
  }
  if (!Number.isFinite(state.economy.cash)) {
    console.error(`life ${n}: cash is not finite`); failures++;
  }
  if (state.economy.cash < 0) {
    console.error(`life ${n}: cash went negative (${state.economy.cash})`); failures++;
  }

  // The save payload must round-trip cleanly.
  try {
    const clone = JSON.parse(JSON.stringify(state));
    if (clone.character.age !== state.character.age) throw new Error('age mismatch');
  } catch (err) {
    console.error(`life ${n}: state is not JSON-serialisable: ${err.message}`); failures++;
  }

  if (n === 0) {
    console.log(`\nSample life: ${fullName(state)} (${state.character.city})`);
    console.log(`  died at ${state.character.age} — ${state.character.causeOfDeath}`);
    console.log(`  net worth ${money(netWorth(state))}, ${state.log.length} feed entries`);
    console.log(`  degree: ${state.education.highestDegree ?? 'none'}, convictions: ${state.crime.convictions}`);
    console.log('  last 5 entries:');
    for (const e of state.log.slice(-5)) console.log(`    ${e.age}: ${e.icon} ${e.text}`);
  }
}

console.log(`\nContent: ${careers.size} careers, ${events.size} events, ${crimes.size} crimes, ${activities.size} activities`);
console.log(`${LIVES} lives simulated, average lifespan ${(totalYears / LIVES).toFixed(1)} years`);
console.log(`  held a job:     ${reached.job}/${LIVES}`);
console.log(`  earned degree:  ${reached.degree}/${LIVES}`);
console.log(`  found partner:  ${reached.partner}/${LIVES}`);
console.log(`  went to prison: ${reached.prison}/${LIVES}`);
console.log(failures === 0 ? '\nPASS — no invariant violations.' : `\nFAIL — ${failures} problem(s).`);
process.exit(failures === 0 ? 0 : 1);
