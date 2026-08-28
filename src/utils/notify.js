import { notify } from '@kyvg/vue3-notification'

export function notifyError(text, title = 'Error') {
  notify({ title, text, type: 'error' })
}

export function notifySuccess(text, title = 'Success') {
  notify({ title, text, type: 'success' })
}
