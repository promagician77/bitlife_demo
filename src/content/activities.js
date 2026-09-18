/**
 * Life activities — the things you can choose to do with a year.
 * Each one costs an action from the yearly energy budget.
 */
export const ACTIVITIES = [
  {
    id: 'gym', name: 'Go to the gym', icon: '🏋️', tone: 'var(--c-fitness)',
    desc: 'Fitness up, happiness down.', minAge: 12, onceKey: 'gym',
    effects: { stats: { fitness: 7, health: 3, looks: 2, happiness: -2 }, skills: { discipline: 2 } },
    text: 'You trained seriously this year.',
  },
  {
    id: 'doctor', name: 'See a doctor', icon: '🩺', tone: 'var(--c-health)',
    desc: 'A check-up and whatever it turns up. $250.',
    minAge: 1, cost: 250, onceKey: 'doctor',
    effects: { money: -250, stats: { health: 9 } },
    text: 'You got a full check-up and followed the advice.',
  },
  {
    id: 'meditate', name: 'Meditate', icon: '🧘', tone: 'var(--c-mentality)',
    desc: 'Clears the head. Free.', minAge: 8, onceKey: 'meditate',
    effects: { stats: { mentality: 8, happiness: 5, health: 1 }, skills: { discipline: 3 } },
    text: 'You built a daily meditation habit.',
  },
  {
    id: 'party', name: 'Go out', icon: '🍻', tone: 'var(--c-popularity)',
    desc: 'Popularity up, health down. $300.',
    minAge: 16, cost: 300, onceKey: 'party',
    effects: { money: -300, stats: { popularity: 8, happiness: 9, health: -4 }, skills: { charisma: 3 } },
    text: 'You went out a lot this year.',
  },
  {
    id: 'salon', name: 'Salon & style', icon: '✨', tone: 'var(--c-popularity)',
    desc: 'Looks up. $450.', minAge: 12, cost: 450, onceKey: 'salon',
    effects: { money: -450, stats: { looks: 9, happiness: 4 } },
    text: 'You spent real money on how you look.',
  },
  {
    id: 'read', name: 'Read everything', icon: '📚', tone: 'var(--accent-hi)',
    desc: 'Mentality and logic up. Free.', minAge: 6, onceKey: 'read',
    effects: { stats: { mentality: 6, happiness: 2 }, skills: { logic: 4, creativity: 2 } },
    text: 'You read constantly this year.',
  },
  {
    id: 'volunteer', name: 'Volunteer', icon: '🤝', tone: 'var(--c-money)',
    desc: 'Karma and respect up.', minAge: 14, onceKey: 'volunteer',
    effects: { karma: 10, respect: 5, stats: { happiness: 6, popularity: 3 } },
    text: 'You gave your time to a cause that mattered to you.',
  },
];
