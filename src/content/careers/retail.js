/** Career: Retail. The entry-level job that is always hiring. */
export default {
  id: 'retail',
  name: 'Retail',
  employer: 'Marlow’s Department Store',
  icon: '🛒', scene: 'retail',
  category: 'Service',
  tone: '#4c1d95',
  blurb: 'Always hiring. Rarely rewarding.',
  description:
    'No requirements, no barriers. A first paycheque while you work out what ' +
    'you actually want to do.',

  requirements: { minAge: 16, education: null },
  keySkills: ['charisma'],
  competition: 0.0,

  levels: [
    { title: 'Sales Associate',  salary: 17000, xpToNext: 240 },
    { title: 'Senior Associate', salary: 24000, xpToNext: 400, minPerformance: 40 },
    { title: 'Shift Supervisor', salary: 33000, xpToNext: 600, minPerformance: 48 },
    { title: 'Store Manager',    salary: 51000, xpToNext: 900, minPerformance: 58 },
    { title: 'Regional Manager', salary: 82000, minPerformance: 66 },
  ],

  workEffects: { stats: { happiness: -3, fitness: -1 }, skills: { charisma: 2 } },

  tasks: [
    {
      id: 'upsell', name: 'Push the loyalty card', icon: '💳',
      desc: 'Corporate is watching the numbers.',
      odds: (s) => 0.45 + (s.skills.charisma ?? 0) * 0.006,
      success: {
        text: 'You topped the regional loyalty sign-up board.',
        effects: { performance: 9, jobXp: 90, money: 400, skills: { charisma: 3 } },
      },
      failure: {
        text: 'You missed your loyalty card target three quarters running.',
        effects: { performance: -8, stats: { happiness: -4 } },
      },
    },
    {
      id: 'cover', name: 'Cover everyone’s shifts', icon: '🗓️',
      desc: 'Say yes to every request.',
      odds: 0.8,
      success: {
        text: 'Management noticed how reliable you are.',
        effects: { performance: 11, jobXp: 100, money: 900, stats: { happiness: -5, health: -3 } },
      },
      failure: {
        text: 'You covered every shift and nobody noticed.',
        effects: { stats: { happiness: -8, health: -4 } },
      },
    },
  ],
};
