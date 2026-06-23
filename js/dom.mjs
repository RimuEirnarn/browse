/**
 * @typedef CommonProps
 *
 * @prop {string} [class]
 * @prop {Partial<CSSStyleDeclaration>} [style]
 * @prop {Record<string, string>} [dataset]
 * @prop {Record<string, EventListener|({handler: EventListener} & EventListenerOptions)} [on]
 */


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
 *
 * @template {keyof HTMLElementTagNameMap} K
 *
 * @param {K} tag
 * @param {CommonProps & Partial<HTMLElementTagNameMap[K]>} [props]
 * @param  {...Node|string} children
 * @returns {HTMLElementTagNameMap[K]}
 */
export function e(tag, props, ...children) {
  const element = document.createElement(tag)
  const { on, class: className, style, dataset, remaining } = props

  Object.assign(element, props)
  if (className) element.className = className;
  if (style) Object.assign(element.style, style);
  if (dataset) Object.assign(element.dataset, dataset);

  if (on) {
    for (const [event, handler] of Object.entries(on)) {
      if (typeof handler === 'function')
        element.addEventListener(event, handler);
      if (typeof handler === 'object') {
        const { handler: callable, handler_props } = handler;
        element.addEventListener(event, callable, handler_props)
      }
    }
  }

  for (const child of children) {
    element.append(child)
  }
  return element
}

/**
 * @callback Builder
 * @param {Object} [props]
 * @param {...Node|string} children
 * @returns {HTMLElement}
 */

/**
 * @type {Record<string, Builder>}
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
