/**
 * Character system -- identity and mortality.
 * Owns: state.character
 */
import { zodiacFor, fullName } from '../core/state.js';
import { FIRST_NAMES, LAST_NAMES, PLACES } from '../content/names.js';

const AVATAR_BY_AGE = [
  [3,  '👶'], [12, '🧒'], [19, '🧑'],
  [45, '😎'], [65, '🧔'], [999, '👴'],
];

export default {
  id: 'character',
  order: 0,

  init(ctx, setup) {
    const { state, rng } = ctx;
    const gender = setup.gender ?? rng.pick(['male', 'female']);
    const place = setup.place ?? rng.pick(PLACES);
    const month = rng.int(1, 12);
    const day = rng.int(1, 28);

    Object.assign(state.character, {
      firstName: (setup.firstName || '').trim() || rng.pick(FIRST_NAMES[gender]),
      lastName:  (setup.lastName  || '').trim() || rng.pick(LAST_NAMES),
      gender,
      country: place.country,
      city: setup.city || rng.pick(place.cities),
      birthMonth: month,
      birthDay: day,
      zodiac: zodiacFor(month, day),
      age: 0,
      alive: true,
      avatar: '👶',
    });

    // Starting stats are rolled, not chosen -- every life is different.
    state.stats.health     = rng.bell(72, 100);
    state.stats.happiness  = rng.bell(60, 95);
    state.stats.fitness    = rng.bell(40, 80);
    state.stats.mentality  = rng.bell(35, 90);
    state.stats.looks      = rng.bell(25, 95);
    state.stats.popularity = rng.bell(20, 55);

    ctx.log(
      `You were born a ${gender === 'male' ? 'boy' : 'girl'} in ${state.character.city}, ${state.character.country}.`,
      { icon: '🎉', tone: 'var(--c-happiness)', category: 'milestone' },
    );

    ctx.bus.on('life:die', ({ cause }) => this.kill(ctx, cause));
  },

  rehydrate(ctx) {
    ctx.bus.on('life:die', ({ cause }) => this.kill(ctx, cause));
  },

  onYear(ctx) {
    const { state } = ctx;
    state.character.avatar = AVATAR_BY_AGE.find(([max]) => state.character.age < max)[1];
  },

  /** Single entry point for ending a life, so every system reports it the same way. */
  kill(ctx, cause) {
    const { state } = ctx;
    if (!state.character.alive) return;
    state.character.alive = false;
    state.character.causeOfDeath = cause;
    ctx.log(`${fullName(state)} died at the age of ${state.character.age}. ${cause}`, {
      icon: '⚰️', tone: 'var(--c-danger)', category: 'milestone',
    });
    ctx.bus.emit('game:over', { ctx, cause });
  },
};
