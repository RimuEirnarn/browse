const toastQueue = document.getElementById('toast-zone')

/**
 * Summons a toast
 * @param {string} message
 * @param {{level: string, duration: number}} param1
 */
export function toast(message, { level = 'info', duration = 3000 } = {}) {
  const el = document.createElement('div')
  el.className = `toast toast-${level}`
  el.textContent = message

  toastQueue.appendChild(el)

  // animate in
  requestAnimationFrame(() => el.classList.add('toast-visible'))

  // auto-dismiss
  setTimeout(() => {
    el.classList.remove('toast-visible')
    el.addEventListener('transitionend', () => el.remove(), { once: true })
  }, duration)
}
