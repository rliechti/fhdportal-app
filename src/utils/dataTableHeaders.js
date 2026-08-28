export function headerKey(header) {
    return header.key || header.value
}

export const NON_DATA_KEYS = ['actions', 'action']

export function normalizeHeader(header) {
    const key = headerKey(header)
    const hasChildren = Array.isArray(header.children) && header.children.length > 0
    const isActionColumn = NON_DATA_KEYS.includes(key)
    return {
        ...header,
        sortable: header.sortable !== undefined ? header.sortable : !isActionColumn,
        hideable: header.hideable !== undefined ? header.hideable : true,
        reorderable:
            header.reorderable !== undefined ? header.reorderable : !hasChildren && !isActionColumn,
        exportable: header.exportable !== undefined ? header.exportable : !isActionColumn,
        nowrap: header.nowrap !== undefined ? header.nowrap : true,
        ...(hasChildren ? { children: header.children.map(normalizeHeader) } : {})
    }
}

export const normalizeHeaders = (headers) => (headers ?? []).map(normalizeHeader)

export function flattenHeaders(headers, out = []) {
    for (const h of headers ?? []) {
        out.push(h)
        if (h.children) flattenHeaders(h.children, out)
    }
    return out
}

export const sortableKeySet = (headers) =>
    new Set(
        flattenHeaders(headers)
            .filter((h) => h.sortable !== false)
            .map(headerKey)
    )

export const hideableKeySet = (headers) =>
    new Set(
        flattenHeaders(headers)
            .filter((h) => h.hideable !== false)
            .map(headerKey)
    )

export const reorderableKeys = (headers) =>
    (headers ?? []).filter((h) => h.reorderable !== false).map(headerKey)

export function applyColumnOrder(headers, order) {
    if (!order?.length) return headers
    const pinned = new Map()
    const movable = []
    headers.forEach((h, i) => (h.reorderable === false ? pinned.set(i, h) : movable.push(h)))
    const rank = new Map(order.map((k, i) => [k, i]))
    movable.sort(
        (a, b) => (rank.get(headerKey(a)) ?? Infinity) - (rank.get(headerKey(b)) ?? Infinity)
    )
    const out = []
    let m = 0
    for (let i = 0; i < headers.length; i++) {
        out.push(pinned.has(i) ? pinned.get(i) : movable[m++])
    }
    return out
}

export function applyColumnVisibility(headers, hiddenKeys) {
    if (!hiddenKeys?.length) return headers
    const hidden = new Set(hiddenKeys)
    const walk = (list) =>
        list.reduce((acc, h) => {
            if (hidden.has(headerKey(h))) return acc
            if (h.children) {
                const children = walk(h.children)
                if (children.length) acc.push({ ...h, children })
                return acc
            }
            acc.push(h)
            return acc
        }, [])
    const result = walk(headers)
    return result.length ? result : headers
}

export const flexColumn = (header) => ({ width: '100%', maxWidth: 500, nowrap: true, ...header })

export const fitColumn = (header) => ({ width: '1%', nowrap: true, ...header })

function mergeCellClass(header, className) {
    const existing = header.cellProps?.class
    const merged = existing ? `${existing} ${className}` : className
    return { ...header, cellProps: { ...header.cellProps, class: merged } }
}

export const dateColumn = (header) =>
    mergeCellClass({ width: '1%', align: 'center', nowrap: true, ...header }, 'fega-dt-cell--mono')

export const numericColumn = (header) =>
    mergeCellClass({ width: '1%', nowrap: true, ...header }, 'fega-dt-cell--mono')

export const idColumn = (header) =>
    mergeCellClass({ width: '1%', nowrap: true, ...header }, 'fega-dt-cell--mono')
