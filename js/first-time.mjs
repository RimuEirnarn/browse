/**
<div class="first-time-dweller">
  <div class="message">
    <h3 class="press-start-2p mb-4">Welcome!</h3>

    <p class="mb-2">This is a start page dashboard—a command-line driven start page</p>
    <p class="mb-2">To open up command palette, type <kbd>Ctrl+K</kbd></p>

    <p class="mb-4 text-red">Warning! Some contents inside might have themes of depression and suicide. Please be advised</p>

    <button class="finalize-ftd pixelify-sans">I understand</button>
  </div>
</div>
*/

import { bootSequence, systemLog } from "./boot.mjs";

const GENERIC_TEXT_CLASS = "mb-2 text-white"

function is_first_time_initialized() {
  return localStorage.getItem("lunaeri-first-time") !== "initialized"
}

/**
 *
 * @param {HTMLDivElement} box
 * @param {string} message
 * @param {string} classList
 * @param {boolean} [textMode=false]
 * @param {string} [elementTag="p"]
 * @returns {HTMLParagraphElement}
 */
function create_message(box, message, classList, textMode = false, elementTag = "p") {
  const x = document.createElement(elementTag)
  if (textMode) x.textContent = message
  else x.innerHTML = message
  x.classList = `${classList}`
  box.appendChild(x)
  return x
}

export function initialize_first_time() {
  if (!is_first_time_initialized()) {
    systemLog.info("First time experience is already experienced")
    bootSequence.updateProgress()
    return
  };
  const overlay = document.createElement("div")
  overlay.className = 'first-time-dweller ft-visible'

  const message = document.createElement("div")
  message.className = "message"
  overlay.appendChild(message)

  // const title = document.createElement("h1")
  // title.className = "press-start-2p-regular mb-4 text-white"
  // title.textContent = "LUNAERI SYSTSEM INITIALIZED"
  // message.appendChild(title)
  create_message(message, "LUNAERI SYSTEM INITIALIZED", "press-start-2p-regular mb-4 text-white", false, "h1")

  // const message_1 = document.createElement("p")
  // message_1.className = "mb-2 text-white"
  // message_1.textContent = "Command-line start page ready"
  // message.appendChild(message_1)
  create_message(message, "Command-line start page ready", GENERIC_TEXT_CLASS, false)
  create_message(message, "Press <kbd class='silkscreen-bold text-white'>CTRL+K</kbd> to access command palette", "text-white mb-4")
  create_message(message, "Content Advisory:", "text-white mb-2")
  create_message(message, "Some entries contain mature emotional themes such as isolation, depression, suicide, and mortality.", "mb-4 text-red")

  const finalize_container = document.createElement("div")
  finalize_container.className = "finalize-panel"

  const finalize = document.createElement("button")
  finalize.className = "finalize-ftd text-white"
  finalize.textContent = "Initialize"
  finalize_container.appendChild(finalize)
  message.appendChild(finalize_container)

  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('ft-visible'))

  finalize.addEventListener("click", () => {
    localStorage.setItem("lunaeri-first-time", "initialized")
    overlay.classList.remove('ft-visible')
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true})
  })
  systemLog.info("Initialized first time experience")
  bootSequence.updateProgress()
}
