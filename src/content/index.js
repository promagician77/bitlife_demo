/**
 * Content bootstrap.
 *
 * Everything the game knows about careers, events, schools, skills, items,
 * crimes and activities is loaded here into the registries. This is the single
 * place to wire up new content packs.
 */
import { careers, events, schools, skills, items, crimes, activities } from '../core/registry.js';

import { CAREERS }    from './careers/index.js';
import { EVENTS }     from './events/index.js';
import { SCHOOLS }    from './schools.js';
import { SKILLS }     from './skills.js';
import { ITEMS }      from './items.js';
import { CRIMES }     from './crimes.js';
import { ACTIVITIES } from './activities.js';

let loaded = false;

export function loadContent() {
  if (loaded) return;
  careers.add(CAREERS);
  events.add(EVENTS);
  schools.add(SCHOOLS);
  skills.add(SKILLS);
  items.add(ITEMS);
  crimes.add(CRIMES);
  activities.add(ACTIVITIES);
  loaded = true;

  if (typeof console !== 'undefined') {
    console.info(
      `[content] ${careers.size} careers, ${events.size} events, ${schools.size} schools, ` +
      `${skills.size} skills, ${items.size} items, ${crimes.size} crimes, ${activities.size} activities`,
    );
  }
}
