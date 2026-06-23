import { bootSequence, systemLog } from "./boot.mjs";
import { prompt } from "./modals.mjs";
import { closePalette, open_callbacks } from "./palette.mjs";
import { toast } from "./toasts.mjs";
import { sanitize } from "./utilities.mjs"

const results_element = document.getElementById("results")
const input_element = document.getElementById("palette_input")
const mode_element = document.getElementById('mode');
const section_label = document.getElementById('section_label');
const prefix_tips = document.getElementById('prefix_tips');
const status = document.getElementById('palette_status');
const ghost = document.getElementById('ghost')
const no_update_prefixes = [">", "?"]
let active_index = 0;
const debug = true;

/** @typedef {import("./modals.mjs").ModalSchema} ModalSchema */
/** @typedef {import("./modals.mjs").FieldSchema} FieldSchema */

/**
 * @typedef CommandSchema
 * @prop {string} desc
 * @prop {() => null} callback
 */

/** @type {Map.<string, CommandSchema>} */
const commands = new Map()
const ruler = document.createElement('span')
ruler.style.cssText = `
  position: absolute;
  visibility: hidden;
  opacity: 0;
  white-space: pre;
  font-family: var(--font-mono);
  font-size: 10px;
`
document.body.appendChild(ruler)

/**
 * @typedef ResultQuery
 * @prop {string} icon
 * @prop {string} title
 * @prop {string} sub
 * @prop {string} badge
 * @prop {string} badge_class
 * @prop {boolean} active
 * @prop {string} action
 * @prop {string} type
 */

/** @type {ResultQuery[]} */
// const demo_res = [
//   { icon: 'nf-cod-globe', type: 'url', title: 'github.com/NekoRisya', sub: 'https://github.com/NekoRisya', badge: 'recent', badge_class: 'badge-hist', action: "https://github.com/NekoRisya" },
//   { icon: 'nf-cod-terminal', type: 'cmd', title: 'open system settings', sub: '/settings · system configuration', badge: 'cmd', badge_class: 'badge-cmd', action: "settings" },
//   { icon: 'nf-cod-bookmark', type: 'bookmark', title: 'Obsidian vault notes', sub: 'obsidian://open?vault=main', badge: 'bookmark', badge_class: 'badge-url', action: 'command://obsidian' },
// ];
const demo_res = []

/** @type {ResultQuery[]} */
const res = []

/**
 * Register a command
 * @param {string} name
 * @param {string} desc
 * @param {() => null} callback
 */
export function register(name, desc, callback) {
  systemLog.info(`Registering command ${name}`)
  commands.set(name, {desc, callback})
}

/**
 * Push result with deduplication
 * @param {string} type - Result type (url, cmd, search, ai, etc)
 * @param {string} action - The action/URL value
 * @param {string} [query=''] - The query/display value
 */
function push_result(type, action, query = '') {
  let sub = '';
  switch (type) {
    case 'url':
      sub = action;
      break;
    case 'search':
    case 'ai':
    case 'cmd':
      sub = query;
      break;
    default:
      sub = query;
  }

  // Check for duplicates by type and action combination
  if (res.some(element => element.type === type && element.action === action)) {
    return;
  }

  res.push({
    icon: type_icons(type),
    type,
    title: query || action,
    sub,
    badge: type,
    badge_class: type_badges(type),
    active: false,
    action
  });

  save_results();
}

function save_results() {
  localStorage.setItem("history", JSON.stringify(res))
}

function load_results() {
  const data = localStorage.getItem("history")
  if (!data) return;
  res.push(...JSON.parse(data))
}

function mode_for(val) {
  if (val.startsWith('/')) return 'command';
  if (val.startsWith('@')) return 'bookmark';
  if (val.startsWith('#')) return 'history';
  if (val.startsWith("?")) return 'ai';
  if (val.startsWith(">")) return 'eval';
  return 'omni';
}

function type_icons(val) {
  if (val == "url") return 'nf-cod-globe'
  if (val == 'cmd') return 'nf-cod-terminal'
  if (val == 'bookmark') return 'nf-cod-bookmark'
  if (val == 'hist') return 'nf-cod-history'
  if (val == 'search') return 'nf-cod-search'
  if (val == 'ai') return 'nf-cod-sparkle'
  return 'nf-cod-globe'
}

function type_badges(val) {
  if (val == "url") return 'badge-url'
  if (val == 'cmd') return 'badge-cmd'
  if (val == 'bookmark') return 'badge-hist'
  if (val == 'hist') return 'badge-hist'
  if (val == 'search') return 'badge-url'
  if (val == 'ai') return 'badge-url'
  return 'badge-url'
}

/**
 * Create result item element with event listener
 * @param {ResultQuery} item - Result query object
 * @param {number} index - Index of the result
 * @returns {HTMLElement}
 */
export function create_result_element({ icon, title, sub, badge, badge_class, active, type, action }, index) {
  const container = document.createElement('div');
  container.className = `result-item ${active ? 'active' : ''}`;

  const iconDiv = document.createElement('div');
  iconDiv.className = 'result-icon url';
  const iconElem = document.createElement('i');
  iconElem.className = `nf ${sanitize(icon)}`;
  iconElem.setAttribute('aria-hidden', 'true');
  iconDiv.appendChild(iconElem);

  const textDiv = document.createElement('div');
  textDiv.className = 'result-text';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'result-title';
  titleDiv.textContent = title;

  const subDiv = document.createElement('div');
  subDiv.className = 'result-sub';
  subDiv.textContent = sub;

  textDiv.appendChild(titleDiv);
  textDiv.appendChild(subDiv);

  const badge_elem = document.createElement('span');
  badge_elem.className = `result-badge ${sanitize(badge_class)}`;
  badge_elem.textContent = sanitize(badge);

  container.appendChild(iconDiv);
  container.appendChild(textDiv);
  container.appendChild(badge_elem);

  // Add click event listener
  container.addEventListener('click', () => {
    const resultItem = { icon, title, sub, badge, badge_class, active, type, action };
    execute(resultItem);
  });

  return container;
}

/**
 * Render result queries to results element
 * @param {ResultQuery[]} results
 */
export function render(results) {
  results_element.innerHTML = '';
  results.forEach((value, index) => {
    const element = create_result_element({ ...value, active: index == active_index }, index);
    results_element.appendChild(element);
  });
}

/**
 *
 * @param {string} value
 */
function update(value, results) {
  const mode = mode_for(value)
  mode_element.textContent = mode
  prefix_tips.style.display = value ? "none" : "flex"
  section_label.textContent = value ? "results" : "quick prefixes"

  const query = value.replace(/^[\/\>\@\?\#]/, '').toLowerCase();
  let filtered = get_filtered_result(query, mode, results)

  if (!value) filtered = results.slice(0, 4);

  status.textContent = filtered.length + " result" + (filtered.length !== 1 ? 's' : '');
  if (active_index == filtered.length) active_index = 0;

  render(filtered)
}

function clear_buffer() {
  update("", [])
  render([])
}

/**
 *
 * @param {string} query
 * @param {string} mode
 * @param {ResultQuery[]} results
 * @returns
 */
function get_filtered_result(query, mode, results) {
  return results.filter(r => {
    if (mode === 'command') return r.type === 'cmd';
    if (mode === 'bookmark') return r.type === 'bookmark';
    if (mode === 'history') return r.type === 'hist' || r.badge_class === 'badge-hist' || r.type === "url";
    return r.title.toLowerCase().includes(query) || r.sub.toLowerCase().includes(query);
  }).filter(r => !query || r.title.toLowerCase().includes(query) || r.sub.toLowerCase().includes(query));
}

/**
 *
 * @param {string[]} vals
 * @returns
 */
function get_shared_prefix(vals) {
  if (!vals.length) return ''
  let prefix = vals[0]
  for (const v of vals.slice(1)) {
    while (!v.startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      if (!prefix) return ''
    }
  }
  return prefix
}


/**
 *
 * @param {string} val
 * @param {ResultQuery[]} results
 * @returns {string?}
 */
function get_suggestion(val, results) {
  if (!val) return null

  const prefix = /^[\/\>\@\?\#]/.exec(val)?.[0] ?? ''
  const query = val.slice(prefix.length).toLowerCase()
  if (!query) return null

  const matches = get_filtered_result(query, mode_for(prefix), results).filter(r =>
    r.title.toLowerCase().startsWith(query)
  )

  if (!matches.length) return null

  if (matches.length === 1) return prefix + matches[0].title

  const shared = get_shared_prefix(matches.map(r => r.title.toLowerCase()))

  if (shared.length <= query.length) return null

  return prefix + shared
}

/**
 * set prefix of command
 * @param {string} value
 */
function set_prefix(value) {
  input_element.value = value;
  input_element.focus();
  if (no_update_prefixes.includes(value)) update("", [])
  else update(value, res);
}

function update_ghost(val, results) {
  const suggestion = get_suggestion(val, results)
  if (!suggestion || !val) {
    ghost.textContent = ""
    return
  }

  ruler.textContent = val
  const typedWidth = ruler.getBoundingClientRect().width
  if (ruler.textContent) {
    document.documentElement.style.overflow = 'hidden'
  }

  ghost.style.left = `${typedWidth}px`
  ghost.textContent = suggestion.slice(val.length)
}

function run_command(command, identifier = "command://") {
  if (command.startsWith(identifier)) {
    const action = command.replace("/", "")
    console.log(`Running ${action}`)
    commands.get(action)?.callback()
    closePalette()
    return;
  }
}

/**
 *
 * @param {ResultQuery} item
 */
function execute(item) {
  run_command(item.action)
  switch (item.type) {
    case 'url': {
      const url = item.action.startsWith('https://') || item.action.startsWith('http://') ? item.action : `https://${item.action}`;
      window.location.href = url
      break
    }

    case 'cmd':
      commands.get(item.action)?.callback()
      break

    case 'search':
      window.location.href = `https://google.com/search?q=${encodeURIComponent(item.action)}`
      break

    case 'ai':
      window.location.href = `https://claude.ai/new?q=${encodeURIComponent(item.action)}`
      break

    case 'eval':
      run_script(item.action)
      break
  }

  closePalette()
}

function execute_raw_query(val) {
  if (val.startsWith('?')) {
    const query = val.slice(1).trim();
    push_result('ai', query, query);
    window.location.href = `https://claude.ai/new?q=${encodeURIComponent(query)}`
  } else if (val.startsWith('>')) {
    run_script(val.slice(1).trim())
  } else if (val.startsWith("/")) {
    run_command(val, '/')
  } else if (isURL(val) || val.startsWith("https://") || val.startsWith("http://")) {
    const url = val.startsWith('https://') || val.startsWith('http://') ? val : `https://${val}`;
    push_result('url', val);
    window.location.href = url;
  } else {
    push_result('search', val, val);
    window.location.href = `https://google.com/search?q=${encodeURIComponent(val)}`
  }
}

function run_script(raw) {
  try {
    const result = eval(raw)
    console.log('[palette]', result)
    toast(`[Command] ${result}`, { level: 'ok' })
  } catch (err) {
    toast(err.message, { level: 'error' })
  }
}

function isURL(val) {
  return /^[\w-]+\.\w{2,}/.test(val)
}

export function initialize_commands() {
  load_results()
  open_callbacks.push(() => update("", res))
  if (res.length === 0) res.push(...demo_res)
  const flat_res = res.map((result) => result.title)

  for (const [name, command] of commands) {
    if (flat_res.includes(name)) continue
    res.push({ title: name, action: name, sub: command.desc, badge: 'cmd', badge_class: type_badges('cmd'), type: 'cmd', icon: type_icons('cmd') })
  }

  input_element.addEventListener("input", element => {
    if (element.target.value.startsWith(">")) {
      clear_buffer()
      return;
    };
    active_index = 0
    update_ghost(element.target.value, res)
    update(element.target.value, res)
  })

  input_element.addEventListener('keydown', element => {
    const items = results_element.querySelectorAll('.result-item');
    if (element.key === "Enter") {
      const prefix = input_element.value.at(0) || ""
      const active = get_filtered_result(input_element.value.slice(1), mode_for(prefix), res)[active_index]
      if (active) execute(active)
      else execute_raw_query(input_element.value)
    }
    if (element.key === 'ArrowDown') {
      element.preventDefault();
      if (input_element.value.startsWith(">")) { clear_buffer(); return; }
      active_index = Math.min(active_index + 1, items.length - 1);
      update(input_element.value, res);
    }
    if (element.key === 'ArrowUp') {
      element.preventDefault();
      if (input_element.value.startsWith(">")) { clear_buffer(); return; }
      active_index = Math.max(active_index - 1, 0);
      update(input_element.value, res);
    }
    if (element.key === 'Tab') {
      element.preventDefault()
      if (input_element.value.startsWith(">")) { clear_buffer(); return; }

      const suggestion = get_suggestion(input_element.value, res)
      if (suggestion) {
        input_element.value = suggestion
        ghost.textContent = ''
        update(suggestion, res)
      }
    }
  });

  document.querySelectorAll("[data-cid]").forEach(element => {
    const command_id = element.attributes["data-cid"].value
    element.addEventListener("click", () => set_prefix(command_id))
  })
  systemLog.info("Initialized commands")
  bootSequence.updateProgress()
}


