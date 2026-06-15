import { request_json } from "./utilities.mjs"
import { bootSequence, systemLog } from "./boot.mjs"

const max_step = 5

document.addEventListener("DOMContentLoaded", () => {
  systemLog.info("System loaded");

  if (!bootSequence.initialize(max_step)) {
    systemLog.error("Failed to initialize boot sequence");
  }
  bootSequence.start();

  request_json("https://rimueirnarn.pythonanywhere.com/api/revision").then((value) => {
    document.querySelector(".lunae-version-info").textContent = value.data;
    systemLog.info(`Version info loaded: ${value.data}`);
    bootSequence.updateProgress()
  }).catch((err) => {
    systemLog.error(`Failed to load version info: ${err.message}`);
  });

  request_json("https://rimueirnarn.pythonanywhere.com/api/status").then((value) => {
    const { AWF: awf, AWS: aws, BD: bd, HPY: hpy, NR: nr } = value.detail;
    document.querySelector(".lunae-rimu-info").textContent = `${awf}/${aws}/${bd}/${hpy}/${nr}`;
    systemLog.info(`System status loaded: ${awf}/${aws}/${bd}/${hpy}/${nr}`);
    bootSequence.updateProgress()
  }).catch((err) => {
    systemLog.error(`Failed to load system status: ${err.message}`);
  });

  setTimeout(() => bootSequence.updateProgress(), 1000)
  setTimeout(() => bootSequence.updateProgress(), 1500)
  setTimeout(() => bootSequence.updateProgress(), 2000)
});
