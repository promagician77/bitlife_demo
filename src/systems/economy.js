/**
 * Economy system -- income, tax, cost of living, debt.
 * Owns: state.economy
 *
 * Runs after career so it collects the salary the career system just set.
 */
const TAX_BANDS = [
  [12000, 0.00], [45000, 0.14], [95000, 0.24], [200000, 0.32], [Infinity, 0.39],
];

function taxOn(gross) {
  let tax = 0, last = 0;
  for (const [ceiling, rate] of TAX_BANDS) {
    if (gross <= last) break;
    tax += (Math.min(gross, ceiling) - last) * rate;
    last = ceiling;
  }
  return Math.round(tax);
}

/** Baseline annual cost of living once you are living independently. */
function costOfLiving(state) {
  const age = state.character.age;
  if (age < 18) return 0;
  const base = 8200 + age * 40;
  const lifestyle = Math.round(state.economy.salary * 0.18);
  return base + lifestyle;
}

export default {
  id: 'economy',
  order: 50,

  onYear(ctx) {
    const { state } = ctx;
    const age = state.character.age;
    const ledger = [];

    /* Income ------------------------------------------------------------- */
    if (state.career.employed && !state.prison.inPrison) {
      const gross = state.economy.salary;
      const tax = taxOn(gross);
      const net = gross - tax;
      state.economy.cash += net;
      state.economy.lifetimeEarned += net;
      ledger.push({ label: 'Salary', amount: gross }, { label: 'Income tax', amount: -tax });
    }

    // Pocket money from parents while you are a dependent.
    if (age >= 6 && age < 18) {
      const allowance = 260 + age * 22;
      state.economy.cash += allowance;
      state.economy.lifetimeEarned += allowance;
      ledger.push({ label: 'Allowance', amount: allowance });
    }

    /* Outgoings ----------------------------------------------------------- */
    const living = state.prison.inPrison ? 0 : costOfLiving(state);
    if (living) {
      state.economy.cash -= living;
      state.economy.lifetimeSpent += living;
      ledger.push({ label: 'Cost of living', amount: -living });
    }

    if (state.economy.debt > 0) {
      const interest = Math.round(state.economy.debt * 0.07);
      state.economy.debt += interest;
      ledger.push({ label: 'Debt interest', amount: -interest });
    }

    /* Overdrawn? Roll it into debt rather than allowing negative cash. ----- */
    if (state.economy.cash < 0) {
      const shortfall = -state.economy.cash;
      state.economy.cash = 0;
      state.economy.debt += shortfall;
      ctx.log(`You could not cover your costs. $${shortfall.toLocaleString('en-US')} was added to your debt.`, {
        icon: '📉', tone: 'var(--c-danger)', category: 'economy',
      });
      ctx.effects({ stats: { happiness: -6 } });
    }

    state.economy.ledger = ledger;

    const net = ledger.reduce((sum, l) => sum + l.amount, 0);
    if (net !== 0 && age >= 18) {
      ctx.log(
        net > 0
          ? `You netted $${net.toLocaleString('en-US')} this year.`
          : `You burned through $${Math.abs(net).toLocaleString('en-US')} this year.`,
        { icon: '📊', category: 'economy' },
      );
    }
  },

  /** Pay down debt with cash -- a player action. */
  payDebt(ctx, amount) {
    const { state } = ctx;
    const pay = Math.min(amount, state.economy.cash, state.economy.debt);
    if (pay <= 0) return { ok: false, reason: 'Nothing to pay, or no cash to pay it with.' };
    state.economy.cash -= pay;
    state.economy.debt -= pay;
    ctx.log(`You paid $${pay.toLocaleString('en-US')} off your debt.`, {
      icon: '🏦', tone: 'var(--c-money)', category: 'economy',
    });
    return { ok: true, message: `Paid $${pay.toLocaleString('en-US')}.` };
  },

  taxOn, costOfLiving,
};
