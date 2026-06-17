/**
 * @typedef FieldSchema
 * @prop {string} id
 * @prop {string} label
 * @prop {string} type
 * @prop {string} placeholder
 * @prop {boolean} [required=false]
 * @prop {((any) => boolean | string)?} validate
 * @prop {any?} default
 */

/**
 * @typedef ModalSchema
 * @prop {string} title
 * @prop {FieldSchema[]} fields
 */

/**
 * Prompt user based on Schema
 * @param {ModalSchema} schema
 * @returns
 */
export function prompt(schema) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    const box = document.createElement('div')
    box.className = 'modal-box'

    const title = document.createElement('div')
    title.className = 'modal-title'
    title.textContent = schema.title
    box.appendChild(title)

    const fieldEls = {}
    const errorEls = {}

    for (const field of schema.fields) {
      const group = document.createElement('div')
      group.className = 'modal-group'

      const label = document.createElement('label')
      label.className = 'modal-label'
      label.textContent = field.label
      if (field.required) label.dataset.required = ''
      group.appendChild(label)

      let input

      if (field.type === 'select') {
        input = document.createElement('select')
        input.className = 'modal-input'
        for (const opt of field.options) {
          const o = document.createElement('option')
          o.value = opt
          o.textContent = opt
          if (opt === field.default) o.selected = true
          input.appendChild(o)
        }

      } else if (field.type === 'toggle') {
        const wrap = document.createElement('div')
        wrap.className = 'modal-toggle-wrap'
        input = document.createElement('input')
        input.type = 'checkbox'
        input.className = 'modal-toggle'
        input.checked = field.default ?? false
        const slider = document.createElement('span')
        slider.className = 'modal-toggle-slider'
        wrap.appendChild(input)
        wrap.appendChild(slider)
        group.appendChild(label)
        group.appendChild(wrap)
        fieldEls[field.id] = input
        box.appendChild(group)
        continue

      } else if (field.type === 'textarea') {
        input = document.createElement('textarea')
        input.className = 'modal-input modal-textarea'
        input.placeholder = field.placeholder ?? ''
        input.rows = 4

      } else {
        input = document.createElement('input')
        input.type = field.type
        input.className = 'modal-input'
        input.placeholder = field.placeholder ?? ''
        if (field.default != null) input.value = field.default
      }

      group.appendChild(label)
      group.appendChild(input)

      const error = document.createElement('span')
      error.className = 'modal-error'
      group.appendChild(error)

      fieldEls[field.id] = input
      errorEls[field.id] = error
      box.appendChild(group)
    }

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const cancel = document.createElement('button')
    cancel.className = 'modal-btn modal-btn-cancel'
    cancel.textContent = 'cancel'

    const submit = document.createElement('button')
    submit.className = 'modal-btn modal-btn-submit'
    submit.textContent = 'confirm'

    actions.appendChild(cancel)
    actions.appendChild(submit)
    box.appendChild(actions)
    overlay.appendChild(box)
    document.body.appendChild(overlay)

    requestAnimationFrame(() => overlay.classList.add('modal-visible'))

    const first = Object.values(fieldEls)[0]
    first?.focus()

    function validate() {
      let valid = true
      for (const field of schema.fields) {
        const el = fieldEls[field.id]
        const errEl = errorEls[field.id]
        const val = el.type === 'checkbox' ? el.checked : el.value.trim()

        let msg = ''

        if (field.required && !val) {
          msg = 'required'
        } else if (field.validate) {
          const result = field.validate(val)
          if (result !== true) msg = result
        }

        if (errEl) errEl.textContent = msg
        if (msg) { valid = false; el.classList.add('modal-input-error') }
        else el.classList.remove('modal-input-error')
      }
      return valid
    }

    function collect() {
      const values = {}
      for (const field of schema.fields) {
        const el = fieldEls[field.id]
        values[field.id] = el.type === 'checkbox' ? el.checked : el.value.trim()
      }
      return values
    }

    function close(result) {
      overlay.classList.remove('modal-visible')
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true })
      resolve(result)
    }

    submit.addEventListener('click', () => {
      if (validate()) close(collect())
    })

    cancel.addEventListener('click', () => close(null))

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null)
    })

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close(null)
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        if (validate()) close(collect())
      }
      if (e.key === 'Tab') {
        const focusable = [...box.querySelectorAll('input, select, textarea, button')]
        const first = focusable[0]
        const last = focusable.at(-1)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    })
  })
}
