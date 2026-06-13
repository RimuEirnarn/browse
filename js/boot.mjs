// System Logger
class SystemLogger {
  /**
   * System Logger
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
    this.logs = [];
  }

  /**
   *
   * @param {string} level
   * @param {string} message
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, module: this.name };
    this.logs.push(entry);
    console.log(`[${level.toUpperCase().padEnd(5, " ")}] [${this.name}] ${message}`);

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
  constructor() {
    this.width = 0;
    this.bootInterval = null;
    this.bootloaderPg = null;
    this.bootloaderInfo = null;
    this.diff = 0;
    this.diffOffset = 0;
    this.logger = new SystemLogger("BootSequence");
  }

  initialize() {
    this.bootloaderPg = document.querySelector(".progress > div");
    this.bootloaderInfo = document.querySelector(".loader-info");

    if (!this.bootloaderPg || !this.bootloaderInfo) {
      this.logger.error("Bootloader UI elements not found");
      return false;
    }

    this.logger.info("Boot sequence initialized");
    return true;
  }

  start() {
    this.logger.info("Starting boot sequence");
    this.width = 0;

    this.bootInterval = setInterval(() => {
      this.updateProgress();
    }, 10);
  }

  updateProgress() {
    const progressRatio = this.width / 100;

    // Update UI
    this.bootloaderInfo.textContent = `${this.width}%`;
    // Max size must be below updated text content.
    const maxSize = document.documentElement.clientWidth - this.bootloaderInfo.offsetWidth;
    this.bootloaderPg.style.width = `${this.width}%`;

    // Handle positioning changes
    if (maxSize !== this.diff) {
      this.logger.debug(`Progress bar adjusted: ${this.diff} -> ${maxSize}`);
      this.diff = maxSize;
      this.diffOffset = this.bootloaderInfo.offsetWidth;
    }

    this.bootloaderInfo.style.left = `${progressRatio * maxSize}px`;

    if (this.width >= 100) {
      this.complete();
    } else {
      this.width += 1;
    }
  }

  complete() {
    clearInterval(this.bootInterval);
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
