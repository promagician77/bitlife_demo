/**
 * Education system.
 * Owns: state.education
 *
 * School stages come from the `schools` registry, so adding trade school,
 * medical school or a PhD later is a data change, not a code change.
 */
import { schools } from '../core/registry.js';
import { clamp } from '../core/state.js';

const gradeLetter = (g) =>
  g >= 90 ? 'A' : g >= 80 ? 'B' : g >= 70 ? 'C' : g >= 60 ? 'D' : 'F';

export default {
  id: 'education',
  order: 30,

  onYear(ctx) {
    const { state, rng } = ctx;
    const age = state.character.age;
    if (state.prison.inPrison) return;   // school is on hold behind bars

    const edu = state.education;

    /* 1. Auto-enrolment into compulsory stages ---------------------------- */
    if (edu.stage === 'none') {
      const due = schools.all().find((s) => s.auto && s.startAge === age && !edu.transcript.some((t) => t.stage === s.id));
      if (due) this.enroll(ctx, due.id, null, { silent: false, free: true });
    }

    if (edu.stage === 'none') return;

    /* 2. A year of study --------------------------------------------------- */
    const stage = schools.get(edu.stage);
    if (!stage) { edu.stage = 'none'; return; }

    edu.yearInStage += 1;

    // Performance gravitates toward what the character can actually manage.
    const target = clamp(
      30 + state.stats.mentality * 0.45 + (state.skills.discipline ?? 0) * 0.25 + rng.int(-8, 8),
    );
    edu.grades = clamp(Math.round(edu.grades + (target - edu.grades) * 0.45));

    if (stage.tuition && edu.yearInStage > 1) {
      ctx.effects({ money: -stage.tuition });
      ctx.log(`You paid ${stage.label} tuition.`, { icon: '💸', category: 'education' });
    }

    ctx.effects({ stats: { mentality: stage.mentalityGain ?? 1 }, skills: stage.skillGain ?? {} });

    /* 3. Graduation --------------------------------------------------------- */
    if (edu.yearInStage >= stage.years) {
      this.graduate(ctx, stage);
    } else if (edu.yearInStage > 1 && rng.chance(0.4)) {
      ctx.log(`Report card: ${gradeLetter(edu.grades)} average at ${stage.label}.`, {
        icon: '📝', category: 'education',
      });
    }
  },

  /* ── player actions ────────────────────────────────────────────────────── */

  /** Can this stage be entered right now? -> { ok, reason } */
  canEnroll(state, stageId) {
    const stage = schools.get(stageId);
    if (!stage) return { ok: false, reason: 'Unknown school.' };
    if (state.prison.inPrison) return { ok: false, reason: 'Not while you are in prison.' };
    if (state.education.stage !== 'none') return { ok: false, reason: 'You are already enrolled somewhere.' };
    if (state.education.transcript.some((t) => t.stage === stageId && t.graduated))
      return { ok: false, reason: 'You already graduated from there.' };
    if (state.character.age < stage.startAge) return { ok: false, reason: `You must be at least ${stage.startAge}.` };
    if (stage.requires && !state.education.transcript.some((t) => t.stage === stage.requires && t.graduated))
      return { ok: false, reason: `Requires ${schools.get(stage.requires)?.label ?? stage.requires}.` };
    if (stage.minGrades && state.education.grades < stage.minGrades)
      return { ok: false, reason: `Your grades are too low (need ${stage.minGrades}).` };
    if (stage.tuition && state.economy.cash < stage.tuition)
      return { ok: false, reason: `You cannot afford the $${stage.tuition.toLocaleString('en-US')} tuition.` };
    return { ok: true };
  },

  enroll(ctx, stageId, major = null, { free = false } = {}) {
    const { state } = ctx;
    const stage = schools.get(stageId);
    if (!stage) return { ok: false, reason: 'Unknown school.' };

    state.education.stage = stageId;
    state.education.yearInStage = 0;
    state.education.major = major;
    if (stage.tuition && !free) ctx.effects({ money: -stage.tuition });

    ctx.log(`You enrolled in ${stage.label}${major ? ` (${major})` : ''}.`, {
      icon: stage.icon, tone: 'var(--accent-hi)', category: 'education',
    });
    ctx.bus.emit('education:enrolled', { ctx, stageId, major });
    return { ok: true };
  },

  graduate(ctx, stage) {
    const { state } = ctx;
    const edu = state.education;
    const passed = edu.grades >= (stage.passMark ?? 50);

    edu.transcript.push({
      stage: stage.id, label: stage.label, gradeAvg: Math.round(edu.grades),
      letter: gradeLetter(edu.grades), year: state.character.birthYear + state.character.age,
      graduated: passed, major: edu.major,
    });
    edu.stage = 'none';
    edu.yearInStage = 0;

    if (passed) {
      if (stage.degree) edu.highestDegree = stage.degree;
      const deltas = ctx.effects({
        stats: { happiness: 10, mentality: stage.gradMentality ?? 3 },
        skills: stage.gradSkills ?? {},
      });
      ctx.log(`You graduated from ${stage.label} with a ${gradeLetter(edu.grades)} average!`, {
        icon: '🎓', tone: 'var(--c-money)', category: 'milestone', deltas,
      });
      ctx.bus.emit('education:graduated', { ctx, stage, major: edu.major });
    } else {
      const deltas = ctx.effects({ stats: { happiness: -12 } });
      ctx.log(`You failed out of ${stage.label}.`, {
        icon: '📉', tone: 'var(--c-danger)', category: 'education', deltas,
      });
    }
  },

  dropOut(ctx) {
    const { state } = ctx;
    const stage = schools.get(state.education.stage);
    if (!stage) return { ok: false, reason: 'You are not enrolled.' };
    state.education.transcript.push({
      stage: stage.id, label: stage.label, gradeAvg: Math.round(state.education.grades),
      letter: gradeLetter(state.education.grades),
      year: state.character.birthYear + state.character.age, graduated: false, dropped: true,
    });
    state.education.stage = 'none';
    state.education.yearInStage = 0;
    state.education.droppedOut = true;
    const deltas = ctx.effects({ stats: { happiness: 4, mentality: -4 } });
    ctx.log(`You dropped out of ${stage.label}.`, {
      icon: '🚪', tone: 'var(--c-warn)', category: 'education', deltas,
    });
    return { ok: true };
  },

  /** A study session: one of the player's yearly actions. */
  study(ctx) {
    const { state, rng } = ctx;
    if (state.education.stage === 'none') return { ok: false, reason: 'You are not in school.' };
    const gain = rng.int(4, 11);
    const deltas = ctx.effects({
      grades: gain, stats: { happiness: -3, mentality: 2 }, skills: { discipline: 2 },
    });
    ctx.log(`You spent the year hitting the books. Grades ${gradeLetter(state.education.grades)}.`, {
      icon: '📚', tone: 'var(--accent-hi)', category: 'education', deltas,
    });
    return { ok: true };
  },

  gradeLetter,
};
