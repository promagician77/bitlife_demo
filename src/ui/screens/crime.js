/** Crime, police heat and prison. */
import { html, style, raw } from '../dom.js';
import { appbar, row, sectionTitle, kv, emptyState } from '../components/common.js';
import { crimes } from '../../core/registry.js';
import { money } from '../../core/state.js';

function prisonPanel(s) {
  return html`
    <section class="hero" style="background-color:#3b1111">
      <div class="hero__row">
        <span class="avatar" aria-hidden="true">&#9939;&#65039;</span>
        <div>
          <p class="hero__name" style="font-size:19px">${s.prison.facility}</p>
          <p class="hero__meta"><span>Year ${s.prison.served} of ${s.prison.sentence}</span></p>
        </div>
      </div>
    </section>

    <div class="rows" style="margin-top:12px">
      ${row({ icon: '📋', title: 'Request parole',
              sub: 'Better odds the more of your sentence you have served', act: 'parole', chevron: false, right: 'Ask' })}
      ${row({ icon: '🏃', title: 'Attempt escape',
              sub: 'Fail and time gets added to your sentence', act: 'escape', chevron: false, right: 'Try' })}
    </div>`;
}

export function renderCrime(app) {
  const s = app.state;
  const heat = Math.round(s.crime.heat);

  return html`
    <div class="screen">
      ${appbar({ title: 'Criminality', back: true, right: raw(
        `<span class="pill ${heat >= 50 ? 'pill--danger' : 'pill--warn'}">&#128110; Heat ${heat}%</span>`) })}

      ${s.prison.inPrison ? prisonPanel(s) : html`
        <div class="card card--pad">
          <div class="stat" style="${style({ '--tone': 'var(--c-danger)' })}">
            <span class="stat__icon" aria-hidden="true">&#128110;</span>
            <span class="stat__body">
              <span class="stat__label">Police attention</span>
              <span class="stat__track"><span class="stat__fill" style="${style({ width: `${heat}%` })}"></span></span>
            </span>
            <span class="stat__val">${heat}%</span>
          </div>
          <p class="row__sub" style="margin-top:8px">
            Heat falls a little every year. Above 45% old cases can be reopened.
          </p>
        </div>

        ${sectionTitle('Commit a crime')}
        <div class="rows">
          ${crimes.all().map((def) => {
            const locked = s.character.age < (def.minAge ?? 10);
            return row({
              icon: def.icon, title: def.name,
              sub: locked ? `🔒 Minimum age ${def.minAge}`
                : `${def.desc} · ${money(def.payout[0])}–${money(def.payout[1])}`,
              right: locked ? '' : 'Do it',
              act: locked ? null : 'commitCrime', data: { crime: def.id },
              disabled: locked, chevron: false,
            });
          })}
        </div>`}

      ${sectionTitle('Criminal record', true)}
      <div class="card card--pad">
        ${kv('Arrests', String(s.crime.arrests))}
        ${kv('Convictions', String(s.crime.convictions))}
        ${kv('Notoriety', `${Math.round(s.crime.notoriety)}%`)}
      </div>

      ${s.crime.record.length ? html`
        <div class="card card--pad" style="margin-top:8px">
          ${s.crime.record.slice().reverse().slice(0, 12).map((r) =>
            kv(`Age ${r.age} &middot; ${r.label}`, r.outcome,
               r.outcome === 'got away with it' ? 'pos' : 'neg'))}
        </div>`
        : emptyState('🗂️', 'Your record is clean.')}
    </div>`;
}
