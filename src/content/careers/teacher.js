/** Career: Teaching. Modest pay, high respect. */
export default {
  id: 'teacher',
  name: 'Teaching',
  employer: 'Fairview Public Schools',
  icon: '👩‍🏫', scene: 'classroom',
  category: 'Education',
  tone: '#155e75',
  blurb: 'Shape the next generation. Modest pay, real respect.',
  description:
    'A stable career with long holidays and short patience. Requires a degree ' +
    'and more emotional stamina than most jobs on this list.',

  requirements: { minAge: 22, education: 'bachelor' },
  keySkills: ['charisma', 'discipline'],
  competition: 0.08,

  levels: [
    { title: 'Teaching Assistant', salary: 28000, xpToNext: 300 },
    { title: 'Teacher',            salary: 44000, xpToNext: 520, minPerformance: 46 },
    { title: 'Senior Teacher',     salary: 58000, xpToNext: 720, minPerformance: 55 },
    { title: 'Head of Department', salary: 76000, xpToNext: 1000, minPerformance: 63 },
    { title: 'Principal',          salary: 112000, minPerformance: 72 },
  ],

  workEffects: { stats: { happiness: -1, mentality: 1 }, skills: { charisma: 2, discipline: 1 } },

  tasks: [
    {
      id: 'mentor', name: 'Mentor a struggling student', icon: '🌱',
      desc: 'Extra hours, no extra pay.',
      odds: (s) => 0.5 + (s.skills.charisma ?? 0) * 0.005,
      success: {
        text: 'A student you mentored turned their year around. They wrote to thank you.',
        effects: { performance: 10, jobXp: 120, respect: 8, stats: { happiness: 12 } },
      },
      failure: {
        text: 'The student you mentored dropped out anyway.',
        effects: { stats: { happiness: -9, mentality: -3 } },
      },
    },
    {
      id: 'curriculum', name: 'Rewrite the curriculum', icon: '📘',
      desc: 'Take on work nobody asked you to do.',
      odds: (s) => 0.4 + (s.skills.discipline ?? 0) * 0.005,
      success: {
        text: 'Your curriculum was adopted across the district.',
        effects: { performance: 14, jobXp: 190, respect: 10, fame: 5 },
      },
      failure: {
        text: 'The board rejected your curriculum after a year of work.',
        effects: { performance: -5, stats: { happiness: -8 } },
      },
    },
  ],
};
