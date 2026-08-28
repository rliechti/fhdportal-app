export function formatFileSize(bytes, decimalPoint = 2) {
    if (+bytes === 0 || bytes === null || bytes === undefined) return '0 B'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i]
}

export function humanizeCamelCase(value) {
    if (!value) return ''
    return value.replace(/([A-Z])/g, ' $1').trim()
}

export function titleCaseFromSnake(value) {
    if (!value) return ''
    return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
