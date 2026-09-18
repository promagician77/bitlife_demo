/** "More" tab: everything not on a primary tab, plus the demo notes. */
import { html } from '../dom.js';
import { appbar, row, sectionTitle, kv } from '../components/common.js';
import { money, netWorth, fullName } from '../../core/state.js';
import { reputation as repSystem } from '../../systems/index.js';
import { careers, events, schools, items, crimes, skills } from '../../core/registry.js';

export function renderMore(app) {
  const s = app.state;

  return html`
    <div class="screen">
      ${appbar({ title: 'More' })}

      <div class="rows">
        ${row({ icon: '🎓', title: 'Education', sub: 'School, college and transcript',
                act: 'go', data: { route: 'education' } })}
        ${row({ icon: '💑', title: 'Relationships', sub: 'Family, friends and partners',
                act: 'go', data: { route: 'relationships' } })}
        ${row({ icon: '🛍️', title: 'Assets', sub: 'Possessions, cash and the shop',
                act: 'go', data: { route: 'assets' } })}
        ${row({ icon: '🕶️', title: 'Criminality', sub: 'Crime, heat and prison',
                act: 'go', data: { route: 'crime' } })}
        ${row({ icon: '💾', title: 'Save & load', sub: 'Three slots, plus autosave',
                act: 'go', data: { route: 'saves' } })}
      </div>

      ${sectionTitle('Life summary')}
      <div class="card card--pad">
        ${kv('Name', fullName(s))}
        ${kv('Born', `${s.character.birthYear} &middot; ${s.character.zodiac}`)}
        ${kv('Net worth', money(netWorth(s)), netWorth(s) >= 0 ? 'pos' : 'neg')}
        ${kv('Lifetime earned', money(s.economy.lifetimeEarned), 'pos')}
        ${kv('Fame', repSystem.tier(s.reputation.fame))}
        ${kv('Respect', `${Math.round(s.reputation.respect)}%`)}
        ${kv('Karma', String(Math.round(s.reputation.karma)),
             s.reputation.karma >= 0 ? 'pos' : 'neg')}
        ${kv('Highest degree', s.education.highestDegree ?? 'None')}
      </div>

      ${sectionTitle('Danger zone')}
      <div class="rows">
        ${row({ icon: '☠️', title: 'Start a new life',
                sub: 'Abandon this character and create another', act: 'confirmRestart', chevron: false })}
      </div>

      ${sectionTitle('About this demo', true)}
      <div class="card card--pad">
        <p class="row__sub">
          Phase 1 prototype. Content loaded at boot:
          ${careers.size} careers, ${events.size} events, ${schools.size} school stages,
          ${skills.size} skills, ${items.size} items and ${crimes.size} crimes &mdash;
          all registered as data, none of it hard-coded into a system.
        </p>
        <div class="divider"></div>
        ${row({ icon: '🧩', title: 'How it is built',
                sub: 'Architecture notes for the next phases', act: 'go', data: { route: 'about' } })}
      </div>
    </div>`;
}
