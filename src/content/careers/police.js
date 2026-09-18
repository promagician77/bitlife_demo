/**
 * Career: Police Officer.
 *
 * A career file is self-contained data. To add a profession, copy this file,
 * change the values, and list it in src/content/careers/index.js — no system
 * code changes anywhere.
 */
export default {
  id: 'police',
  name: 'Police',
  employer: 'the City Police Department',
  icon: '👮', scene: 'police',
  category: 'Public service',
  tone: '#1e3a8a',
  blurb: 'Be a police officer, serve and protect.',
  description:
    'As a police officer you can make a difference in people’s lives, keep the city safe and organised. ' +
    'Specialise in different areas, such as patrol, investigation or specialised units.',

  requirements: { minAge: 21, education: 'highschool', stats: { fitness: 40 }, cleanRecord: true },
  keySkills: ['discipline', 'combat'],
  competition: 0.12,

  levels: [
    { title: 'Cadet',        salary: 38000, xpToNext: 380 },
    { title: 'Officer',      salary: 52000, xpToNext: 520, minPerformance: 50 },
    { title: 'Detective',    salary: 68000, xpToNext: 700, minPerformance: 58 },
    { title: 'Sergeant',     salary: 84000, xpToNext: 900, minPerformance: 62 },
    { title: 'Lieutenant',   salary: 104000, xpToNext: 1200, minPerformance: 68 },
    { title: 'Chief of Police', salary: 148000, minPerformance: 75 },
  ],

  workEffects: { stats: { happiness: -2, fitness: 1, health: -1 }, skills: { discipline: 1, combat: 1 } },

  tasks: [
    {
      id: 'patrol', name: 'Patrol the city', icon: '🚔',
      desc: 'Maintain order and prevent crime.',
      odds: (s) => 0.6 + (s.skills.discipline ?? 0) * 0.004,
      success: {
        text: 'You broke up a robbery in progress during patrol. The captain noticed.',
        effects: { performance: 7, jobXp: 70, respect: 3, stats: { fitness: 2 } },
      },
      failure: {
        text: 'A quiet shift on patrol. Nothing to report.',
        effects: { jobXp: 20, stats: { happiness: -2 } },
      },
    },
    {
      id: 'case', name: 'Solve a major case', icon: '🔍',
      desc: 'Gather evidence and close the file.',
      odds: (s) => 0.35 + (s.skills.logic ?? 0) * 0.006 + s.stats.mentality * 0.002,
      success: {
        text: 'You cracked a case the department had given up on. Commendation earned.',
        effects: { performance: 14, jobXp: 180, fame: 6, respect: 6, stats: { happiness: 8 } },
      },
      failure: {
        text: 'The case went cold. Your captain was not impressed.',
        effects: { performance: -8, stats: { happiness: -6, mentality: -2 } },
      },
    },
    {
      id: 'training', name: 'Training', icon: '🏋️',
      desc: 'Improve your skills and equipment.',
      odds: 0.9,
      success: {
        text: 'You completed advanced tactical training.',
        effects: { skills: { combat: 5, discipline: 3 }, stats: { fitness: 4 }, jobXp: 60 },
      },
      failure: {
        text: 'You pulled a muscle during training.',
        effects: { stats: { health: -4, fitness: -2 } },
      },
    },
  ],
};
