/**
 * Crime definitions.
 *
 * `severity` drives sentencing in systems/police.js:
 *   1 = fine / probation, 2 = prison if you have priors, 3+ = custodial.
 */
export const CRIMES = [
  {
    id: 'shoplift', name: 'Shoplifting', icon: '🛍️',
    desc: 'Walk out with something small.',
    minAge: 10, baseOdds: 0.72, severity: 1, heat: 6,
    payout: [20, 300], fine: [150, 900], sentence: [1, 1],
    successText: 'You walked out of the shop without paying.',
    failText: 'Store security stopped you at the door.',
  },
  {
    id: 'pickpocket', name: 'Pickpocketing', icon: '👛',
    desc: 'Crowded train, open bag.',
    minAge: 12, baseOdds: 0.58, severity: 1, heat: 9,
    payout: [40, 700], fine: [300, 1800], sentence: [1, 2],
    successText: 'You lifted a wallet on the train without anyone noticing.',
    failText: 'A hand caught your wrist mid-pocket.',
  },
  {
    id: 'burglary', name: 'Burglary', icon: '🪟',
    desc: 'An empty house on a quiet street.',
    minAge: 16, baseOdds: 0.45, severity: 2, heat: 20,
    payout: [800, 9000], fine: [2000, 9000], sentence: [2, 5],
    successText: 'You were in and out of the house in six minutes.',
    failText: 'The homeowner came back early and called the police.',
  },
  {
    id: 'gta', name: 'Grand theft auto', icon: '🚘',
    desc: 'Engine running, nobody inside.',
    minAge: 16, baseOdds: 0.38, severity: 3, heat: 30,
    payout: [3000, 24000], fine: [5000, 20000], sentence: [3, 8],
    successText: 'You sold the car to a chop shop the same night.',
    failText: 'A traffic camera caught the plate and a patrol car caught you.',
  },
  {
    id: 'fraud', name: 'Wire fraud', icon: '💳',
    desc: 'Needs a head for numbers.',
    minAge: 18, baseOdds: 0.4, severity: 3, heat: 24,
    payout: [4000, 40000], fine: [8000, 35000], sentence: [3, 9],
    successText: 'The transfers cleared and nobody asked questions.',
    failText: 'A compliance officer flagged the transfers.',
  },
];
