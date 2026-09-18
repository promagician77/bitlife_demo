/**
 * Entry point.
 *
 * Boot order: content into the registries, systems into the engine, then the
 * UI. Nothing here is game logic — it is wiring only.
 */
import { loadContent } from './content/index.js';
import { Engine } from './core/engine.js';
import { bus } from './core/bus.js';
import { systems } from './systems/index.js';
import { App } from './ui/app.js';

loadContent();

const engine = new Engine({ bus });
for (const system of systems) engine.use(system);

const app = new App(engine);

/* Death is the one event the shell reacts to directly. */
bus.on('game:over', () => {
  // Let the current render finish before switching screens.
  queueMicrotask(() => app.go('gameover', { replace: true }));
});

app.render();

/* Cosmetic: keep the mock status bar honest. */
const clock = document.getElementById('statusClock');
const tick = () => {
  if (!clock) return;
  clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
tick();
setInterval(tick, 30_000);

/* Handy for poking at the model from the console during the demo. */
if (typeof window !== 'undefined') {
  window.LifeQuest = { engine, app, bus };
}
