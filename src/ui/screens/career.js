/** Career hub: current job, job tasks, and the job market. */
import { html, style } from '../dom.js';
import { art } from '../art.js';
import { appbar, walletPills, row, sectionTitle, emptyState, kv } from '../components/common.js';
import { careers } from '../../core/registry.js';
import { money } from '../../core/state.js';
import { career as careerSystem } from '../../systems/index.js';

function currentJobCard(app) {
  const s = app.state;
  const def = careers.get(s.career.jobId);
  if (!def) return '';
  const level = def.levels[s.career.levelIndex];
  const next = def.levels[s.career.levelIndex + 1];
  const pct = next ? Math.min(100, Math.round((s.career.xp / (level.xpToNext ?? 500)) * 100)) : 100;

  return html`
    <section class="banner" style="${style({ 'background-color': def.tone })}">
      ${art(def.scene ?? 'city')}
      <span class="banner__scrim"></span>
      <div class="banner__text">
        <p class="banner__title">${def.name}</p>
        <p class="banner__sub">${def.blurb}</p>
      </div>
    </section>
    <p class="lead">${def.description}</p>

    <div class="card joblevel" style="margin-top:14px">
      <div class="joblevel__top">
        <span class="joblevel__badge" aria-hidden="true">&#127894;</span>
        <div style="flex:1">
          <p class="row__title">${level.title}</p>
          <p class="row__sub">${money(s.economy.salary)} / year &middot; ${s.career.yearsAtJob} yr in role</p>
        </div>
        <div class="joblevel__next">
          ${next ? html`<span style="opacity:.7">Next</span><br /><strong>${next.title}</strong>`
                 : html`<strong>Top of the ladder</strong>`}
        </div>
      </div>
      <div class="xpbar"><span style="${style({ width: `${pct}%` })}"></span></div>
      <p class="row__sub">${next
        ? `${s.career.xp} / ${level.xpToNext} XP · performance ${Math.round(s.career.performance)}%`
        : `Performance ${Math.round(s.career.performance)}%`}</p>
    </div>

    ${sectionTitle('Tasks for the job')}
    <div class="rows">
      ${(def.tasks ?? []).map((task) => html`
        <div class="row">
          <span class="row__icon" aria-hidden="true">${task.icon ?? def.icon}</span>
          <span class="row__body">
            <span class="row__title">${task.name}</span>
            <span class="row__sub">${task.desc}</span>
          </span>
          <button class="btn btn--primary btn--sm" data-act="jobTask" data-task="${task.id}">Start</button>
        </div>`)}
    </div>

    ${sectionTitle('Career choices')}
    <div class="rows">
      ${row({ icon: '💵', title: 'Ask for a raise', sub: 'Depends on performance and charisma',
              act: 'askRaise' })}
      ${row({ icon: '⏰', title: 'Work harder', sub: 'Performance and XP up, health down',
              act: 'workHarder' })}
      ${row({ icon: '👋', title: 'Quit your job', sub: 'Walk away with nothing lined up',
              act: 'quitJob' })}
    </div>`;
}

function jobMarket(app) {
  const s = app.state;
  const list = careers.all().map((def) => ({ def, gate: careerSystem.canApply(s, def.id) }));

  return html`
    ${sectionTitle(s.career.employed ? 'Other openings' : 'Open positions')}
    <div class="rows">
      ${list.map(({ def, gate }) => row({
        icon: def.icon,
        title: def.name,
        sub: gate.ok
          ? `${def.blurb} · starts at ${money(def.levels[0].salary)}`
          : `🔒 ${gate.reason}`,
        right: gate.ok ? 'Apply' : '',
        act: gate.ok ? 'applyJob' : null,
        data: { job: def.id },
        disabled: !gate.ok,
        chevron: false,
      }))}
    </div>`;
}

export function renderCareer(app) {
  const s = app.state;
  return html`
    <div class="screen">
      ${appbar({ title: 'Career', right: walletPills(s) })}
      ${s.prison.inPrison
        ? emptyState('⛓️', 'You cannot work while you are incarcerated.')
        : html`
            ${s.career.employed ? currentJobCard(app) : emptyState('💼', 'You do not have a job yet.')}
            ${jobMarket(app)}
            ${s.career.history.length ? html`
              ${sectionTitle('Work history', true)}
              <div class="card card--pad">
                ${s.career.history.slice().reverse().map((h) =>
                  kv(h.title, `${h.years} yr &middot; left at ${h.endedAtAge}`))}
              </div>` : ''}
          `}
    </div>`;
}
