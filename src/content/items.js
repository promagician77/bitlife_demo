/**
 * Purchasable items.
 * `effects` is applied once on purchase; `upkeep` is charged every year;
 * `depreciation` is the fraction of resale value lost annually.
 */
export const ITEMS = [
  { id: 'phone',   name: 'A decent phone',    icon: '📱', price: 900,
    minAge: 12, depreciation: 0.25, effects: { happiness: 6, popularity: 3 },
    desc: 'Everyone has one. You may as well.' },

  { id: 'bike',    name: 'Road bike',         icon: '🚲', price: 1400,
    minAge: 10, depreciation: 0.12, effects: { fitness: 8, happiness: 4 },
    desc: 'Cheaper than a gym and you get somewhere.' },

  { id: 'guitar',  name: 'Guitar',            icon: '🎸', price: 700,
    minAge: 8, depreciation: 0.08, effects: { happiness: 7 },
    desc: 'Creativity goes up. So does your neighbours’ patience.' },

  { id: 'wardrobe',name: 'A proper wardrobe', icon: '👔', price: 2600,
    minAge: 16, depreciation: 0.3, effects: { looks: 12, popularity: 5 },
    desc: 'People treat you differently. Annoyingly, it works.' },

  { id: 'car',     name: 'Used car',          icon: '🚗', price: 11000,
    minAge: 18, depreciation: 0.14, upkeep: 1600, unique: true,
    effects: { happiness: 10, popularity: 5 },
    desc: 'Freedom, plus insurance and servicing.' },

  { id: 'condo',   name: 'City apartment',    icon: '🏢', price: 185000,
    minAge: 21, depreciation: -0.02, upkeep: 4200, unique: true,
    effects: { happiness: 20, mentality: 6 },
    desc: 'Appreciates in value, unlike everything else here.' },

  { id: 'watch',   name: 'Luxury watch',      icon: '⌚', price: 24000,
    minAge: 21, depreciation: 0.02, effects: { looks: 10, popularity: 8 },
    desc: 'Holds its value and says something about you.' },
];
