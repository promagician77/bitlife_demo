/** End-of-life summary. */
import { html } from '../dom.js';
import { kv } from '../components/common.js';
import { fullName, money, netWorth } from '../../core/state.js';
import { reputation as repSystem } from '../../systems/index.js';

export function renderGameOver(app) {
  const s = app.state;
  const milestones = s.log.filter((e) => e.category === 'milestone');

  return html`
    <div class="screen gameover">
      <span class="gameover__icon" aria-hidden="true">&#9905;&#65039;</span>
      <h1 class="gameover__title">${fullName(s)}</h1>
      <p class="gameover__sub">
        ${s.character.birthYear} &ndash; ${s.character.birthYear + s.character.age}
        &middot; ${s.character.age} years<br />${s.character.causeOfDeath ?? ''}
      </p>

      <div class="card card--pad gameover__stats">
        ${kv('Net worth at death', money(netWorth(s)), netWorth(s) >= 0 ? 'pos' : 'neg')}
        ${kv('Lifetime earnings', money(s.economy.lifetimeEarned), 'pos')}
        ${kv('Highest degree', s.education.highestDegree ?? 'None')}
        ${kv('Jobs held', String(s.career.history.length + (s.career.employed ? 1 : 0)))}
        ${kv('Convictions', String(s.crime.convictions), s.crime.convictions ? 'neg' : '')}
        ${kv('Fame', repSystem.tier(s.reputation.fame))}
        ${kv('Karma', String(Math.round(s.reputation.karma)), s.reputation.karma >= 0 ? 'pos' : 'neg')}
        ${kv('Milestones', String(milestones.length))}
      </div>

      <div class="card card--pad gameover__stats">
        ${milestones.slice(-8).reverse().map((m) => html`
          <div class="kv">
            <span class="kv__k">${m.icon} ${m.text}</span>
            <span class="kv__v" style="opacity:.6">${m.age}</span>
          </div>`)}
      </div>

      <button class="btn btn--primary btn--block" data-act="restart">Start a new life</button>
      <button class="btn btn--ghost btn--block" data-act="go" data-route="life">Read the full story</button>
    </div>`;
}
