/**
 * School stages.
 *
 * `auto: true` means the character is enrolled automatically at `startAge`
 * (compulsory education). Anything else must be chosen by the player.
 * `degree` is what the career system tests requirements against.
 */
export const SCHOOLS = [
  {
    id: 'elementary', label: 'Elementary School', icon: '🏫',
    startAge: 5, years: 7, auto: true, passMark: 25,
    mentalityGain: 2, skillGain: { logic: 1, charisma: 1 },
  },
  {
    id: 'highschool', label: 'High School', icon: '🏫',
    startAge: 12, years: 6, auto: true, passMark: 50,
    degree: 'highschool', mentalityGain: 2,
    skillGain: { logic: 2, discipline: 1 },
    gradSkills: { discipline: 3 },
  },
  {
    id: 'community', label: 'Community College', icon: '🏛️',
    startAge: 18, years: 2, requires: 'highschool', tuition: 4500,
    passMark: 55, degree: 'associate', mentalityGain: 3,
    skillGain: { logic: 3, discipline: 2 },
    gradSkills: { logic: 4 },
    majors: ['Business', 'Culinary Arts', 'Criminal Justice', 'IT Support'],
  },
  {
    id: 'university', label: 'University', icon: '🎓',
    startAge: 18, years: 4, requires: 'highschool', tuition: 14000,
    minGrades: 60, passMark: 60, degree: 'bachelor', mentalityGain: 4,
    skillGain: { logic: 4, discipline: 2, charisma: 1 },
    gradMentality: 6, gradSkills: { logic: 6, discipline: 3 },
    majors: ['Computer Science', 'Medicine', 'Business', 'Criminal Justice', 'Psychology', 'Art'],
  },
  {
    id: 'graduate', label: 'Graduate School', icon: '🎓',
    startAge: 22, years: 2, requires: 'university', tuition: 22000,
    minGrades: 70, passMark: 65, degree: 'master', mentalityGain: 5,
    skillGain: { logic: 5, discipline: 3 },
    gradMentality: 8, gradSkills: { logic: 8 },
    majors: ['Computer Science', 'Business', 'Psychology', 'Public Policy'],
  },
];
