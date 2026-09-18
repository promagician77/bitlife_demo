/** Character creation. */
import { html, raw } from '../dom.js';
import { PLACES } from '../../content/names.js';

export function renderCreate(app) {
  const d = app.draft;
  const hasSaves = app.saves.slots().some((s) => !s.empty);

  return html`
    <div class="screen create">
      <div>
        <p class="create__logo">LifeQuest</p>
        <p class="create__sub">Phase 1 prototype &middot; one life at a time</p>
      </div>

      <div class="field">
        <label class="field__label" for="fn">First name</label>
        <input class="input" id="fn" data-field="firstName" value="${d.firstName}"
               placeholder="Leave blank to randomise" autocomplete="off" maxlength="18" />
      </div>

      <div class="field">
        <label class="field__label" for="ln">Last name</label>
        <input class="input" id="ln" data-field="lastName" value="${d.lastName}"
               placeholder="Leave blank to randomise" autocomplete="off" maxlength="18" />
      </div>

      <div class="field">
        <span class="field__label">Gender</span>
        <div class="segment" role="group" aria-label="Gender">
          ${['male', 'female', 'random'].map((g) => html`
            <button type="button" data-act="setGender" data-gender="${g}"
                    aria-pressed="${String(d.gender === g)}">
              ${g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Random'}
            </button>`)}
        </div>
      </div>

      <div class="field">
        <label class="field__label" for="country">Where you grow up</label>
        <select class="input" id="country" data-field="country">
          <option value="random"${d.country === 'random' ? ' selected' : ''}>Anywhere</option>
          ${PLACES.map((p) => raw(
            `<option value="${p.country}"${d.country === p.country ? ' selected' : ''}>${p.country}</option>`))}
        </select>
      </div>

      <p class="roll-note">
        Health, looks, fitness and intelligence are rolled, not chosen.
        Every life starts differently.
      </p>

      <button class="btn btn--primary btn--block" data-act="startLife">Start your life</button>
      ${hasSaves ? html`
        <button class="btn btn--ghost btn--block" data-act="go" data-route="saves">Continue a saved life</button>` : ''}
      <button class="btn btn--ghost btn--block" data-act="go" data-route="about">How this demo is built</button>
    </div>`;
}
