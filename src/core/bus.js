/**
 * Minimal publish/subscribe bus.
 *
 * This is the *only* channel systems use to talk to each other. A system never
 * imports another system, so any of them can be replaced, removed or added
 * later without touching the rest of the codebase.
 *
 *   bus.on('crime:committed', payload => ...)   // police reacts
 *   bus.emit('crime:committed', { severity: 3 })
 */
export class Bus {
  constructor() { this._handlers = new Map(); }

  /** Subscribe. Returns an unsubscribe function. */
  on(type, handler) {
    if (!this._handlers.has(type)) this._handlers.set(type, new Set());
    this._handlers.get(type).add(handler);
    return () => this.off(type, handler);
  }

  /** Subscribe for a single delivery. */
  once(type, handler) {
    const off = this.on(type, (payload) => { off(); handler(payload); });
    return off;
  }

  off(type, handler) { this._handlers.get(type)?.delete(handler); }

  /**
   * Fire an event. Handler errors are contained so one broken listener can
   * never abort a year advance.
   */
  emit(type, payload) {
    for (const handler of this._handlers.get(type) ?? []) {
      try { handler(payload); }
      catch (err) { console.error(`[bus] handler for "${type}" failed:`, err); }
    }
    for (const handler of this._handlers.get('*') ?? []) {
      try { handler({ type, payload }); }
      catch (err) { console.error('[bus] wildcard handler failed:', err); }
    }
  }

  clear() { this._handlers.clear(); }
}

export const bus = new Bus();
