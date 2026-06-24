import { bootSequence, systemLog } from "./boot.mjs"

function createLinkElement(rel, href, attributes = {}) {
  const link = document.createElement("link")
  link.rel = rel
  link.href = href
  Object.assign(link, attributes)
  return link
}

function loadLinkResource(link, resourcePath) {
  return new Promise((resolve, reject) => {
    link.onload = () => {
      systemLog.info(`Loaded ${resourcePath}`)
      bootSequence.updateProgress()
      resolve(resourcePath)
    }
    link.onerror = () => {
      reject(new Error(`Failed to load ${resourcePath}`))
    }
    document.head.appendChild(link)
  })
}

function loadCSS(url) {
  return loadLinkResource(
    createLinkElement("stylesheet", url, { blocking: 'render' }),
    url
  )
}

function preloadAsset({as, href}) {
  return loadLinkResource(
    createLinkElement("preload", href, { as }),
    href
  )
}

const superLoader = [
  "https://www.nerdfonts.com/assets/css/webfont.css",
  // "https://fonts.googleapis.com/css2?family=Chewy&family=Jersey+10&family=Micro+5&family=Pixelify+Sans:wght@400..700&family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap",
]

const resources = {
  "css": [
    "css/colors.css",
    "css/main.css",
    "css/utilities.css",
    "css/commands.css",
    "css/widgets.css",
    "css/toasts.css",
    "css/modals.css",
    "css/first-time.css",
    // "css/failing.css"
  ],
  "preload": [
    {as: 'image', href: "img/ENDFIELD_RIMU_AERISYA.webp"}
  ]
}

const assetsLength = Object.values(resources).reduce((sum, arr) => sum + arr.length, 0)
const max_step = assetsLength + superLoader.length + 10

if (!bootSequence.initialize(max_step)) {
  systemLog.error("Failed to initialize boot sequence");
}

bootSequence.start();

const superPromise = superLoader.map(loadCSS)
const preloadPromises = resources.preload.map(preloadAsset)


document.addEventListener("DOMContentLoaded", () => {
  Promise.all(superPromise).then(() => {
    document.dispatchEvent(new CustomEvent("lunaeri.essentials.loaded"))
  })
})

document.addEventListener("lunaeri.essentials.loaded", async () => {
  const cssPromises = resources.css.map(loadCSS)
  try {
    await Promise.all(cssPromises)
    document.querySelector("#fouc")?.remove()
    document.dispatchEvent(new CustomEvent("lunaeri.bootload-start"))
  } catch (error) {
    document.querySelector(".bootloader").classList.add('bootloader-error')
    systemLog.error(error.message)
    document.querySelector("#fouc")?.remove()
  }
})
