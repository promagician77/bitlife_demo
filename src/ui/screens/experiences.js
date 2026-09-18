/** Activities and skill training. */
import { html, style, raw, attr } from '../dom.js';
import { appbar, row, sectionTitle } from '../components/common.js';
import { activities as activitySystem, skills as skillSystem } from '../../systems/index.js';
import { money } from '../../core/state.js';

export function renderExperiences(app) {
  const s = app.state;
  const acts = activitySystem.list(s);

  return html`
    <div class="screen">
      ${appbar({ title: 'Experiences', right: raw(
        `<span class="pill">&#9889; ${s.year.actionsLeft} energy</span>`) })}

      <p class="row__sub" style="padding:0 2px 8px">
        Each action costs one energy. Energy refills every year.
      </p>

      ${sectionTitle('Activities')}
      <div class="rows">
        ${acts.map((a) => {
          const gate = activitySystem.canRun(s, a.id);
          return row({
            icon: a.icon, title: a.name, tone: a.tone,
            sub: gate.ok ? a.desc : `🔒 ${gate.reason}`,
            right: a.cost ? money(a.cost) : 'Free',
            act: gate.ok ? 'runActivity' : null,
            data: { activity: a.id }, disabled: !gate.ok, chevron: false,
          });
        })}
      </div>

      ${sectionTitle('Skills')}
      <div class="grid2">
        ${skillSystem.all().map((skill) => {
          const level = Math.round(s.skills[skill.id] ?? 0);
          const locked = skill.minAge && s.character.age < skill.minAge;
          return html`
            <button class="tile" data-act="trainSkill" data-skill="${skill.id}"
                    style="${style({ '--tone': 'var(--accent-hi)' })}" ${attr('disabled', locked)}>
              <span class="tile__top">
                <span aria-hidden="true">${skill.icon}</span>
                <span class="tile__name">${skill.name}</span>
                <span class="tile__val">${level}</span>
              </span>
              <span class="stat__track">
                <span class="stat__fill" style="${style({ width: `${level}%`, '--tone': 'var(--accent-hi)' })}"></span>
              </span>
              <span class="row__sub">${locked ? `Unlocks at ${skill.minAge}`
                : skill.cost ? `Train · ${money(skill.cost)}` : 'Train · free'}</span>
            </button>`;
        })}
      </div>
    </div>`;
}
