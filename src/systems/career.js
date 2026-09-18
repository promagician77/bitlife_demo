/**
 * Career system.
 * Owns: state.career
 *
 * Career definitions live in src/content/careers/. Each one declares its own
 * requirements, promotion ladder and on-the-job tasks, so a new profession is
 * a new data file -- this system never needs to change.
 */
import { careers } from '../core/registry.js';
import { clamp } from '../core/state.js';

/** Degree ranking used to test education requirements. */
const DEGREE_RANK = { none: 0, highschool: 1, associate: 2, bachelor: 3, master: 4, doctorate: 5 };
const rankOf = (degree) => DEGREE_RANK[degree ?? 'none'] ?? 0;

export default {
  id: 'career',
  order: 40,

  init(ctx) { this._wire(ctx); },
  rehydrate(ctx) { this._wire(ctx); },

  _wire(ctx) {
    ctx.bus.on('career:fire', ({ reason }) => this.fire(ctx, reason));
  },

  onYear(ctx) {
    const { state, rng } = ctx;
    const career = state.career;
    if (!career.employed) return;

    if (state.prison.inPrison) {
      this.fire(ctx, 'Your employer let you go while you were incarcerated.');
      return;
    }

    const def = careers.get(career.jobId);
    if (!def) { career.employed = false; return; }
    const level = def.levels[career.levelIndex];

    career.yearsAtJob += 1;

    /* Performance drifts toward what your stats support. */
    const target = clamp(
      35 + state.stats.mentality * 0.2 + state.stats.health * 0.1 +
      (def.keySkills ?? []).reduce((sum, id) => sum + (state.skills[id] ?? 0) * 0.25, 0),
    );
    career.performance = clamp(Math.round(career.performance + (target - career.performance) * 0.3 + rng.int(-5, 5)));

    career.xp += Math.round(20 + career.performance * 0.6);

    ctx.effects(def.workEffects ?? { stats: { happiness: -1, fitness: -1 } });

    /* Promotion --------------------------------------------------------- */
    const nextLevel = def.levels[career.levelIndex + 1];
    if (nextLevel && career.xp >= (level.xpToNext ?? 500) && career.performance >= (nextLevel.minPerformance ?? 55)) {
      this.promote(ctx, def);
    } else if (career.performance < 25 && rng.chance(0.35)) {
      this.fire(ctx, 'You were let go for poor performance.');
    } else if (career.yearsAtJob === 1) {
      ctx.log(`You worked your first year as a ${level.title}.`, {
        icon: def.icon, category: 'career',
      });
    }

    /* Retirement nudge --------------------------------------------------- */
    if (state.character.age === 65) {
      ctx.log('You are eligible to retire whenever you like.', { icon: '🏖️', category: 'career' });
    }
  },

  /* ── eligibility ───────────────────────────────────────────────────────── */

  /** @returns {{ok:boolean, reason?:string}} */
  canApply(state, careerId) {
    const def = careers.get(careerId);
    if (!def) return { ok: false, reason: 'Unknown career.' };
    const req = def.requirements ?? {};
    if (state.prison.inPrison) return { ok: false, reason: 'Not while you are in prison.' };
    if (state.career.employed && state.career.jobId === careerId) return { ok: false, reason: 'You already work here.' };
    if (state.character.age < (req.minAge ?? 18)) return { ok: false, reason: `Minimum age is ${req.minAge ?? 18}.` };
    if (rankOf(state.education.highestDegree) < rankOf(req.education))
      return { ok: false, reason: `Requires a ${req.education} qualification.` };
    if (req.major && state.education.transcript.every((t) => t.major !== req.major))
      return { ok: false, reason: `Requires a degree in ${req.major}.` };
    for (const [key, min] of Object.entries(req.stats ?? {}))
      if (state.stats[key] < min) return { ok: false, reason: `Needs ${key} of at least ${min}.` };
    for (const [key, min] of Object.entries(req.skills ?? {}))
      if ((state.skills[key] ?? 0) < min) return { ok: false, reason: `Needs ${key} skill of at least ${min}.` };
    if (req.cleanRecord && state.crime.convictions > 0)
      return { ok: false, reason: 'Requires a clean criminal record.' };
    return { ok: true };
  },

  /* ── player actions ────────────────────────────────────────────────────── */

  /** Interview for a job. Success depends on stats, skills and grades. */
  apply(ctx, careerId) {
    const { state, rng } = ctx;
    const gate = this.canApply(state, careerId);
    if (!gate.ok) return gate;

    const def = careers.get(careerId);
    const skillScore = (def.keySkills ?? []).reduce((sum, id) => sum + (state.skills[id] ?? 0), 0) /
                        Math.max(1, (def.keySkills ?? []).length);
    const odds = clamp(
      0.25 + skillScore * 0.005 + state.stats.looks * 0.0015 +
      state.education.grades * 0.003 + state.stats.mentality * 0.002 -
      (def.competition ?? 0.1), 0.05, 0.95,
    );

    if (!rng.chance(odds)) {
      const deltas = ctx.effects({ stats: { happiness: -4 } });
      ctx.log(`You interviewed for ${def.name} and were turned down.`, {
        icon: '📄', tone: 'var(--c-danger)', category: 'career', deltas,
      });
      return { ok: false, reason: 'They went with another candidate.' };
    }

    if (state.career.employed) state.career.history.push(this._snapshot(state));

    Object.assign(state.career, {
      jobId: careerId, levelIndex: 0, xp: 0, yearsAtJob: 0,
      performance: clamp(45 + state.stats.mentality * 0.2), employed: true,
    });
    state.economy.salary = def.levels[0].salary;

    const deltas = ctx.effects({ stats: { happiness: 8 } });
    ctx.log(`You were hired as a ${def.levels[0].title} at ${def.employer ?? def.name}.`, {
      icon: def.icon, tone: 'var(--c-money)', category: 'milestone', deltas,
    });
    ctx.bus.emit('career:hired', { ctx, careerId });
    return { ok: true };
  },

  promote(ctx, def) {
    const { state } = ctx;
    state.career.levelIndex += 1;
    state.career.xp = 0;
    const level = def.levels[state.career.levelIndex];
    state.economy.salary = level.salary;
    const deltas = ctx.effects({ stats: { happiness: 9, popularity: 3 }, money: 0 });
    ctx.log(`Promoted to ${level.title}! Your salary is now $${level.salary.toLocaleString('en-US')}.`, {
      icon: '📈', tone: 'var(--c-money)', category: 'milestone', deltas,
    });
    ctx.bus.emit('career:promoted', { ctx, careerId: def.id, levelIndex: state.career.levelIndex });
  },

  askForRaise(ctx) {
    const { state, rng } = ctx;
    if (!state.career.employed) return { ok: false, reason: 'You do not have a job.' };
    const odds = clamp(0.1 + state.career.performance * 0.006 + state.career.yearsAtJob * 0.03 +
                       (state.skills.charisma ?? 0) * 0.004, 0.05, 0.85);
    if (rng.chance(odds)) {
      const bump = Math.round(state.economy.salary * rng.float(0.05, 0.16));
      const deltas = ctx.effects({ salary: bump, stats: { happiness: 6 } });
      ctx.log(`You asked for a raise and got one: +$${bump.toLocaleString('en-US')} a year.`, {
        icon: '💵', tone: 'var(--c-money)', category: 'career', deltas,
      });
      return { ok: true, message: `Raise approved: +$${bump.toLocaleString('en-US')}/yr` };
    }
    const deltas = ctx.effects({ stats: { happiness: -5 }, performance: -4 });
    ctx.log('You asked for a raise. Your boss said no.', {
      icon: '🙄', tone: 'var(--c-danger)', category: 'career', deltas,
    });
    return { ok: false, reason: 'Your boss turned you down.' };
  },

  workHarder(ctx) {
    const { state, rng } = ctx;
    if (!state.career.employed) return { ok: false, reason: 'You do not have a job.' };
    const deltas = ctx.effects({
      performance: rng.int(6, 14), jobXp: rng.int(40, 90),
      stats: { happiness: -4, health: -2 },
    });
    ctx.log('You put in long hours at work.', {
      icon: '⏰', tone: 'var(--accent-hi)', category: 'career', deltas,
    });
    return { ok: true, message: 'Performance up, but it cost you.' };
  },

  quit(ctx) {
    const { state } = ctx;
    if (!state.career.employed) return { ok: false, reason: 'You do not have a job.' };
    const def = careers.get(state.career.jobId);
    state.career.history.push(this._snapshot(state));
    state.career.employed = false;
    state.economy.salary = 0;
    const deltas = ctx.effects({ stats: { happiness: 5 } });
    ctx.log(`You quit your job at ${def?.name ?? 'work'}.`, {
      icon: '👋', tone: 'var(--c-warn)', category: 'career', deltas,
    });
    return { ok: true };
  },

  fire(ctx, reason = 'You lost your job.') {
    const { state } = ctx;
    if (!state.career.employed) return;
    state.career.history.push(this._snapshot(state));
    state.career.employed = false;
    state.economy.salary = 0;
    const deltas = ctx.effects({ stats: { happiness: -14 } });
    ctx.log(reason, { icon: '📦', tone: 'var(--c-danger)', category: 'career', deltas });
  },

  /** Run a career-specific task (declared by the career content file). */
  runTask(ctx, taskId) {
    const { state, rng } = ctx;
    const def = careers.get(state.career.jobId);
    const task = def?.tasks?.find((t) => t.id === taskId);
    if (!task) return { ok: false, reason: 'That task is not available.' };

    const odds = typeof task.odds === 'function' ? task.odds(state) : (task.odds ?? 0.7);
    const won = rng.chance(clamp(odds, 0.05, 0.97));
    const outcome = won ? task.success : task.failure;
    const deltas = ctx.effects(outcome?.effects);
    ctx.log(outcome?.text ?? task.name, {
      icon: task.icon ?? def.icon, tone: won ? 'var(--c-money)' : 'var(--c-danger)',
      category: 'career', deltas,
    });
    return { ok: true, message: won ? 'Task completed.' : 'That did not go well.' };
  },

  currentLevel(state) {
    const def = careers.get(state.career.jobId);
    return def ? def.levels[state.career.levelIndex] : null;
  },

  _snapshot(state) {
    const def = careers.get(state.career.jobId);
    return {
      careerId: state.career.jobId,
      title: def?.levels[state.career.levelIndex]?.title ?? 'Worker',
      name: def?.name ?? 'Job',
      years: state.career.yearsAtJob,
      endedAtAge: state.character.age,
    };
  },
};
