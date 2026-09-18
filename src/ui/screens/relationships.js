/** Relationships screen. */
import { html, style, raw } from '../dom.js';
import { appbar, sectionTitle, emptyState } from '../components/common.js';
import { relationships as relSystem } from '../../systems/index.js';

const TONE = { family: 'var(--c-health)', friend: 'var(--accent-hi)', romance: 'var(--c-popularity)' };

const relRow = (rel) => html`
  <button class="row" data-act="openRelationship" data-rel="${rel.id}">
    <span class="row__icon" aria-hidden="true">${rel.icon}</span>
    <span class="row__body">
      <span class="row__title">${rel.name}</span>
      <span class="row__sub">${rel.type.charAt(0).toUpperCase() + rel.type.slice(1)} &middot; ${rel.age} years old</span>
      <span class="rel__meter" style="${style({ '--tone': TONE[rel.kind] })}">
        <span style="${style({ width: `${Math.round(rel.closeness)}%` })}"></span>
      </span>
    </span>
    <span class="row__right">${Math.round(rel.closeness)}%</span>
  </button>`;

export function renderRelationships(app) {
  const s = app.state;
  const family = relSystem.list(s, 'family');
  const romance = relSystem.list(s, 'romance');
  const friends = relSystem.list(s, 'friend');

  return html`
    <div class="screen">
      ${appbar({ title: 'Relationships', back: true, right: raw(
        `<span class="pill">&#127775; ${Math.round(s.stats.popularity)}%</span>`) })}

      ${romance.length ? html`${sectionTitle('Partner')}<div class="rows">${romance.map(relRow)}</div>`
        : s.character.age >= 16 ? html`
            <div class="rows">
              <button class="row" data-act="findLove">
                <span class="row__icon" aria-hidden="true">&#128147;</span>
                <span class="row__body">
                  <span class="row__title">Look for love</span>
                  <span class="row__sub">Depends on looks, popularity and charisma</span>
                </span>
                <span class="row__chev" aria-hidden="true">&#8250;</span>
              </button>
            </div>` : ''}

      ${sectionTitle('Family')}
      <div class="rows">
        ${family.length ? family.map(relRow) : emptyState('🕊️', 'No living family.')}
      </div>

      ${sectionTitle('Friends')}
      <div class="rows">
        ${friends.length ? friends.map(relRow)
          : emptyState('👥', 'You have not made friends yet. School and work help.')}
      </div>
    </div>`;
}
