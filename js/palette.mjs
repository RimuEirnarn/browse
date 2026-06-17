import { systemLog } from "./boot.mjs"

/** @type {HTMLDivElement} */
const palette = document.querySelector("#palette")
/** @type {HTMLInputElement} */
const palette_input = document.querySelector("#palette_input")
/** @type {(() => void)[]} */
export const open_callbacks = []
/** @type {(() => void)[]} */
export const close_callbacks = []

export function openPalette() {
  palette.style.display = "block"
  palette.classList.add("solving")
  setTimeout(() => {
    palette_input.focus()
    palette_input.select()
    palette.classList.remove("solving")
    open_callbacks.forEach(val => val())
  }, 300)
}

export function closePalette() {
  palette.classList.add("dissolving-fast")
  setTimeout(() => {
    palette.style.display = ""
    palette_input.blur()
    palette.classList.remove("dissolving-fast")
    palette_input.value = ""
    close_callbacks.forEach(val => val())
  }, 300)
}

export function init_palette() {
  systemLog.info("Initialized palette")
  document.addEventListener('keydown', (e) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault() // stops browser's default Ctrl+K behavior (focus address bar)
      openPalette()
    }
    if (e.key === 'Escape') {
      closePalette()
    }
  })
}
