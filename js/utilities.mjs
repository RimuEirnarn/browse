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
