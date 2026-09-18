/** Career: Kitchen / Chef. No degree needed — you start at the sink. */
export default {
  id: 'chef',
  name: 'Culinary',
  employer: 'Rosetta’s',
  icon: '👩‍🍳', scene: 'kitchen',
  category: 'Hospitality',
  tone: '#9a3412',
  blurb: 'Work your way up from the dish pit to your own restaurant.',
  description:
    'Long hours, hot kitchens and no degree required. Talent and stubbornness ' +
    'matter more than qualifications here.',

  requirements: { minAge: 16, education: null },
  keySkills: ['creativity', 'discipline'],
  competition: 0.04,

  levels: [
    { title: 'Dishwasher',      salary: 19000, xpToNext: 260 },
    { title: 'Line Cook',       salary: 31000, xpToNext: 420, minPerformance: 42 },
    { title: 'Sous Chef',       salary: 48000, xpToNext: 620, minPerformance: 52 },
    { title: 'Head Chef',       salary: 72000, xpToNext: 880, minPerformance: 60 },
    { title: 'Executive Chef',  salary: 110000, xpToNext: 1200, minPerformance: 68 },
    { title: 'Restaurateur',    salary: 190000, minPerformance: 74 },
  ],

  workEffects: { stats: { fitness: -1, health: -2, happiness: -1 }, skills: { creativity: 2, discipline: 1 } },

  tasks: [
    {
      id: 'menu', name: 'Design a new menu', icon: '📝',
      desc: 'Put your own stamp on the kitchen.',
      odds: (s) => 0.4 + (s.skills.creativity ?? 0) * 0.006,
      success: {
        text: 'Your new menu got written up in the local paper.',
        effects: { performance: 12, jobXp: 150, fame: 10, skills: { creativity: 4 }, stats: { happiness: 7 } },
      },
      failure: {
        text: 'Your new menu confused the regulars and sales dropped.',
        effects: { performance: -9, stats: { happiness: -6 } },
      },
    },
    {
      id: 'doubles', name: 'Work doubles', icon: '🔥',
      desc: 'Every shift you can get.',
      odds: 0.85,
      success: {
        text: 'You worked doubles all season. The tips were good.',
        effects: { money: 3400, performance: 8, jobXp: 110, stats: { health: -6, happiness: -5, fitness: -3 } },
      },
      failure: {
        text: 'You burned out working doubles and called in sick for a month.',
        effects: { performance: -10, stats: { health: -10, happiness: -8 } },
      },
    },
    {
      id: 'competition', name: 'Enter a cooking competition', icon: '🏆',
      desc: 'High risk, high visibility.',
      odds: (s) => 0.2 + (s.skills.creativity ?? 0) * 0.005 + s.career.performance * 0.002,
      success: {
        text: 'You won the regional cooking competition!',
        effects: { money: 6000, fame: 20, performance: 15, jobXp: 220, stats: { happiness: 14 } },
      },
      failure: {
        text: 'You were eliminated in the first round of the competition.',
        effects: { stats: { happiness: -7 }, fame: 2 },
      },
    },
  ],
};
