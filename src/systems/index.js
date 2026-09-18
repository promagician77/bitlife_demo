/**
 * System manifest.
 *
 * This list *is* the game loop. Reorder it, delete a line, or add one — the
 * engine picks the change up with no other edits anywhere. Each system also
 * declares its own `order`, which is what the engine actually sorts by; the
 * order here is just documentation.
 */
import character     from './character.js';
import age           from './age.js';
import prison        from './prison.js';
import health        from './health.js';
import education     from './education.js';
import career        from './career.js';
import economy       from './economy.js';
import skills        from './skills.js';
import relationships from './relationships.js';
import crime         from './crime.js';
import police        from './police.js';
import reputation    from './reputation.js';
import inventory     from './inventory.js';
import events        from './events.js';
import activities    from './activities.js';
import save          from './save.js';

export const systems = [
  character,      //   0  identity, death
  age,            //  10  the heartbeat
  prison,         //  15  sets inPrison before anything reads it
  health,         //  20  decay, illness, mortality
  education,      //  30  school progress
  career,         //  40  work, promotion
  economy,        //  50  income and outgoings
  skills,         //  55  skill decay
  relationships,  //  60  family, friends, partners
  crime,          //  70  heat decay, crime resolution
  police,         //  72  arrests and sentencing
  reputation,     //  80  fame, respect, karma
  inventory,      //  85  depreciation, upkeep
  events,         //  90  random life events (last: sees the whole year)
  activities,     // 500  player-triggered only, no yearly hook
  save,           // 999  autosave
];

export {
  character, age, prison, health, education, career, economy, skills,
  relationships, crime, police, reputation, inventory, events, activities, save,
};
