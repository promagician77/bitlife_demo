/**
 * Inventory system.
 * Owns: state.inventory
 *
 * Items are registry content; this system only handles buying, selling and
 * yearly depreciation.
 */
import { items } from '../core/registry.js';

let uid = 0;

export default {
  id: 'inventory',
  order: 85,

  init(ctx) { this._wire(ctx); },
  rehydrate(ctx) { this._wire(ctx); },

  _wire(ctx) {
    ctx.bus.on('inventory:grant', ({ itemId }) => this.grant(ctx, itemId));
  },

  onYear(ctx) {
    for (const owned of ctx.state.inventory) {
      const def = items.get(owned.itemId);
      const rate = def?.depreciation ?? 0.08;
      owned.value = Math.max(Math.round((def?.price ?? owned.value) * 0.05), Math.round(owned.value * (1 - rate)));
      if (def?.upkeep) ctx.effects({ money: -def.upkeep });
    }
  },

  canBuy(state, itemId) {
    const def = items.get(itemId);
    if (!def) return { ok: false, reason: 'Unknown item.' };
    if (def.minAge && state.character.age < def.minAge) return { ok: false, reason: `You must be ${def.minAge}.` };
    if (state.economy.cash < def.price) return { ok: false, reason: 'You cannot afford that.' };
    if (def.unique && state.inventory.some((i) => i.itemId === itemId))
      return { ok: false, reason: 'You already own one.' };
    return { ok: true };
  },

  buy(ctx, itemId) {
    const { state } = ctx;
    const gate = this.canBuy(state, itemId);
    if (!gate.ok) return gate;
    const def = items.get(itemId);
    const deltas = ctx.effects({ money: -def.price, stats: def.effects ?? { happiness: 4 } });
    state.inventory.push({
      uid: `itm_${Date.now().toString(36)}_${uid++}`,
      itemId, name: def.name, icon: def.icon,
      value: Math.round(def.price * 0.8), boughtAtAge: state.character.age,
    });
    ctx.log(`You bought ${def.name}.`, { icon: def.icon, tone: 'var(--c-money)', category: 'asset', deltas });
    return { ok: true, message: `Bought ${def.name}` };
  },

  grant(ctx, itemId) {
    const def = items.get(itemId);
    if (!def) return;
    ctx.state.inventory.push({
      uid: `itm_${Date.now().toString(36)}_${uid++}`,
      itemId, name: def.name, icon: def.icon,
      value: Math.round(def.price * 0.7), boughtAtAge: ctx.state.character.age,
    });
  },

  sell(ctx, ownedUid) {
    const { state } = ctx;
    const index = state.inventory.findIndex((i) => i.uid === ownedUid);
    if (index < 0) return { ok: false, reason: 'You do not own that.' };
    const [owned] = state.inventory.splice(index, 1);
    const deltas = ctx.effects({ money: owned.value });
    ctx.log(`You sold ${owned.name} for $${owned.value.toLocaleString('en-US')}.`, {
      icon: '🏷️', tone: 'var(--c-money)', category: 'asset', deltas,
    });
    return { ok: true, message: `+$${owned.value.toLocaleString('en-US')}` };
  },
};
