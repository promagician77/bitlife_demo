/**
 * Childhood events (ages 1–12).
 * Data only: every field is read by systems/events.js.
 */
export const CHILDHOOD_EVENTS = [
  {
    id: 'child_first_word', minAge: 1, maxAge: 2, once: true, weight: 4,
    icon: '🗣️', tone: 'var(--c-happiness)',
    text: 'You said your first word. Your parents cried.',
    effects: { stats: { happiness: 4 }, skills: { charisma: 2 }, relationship: { with: 'family', by: 4 } },
  },
  {
    id: 'child_imaginary_friend', minAge: 3, maxAge: 7, once: true, weight: 3,
    icon: '👻',
    text: 'You invented an imaginary friend and insisted on a seat for them at dinner.',
    effects: { skills: { creativity: 5 }, stats: { happiness: 5, popularity: -2 } },
  },
  {
    id: 'child_bike', minAge: 5, maxAge: 9, once: true, weight: 4,
    icon: '🚲',
    title: 'The bike',
    text: 'Your father is holding the back of your bike. He asks if you want him to let go.',
    choices: [
      {
        label: 'Tell him to let go', odds: 0.65,
        success: { text: 'He let go and you rode the whole street. You have never forgotten it.',
          effects: { stats: { happiness: 8, fitness: 4 }, skills: { discipline: 3 } } },
        failure: { text: 'He let go and you went straight into a hedge. Six stitches.',
          effects: { stats: { health: -8, happiness: -4 } } },
      },
      {
        label: 'Ask him to keep holding on',
        text: 'You stayed on the training wheels another year. Safe, if unremarkable.',
        effects: { stats: { happiness: 1 }, skills: { discipline: -1 } },
      },
    ],
  },
  {
    id: 'child_pet', minAge: 4, maxAge: 11, once: true, weight: 3,
    icon: '🐶',
    title: 'A dog at the shelter',
    text: 'Your family visits an animal shelter. One dog will not stop looking at you.',
    choices: [
      { label: 'Beg your parents for the dog', odds: 0.5,
        success: { text: 'You got the dog. Best friend you will ever have.',
          effects: { stats: { happiness: 14 }, relationship: { with: 'family', by: 3 } } },
        failure: { text: 'Your parents said no. You sulked for a month.',
          effects: { stats: { happiness: -6 }, relationship: { with: 'family', by: -5 } } } },
      { label: 'Say nothing',
        text: 'You did not ask. You still think about that dog.',
        effects: { stats: { happiness: -2, mentality: 1 } } },
    ],
  },
  {
    id: 'child_reading', minAge: 6, maxAge: 12, weight: 3,
    icon: '📖',
    text: 'You read your way through the school library this year.',
    effects: { skills: { logic: 4, creativity: 3 }, stats: { mentality: 4, popularity: -1 } },
  },
  {
    id: 'child_playground', minAge: 5, maxAge: 11, weight: 3,
    icon: '🛝',
    text: 'You fell off the playground climbing frame.',
    effects: { stats: { health: -5, fitness: 2 } },
  },
  {
    id: 'child_bully', minAge: 7, maxAge: 13, weight: 4,
    icon: '😡',
    title: 'The bully',
    text: 'An older kid has been taking your lunch money for weeks.',
    choices: [
      { label: 'Fight back', odds: (s) => 0.3 + (s.stats.fitness + (s.skills.combat ?? 0) * 2) * 0.004,
        success: { text: 'You stood up to them and they never bothered you again.',
          effects: { stats: { popularity: 10, happiness: 6 }, skills: { combat: 4, streetwise: 3 } } },
        failure: { text: 'You fought back and lost badly in front of everyone.',
          effects: { stats: { health: -9, happiness: -10, popularity: -6 } } } },
      { label: 'Tell a teacher', odds: 0.6,
        success: { text: 'The school stepped in and it stopped.',
          effects: { stats: { happiness: 4 }, skills: { discipline: 2 } } },
        failure: { text: 'The teacher did nothing and word got round that you told.',
          effects: { stats: { happiness: -8, popularity: -8 } } } },
      { label: 'Just keep paying',
        text: 'You kept handing over your lunch money all year.',
        effects: { money: -120, stats: { happiness: -6, mentality: -3 } } },
    ],
  },
  {
    id: 'child_talent_show', minAge: 8, maxAge: 13, once: true, weight: 3,
    icon: '🎤',
    title: 'The school talent show',
    text: 'Sign-ups for the talent show close today.',
    choices: [
      { label: 'Perform', odds: (s) => 0.35 + (s.skills.creativity ?? 0) * 0.008 + (s.skills.charisma ?? 0) * 0.005,
        success: { text: 'You brought the house down at the talent show.',
          effects: { stats: { popularity: 12, happiness: 10 }, skills: { charisma: 5, creativity: 4 }, fame: 4 } },
        failure: { text: 'You froze on stage. People still bring it up.',
          effects: { stats: { popularity: -8, happiness: -8 }, skills: { charisma: 1 } } } },
      { label: 'Skip it', text: 'You watched from the audience.', effects: { stats: { happiness: 1 } } },
    ],
  },
];
