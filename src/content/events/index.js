/**
 * Event manifest.
 * Drop a new file in this folder, export an array, add it here. Nothing else
 * in the codebase needs to know about it.
 */
import { CHILDHOOD_EVENTS } from './childhood.js';
import { SCHOOL_EVENTS }    from './school.js';
import { ADULT_EVENTS }     from './adult.js';
import { PRISON_EVENTS }    from './prison.js';
import { RANDOM_EVENTS }    from './random.js';

export const EVENTS = [
  ...CHILDHOOD_EVENTS,
  ...SCHOOL_EVENTS,
  ...ADULT_EVENTS,
  ...PRISON_EVENTS,
  ...RANDOM_EVENTS,
];
