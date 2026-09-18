/** Assets: what you own, and the shop. */
import { html } from '../dom.js';
import { appbar, walletPills, row, sectionTitle, emptyState, kv } from '../components/common.js';
import { items } from '../../core/registry.js';
import { inventory as invSystem } from '../../systems/index.js';
import { money, netWorth } from '../../core/state.js';

export function renderAssets(app) {
  const s = app.state;

  return html`
    <div class="screen">
      ${appbar({ title: 'Assets', back: true, right: walletPills(s) })}

      <div class="card card--pad">
        ${kv('Cash', money(s.economy.cash), 'pos')}
        ${kv('Debt', money(s.economy.debt), s.economy.debt ? 'neg' : '')}
        ${kv('Possessions', money(s.inventory.reduce((sum, i) => sum + i.value, 0)))}
        ${kv('Net worth', money(netWorth(s)), netWorth(s) >= 0 ? 'pos' : 'neg')}
        ${s.economy.salary ? kv('Salary', `${money(s.economy.salary)} / yr`) : ''}
      </div>

      ${s.economy.debt > 0 ? html`
        <div class="rows" style="margin-top:12px">
          ${row({ icon: '🏦', title: 'Pay off debt',
                  sub: `Pay ${money(Math.min(s.economy.cash, s.economy.debt))} now`,
                  act: 'payDebt', chevron: false, right: 'Pay' })}
        </div>` : ''}

      ${sectionTitle('Owned')}
      <div class="rows">
        ${s.inventory.length ? s.inventory.map((owned) => row({
          icon: owned.icon, title: owned.name,
          sub: `Bought at ${owned.boughtAtAge} · worth ${money(owned.value)}`,
          right: 'Sell', act: 'sellItem', data: { uid: owned.uid }, chevron: false,
        })) : emptyState('📦', 'You do not own anything yet.')}
      </div>

      ${sectionTitle('Shop')}
      <div class="rows">
        ${items.all().map((def) => {
          const gate = invSystem.canBuy(s, def.id);
          return row({
            icon: def.icon, title: def.name,
            sub: gate.ok ? def.desc : `🔒 ${gate.reason}`,
            right: money(def.price),
            act: gate.ok ? 'buyItem' : null, data: { item: def.id },
            disabled: !gate.ok, chevron: false,
          });
        })}
      </div>
    </div>`;
}
