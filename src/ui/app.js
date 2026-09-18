/**
 * The UI shell: routing, action dispatch, modals and toasts.
 *
 * Everything below this line is presentation. It reads state and calls system
 * methods; it never mutates state itself. Swapping this folder for React
 * Native would leave src/core and src/systems untouched.
 */
import { html, raw, mount, delegate } from './dom.js';
import { sheet } from './components/sheet.js';
import { schools } from '../core/registry.js';
import { PLACES } from '../content/names.js';

import { renderCreate }        from './screens/create.js';
import { renderHome }          from './screens/home.js';
import { renderLife }          from './screens/life.js';
import { renderCareer }        from './screens/career.js';
import { renderExperiences }   from './screens/experiences.js';
import { renderMore }          from './screens/more.js';
import { renderEducation }     from './screens/education.js';
import { renderRelationships } from './screens/relationships.js';
import { renderAssets }        from './screens/assets.js';
import { renderCrime }         from './screens/crime.js';
import { renderSaves }         from './screens/saves.js';
import { renderAbout }         from './screens/about.js';
import { renderGameOver }      from './screens/gameover.js';

import {
  career as careerSystem, education as eduSystem, relationships as relSystem,
  activities as activitySystem, skills as skillSystem, inventory as invSystem,
  crime as crimeSystem, prison as prisonSystem, economy as economySystem,
  save as saveSystem,
} from '../systems/index.js';

const TABS = [
  { route: 'home',        label: 'Home',        icon: '🏠' },
  { route: 'career',      label: 'Career',      icon: '💼' },
  { route: 'life',        label: 'Life',        icon: '👤' },
  { route: 'experiences', label: 'Experiences', icon: '⭐' },
  { route: 'more',        label: 'More',        icon: '⚙️' },
];

const SCREENS = {
  create: renderCreate, home: renderHome, life: renderLife, career: renderCareer,
  experiences: renderExperiences, more: renderMore, education: renderEducation,
  relationships: renderRelationships, assets: renderAssets, crime: renderCrime,
  saves: renderSaves, about: renderAbout, gameover: renderGameOver,
};

/** Routes that are reachable without a living character. */
const PUBLIC_ROUTES = new Set(['create', 'saves', 'about', 'gameover']);

export class App {
  constructor(engine) {
    this.engine = engine;
    this.saves = saveSystem;
    this.route = 'create';
    this.history = [];
    this.sheetCfg = null;
    this.draft = { firstName: '', lastName: '', gender: 'random', country: 'random' };

    this.el = {
      app: document.getElementById('app'),
      tabbar: document.getElementById('tabbar'),
      modal: document.getElementById('modalRoot'),
      toast: document.getElementById('toastRoot'),
    };

    this._bind();
  }

  get state() { return this.engine.state; }
  get ctx() { return this.engine.ctx; }

  /* ── routing ───────────────────────────────────────────────────────────── */

  go(route, { replace = false } = {}) {
    if (!SCREENS[route]) return;
    if (!replace && this.route !== route) this.history.push(this.route);
    this.route = route;
    this.closeSheet(false);
    this.render();
    this.el.app.scrollTop = 0;
  }

  back() {
    const previous = this.history.pop();
    this.route = previous && SCREENS[previous] ? previous : 'home';
    this.closeSheet(false);
    this.render();
  }

  /* ── rendering ─────────────────────────────────────────────────────────── */

  render() {
    if (this.state && !this.state.character.alive && !PUBLIC_ROUTES.has(this.route)) {
      this.route = 'gameover';
    }
    const screen = SCREENS[this.route] ?? renderHome;
    mount(this.el.app, screen(this));
    this._renderTabbar();
    this._renderSheet();
  }

  _renderTabbar() {
    const showTabs = !!this.state && this.route !== 'create' && this.route !== 'gameover';
    this.el.tabbar.hidden = !showTabs;
    if (!showTabs) { this.el.tabbar.innerHTML = ''; return; }

    const s = this.state;
    const blocked = this.engine.prompts.length > 0;

    mount(this.el.tabbar, html`
      ${TABS.slice(0, 2).map((t) => this._tab(t))}
      <button class="agebtn" data-act="advanceYear" aria-label="Advance one year"
              ${raw(blocked ? 'disabled' : '')}>
        <span class="agebtn__num">${s.character.age + 1}</span>
        <span class="agebtn__cap">+1 YR</span>
      </button>
      ${TABS.slice(3).map((t) => this._tab(t))}`);
  }

  _tab({ route, label, icon }) {
    const current = this.route === route;
    return html`
      <button class="tab" data-act="go" data-route="${route}"
              ${raw(current ? 'aria-current="page"' : '')}>
        <span class="tab__icon" aria-hidden="true">${icon}</span>
        <span class="tab__label">${label}</span>
      </button>`;
  }

  _renderSheet() {
    if (!this.sheetCfg) { this.el.modal.innerHTML = ''; return; }
    mount(this.el.modal, sheet(this.sheetCfg));
  }

  openSheet(cfg) { this.sheetCfg = cfg; this._renderSheet(); }

  closeSheet(rerender = true) {
    this.sheetCfg = null;
    this.el.modal.innerHTML = '';
    if (rerender) this.render();
  }

  toast(message, kind = '') {
    const el = document.createElement('div');
    el.className = `toast${kind ? ` toast--${kind}` : ''}`;
    el.textContent = message;
    this.el.toast.append(el);
    setTimeout(() => el.remove(), 2600);
  }

  /** Show the result of a system call as a toast. */
  report(result, fallback = '') {
    if (!result) return;
    if (result.ok) this.toast(result.message ?? fallback ?? 'Done', 'good');
    else this.toast(result.reason ?? 'That did not work.', 'bad');
  }

  /* ── the year loop ─────────────────────────────────────────────────────── */

  advanceYear() {
    if (this.engine.prompts.length) { this._showNextPrompt(); return; }
    const result = this.engine.advanceYear();

    if (!this.state.character.alive) { this.go('gameover', { replace: true }); return; }

    this.go('life', { replace: this.route === 'life' });
    if (result.prompts.length) this._showNextPrompt();
  }

  _showNextPrompt() {
    const prompt = this.engine.prompts[0];
    if (!prompt) { this.render(); return; }
    this.openSheet({
      icon: prompt.icon,
      title: prompt.title,
      text: prompt.text,
      dismissible: false,
      actions: prompt.choices.map((c, i) => ({
        label: c.label, hint: c.hint, act: 'choosePrompt', data: { index: i },
        variant: i === 0 ? 'primary' : null,
      })),
    });
  }

  _choosePrompt(index) {
    const outcome = this.engine.resolvePrompt(Number(index));
    if (outcome) {
      this.openSheet({
        icon: outcome.icon, title: 'What happened', text: outcome.text,
        deltas: outcome.deltas, dismissible: false,
        actions: [{ label: 'Continue', act: 'afterPrompt', variant: 'primary' }],
      });
    } else {
      this._afterPrompt();
    }
  }

  _afterPrompt() {
    this.closeSheet(false);
    if (this.engine.prompts.length) this._showNextPrompt();
    else this.render();
  }

  /**
   * Run a player action that costs energy.
   *
   * The budget is checked first and only deducted once the action has actually
   * happened, so a system's own guard never sees a key this call just consumed.
   *
   * "Happened" means a life-feed entry was written. Every system logs whatever
   * it actually did — including failures like a botched crime or a rejected job
   * application, which should still cost the year — while guard clauses return
   * early without logging. So the log length is an accurate, system-agnostic
   * signal, and no system needs to know the action budget exists.
   */
  _spend(onceKey, fn) {
    const gate = this.engine.canSpendAction(onceKey);
    if (!gate.ok) { this.toast(gate.reason, 'bad'); return; }

    const entriesBefore = this.state.log.length;
    const result = fn();
    const happened = this.state.log.length > entriesBefore || result?.ok === true;
    if (happened) this.engine.commitAction(onceKey);

    this.report(result);
    this.render();
  }

  /* ── event wiring ──────────────────────────────────────────────────────── */

  _bind() {
    const root = document.body;

    // Keep the create-screen form in sync without re-rendering on every keypress.
    root.addEventListener('input', (ev) => {
      const field = ev.target.closest('[data-field]');
      if (field) this.draft[field.dataset.field] = field.value;
    });

    delegate(root, {
      /* navigation ------------------------------------------------------- */
      go: ({ route }) => this.go(route),
      back: () => this.back(),
      closeSheet: () => this.closeSheet(),

      /* character creation ----------------------------------------------- */
      setGender: ({ gender }) => { this.draft.gender = gender; this.render(); },
      startLife: () => this._startLife(),
      restart: () => { this.history = []; this.go('create', { replace: true }); },
      confirmRestart: () => this.openSheet({
        icon: '☠️', title: 'Start a new life?',
        text: 'This character will be abandoned. Your autosave will be overwritten on the next year.',
        actions: [{ label: 'Yes, start over', act: 'restart', variant: 'danger' }],
      }),

      /* the year --------------------------------------------------------- */
      advanceYear: () => this.advanceYear(),
      choosePrompt: ({ index }) => this._choosePrompt(index),
      afterPrompt: () => this._afterPrompt(),

      /* career ------------------------------------------------------------ */
      applyJob: ({ job }) => this._spend(`apply:${job}`, () => careerSystem.apply(this.ctx, job)),
      jobTask: ({ task }) => this._spend(`task:${task}`, () => careerSystem.runTask(this.ctx, task)),
      askRaise: () => this._spend('raise', () => careerSystem.askForRaise(this.ctx)),
      workHarder: () => this._spend('workHarder', () => careerSystem.workHarder(this.ctx)),
      quitJob: () => this.openSheet({
        icon: '👋', title: 'Quit your job?', text: 'You will have no income until you find something else.',
        actions: [{ label: 'Quit', act: 'quitJobConfirm', variant: 'danger' }],
      }),
      quitJobConfirm: () => { this.report(careerSystem.quit(this.ctx)); this.closeSheet(); },

      /* education --------------------------------------------------------- */
      study: () => this._spend('study', () => eduSystem.study(this.ctx)),
      dropOut: () => this.openSheet({
        icon: '🚪', title: 'Drop out?', text: 'You will leave without a qualification.',
        actions: [{ label: 'Drop out', act: 'dropOutConfirm', variant: 'danger' }],
      }),
      dropOutConfirm: () => { this.report(eduSystem.dropOut(this.ctx)); this.closeSheet(); },
      enrollPick: ({ school }) => this._pickMajor(school),
      enrollConfirm: ({ school, major }) => {
        this.report(eduSystem.enroll(this.ctx, school, major === '-' ? null : major));
        this.closeSheet();
      },

      /* relationships ------------------------------------------------------ */
      openRelationship: ({ rel }) => this._relationshipSheet(rel),
      relAct: ({ rel, kind }) => {
        this.closeSheet(false);
        this._spend(`rel:${rel}:${kind}`, () => relSystem.interact(this.ctx, rel, kind));
      },
      findLove: () => this._spend('findLove', () => relSystem.findLove(this.ctx)),
      breakUp: ({ rel }) => { this.report(relSystem.breakUp(this.ctx, rel)); this.closeSheet(); },

      /* activities and skills ---------------------------------------------- */
      runActivity: ({ activity }) => {
        const def = activitySystem.list(this.state).find((a) => a.id === activity);
        this._spend(def?.onceKey ?? `act:${activity}`, () => activitySystem.run(this.ctx, activity));
      },
      trainSkill: ({ skill }) => this._spend(`train:${skill}`, () => skillSystem.train(this.ctx, skill)),

      /* assets ------------------------------------------------------------- */
      buyItem: ({ item }) => { this.report(invSystem.buy(this.ctx, item)); this.render(); },
      sellItem: ({ uid }) => { this.report(invSystem.sell(this.ctx, uid)); this.render(); },
      payDebt: () => {
        this.report(economySystem.payDebt(this.ctx, this.state.economy.cash));
        this.render();
      },

      /* crime -------------------------------------------------------------- */
      commitCrime: ({ crime }) => this._spend(`crime:${crime}`, () => crimeSystem.commit(this.ctx, crime)),
      parole: () => this._spend('parole', () => prisonSystem.requestParole(this.ctx)),
      escape: () => this._spend('escape', () => prisonSystem.attemptEscape(this.ctx)),

      /* saves --------------------------------------------------------------- */
      saveTo: ({ slot }) => {
        this.report(this.saves.write(Number(slot), this.state), 'Saved.');
        this.render();
      },
      loadFrom: ({ slot }) => {
        const payload = this.saves.read(Number(slot));
        if (!payload) { this.toast('That slot is empty.', 'bad'); return; }
        this.engine.loadState(payload.state);
        this.history = [];
        this.toast('Life loaded.', 'good');
        this.go(this.state.character.alive ? 'home' : 'gameover', { replace: true });
      },
      eraseSlot: ({ slot }) => this.openSheet({
        icon: '🗑️', title: `Erase slot ${Number(slot) + 1}?`,
        text: 'This cannot be undone.',
        actions: [{ label: 'Erase', act: 'eraseConfirm', data: { slot }, variant: 'danger' }],
      }),
      eraseConfirm: ({ slot }) => { this.saves.erase(Number(slot)); this.closeSheet(); },
      exportSave: ({ slot }) => {
        const code = this.saves.exportSlot(Number(slot));
        if (!code) { this.toast('Nothing to export.', 'bad'); return; }
        navigator.clipboard?.writeText(code)
          .then(() => this.toast('Save code copied to clipboard.', 'good'))
          .catch(() => window.prompt('Copy this save code:', code));
      },
      importSave: ({ slot }) => {
        const code = window.prompt('Paste a LifeQuest save code:');
        if (!code) return;
        this.report(this.saves.importString(Number(slot), code.trim()), 'Save imported.');
        this.render();
      },
    });
  }

  /* ── sheets that need state ────────────────────────────────────────────── */

  _startLife() {
    const d = this.draft;
    this.engine.newGame({
      firstName: d.firstName,
      lastName: d.lastName,
      gender: d.gender === 'random' ? undefined : d.gender,
      place: d.country === 'random' ? undefined : PLACES.find((p) => p.country === d.country),
    });
    this.history = [];
    this.go('home', { replace: true });
    this.toast('A new life begins.', 'good');
  }

  _pickMajor(schoolId) {
    const school = schools.get(schoolId);
    const majors = school?.majors ?? [];
    if (!majors.length) {
      this.report(eduSystem.enroll(this.ctx, schoolId, null));
      this.render();
      return;
    }
    this.openSheet({
      icon: school.icon, title: school.label,
      text: `Choose what you want to study. ${school.tuition
        ? `Tuition is $${school.tuition.toLocaleString('en-US')} a year.` : ''}`,
      actions: majors.map((m) => ({
        label: m, act: 'enrollConfirm', data: { school: schoolId, major: m },
      })),
    });
  }

  _relationshipSheet(relId) {
    const rel = relSystem.find(this.state, relId);
    if (!rel) return;
    const actions = [
      { label: 'Spend time together', act: 'relAct', data: { rel: relId, kind: 'time' }, variant: 'primary' },
      { label: 'Compliment them', act: 'relAct', data: { rel: relId, kind: 'compliment' } },
      { label: 'Start an argument', act: 'relAct', data: { rel: relId, kind: 'argue' } },
    ];
    if (rel.kind === 'family') {
      actions.push({ label: 'Ask for money', act: 'relAct', data: { rel: relId, kind: 'money' } });
    }
    if (rel.kind === 'romance') {
      actions.push({ label: 'Break up', act: 'breakUp', data: { rel: relId }, variant: 'danger' });
    }
    this.openSheet({
      icon: rel.icon,
      title: rel.name,
      text: `${rel.type.charAt(0).toUpperCase() + rel.type.slice(1)} · ${rel.age} years old · ${Math.round(rel.closeness)}% close`,
      actions,
    });
  }
}
