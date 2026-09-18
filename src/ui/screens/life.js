/** The life feed -- a scrollable timeline of everything that has happened. */
import { html, style, raw } from '../dom.js';
import { appbar, deltaChips, emptyState } from '../components/common.js';

export function renderLife(app) {
  const s = app.state;

  // Group entries by age, newest year first.
  const byAge = new Map();
  for (const entry of s.log) {
    if (!byAge.has(entry.age)) byAge.set(entry.age, []);
    byAge.get(entry.age).push(entry);
  }
  const ages = [...byAge.keys()].sort((a, b) => b - a);

  return html`
    <div class="screen">
      ${appbar({ title: 'Life', right:
        raw(`<span class="pill">&#128197; ${s.character.birthYear + s.character.age}</span>`) })}

      ${ages.length === 0 ? emptyState('📖', 'Your story starts here.') : ''}

      <div class="feed">
        ${ages.map((age) => html`
          <div class="feed__year">
            <span>Age ${age}</span>
            <span style="opacity:.6">&middot; ${s.character.birthYear + age}</span>
          </div>
          ${byAge.get(age).slice().reverse().map((entry) => html`
            <article class="entry" style="${style({ '--tone': entry.tone })}">
              <span class="entry__icon" aria-hidden="true">${entry.icon}</span>
              <div>
                <p class="entry__text">${entry.text}</p>
                ${deltaChips(entry.deltas)}
              </div>
            </article>`)}
        `)}
      </div>
    </div>`;
}
