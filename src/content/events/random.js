/** Small colour events that can fire at almost any age. */
export const RANDOM_EVENTS = [
  { id: 'rnd_good_weather', weight: 2, minAge: 4, icon: '☀️',
    text: 'It was a good year. Nothing much happened, and that was fine.',
    effects: { stats: { happiness: 3 } } },

  { id: 'rnd_found_money', weight: 2, minAge: 5, icon: '💵',
    text: 'You found cash on the pavement in {city}.',
    effects: { money: 40, stats: { happiness: 2 } } },

  { id: 'rnd_bad_haircut', weight: 2, minAge: 6, icon: '✂️',
    text: 'You got a genuinely terrible haircut.',
    effects: { stats: { looks: -6, happiness: -3 } } },

  { id: 'rnd_food_poisoning', weight: 2, minAge: 8, icon: '🥢',
    text: 'A street food stall in {city} did not agree with you.',
    effects: { stats: { health: -5, happiness: -3 } } },

  { id: 'rnd_viral', weight: 1, minAge: 13, icon: '📱',
    text: 'Something you posted went unexpectedly viral.',
    effects: { fame: 12, stats: { popularity: 8, happiness: 6 } } },

  { id: 'rnd_neighbour', weight: 2, minAge: 18, icon: '🏠',
    text: 'Your neighbour renovated for eleven months straight.',
    effects: { stats: { happiness: -5, mentality: -3 } } },

  { id: 'rnd_volunteer', weight: 2, minAge: 14, icon: '🤝',
    title: 'A volunteering drive',
    text: 'A local charity is short of hands this weekend.',
    choices: [
      { label: 'Volunteer', text: 'You volunteered and found it unexpectedly grounding.',
        effects: { karma: 8, respect: 4, stats: { happiness: 7, popularity: 3 } } },
      { label: 'Stay home', text: 'You had a quiet weekend instead.', effects: { stats: { happiness: 2 } } },
    ] },

  { id: 'rnd_dentist', weight: 2, minAge: 10, icon: '🦷',
    text: 'You needed unexpected dental work.',
    effects: { money: -700, stats: { health: 3, looks: 2, happiness: -3 } } },

  { id: 'rnd_travel', weight: 2, minAge: 18, when: (s) => s.economy.cash > 3000, icon: '✈️',
    title: 'A cheap flight',
    text: 'There is a very cheap flight somewhere you have always wanted to go.',
    choices: [
      { label: 'Book it ($1,800)', text: 'You took the trip. You still talk about it.',
        effects: { money: -1800, stats: { happiness: 16, mentality: 5 }, skills: { charisma: 3 } } },
      { label: 'Be sensible', text: 'You stayed home and saved the money.', effects: { stats: { happiness: -2 } } },
    ] },

  { id: 'rnd_mugged', weight: 2, minAge: 14, when: (s) => !s.prison.inPrison, icon: '🔦',
    title: 'Mugged',
    text: 'Someone blocks your path on a dark street and asks for your wallet.',
    choices: [
      { label: 'Hand it over', text: 'You handed over your wallet and walked away unhurt.',
        effects: { money: (s) => -Math.min(s.economy.cash, 300), stats: { happiness: -8 } } },
      { label: 'Fight back', odds: (s) => 0.3 + (s.skills.combat ?? 0) * 0.008 + s.stats.fitness * 0.003,
        success: { text: 'You fought them off and kept your wallet.',
          effects: { stats: { happiness: 6, fitness: 2 }, skills: { combat: 4, streetwise: 3 } } },
        failure: { text: 'You fought back and came off much worse.',
          effects: { money: (s) => -Math.min(s.economy.cash, 400), stats: { health: -16, happiness: -12 } } } },
    ] },
];
