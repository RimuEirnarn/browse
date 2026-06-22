
/**
 * Shorthand for document.query
 * @param {string} selector
 * @returns {Element}
 */
export function query(selector) {
  const element = document.querySelector(selector)
  if (!element) throw new Error("Selector object must be present");
  return element
}

/**
 * Tiny helper for inline "HTML"
 * @param {string} tag
 * @param {Object.<string, any>} props
 * @param  {...HTMLElement|Node|string} children
 * @returns {HTMLElement}
 */
export function e(tag, props, ...children) {
  const element = document.createElement(tag)
  Object.assign(element, props)
  for (const child of children) {
    element.append(child)
  }
  return element
}

/**
 * @typedef {(props?: Object.<string, any>, ...children: (HTMLElement|Node|string)[])} Builder
 */

/**
 * @type {Object.<string, Builder>}
 */
export const html = new Proxy({}, {
  /**
   *
   * @param {any} _
   * @param {string} tag
   * @returns {}
   */
  get(_, tag) {
    return (props, ...children) => e(tag, props, ...children)
  }
})
