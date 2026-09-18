/** Save / load screen: three slots plus an export code. */
import { html, raw } from '../dom.js';
import { appbar, sectionTitle, emptyState } from '../components/common.js';
import { money } from '../../core/state.js';

const when = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' +
         d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

export function renderSaves(app) {
  const slots = app.saves.slots();
  const hasGame = !!app.engine.state;

  return html`
    <div class="screen">
      ${appbar({ title: 'Save & load', back: true })}

      ${!app.saves.available
        ? emptyState('⚠️', 'This browser is blocking local storage, so saving is disabled.')
        : ''}

      <div class="rows" style="margin-top:8px">
        ${slots.map((slot) => html`
          <div class="card slot">
            <div class="slot__head">
              <span class="slot__idx">${slot.index + 1}</span>
              <div style="flex:1">
                <p class="row__title">
                  ${slot.empty ? 'Empty slot' : `${slot.summary.avatar} ${slot.summary.name}`}
                  ${slot.isAutosave ? html`<span class="chip" style="margin-left:6px">auto</span>` : ''}
                </p>
                <p class="row__sub">
                  ${slot.empty ? 'Nothing saved here yet'
                    : `Age ${slot.summary.age} · ${slot.summary.job} · ${money(slot.summary.netWorth)}`}
                </p>
                ${slot.empty ? '' : html`<p class="row__sub" style="opacity:.6">${when(slot.savedAt)}
                  ${slot.summary.alive ? '' : ' · deceased'}</p>`}
              </div>
            </div>
            <div class="slot__actions">
              <button class="btn btn--sm" data-act="saveTo" data-slot="${slot.index}"
                      ${raw(hasGame ? '' : 'disabled')}>Save here</button>
              <button class="btn btn--sm btn--primary" data-act="loadFrom" data-slot="${slot.index}"
                      ${raw(slot.empty ? 'disabled' : '')}>Load</button>
              <button class="btn btn--sm btn--ghost" data-act="eraseSlot" data-slot="${slot.index}"
                      ${raw(slot.empty ? 'disabled' : '')}>Erase</button>
            </div>
          </div>`)}
      </div>

      ${sectionTitle('Portable save', true)}
      <div class="card card--pad">
        <p class="row__sub">
          A save is a single JSON snapshot of the whole state tree, so it survives new
          systems being added later. You can copy one out as a code and paste it back in.
        </p>
        <div class="slot__actions" style="margin-top:12px">
          <button class="btn btn--sm" data-act="exportSave" data-slot="0">Copy code</button>
          <button class="btn btn--sm" data-act="importSave" data-slot="1">Paste code</button>
        </div>
      </div>
    </div>`;
}
