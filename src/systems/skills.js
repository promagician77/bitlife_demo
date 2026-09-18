/**
 * Skills system.
 * Owns: state.skills
 *
 * Skill definitions come from the `skills` registry. Careers reference skills
 * by id only, so new skills and new careers can be introduced independently.
 */
import { skills as skillRegistry } from '../core/registry.js';
import { clamp } from '../core/state.js';

export default {
  id: 'skills',
  order: 55,

  init(ctx) {
    const { state, rng } = ctx;
    for (const skill of skillRegistry.all()) {
      state.skills[skill.id] = rng.bell(skill.startMin ?? 0, skill.startMax ?? 12);
    }
  },

  rehydrate(ctx) {
    // Forward compatibility: skills added in a later version default to 0.
    for (const skill of skillRegistry.all()) {
      if (ctx.state.skills[skill.id] === undefined) ctx.state.skills[skill.id] = 0;
    }
  },

  onYear(ctx) {
    const { state } = ctx;
    const trainedThisYear = state.year.usedOnce ?? {};
    for (const skill of skillRegistry.all()) {
      const decay = skill.decay ?? 0.5;
      if (!trainedThisYear[`train:${skill.id}`] && state.character.age > 20) {
        state.skills[skill.id] = clamp((state.skills[skill.id] ?? 0) - decay);
      }
    }
  },

  /** Practise a skill -- costs one of the year's actions. */
  train(ctx, skillId) {
    const { state, rng } = ctx;
    const skill = skillRegistry.get(skillId);
    if (!skill) return { ok: false, reason: 'Unknown skill.' };
    if (skill.minAge && state.character.age < skill.minAge)
      return { ok: false, reason: `You are too young to train ${skill.name}.` };
    if (skill.cost && state.economy.cash < skill.cost)
      return { ok: false, reason: `You need $${skill.cost.toLocaleString('en-US')} for that.` };

    const level = state.skills[skillId] ?? 0;
    // Diminishing returns: the last 20 points are much harder than the first 20.
    const gain = Math.max(1, Math.round(rng.int(4, 9) * (1 - level / 130)));
    const deltas = ctx.effects({
      skills: { [skillId]: gain },
      money: skill.cost ? -skill.cost : 0,
      stats: skill.practiceEffects ?? { happiness: 1 },
    });
    ctx.log(`${skill.practiceText ?? `You practised ${skill.name}.`}`, {
      icon: skill.icon, tone: 'var(--accent-hi)', category: 'skill', deltas,
    });
    return { ok: true, message: `${skill.name} +${gain}` };
  },

  all: () => skillRegistry.all(),
};
