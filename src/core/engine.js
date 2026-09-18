/**
 * The engine.
 *
 * Owns the state, the RNG and the year pipeline. It knows *nothing* about any
 * particular system -- systems register themselves and declare an `order`, and
 * the engine runs them in that order once per year. Removing a system is
 * deleting one line in src/systems/index.js.
 */
import { Rng } from './rng.js';
import { bus as globalBus } from './bus.js';
import { applyEffects, resolveEffects } from './effects.js';
import { createState, currentYear, ACTIONS_PER_YEAR } from './state.js';

export class Engine {
  constructor({ bus = globalBus } = {}) {
    this.bus = bus;
    this.systems = [];
    this.state = null;
    this.rng = new Rng();
    this.prompts = [];      // interactive events waiting for the player
    this._feedBuffer = [];  // entries produced by the current year
    this.ctx = null;
  }

  /* ── systems ───────────────────────────────────────────────────────────── */

  /** @param {{id:string, order?:number, init?:Function, onYear?:Function}} system */
  use(system) {
    if (!system?.id) throw new Error('[engine] a system needs an id');
    this.systems.push({ order: 100, ...system });
    this.systems.sort((a, b) => a.order - b.order);
    return this;
  }

  system(id) { return this.systems.find((s) => s.id === id) ?? null; }

  /* ── lifecycle ─────────────────────────────────────────────────────────── */

  /** Start a fresh life. `setup` is handed to the character system. */
  newGame(setup = {}) {
    const seed = setup.seed ?? (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    const birthYear = setup.birthYear ?? new Date().getFullYear();
    this.state = createState({ seed, birthYear });
    this.rng = new Rng(seed, 0);
    this.prompts = [];
    this._buildCtx();
    for (const s of this.systems) s.init?.(this.ctx, setup);
    this.bus.emit('game:new', { ctx: this.ctx, setup });
    return this.state;
  }

  /** Re-attach the engine to a state tree loaded from storage. */
  loadState(state) {
    this.state = state;
    this.rng = Rng.fromJSON(state.rng);
    this.prompts = [];
    this._buildCtx();
    for (const s of this.systems) s.rehydrate?.(this.ctx);
    this.bus.emit('game:loaded', { ctx: this.ctx });
    return this.state;
  }

  _buildCtx() {
    const engine = this;
    this.ctx = {
      get state() { return engine.state; },
      get rng() { return engine.rng; },
      bus: this.bus,
      engine,
      /** Apply a declarative effect object. */
      effects: (fx) => applyEffects(this.ctx, resolveEffects(fx, this.state)),
      /** Append a life-feed entry for the current year. */
      log: (text, opts = {}) => this.log(text, opts),
      /** Queue an interactive event for the UI to present. */
      prompt: (promptDef) => { this.prompts.push(promptDef); },
    };
  }

  /* ── the life feed ─────────────────────────────────────────────────────── */

  log(text, { icon = '•', tone = null, category = 'life', deltas = [] } = {}) {
    const entry = {
      id: `${this.state.character.age}-${this.state.log.length}`,
      age: this.state.character.age,
      year: currentYear(this.state),
      text, icon, tone, category, deltas,
    };
    this.state.log.push(entry);
    this._feedBuffer.push(entry);
    return entry;
  }

  /** Entries recorded for a given age. */
  logForAge(age) { return this.state.log.filter((e) => e.age === age); }

  /* ── the year pipeline ─────────────────────────────────────────────────── */

  get canAdvance() { return !!this.state?.character.alive && this.prompts.length === 0; }

  /**
   * Advance one year. Runs every system's `onYear` in order, then returns what
   * happened so the UI can render it.
   * @returns {{entries:Array, prompts:Array, age:number}}
   */
  advanceYear() {
    if (!this.state?.character.alive) return { entries: [], prompts: [], age: this.state?.character.age ?? 0 };

    this._feedBuffer = [];
    this.bus.emit('year:before', { ctx: this.ctx });

    for (const system of this.systems) {
      if (!system.onYear) continue;
      try { system.onYear(this.ctx); }
      catch (err) { console.error(`[engine] system "${system.id}" failed during onYear:`, err); }
      if (!this.state.character.alive) break;   // stop the pipeline on death
    }

    this.state.year.actionsLeft = ACTIONS_PER_YEAR;
    this.state.year.usedOnce = {};
    this.state.rng = this.rng.toJSON();
    this.state.meta.updatedAt = Date.now();

    this.bus.emit('year:after', { ctx: this.ctx });

    return { entries: this._feedBuffer.slice(), prompts: this.prompts.slice(), age: this.state.character.age };
  }

  /* ── player actions ────────────────────────────────────────────────────── */

  /**
   * Is there budget for this action? Callers check *before* running it, so a
   * system's own `canRun`-style guard never sees a key this call already
   * consumed.
   */
  canSpendAction(onceKey = null) {
    if (this.state.year.actionsLeft <= 0) return { ok: false, reason: 'No energy left this year.' };
    if (onceKey && this.state.year.usedOnce[onceKey]) return { ok: false, reason: 'Already did that this year.' };
    return { ok: true };
  }

  /** Deduct the budget. Call only once the action has actually happened. */
  commitAction(onceKey = null) {
    this.state.year.actionsLeft = Math.max(0, this.state.year.actionsLeft - 1);
    if (onceKey) this.state.year.usedOnce[onceKey] = true;
  }

  /** Check and commit in one step, for programmatic callers such as the harness. */
  spendAction(onceKey = null) {
    const gate = this.canSpendAction(onceKey);
    if (gate.ok) this.commitAction(onceKey);
    return gate;
  }

  /** Resolve the first queued prompt with the chosen option index. */
  resolvePrompt(choiceIndex) {
    const promptDef = this.prompts.shift();
    if (!promptDef) return null;
    const choice = promptDef.choices?.[choiceIndex];
    const result = promptDef.onChoose?.(this.ctx, choice, choiceIndex) ?? null;
    this.state.rng = this.rng.toJSON();
    return result;
  }
}
