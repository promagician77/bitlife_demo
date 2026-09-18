/**
 * Relationships system.
 * Owns: state.relationships
 *
 * A relationship is: { id, name, type, kind, gender, age, alive, closeness, icon }
 * `kind` is one of 'family' | 'friend' | 'romance' and drives which
 * interactions the UI offers.
 */
import { FIRST_NAMES } from '../content/names.js';
import { clamp } from '../core/state.js';

let uid = 0;
const nextId = () => `rel_${Date.now().toString(36)}_${uid++}`;

const ICON = {
  mother: '👩', father: '👨', sibling: '🧑',
  friend: '👥', partner: '💑', child: '👶',
};

export default {
  id: 'relationships',
  order: 60,

  init(ctx) {
    const { state, rng } = ctx;
    const surname = state.character.lastName;

    state.relationships.push(
      this._make(rng, { type: 'mother', kind: 'family', gender: 'female', surname, age: rng.int(21, 40), closeness: rng.int(60, 95) }),
      this._make(rng, { type: 'father', kind: 'family', gender: 'male',   surname, age: rng.int(22, 45), closeness: rng.int(45, 90) }),
    );

    const siblings = rng.chance(0.55) ? rng.int(1, 2) : 0;
    for (let i = 0; i < siblings; i++) {
      const gender = rng.pick(['male', 'female']);
      state.relationships.push(this._make(rng, {
        type: 'sibling', kind: 'family', gender, surname,
        age: rng.int(-6, 6), closeness: rng.int(35, 85),
      }));
    }

    this._wire(ctx);
  },

  rehydrate(ctx) { this._wire(ctx); },

  _wire(ctx) {
    ctx.bus.on('relationship:adjust', ({ with: target, by = 0 }) => {
      const list = ctx.state.relationships.filter(
        (r) => r.alive && (r.id === target || r.type === target || r.kind === target || target === 'all'),
      );
      for (const rel of list) rel.closeness = clamp(rel.closeness + by);
    });
  },

  _make(rng, { type, kind, gender, surname, age, closeness }) {
    return {
      id: nextId(),
      name: `${rng.pick(FIRST_NAMES[gender])} ${surname ?? rng.pick(['Hansen', 'Reed', 'Moss'])}`,
      type, kind, gender,
      age: Math.max(0, age),
      alive: true,
      closeness: clamp(closeness),
      icon: ICON[type] ?? '👤',
    };
  },

  onYear(ctx) {
    const { state, rng } = ctx;

    for (const rel of state.relationships) {
      if (!rel.alive) continue;
      rel.age += 1;

      // Relationships fade without attention.
      rel.closeness = clamp(rel.closeness - (state.prison.inPrison ? 4 : 1.5));

      // Elderly relatives pass away.
      const risk = rel.age < 60 ? 0.002 : rel.age < 75 ? 0.02 : rel.age < 88 ? 0.07 : 0.2;
      if (rng.chance(risk)) {
        rel.alive = false;
        const deltas = ctx.effects({ stats: { happiness: rel.kind === 'family' ? -22 : -8 } });
        ctx.log(`${rel.name}, your ${rel.type}, passed away at ${rel.age}.`, {
          icon: '🕊️', tone: 'var(--c-danger)', category: 'milestone', deltas,
        });
      }
    }

    // School and work put new people in your life.
    const age = state.character.age;
    const canMeet = !state.prison.inPrison && (age >= 5 && age <= 70);
    const friendCount = state.relationships.filter((r) => r.alive && r.kind === 'friend').length;
    if (canMeet && friendCount < 6 && rng.chance(0.18 + state.stats.popularity * 0.003)) {
      const gender = rng.pick(['male', 'female']);
      const friend = this._make(rng, {
        type: 'friend', kind: 'friend', gender, surname: null,
        age: age + rng.int(-2, 2), closeness: rng.int(35, 70),
      });
      state.relationships.push(friend);
      ctx.log(`You became friends with ${friend.name}.`, {
        icon: '🤝', tone: 'var(--c-popularity)', category: 'social',
      });
    }
  },

  /* ── interactions ──────────────────────────────────────────────────────── */

  list(state, kind = null) {
    return state.relationships.filter((r) => r.alive && (!kind || r.kind === kind));
  },

  find(state, id) { return state.relationships.find((r) => r.id === id) ?? null; },

  interact(ctx, relId, kind) {
    const { state, rng } = ctx;
    const rel = this.find(state, relId);
    if (!rel || !rel.alive) return { ok: false, reason: 'They are not around.' };

    switch (kind) {
      case 'time': {
        const gain = rng.int(5, 14);
        const deltas = ctx.effects({ stats: { happiness: 4 } });
        rel.closeness = clamp(rel.closeness + gain);
        ctx.log(`You spent quality time with ${rel.name}.`, {
          icon: '☕', tone: 'var(--c-popularity)', category: 'social', deltas,
        });
        return { ok: true, message: `${rel.name} +${gain} closeness` };
      }
      case 'compliment': {
        const good = rng.chance(0.55 + (state.skills.charisma ?? 0) * 0.005);
        const gain = good ? rng.int(4, 9) : -rng.int(1, 4);
        rel.closeness = clamp(rel.closeness + gain);
        ctx.log(good ? `You complimented ${rel.name} and they lit up.`
                     : `Your compliment to ${rel.name} landed badly.`, {
          icon: good ? '😊' : '😬',
          tone: good ? 'var(--c-money)' : 'var(--c-danger)', category: 'social',
        });
        return { ok: true, message: `${gain > 0 ? '+' : ''}${gain} closeness` };
      }
      case 'argue': {
        const loss = rng.int(8, 20);
        rel.closeness = clamp(rel.closeness - loss);
        const deltas = ctx.effects({ stats: { happiness: -4 } });
        ctx.log(`You had a blazing row with ${rel.name}.`, {
          icon: '🗯️', tone: 'var(--c-danger)', category: 'social', deltas,
        });
        return { ok: true, message: `${rel.name} -${loss} closeness` };
      }
      case 'money': {
        if (rel.kind !== 'family') return { ok: false, reason: 'Only family will bail you out.' };
        const odds = clamp(rel.closeness / 130, 0.05, 0.8);
        if (!rng.chance(odds)) {
          rel.closeness = clamp(rel.closeness - 5);
          ctx.log(`You asked ${rel.name} for money. They said no.`, {
            icon: '🚫', tone: 'var(--c-danger)', category: 'social',
          });
          return { ok: false, reason: 'They turned you down.' };
        }
        const amount = rng.int(200, 2500);
        const deltas = ctx.effects({ money: amount });
        rel.closeness = clamp(rel.closeness - 3);
        ctx.log(`${rel.name} lent you $${amount.toLocaleString('en-US')}.`, {
          icon: '💸', tone: 'var(--c-money)', category: 'social', deltas,
        });
        return { ok: true, message: `+$${amount.toLocaleString('en-US')}` };
      }
      default:
        return { ok: false, reason: 'Unknown interaction.' };
    }
  },

  /** Look for a partner -- unlocked at 16. */
  findLove(ctx) {
    const { state, rng } = ctx;
    if (state.character.age < 16) return { ok: false, reason: 'You are too young to date.' };
    if (this.list(state, 'romance').length) return { ok: false, reason: 'You are already seeing someone.' };

    const odds = clamp(0.2 + state.stats.looks * 0.005 + state.stats.popularity * 0.003 +
                       (state.skills.charisma ?? 0) * 0.004, 0.08, 0.9);
    if (!rng.chance(odds)) {
      const deltas = ctx.effects({ stats: { happiness: -3 } });
      ctx.log('You put yourself out there, but nothing came of it.', {
        icon: '💔', tone: 'var(--c-danger)', category: 'social', deltas,
      });
      return { ok: false, reason: 'No luck this year.' };
    }

    const gender = state.character.gender === 'male' ? 'female' : 'male';
    const partner = this._make(rng, {
      type: 'partner', kind: 'romance', gender, surname: null,
      age: state.character.age + rng.int(-3, 3), closeness: rng.int(55, 85),
    });
    state.relationships.push(partner);
    const deltas = ctx.effects({ stats: { happiness: 14, popularity: 4 } });
    ctx.log(`You started dating ${partner.name}.`, {
      icon: '💕', tone: 'var(--c-popularity)', category: 'milestone', deltas,
    });
    return { ok: true, message: `You are now dating ${partner.name}.` };
  },

  breakUp(ctx, relId) {
    const { state } = ctx;
    const rel = this.find(state, relId);
    if (!rel) return { ok: false, reason: 'They are not around.' };
    rel.alive = false;      // removed from the active roster
    const deltas = ctx.effects({ stats: { happiness: -12 } });
    ctx.log(`You broke up with ${rel.name}.`, {
      icon: '💔', tone: 'var(--c-danger)', category: 'social', deltas,
    });
    return { ok: true };
  },
};
