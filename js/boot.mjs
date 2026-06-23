// System Logger
class SystemLogger {
  /**
   * System Logger
   * @param {string} name
   * @param {number|string} level_limit
   */
  constructor(name, level_limit = -1) {
    this.name = name;
    this.logs = [];
    this.levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    this.callback = [console.debug, console.info, console.warn, console.error, console.error]
    this.level_limit = typeof level_limit == 'string' ? this.levels.indexOf(level_limit) : level_limit
  }

  /**
   *
   * @param {string} level
   * @param {string} message
   */
  log(level, message) {
    const level_index = this.levels.indexOf(level.toUpperCase())
    if (level_index < this.level_limit) return;
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, module: this.name };
    this.logs.push(entry);
    const fn = this.callback[level_index]
    fn(`[${level.toUpperCase().padEnd(5, " ")}] [${this.name}] ${message}`);

    // Push to system log element
    const syslogElement = document.querySelector(".boot-syslog");
    if (syslogElement) {
      const logLine = document.createElement("div");
      logLine.classList.add("syslog-entry")
      logLine.textContent = `[${timestamp}] [${level.toUpperCase().padEnd(5, " ")}] [${this.name}] ${message}`;
      syslogElement.appendChild(logLine);
      // Auto-scroll to bottom
      syslogElement.scrollTop = syslogElement.scrollHeight;
    }
  }

  info(message) {
    this.log("info", message);
  }

  warn(message) {
    this.log("warn", message);
  }

  error(message) {
    this.log("error", message);
  }

  debug(message) {
    this.log("debug", message);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

// Global logger instance
export const systemLog = new SystemLogger("System");

// Boot Sequence Manager
class BootSequence {

  /**
   * Boot sequences
   * @param {number} sequence_limit The amount of shadow jobs before reaching 100%
   * @param {string|number} [level_limit="INFO"]
   */
  constructor(sequence_limit, level_limit = "INFO") {
    this.currentStep = 0;
    this.maxStep = sequence_limit
    this.width = 0;
    this.bootInterval = null;
    this.bootloaderPg = null;
    this.bootloaderInfo = null;
    this.diff = 0;
    this.diffOffset = 0;
    this.logger = new SystemLogger("BootSequence", level_limit);
  }

  /**
   * Initialize boot sequence, when sequence limit is not passed, will use already instantiated value.
   * @param {number?} sequence_limit
   * @returns
   */
  initialize(sequence_limit) {
    this.bootloaderPg = document.querySelector(".progress > div");
    this.bootloaderInfo = document.querySelector(".loader-info");
    this.maxStep = !sequence_limit ? this.sequence_limit : sequence_limit

    if (!this.bootloaderPg || !this.bootloaderInfo) {
      this.logger.error("Bootloader UI elements not found");
      return false;
    }

    this.logger.info("Boot sequence initialized");
    this.logger.info(`Running boot scripts (${this.maxStep} in total)`)
    return true;
  }

  start() {
    this.logger.info("Starting boot sequence");
    this.width = 0;

    // this.bootInterval = setInterval(() => {
    //   this.updateProgress();
    // }, 10);
  }

  draw() {
    const progressRatio = this.width / 100;
    // Update UI
    this.bootloaderInfo.textContent = `${(this.width * 100).toFixed(2)}%`;
    // Max size must be below updated text content.
    const maxSize = document.documentElement.clientWidth - this.bootloaderInfo.offsetWidth;
    this.bootloaderPg.style.width = `${this.width * 100}%`;

    // Handle positioning changes
    if (maxSize !== this.diff) {
      this.logger.debug(`Progress bar adjusted: ${this.diff} -> ${maxSize}`);
      this.diff = maxSize;
      this.diffOffset = this.bootloaderInfo.offsetWidth;
    }

    this.bootloaderInfo.style.left = `${progressRatio * maxSize}px`;
  }

  updateProgress() {
    this.currentStep += 1;
    this.width = this.currentStep / this.maxStep
    this.draw()
    if (this.currentStep >= this.maxStep) {
      this.complete();
      return
    }
  }

  complete() {
    // clearInterval(this.bootInterval);
    this.logger.info("Boot sequence completed");

    const bootloader = document.querySelector(".bootloader");
    if (bootloader) {
      const syslog = bootloader.querySelector(".boot-syslog");
      if (syslog) {
        document.documentElement.style.overflow = "hidden"
        syslog.style.overflow = "hidden";
      }

      bootloader.classList.add("dissolving");

      setTimeout(() => {
        bootloader.remove();
        this.logger.info("Bootloader UI removed");
        document.documentElement.style.overflow = ""
      }, 800);
    }
  }

  stop() {
    if (this.bootInterval) {
      clearInterval(this.bootInterval);
      this.logger.warn("Boot sequence stopped prematurely");
    }
  }

  getSystemLogs() {
    return this.logger.getLogs();
  }
}

export const bootSequence = new BootSequence();
