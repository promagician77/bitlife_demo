/**
 * Events that only fire while incarcerated.
 * `prisonOnly` + `inPrison` are read by systems/events.js eligibility gates.
 */
export const PRISON_EVENTS = [
  {
    id: 'prison_shank', prisonOnly: true, inPrison: true, weight: 4,
    icon: '🔪',
    title: 'The yard',
    text: 'Someone is selling protection. It will cost you.',
    choices: [
      { label: 'Pay for protection ($800)',
        text: 'You paid for protection. The year passed quietly.',
        effects: { money: -800, stats: { happiness: 3, health: 4 } } },
      { label: 'Handle it yourself', odds: (s) => 0.3 + (s.skills.combat ?? 0) * 0.007 + s.stats.fitness * 0.003,
        success: { text: 'You handled yourself. Word got around not to try you.',
          effects: { skills: { combat: 6, streetwise: 6 }, stats: { fitness: 4 } } },
        failure: { text: 'You were badly beaten in the yard.',
          effects: { stats: { health: -20, happiness: -10 } } } },
    ],
  },
  {
    id: 'prison_education', prisonOnly: true, inPrison: true, weight: 3,
    icon: '📚',
    text: 'You took every class the prison library offered.',
    effects: { skills: { logic: 5, discipline: 4 }, stats: { mentality: 5, happiness: 3 } },
  },
  {
    id: 'prison_visit', prisonOnly: true, inPrison: true, weight: 4,
    icon: '🫟',
    text: 'You had a visitor this year. It helped more than you expected.',
    effects: { stats: { happiness: 10 }, relationship: { with: 'family', by: 6 } },
  },
  {
    id: 'prison_riot', prisonOnly: true, inPrison: true, weight: 2,
    icon: '🔥',
    title: 'A riot breaks out',
    text: 'The block erupts. Guards have pulled back.',
    choices: [
      { label: 'Join in', odds: 0.45,
        success: { text: 'You came out of the riot with a reputation and no charges.',
          effects: { skills: { streetwise: 10, combat: 6 }, stats: { happiness: 4 } } },
        failure: { text: 'You were identified as a ringleader. Two years added.',
          effects: { stats: { health: -12, happiness: -14 } } } },
      { label: 'Stay in your cell',
        text: 'You sat it out in your cell and kept your head down.',
        effects: { stats: { happiness: -4, mentality: -3 } } },
    ],
  },
];
