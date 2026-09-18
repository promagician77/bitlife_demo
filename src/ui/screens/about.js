/** Architecture notes — shown in the demo so the structure is visible. */
import { html } from '../dom.js';
import { appbar, sectionTitle } from '../components/common.js';
import { systems } from '../../systems/index.js';

export function renderAbout(app) {
  return html`
    <div class="screen">
      ${appbar({ title: 'How it is built', back: true })}

      <div class="card card--pad">
        <p class="row__sub">
          Phase 1 prototype of the life simulation. No framework and no build step:
          plain ES modules, so the folder deploys to any static host as-is.
        </p>
      </div>

      ${sectionTitle('The year pipeline')}
      <div class="card card--pad">
        <p class="row__sub" style="margin-bottom:10px">
          Pressing <strong>+1 Year</strong> runs every system in this order. Each one owns a
          single branch of state and talks to the others only through the event bus.
        </p>
        ${systems.filter((s) => s.onYear).map((s, i) => html`
          <div class="kv">
            <span class="kv__k">${i + 1}. ${s.id}</span>
            <span class="kv__v" style="opacity:.6">order ${s.order}</span>
          </div>`)}
      </div>

      ${sectionTitle('Adding content later')}
      <div class="card card--pad">
        <p class="row__sub">
          <strong>A new career</strong> — add a file to <code>src/content/careers/</code> and
          list it in that folder's <code>index.js</code>. Levels, salary, requirements and
          on-the-job tasks are all declared there.
        </p>
        <div class="divider"></div>
        <p class="row__sub">
          <strong>A new event</strong> — add it to any array under
          <code>src/content/events/</code>. Age gates, conditions, weights, choices and
          outcomes are data. Events never touch systems directly; they declare an effect
          object that <code>core/effects.js</code> applies.
        </p>
        <div class="divider"></div>
        <p class="row__sub">
          <strong>A new system</strong> — drop a module in <code>src/systems/</code> with an
          <code>id</code>, an <code>order</code> and an <code>onYear</code> hook, then add one
          line to <code>src/systems/index.js</code>. Its state branch is saved automatically.
        </p>
      </div>

      ${sectionTitle('Not in Phase 1')}
      <div class="card card--pad">
        <p class="row__sub">
          Marriage and children, property and mortgages, court and lawyers as a playable
          scene, health conditions as tracked entities, achievements, and the wider career
          catalogue. The seams for all of them are already in place.
        </p>
      </div>
    </div>`;
}
