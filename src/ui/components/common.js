/** Shared UI building blocks used across screens. */
import { html, raw, style, attr } from '../dom.js';
import { art, hasArt } from '../art.js';
import { STAT_META, money } from '../../core/state.js';

/** `right` must be markup produced by html`` or raw(). */
export const appbar = ({ title, back = null, right = '' }) => html`
  <header class="appbar">
    ${back ? html`<button class="iconbtn" data-act="back" aria-label="Back">&#8249;</button>` : ''}
    <h1 class="appbar__title">${title}</h1>
    <span class="appbar__spacer"></span>
    ${right}
  </header>`;

export const walletPills = (state) => html`
  <span class="wallet">
    <span class="pill pill--money">&#128176; ${money(state.economy.cash)}</span>
    ${state.economy.debt > 0
      ? html`<span class="pill pill--danger">&#9888;&#65039; ${money(state.economy.debt)}</span>`
      : ''}
  </span>`;

/** One labelled stat bar. */
export const statBar = (key, value) => {
  const meta = STAT_META[key];
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return html`
    <div class="stat" style="${style({ '--tone': meta.tone })}">
      <span class="stat__icon" aria-hidden="true">${meta.icon}</span>
      <span class="stat__body">
        <span class="stat__label">${meta.label}</span>
        <span class="stat__track"><span class="stat__fill" style="${style({ width: `${pct}%` })}"></span></span>
      </span>
      <span class="stat__val">${pct}%</span>
    </div>`;
};

/** The full stat block, with money shown as a value rather than a bar %. */
export const statList = (state, keys = Object.keys(STAT_META)) => html`
  <div class="stats">${keys.map((k) => statBar(k, state.stats[k]))}</div>`;

/**
 * A tappable list row.
 * @param {{icon,title,sub,right,act,data,disabled,tone,chevron}} opts
 */
export const row = ({ icon, title, sub, right, act, data = {}, disabled = false, tone, chevron = true }) => html`
  <button class="row" data-act="${act ?? ''}"
          ${raw(Object.entries(data).map(([k, v]) => `data-${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' '))}
          ${attr('disabled', disabled || !act)}>
    ${icon ? html`<span class="row__icon" style="${style({ '--tone-bg': tone })}" aria-hidden="true">${icon}</span>` : ''}
    <span class="row__body">
      <span class="row__title">${title}</span>
      ${sub ? html`<span class="row__sub">${sub}</span>` : ''}
    </span>
    ${right ? html`<span class="row__right">${raw(right)}</span>` : ''}
    ${chevron && act ? html`<span class="row__chev" aria-hidden="true">&#8250;</span>` : ''}
  </button>`;

/**
 * Illustrated menu row, as on the home screen.
 * `scene` names an entry in ui/art.js; `icon` is the emoji fallback.
 */
export const menuRow = ({ icon, scene, title, sub, act, data = {}, tone, badge }) => html`
  <button class="menu-row" data-act="${act}" style="${style({ '--tone-bg': tone })}"
          ${raw(Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' '))}>
    <span class="menu-row__art" aria-hidden="true">${scene && hasArt(scene) ? art(scene) : icon}</span>
    <span class="row__body">
      <span class="row__title">${title}</span>
      <span class="row__sub">${sub}</span>
    </span>
    ${badge ? html`<span class="menu-row__badge">${badge}</span>` : ''}
    <span class="row__chev" aria-hidden="true">&#8250;</span>
  </button>`;

export const emptyState = (icon, text) => html`
  <p class="empty"><span class="empty__icon" aria-hidden="true">${icon}</span>${text}</p>`;

export const kv = (label, value, cls = '') => html`
  <div class="kv"><span class="kv__k">${label}</span><span class="kv__v ${cls}">${raw(value)}</span></div>`;

export const sectionTitle = (text, small = false) =>
  html`<h2 class="section-title${small ? ' section-title--sm' : ''}">${text}</h2>`;

/** Render the delta chips attached to a feed entry. */
export const deltaChips = (deltas = []) => deltas.length
  ? html`<span class="entry__delta">${deltas.map((d) => html`
      <span class="delta ${d.amount > 0 ? 'delta--up' : 'delta--down'}">${d.label}</span>`)}</span>`
  : '';
