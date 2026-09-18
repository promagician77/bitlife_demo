/** Education screen: current enrolment, available schools, transcript. */
import { html, style, raw } from '../dom.js';
import { appbar, row, sectionTitle, kv, emptyState } from '../components/common.js';
import { schools } from '../../core/registry.js';
import { education as eduSystem } from '../../systems/index.js';
import { money } from '../../core/state.js';

export function renderEducation(app) {
  const s = app.state;
  const edu = s.education;
  const stage = edu.stage !== 'none' ? schools.get(edu.stage) : null;

  return html`
    <div class="screen">
      ${appbar({ title: 'Education', back: true, right: raw(
        `<span class="pill">&#127891; ${eduSystem.gradeLetter(edu.grades)}</span>`) })}

      ${stage ? html`
        <div class="card joblevel">
          <div class="joblevel__top">
            <span class="joblevel__badge" aria-hidden="true">${stage.icon}</span>
            <div style="flex:1">
              <p class="row__title">${stage.label}</p>
              <p class="row__sub">Year ${edu.yearInStage} of ${stage.years}${edu.major ? ` · ${edu.major}` : ''}</p>
            </div>
            <div class="joblevel__next">
              <span style="opacity:.7">Grade</span><br /><strong>${Math.round(edu.grades)}%</strong>
            </div>
          </div>
          <div class="xpbar">
            <span style="${style({ width: `${Math.round((edu.yearInStage / stage.years) * 100)}%` })}"></span>
          </div>
        </div>

        <div class="rows" style="margin-top:12px">
          ${row({ icon: '📚', title: 'Study hard', sub: 'Grades up, happiness down', act: 'study' })}
          ${row({ icon: '🚪', title: 'Drop out', sub: 'Leave without a qualification', act: 'dropOut' })}
        </div>
      ` : emptyState('🏫', s.character.age < 5
          ? 'You are not old enough for school yet.'
          : 'You are not enrolled anywhere right now.')}

      ${sectionTitle('Apply to study')}
      <div class="rows">
        ${schools.all().filter((sc) => !sc.auto).map((sc) => {
          const gate = eduSystem.canEnroll(s, sc.id);
          return row({
            icon: sc.icon, title: sc.label,
            sub: gate.ok
              ? `${sc.years} years · ${sc.tuition ? `${money(sc.tuition)} a year` : 'free'}`
              : `🔒 ${gate.reason}`,
            right: gate.ok ? 'Apply' : '',
            act: gate.ok ? 'enrollPick' : null,
            data: { school: sc.id }, disabled: !gate.ok, chevron: false,
          });
        })}
      </div>

      ${edu.transcript.length ? html`
        ${sectionTitle('Transcript', true)}
        <div class="card card--pad">
          ${edu.transcript.slice().reverse().map((t) => kv(
            `${t.label}${t.major ? ` &middot; ${t.major}` : ''}`,
            t.graduated ? `${t.letter} &middot; ${t.year}` : (t.dropped ? 'Dropped out' : 'Failed'),
            t.graduated ? 'pos' : 'neg'))}
        </div>` : ''}
    </div>`;
}
