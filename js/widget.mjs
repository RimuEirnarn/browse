import { systemLog } from "./boot.mjs"
import { fetch_motd, sanitize } from "./utilities.mjs"

const widgetRegistry = new Map()
const _hidden_registry = {}

/**
 * @typedef WidgetSchema
 * @prop {string} id
 * @prop {('top-right'|'bottom-right')} anchor
 * @prop {() => HTMLElement} render
 * @prop {number?} interval
 */

/**
 *
 * @param {WidgetSchema} param0
 */
function registerWidget({ id, anchor, render, interval = null }) {
  widgetRegistry.set(id, { id, anchor, render, interval })
}

// anchors: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
// disabled anchors: *-left

registerWidget({
  id: 'clock',
  anchor: 'top-right',
  interval: 1000,
  render() {
    const el = document.createElement('div')
    el.className = 'widget'
    el.textContent = new Date().toLocaleTimeString('en-GB')
    return el
  }
})

registerWidget({
  id: 'date',
  anchor: 'top-right',
  render() {
    const el = document.createElement('div')
    el.className = 'widget'
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    return el
  }
})

registerWidget({
  id: "motd",
  anchor: 'top-right',
  render() {
    const el = document.createElement('div')
    el.className = `widget`
    fetch_motd().then(value => el.textContent = value.data)
    return el
  }
})

registerWidget({
  id: "notes",
  anchor: 'top-right',
  render() {
    const note = localStorage.getItem("notes")
    const el = document.createElement('div')
    el.className = `widget ${!note ? "hidden" : ""}`
    el.textContent = sanitize(note)
    return el
  }
})

export function mountWidgets() {
  for (const [id, widget] of widgetRegistry) {
    const anchor = document.getElementById(`anchor-${widget.anchor}`)
    if (!anchor) continue

    const slot = document.createElement('div')
    slot.dataset.widgetId = id

    function refresh() {
      const fresh = widget.render()
      slot.replaceChildren(fresh)
    }

    refresh()
    systemLog.info(`Appending ${id} to ${anchor}`)
    anchor.appendChild(slot)
    _hidden_registry[id] = refresh

    if (widget.interval) {
      setInterval(refresh, widget.interval)
    }
  }
}

/**
 * Update
 * @param {string} name
 */
export function update(name) {
  const event = new CustomEvent("widgets.update", {
    detail: {
      name: name
    }
  })
  const dispatched = document.dispatchEvent(event)
  systemLog.info(`Throwing to widget ${name} returned ${dispatched}`)
}

document.addEventListener("widgets.update", (event) => {
  const name = event.detail?.name || ""
  if (name in _hidden_registry) {
    systemLog.info(`Refreshing ${name}`)
    _hidden_registry[name]()
  }
})
