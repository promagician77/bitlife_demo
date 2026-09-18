/**
 * A very small rendering helper.
 *
 * The demo deliberately avoids a framework: screens are pure functions that
 * return an HTML string, and interaction happens through delegated
 * `data-act` attributes. That keeps the UI layer swappable -- porting this to
 * React Native later means rewriting src/ui/ and nothing else.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape a value for safe interpolation into HTML. */
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

class Raw { constructor(value) { this.value = value; } }

/** Mark a string as already-safe HTML (used for nested templates). */
export const raw = (value) => new Raw(value);

function flatten(value) {
  if (value == null || value === false || value === true) return '';
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(flatten).join('');
  return esc(value);
}

/** Tagged template that escapes every interpolation by default. */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += flatten(values[i]) + strings[i + 1];
  return raw(out);
}

/** Render an html`` result (or plain string) into an element. */
export function mount(el, content) {
  el.innerHTML = content instanceof Raw ? content.value : String(content ?? '');
  return el;
}

/**
 * Delegate clicks on a root element to handlers keyed by `data-act`.
 * The whole dataset of the matched element is passed to the handler.
 */
export function delegate(root, handlers) {
  root.addEventListener('click', (ev) => {
    const target = ev.target.closest('[data-act]');
    if (!target || !root.contains(target)) return;
    const handler = handlers[target.dataset.act];
    if (!handler) return;
    ev.preventDefault();
    handler({ ...target.dataset }, target, ev);
  });
}

/** Attribute helper: `attr('disabled', isDisabled)` -> ` disabled` or ''. */
export const attr = (name, on) => raw(on ? ` ${name}` : '');

/** Inline style helper that drops empty values. */
export const style = (map) =>
  raw(Object.entries(map).filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}:${String(v).replace(/"/g, '')}`).join(';'));
