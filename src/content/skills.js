/**
 * Skill definitions.
 *
 * Careers reference these by id only. Adding a skill here immediately makes it
 * trainable in the UI and usable as a career requirement.
 */
export const SKILLS = [
  {
    id: 'logic', name: 'Logic', icon: '🧩',
    startMin: 2, startMax: 14, decay: 0.4, minAge: 6,
    practiceText: 'You worked through puzzles and problems.',
    practiceEffects: { mentality: 2, happiness: -1 },
  },
  {
    id: 'charisma', name: 'Charisma', icon: '🗣️',
    startMin: 2, startMax: 16, decay: 0.5, minAge: 5,
    practiceText: 'You practised reading people and holding a room.',
    practiceEffects: { popularity: 2, happiness: 1 },
  },
  {
    id: 'discipline', name: 'Discipline', icon: '🎯',
    startMin: 0, startMax: 12, decay: 0.7, minAge: 6,
    practiceText: 'You built a routine and stuck to it.',
    practiceEffects: { mentality: 1, happiness: -2 },
  },
  {
    id: 'creativity', name: 'Creativity', icon: '🎨',
    startMin: 3, startMax: 20, decay: 0.4, minAge: 4,
    practiceText: 'You spent the year making things.',
    practiceEffects: { happiness: 3 },
  },
  {
    id: 'combat', name: 'Combat', icon: '🥊',
    startMin: 0, startMax: 8, decay: 0.8, minAge: 10, cost: 400,
    practiceText: 'You trained at a martial arts gym.',
    practiceEffects: { fitness: 4, health: 1 },
  },
  {
    id: 'streetwise', name: 'Streetwise', icon: '🌃',
    startMin: 0, startMax: 10, decay: 0.3, minAge: 12,
    practiceText: 'You spent time with a rougher crowd.',
    practiceEffects: { popularity: 1, happiness: 1 },
  },
];
