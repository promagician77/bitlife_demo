/**
 * Age system -- the heartbeat of the game.
 * Owns: state.character.age and the yearly milestone markers.
 *
 * Runs first in the pipeline so every other system sees the new age.
 */
import { currentYear } from '../core/state.js';

const MILESTONES = {
  1:  { text: 'You took your first steps.',                       icon: '👣' },
  5:  { text: 'You started school.',                              icon: '🎒' },
  13: { text: 'You are officially a teenager.',                   icon: '🤘' },
  16: { text: 'You can start dating and get a part-time job.',    icon: '💖' },
  18: { text: 'You are an adult. Full-time work is now open.',    icon: '🍾' },
  21: { text: 'You can legally do just about everything now.',    icon: '🎊' },
  30: { text: 'Your twenties are behind you.',                    icon: '🕰️' },
  50: { text: 'Half a century. People call you distinguished.',   icon: '🥂' },
  65: { text: 'Retirement age. You can stop working whenever you like.', icon: '🏖️' },
  100:{ text: 'A full century of life. Remarkable.',              icon: '👑' },
};

export default {
  id: 'age',
  order: 10,

  onYear(ctx) {
    const { state } = ctx;
    state.character.age += 1;

    ctx.log(`You turned ${state.character.age}.`, {
      icon: '🎂', category: 'birthday',
    });

    const milestone = MILESTONES[state.character.age];
    if (milestone) {
      ctx.log(milestone.text, { icon: milestone.icon, tone: 'var(--accent-hi)', category: 'milestone' });
    }

    ctx.bus.emit('age:changed', { ctx, age: state.character.age, year: currentYear(state) });
  },
};
