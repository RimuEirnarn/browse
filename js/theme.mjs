import { bootSequence, systemLog } from "./boot.mjs";
import { register } from "./commands.mjs";

const theme = localStorage.getItem("browse-theme") || "light"

export function initialize_theme() {
  document.querySelector('html').setAttribute('data-theme', theme);
  register("theme", "Change theme", () => {
    let then = localStorage.getItem('browse-theme') || 'light'
    let now = then === "light" ? "dark" : 'light'
    localStorage.setItem("browse-theme", now);
    document.querySelector('html').setAttribute('data-theme', now)
  })
  systemLog.info("Theme manager loaded")
  bootSequence.updateProgress()
}
