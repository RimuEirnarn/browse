import { request_json } from "./utilities.mjs"
import { bootSequence, systemLog } from "./boot.mjs"

document.addEventListener("DOMContentLoaded", () => {
  systemLog.info("System loaded");

  // Initialize boot sequence
  if (!bootSequence.initialize()) {
    systemLog.error("Failed to initialize boot sequence");
  }

  request_json("https://rimueirnarn.pythonanywhere.com/api/revision").then((value) => {
    document.querySelector(".lunae-version-info").textContent = value.data;
    systemLog.info(`Version info loaded: ${value.data}`);
  }).catch((err) => {
    systemLog.error(`Failed to load version info: ${err.message}`);
  });

  request_json("https://rimueirnarn.pythonanywhere.com/api/status").then((value) => {
    const { AWF: awf, AWS: aws, BD: bd, HPY: hpy, NR: nr } = value.detail;
    document.querySelector(".lunae-rimu-info").textContent = `${awf}/${aws}/${bd}/${hpy}/${nr}`;
    systemLog.info(`System status loaded: ${awf}/${aws}/${bd}/${hpy}/${nr}`);
  }).catch((err) => {
    systemLog.error(`Failed to load system status: ${err.message}`);
  });

  // Start boot sequence
  bootSequence.start();
});
