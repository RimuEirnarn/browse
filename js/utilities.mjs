/**
 * Request a file
 * @param {string} url
 */
export async function request(url) {
  return fetch(url).then(data => data.text())
}

/**
 * Request JSON
 * @param {string} url
 */
export async function request_json(url) {
  return fetch(url).then(data => data.json())
}

/**
 * Render to post-request
 * @param {string} url
 * @param {(data: string) => null} callback
 * @param {(reason: any) => any} otherwise
 */
export async function render_to(url, callback, otherwise) {
  return request(url)
  .catch(otherwise)
  .then(callback)
}

/**
 * Fetch current timestamp
 * @returns {number}
 */
export function now() {
  return Date.now()
}

/**
 * Percentage of something
 * @param {number} x
 * @param {number} y
 */
export function p(x, y) {
  return (x / y) * 100
}

/**
 * Sanitize a string
 * @param {string} str data
 */
export function sanitize(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  const reg = /[&<>"'/]/gi;
  if (str === undefined || str === null) return "null";
  if (typeof str === "string") return str.replace(reg, (match) => map[match]);
  else return str.toString().replace(reg, (match) => map[match]);
}
