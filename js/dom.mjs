
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
 * @param  {...HTMLElement} children
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

export const html = new Proxy({}, {
  get(_, tag) {
    /** @type {(props: Object.<string, any>, ...children: HTMLElement[]) => HTMLElement} */
    const proxy = (props, ...children) => e(tag, props, ...children)
    return proxy
  }
})
