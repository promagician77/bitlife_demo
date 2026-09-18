/** Name and place pools used by character creation. Pure data. */

export const FIRST_NAMES = {
  male: [
    'Oliver', 'Noah', 'Lucas', 'Elias', 'William', 'Marcus', 'Adrian', 'Felix',
    'Theo', 'Jonas', 'Mateo', 'Hugo', 'Emil', 'Victor', 'Ruben', 'Isaac',
  ],
  female: [
    'Emma', 'Nora', 'Alma', 'Sofia', 'Ingrid', 'Maja', 'Iris', 'Clara',
    'Leah', 'Vera', 'Elena', 'Freya', 'Amelia', 'Signe', 'Ada', 'Nadia',
  ],
};

export const LAST_NAMES = [
  'Hansen', 'Lindqvist', 'Moreau', 'Reyes', 'Okafor', 'Novak', 'Brennan',
  'Castellan', 'Whitlock', 'Aalto', 'Marchetti', 'Osei', 'Delgado', 'Halvorsen',
  'Bergström', 'Nakamura', 'Ferreira', 'Kovac',
];

export const PLACES = [
  { country: 'Norway',         cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'] },
  { country: 'United States',  cities: ['Denver', 'Austin', 'Portland', 'Chicago'] },
  { country: 'United Kingdom', cities: ['Manchester', 'Bristol', 'Leeds', 'Glasgow'] },
  { country: 'Japan',          cities: ['Osaka', 'Sapporo', 'Fukuoka', 'Nagoya'] },
  { country: 'Brazil',         cities: ['Curitiba', 'Recife', 'Porto Alegre'] },
  { country: 'Germany',        cities: ['Leipzig', 'Hamburg', 'Cologne', 'Stuttgart'] },
];
