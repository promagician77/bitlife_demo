/**
 * Content registries.
 *
 * All *content* -- careers, life events, school stages, skills, shop items --
 * is plain data registered here at boot. Systems only ever read from a
 * registry; they never hard-code content. Adding a new career or event is
 * therefore a matter of dropping a data file into src/content/ and listing it
 * in src/content/index.js.
 */
class Registry {
  /** @param {string} name @param {(entry:any)=>string[]} validate */
  constructor(name, validate = () => []) {
    this.name = name;
    this.validate = validate;
    this._items = new Map();
  }

  /** Register one entry, or an array of them. Later ids overwrite earlier. */
  add(entry) {
    if (Array.isArray(entry)) { entry.forEach((e) => this.add(e)); return this; }
    if (!entry || !entry.id) {
      console.error(`[registry:${this.name}] entry is missing an id`, entry);
      return this;
    }
    const problems = this.validate(entry);
    if (problems.length) {
      // Reject only the bad entry -- never let one content file break boot.
      console.error(`[registry:${this.name}] "${entry.id}" rejected: ${problems.join('; ')}`);
      return this;
    }
    if (this._items.has(entry.id)) {
      console.warn(`[registry:${this.name}] "${entry.id}" was overwritten`);
    }
    this._items.set(entry.id, Object.freeze(entry));
    return this;
  }

  get(id) { return this._items.get(id) ?? null; }
  has(id) { return this._items.has(id); }
  all() { return [...this._items.values()]; }
  filter(fn) { return this.all().filter(fn); }
  get size() { return this._items.size; }
}

export const careers  = new Registry('careers', (c) =>
  [!c.name && 'name required', !Array.isArray(c.levels) && 'levels[] required'].filter(Boolean));

export const events   = new Registry('events', (e) =>
  [!e.text && 'text required',
   e.choices && !Array.isArray(e.choices) && 'choices must be an array'].filter(Boolean));

export const schools  = new Registry('schools', (s) =>
  [typeof s.startAge !== 'number' && 'startAge required',
   typeof s.years !== 'number' && 'years required'].filter(Boolean));

export const skills   = new Registry('skills', (s) => [!s.name && 'name required'].filter(Boolean));
export const items    = new Registry('items',  (i) => [typeof i.price !== 'number' && 'price required'].filter(Boolean));
export const crimes   = new Registry('crimes', (c) => [!c.name && 'name required'].filter(Boolean));
export const activities = new Registry('activities', (a) => [!a.name && 'name required'].filter(Boolean));

export const registries = { careers, events, schools, skills, items, crimes, activities };
