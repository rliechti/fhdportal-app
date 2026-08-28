import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

function parse(value) {
    if (value === null || value === undefined || value === '') return null
    const d = dayjs(value)
    return d.isValid() ? d : null
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
function isDateOnly(value) {
    return typeof value === 'string' && DATE_ONLY_PATTERN.test(value.trim())
}

export function formatDate(value) {
    const d = parse(value)
    return d ? d.format('DD.MM.YYYY') : ''
}

export function formatDateTime(value) {
    const d = parse(value)
    if (!d) return ''
    return isDateOnly(value) ? d.format('D MMMM YYYY') : d.format('D MMMM YYYY, HH:mm:ss')
}

export function formatLongDateTime(value) {
    const d = parse(value)
    return d ? d.format('LLLL') : ''
}

export function isNotExpired(value) {
    const d = parse(value)
    return d ? d.isAfter(dayjs()) : false
}
