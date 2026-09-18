# LifeQuest — Phase 1 Prototype

A playable life-simulation prototype. The UI is built mobile-first; it is delivered as a
web build so it can be deployed to a URL and opened on any phone without an install step.

**Status:** Phase 1 of the roadmap — character creation, age progression, childhood,
school, basic economy, a "Next Year" loop, five careers, random events and save/load.

---

## Run it

No dependencies and no build step. Serve the folder over HTTP (ES modules will not load
from `file://`):

```bash
python3 -m http.server 4173      # or: npm start
# open http://localhost:4173
```

Deploying is copying the folder to any static host — Netlify, Vercel, GitHub Pages, S3,
nginx. There is nothing to compile.

```bash
node tools/smoke.js              # headless: simulates 40 full lives, checks invariants
```

---

## Architecture

The brief's hard requirement was that this must not become one giant system. Three rules
enforce that, and everything else follows from them.

**1. Systems own one branch of state each and never import one another.**

`src/systems/` holds fifteen independent modules. Each declares an `id`, an `order` and a
lifecycle hook. The engine sorts by `order` and runs them; it knows nothing about what any
of them do. Cross-system communication goes over the event bus:

```js
// crime.js decides you were caught, and stops caring what happens next
ctx.bus.emit('crime:caught', { ctx, crime });

// police.js decides the consequence
ctx.bus.on('crime:caught', ({ crime }) => this.arrest(ctx, crime));

// prison.js takes custodial sentences
ctx.bus.on('prison:commit', ({ years, crime }) => this.commit(ctx, years, crime));
```

Replacing the sentencing model means rewriting `police.js` alone.

**2. Content is data, registered at boot.**

Careers, events, schools, skills, items, crimes and activities live in `src/content/` as
plain objects in registries. No system hard-codes a career or an event.

**3. Content never mutates state — it declares an effect.**

Every outcome in the game is an effect object applied by the single function in
`core/effects.js`:

```js
{ money: -600, stats: { fitness: 14, health: 8 }, skills: { discipline: 4 }, karma: -4 }
```

That one choke point is why new content cannot corrupt a system it knows nothing about.
It also means a content author never needs to read system code.

### The year pipeline

Pressing **+1 Year** runs this, in order:

| # | System | Responsibility |
|---|---|---|
| 1 | `character` | identity, single entry point for death |
| 2 | `age` | increments age, milestone markers |
| 3 | `prison` | sets `inPrison` before anything reads it |
| 4 | `health` | stat drift, illness, mortality roll |
| 5 | `education` | enrolment, grades, graduation |
| 6 | `career` | performance, XP, promotion, firing |
| 7 | `economy` | salary, tax, cost of living, debt |
| 8 | `skills` | decay |
| 9 | `relationships` | ageing, drift, bereavement, new friends |
| 10 | `crime` | heat decay |
| 11 | `police` | cold cases |
| 12 | `reputation` | fame, respect, karma |
| 13 | `inventory` | depreciation and upkeep |
| 14 | `events` | random life events — last, so it sees the whole year |
| 15 | `save` | autosave |

Systems that only respond to player input (`activities`) have no yearly hook at all.

### Folder map

```
index.html              phone shell
styles/                 tokens → base → components → screens
src/
  core/                 engine, state, effects, registry, bus, seeded RNG
  systems/              fifteen independent systems + index.js manifest
  content/              careers, events, schools, skills, items, crimes, activities
  ui/                   screens, components, router — no game logic
tools/smoke.js          headless simulation harness
```

`src/core` and `src/systems` have **zero DOM dependencies**. That is what lets
`tools/smoke.js` run whole lives in Node, and it is what makes a later React Native port a
rewrite of `src/ui/` only.

---

## Adding things later

**A new career** — copy any file in `src/content/careers/`, edit the values, add one line
to that folder's `index.js`. Requirements, the promotion ladder, salaries and on-the-job
tasks are all declared in the file:

```js
export default {
  id: 'pilot', name: 'Aviation', icon: '✈️',
  requirements: { minAge: 21, education: 'bachelor', stats: { health: 70 } },
  keySkills: ['discipline', 'logic'],
  levels: [
    { title: 'First Officer', salary: 78000, xpToNext: 600 },
    { title: 'Captain',       salary: 165000, minPerformance: 65 },
  ],
  tasks: [{ id: 'longhaul', name: 'Fly long haul', odds: 0.7,
            success: { text: '…', effects: { jobXp: 120, money: 4000 } },
            failure: { text: '…', effects: { stats: { health: -6 } } } }],
};
```

**A new event** — add an object to any array under `src/content/events/`. Gates
(`minAge`, `maxAge`, `once`, `requiresJob`, `when`) and weights are data. An event either
resolves itself with `effects`, or offers `choices` and becomes an interactive prompt.

**A new system** — a module with `id`, `order` and `onYear`, plus one line in
`src/systems/index.js`. Its state branch is saved automatically, because the save system
snapshots the whole tree rather than enumerating fields.

---

## Save system

Saves are a versioned JSON snapshot of the entire state tree, stored in `localStorage`
across three slots. Slot 1 is the autosave, written at the end of every year.

The payload carries a `schema` number and `systems/save.js` holds a `MIGRATIONS` map keyed
by the version being migrated *from*, so a save written today still loads after new systems
are added. The seeded RNG's cursor is part of the payload, so a reloaded life continues on
exactly the same random stream it left.

Saves can also be exported and imported as a text code — useful for sharing a life during a
demo.

Covered by the save: age, money and debt, career and level, education and transcript,
skills, relationships, reputation, criminal record, prison state, possessions, the full life
log, and every content flag.

---

## Design

Dark, dense and thumb-driven, following the supplied reference. Colour, type, spacing and
motion are tokens in `styles/tokens.css` — one file to retheme the app.

- Phone-width layout at every viewport; on desktop it is framed as a device with a context
  panel beside it.
- Bottom tab bar with the **+1 Year** action raised into the centre, where a thumb rests.
- Touch targets ≥ 44px, `env(safe-area-inset-*)` respected, `prefers-reduced-motion`
  honoured, `:focus-visible` rings kept.
- Interactive events arrive as bottom sheets, so the decision and its result read as one
  gesture.

### Scene art

The illustrations on the home menu and the career banner are hand-authored inline SVG in
[`src/ui/art.js`](src/ui/art.js) — eleven scenes, about 27 KB in total for the whole set.

Vector rather than bitmap, deliberately: it stays sharp on every DPI, adds no network
requests to a first load, re-themes with the palette, and carries no stock-photo licence.
Every scene draws into a single `160×96` viewBox and is sliced to fill its container, so
the same artwork serves as a 66×52 list thumbnail and as a full-width banner.

```js
menuRow({ scene: 'city', icon: '🏢', title: 'Career', … })   // scene, with emoji fallback
```

Adding one means adding an entry to `SCENES`. Gradient ids are suffixed per render, so the
same scene can appear twice on a screen without the two fighting over `url(#…)`.

If you would rather ship photography later, the seam is already there: `menuRow` falls back
to `icon` whenever a scene is missing, so swapping in `<img>` is a change to two components.

---

## Gameplay in Phase 1

Each year gives four **energy**. Actions — the gym, studying, a job task, asking for a
raise, training a skill, committing a crime — cost one each, so a year is a set of
trade-offs rather than a stat-maxing exercise.

- **Stats:** health, happiness, fitness, mentality, looks, popularity — rolled at birth, so
  every life starts differently.
- **Skills:** logic, charisma, discipline, creativity, combat, streetwise. They decay if
  untrained after 20 and gate careers.
- **Education:** elementary and high school are automatic; community college, university and
  graduate school are chosen, cost tuition and carry a major that careers check.
- **Careers:** retail, culinary, police, teaching, software development. Interviews can be
  failed. Promotion needs both XP and performance. Poor performance gets you fired.
- **Crime → police → prison** are three separate systems. Getting caught leads to an
  acquittal, a fine, or a sentence, depending on severity, priors and what you can afford in
  legal fees.
- **Death** is a mortality curve weighted by health. Passive lives average 71 years
  (median 75), and neglecting your health shortens that sharply.

### Not in Phase 1

Marriage and children, property and mortgages, a playable court scene, tracked medical
conditions, achievements, and the wider career catalogue. The seams for each already exist:
relationships carry a `kind`, items carry `upkeep` and negative depreciation, and sentencing
is already isolated behind an event.
