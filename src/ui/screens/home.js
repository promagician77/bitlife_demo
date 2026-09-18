/** Home / profile screen. */
import { html, raw } from '../dom.js';
import { appbar, walletPills, statList, menuRow } from '../components/common.js';
import { fullName, money, netWorth } from '../../core/state.js';
import { careers } from '../../core/registry.js';

function occupation(state) {
  if (state.prison.inPrison) return `Inmate — ${state.prison.facility}`;
  if (state.career.employed) {
    const def = careers.get(state.career.jobId);
    return def ? def.levels[state.career.levelIndex].title : 'Employed';
  }
  if (state.education.stage !== 'none') return 'Student';
  return state.character.age < 6 ? 'Child' : 'Unemployed';
}

export function renderHome(app) {
  const s = app.state;

  return html`
    <div class="screen">
      ${appbar({
        title: 'LifeQuest',
        right: raw('<button class="iconbtn iconbtn--gold" data-act="go" data-route="saves" aria-label="Saves">&#128190;</button>'),
      })}

      <section class="hero">
        <div class="hero__row">
          <span class="avatar" aria-hidden="true">${s.character.avatar}</span>
          <div>
            <p class="hero__name">${fullName(s)}</p>
            <p class="hero__meta">
              <span>Age: ${s.character.age}</span>
              <span>${s.character.city}, ${s.character.country}</span>
            </p>
            <p class="hero__meta"><span>&#128188; ${occupation(s)}</span></p>
          </div>
        </div>
        <div class="hero__wallet">
          ${walletPills(s)}
          <span class="pill">&#9889; ${s.year.actionsLeft} energy</span>
        </div>
      </section>

      <div class="card home__stats">${statList(s)}</div>

      <h2 class="section-title">What would you like to do?</h2>
      <div class="home__menu">
        ${menuRow({ scene: 'city', icon: '🏢', title: 'Career', tone: '#16325c',
          sub: 'Find a job or climb the ladder', act: 'go', data: { route: 'career' } })}
        ${menuRow({ scene: 'campus', icon: '🎓', title: 'Education', tone: '#1d3f52',
          sub: 'School, college and university', act: 'go', data: { route: 'education' } })}
        ${menuRow({ scene: 'romance', icon: '💑', title: 'Relationships', tone: '#4a1f3d',
          sub: `Family, friends and partners (${s.relationships.filter((r) => r.alive).length})`,
          act: 'go', data: { route: 'relationships' } })}
        ${menuRow({ scene: 'training', icon: '🎯', title: 'Activities & skills', tone: '#1f3d2f',
          sub: 'Gym, study, meditate, train a skill', act: 'go', data: { route: 'experiences' } })}
        ${menuRow({ scene: 'market', icon: '🛍️', title: 'Assets', tone: '#3a2f16',
          sub: `Shop and own things · net worth ${money(netWorth(s))}`,
          act: 'go', data: { route: 'assets' } })}
        ${menuRow({ scene: 'night', icon: '🕶️', title: 'Criminality', tone: '#4a1d1d',
          sub: s.prison.inPrison ? 'You are currently incarcerated' : 'Take part in crime, or stay on the right side',
          act: 'go', data: { route: 'crime' },
          badge: s.crime.heat >= 50 ? 'HEAT' : null })}
      </div>
    </div>`;
}

export { occupation };
