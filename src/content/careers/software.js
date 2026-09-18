/** Career: Software Developer. */
export default {
  id: 'software',
  name: 'Software Development',
  employer: 'Northwind Systems',
  icon: '💻', scene: 'code',
  category: 'Technology',
  tone: '#0f766e',
  blurb: 'Build software, ship products, chase equity.',
  description:
    'Write code for a living. The pay climbs fast if you can keep learning, ' +
    'but the hours and the screen time take a toll.',

  requirements: { minAge: 21, education: 'bachelor', major: 'Computer Science', skills: { logic: 25 } },
  keySkills: ['logic', 'creativity'],
  competition: 0.18,

  levels: [
    { title: 'Intern',             salary: 26000, xpToNext: 300 },
    { title: 'Junior Developer',   salary: 62000, xpToNext: 500, minPerformance: 45 },
    { title: 'Developer',          salary: 92000, xpToNext: 700, minPerformance: 55 },
    { title: 'Senior Developer',   salary: 128000, xpToNext: 950, minPerformance: 62 },
    { title: 'Engineering Lead',   salary: 172000, xpToNext: 1300, minPerformance: 70 },
    { title: 'Chief Technology Officer', salary: 265000, minPerformance: 78 },
  ],

  workEffects: { stats: { fitness: -2, health: -1, happiness: -1 }, skills: { logic: 2 } },

  tasks: [
    {
      id: 'ship', name: 'Ship a feature', icon: '🚀',
      desc: 'Take something from idea to production.',
      odds: (s) => 0.55 + (s.skills.logic ?? 0) * 0.005,
      success: {
        text: 'Your feature shipped without a single rollback. Rare.',
        effects: { performance: 10, jobXp: 130, skills: { logic: 3 }, stats: { happiness: 5 } },
      },
      failure: {
        text: 'Your release took down production for four hours.',
        effects: { performance: -12, stats: { happiness: -8, mentality: -3 } },
      },
    },
    {
      id: 'sideproject', name: 'Build a side project', icon: '🛠️',
      desc: 'Nights and weekends, for yourself.',
      odds: (s) => 0.22 + (s.skills.creativity ?? 0) * 0.005,
      success: {
        text: 'Your side project got traction and a small payout.',
        effects: { money: 9000, fame: 8, skills: { creativity: 5, logic: 3 }, stats: { happiness: 10, health: -3 } },
      },
      failure: {
        text: 'Your side project went nowhere. You are exhausted.',
        effects: { stats: { happiness: -6, health: -4, fitness: -3 }, skills: { logic: 2 } },
      },
    },
    {
      id: 'certify', name: 'Take a certification', icon: '📜',
      desc: 'Costs $1,200 and a lot of evenings.',
      odds: (s) => 0.6 + (s.skills.discipline ?? 0) * 0.004,
      success: {
        text: 'You passed the certification exam.',
        effects: { money: -1200, skills: { logic: 7, discipline: 3 }, performance: 6, jobXp: 90 },
      },
      failure: {
        text: 'You failed the certification exam and lost the fee.',
        effects: { money: -1200, stats: { happiness: -6 } },
      },
    },
  ],
};
