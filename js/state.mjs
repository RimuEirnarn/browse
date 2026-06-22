/**
 * @typedef CommandState
 * @prop {boolean} triggered
 * @prop {string[]} disallow_context
 * @prop {('modals'|'first-time'|'command'|'')} context current context
 */

/** @type {CommandState} */
export const command_state = {
  triggered: false,
  disallow_context: ["modals", "first-time", "command"],
  context: ""
}
