import { now, p, request_json } from "./utilities.mjs"
import { bootSequence, systemLog } from "./boot.mjs"
import { compute } from "./moodnr.mjs"
import { init_palette } from "./palette.mjs"
import { initialize_commands } from "./commands.mjs"
import { mountWidgets } from "./widget.mjs"
import "./commands/registries.mjs"

/** @typedef {import("./moodnr.mjs").MNData} MNData */

const max_step = 3
const version = "v0.0.1"
document.addEventListener("DOMContentLoaded", () => {
  systemLog.info("System loaded");

  if (!bootSequence.initialize(max_step)) {
    systemLog.error("Failed to initialize boot sequence");
  }
  bootSequence.start();

  document.querySelectorAll(".version").forEach(element => element.textContent = version)

  request_json(`https://rimueirnarn.pythonanywhere.com/api/revision?ts=${now()}`).then((value) => {
    document.querySelector(".lunae-version-info").textContent = value.data;
    systemLog.info(`Version info loaded: ${value.data}`);
    bootSequence.updateProgress()
  }).catch((err) => {
    systemLog.error(`Failed to load version info: ${err.message}`);
  });

  request_json(`https://rimueirnarn.pythonanywhere.com/api/status?ts=${now()}`).then((value) => {
    const { AWF: awf, AWS: aws, BD: bd, HPY: hpy, NR: nr } = value.detail;
    const summed = awf + aws + bd + hpy + nr;
    const P = (x) => p(x, summed);

    // Status data with class names and values
    const statusData = [
      { name: 'aws', value: aws, percent: P(aws) },
      { name: 'hpy', value: hpy, percent: P(hpy) },
      { name: 'nr', value: nr, percent: P(nr) },
      { name: 'bd', value: bd, percent: P(bd) },
      { name: 'awf', value: awf, percent: P(awf) }
    ];

    // Update progress bar in one operation
    statusData.forEach(status => {
      document.querySelector(`.${status.name}`).style.width = `${status.percent}%`;
    });

    // Update info text with colors for each status
    // document.querySelector(".lunae-rimu-info").innerHTML = `<span class="text-aws">${aws}</span>/<span class="text-hpy">${hpy}</span>/<span class="text-nr">${nr}</span>/<span class="text-bd">${bd}</span>/<span class="text-awf">${awf}</span>`;
    document.querySelector(".lunae-rimu-info").textContent = `${aws}/${hpy}/${nr}/${bd}/${awf}`
    const hp = document.querySelector(".system-runtime")
    const score = compute({aws, hpy, nr, bd, awf})
    let hp_class;
    if (score.score >= 100) hp_class = "text-aws"
    else if (score.score >= 90) hp_class = "text-hpy"
    else if (score.score >= 75) hp_class = "text-nr"
    else if (score.score >= 5) hp_class = "text-bd"
    else hp_class = "text-awf"
    hp.textContent = `${score.score.toFixed(2)}% MR`
    hp.classList.add(hp_class)

    bootSequence.updateProgress();
    systemLog.info(`System status loaded: ${aws}/${hpy}/${nr}/${bd}/${awf}`);
  }).catch((err) => {
    systemLog.error(`Failed to load system status: ${err.message}`);
  });

  (() => {
    init_palette()
    initialize_commands()
    mountWidgets()
    bootSequence.updateProgress()
    systemLog.info("Initialized core modules")
  })()

  // setTimeout(() => bootSequence.updateProgress(), 1000)
  // setTimeout(() => bootSequence.updateProgress(), 1500)
  // setTimeout(() => bootSequence.updateProgress(), 2000)
});

