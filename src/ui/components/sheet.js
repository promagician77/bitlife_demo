/** Bottom-sheet modal used for events, confirmations and sub-menus. */
import { html, raw } from '../dom.js';
import { deltaChips } from './common.js';

/**
 * @param {{icon, title, text, actions:Array<{label,act,data,variant,hint}>, deltas, dismissible}} cfg
 */
export const sheet = (cfg) => html`
  <div class="sheet" role="dialog" aria-modal="true" aria-label="${cfg.title ?? 'Dialog'}">
    <div class="sheet__grip"></div>
    ${cfg.icon ? html`<p class="sheet__icon" aria-hidden="true">${cfg.icon}</p>` : ''}
    ${cfg.title ? html`<h2 class="sheet__title">${cfg.title}</h2>` : ''}
    ${cfg.text ? html`<p class="sheet__text">${cfg.text}</p>` : ''}
    ${cfg.deltas?.length ? html`<p style="text-align:center;margin-top:10px">${deltaChips(cfg.deltas)}</p>` : ''}
    ${cfg.body ?? ''}
    <div class="sheet__actions">
      ${(cfg.actions ?? []).map((a) => html`
        <button class="btn btn--block ${a.variant ? `btn--${a.variant}` : ''}"
                data-act="${a.act}"
                ${raw(Object.entries(a.data ?? {}).map(([k, v]) =>
                  `data-${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' '))}>
          ${a.label}${a.hint ? raw(` <span style="opacity:.65;font-weight:500">&middot; ${a.hint}</span>`) : ''}
        </button>`)}
      ${cfg.dismissible !== false
        ? html`<button class="btn btn--ghost btn--block" data-act="closeSheet">Close</button>` : ''}
    </div>
  </div>`;
