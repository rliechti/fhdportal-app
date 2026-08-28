import { ref, watch } from 'vue'

const STORAGE_PREFIX = 'fega.table.'
const CURRENT_VERSION = 2

const MIGRATIONS = {
    1: (state) => ({ ...state, columnOrder: [] })
}

function migrate(stored) {
    let state = stored ?? {}
    let version = Number(state.v ?? 1)
    while (version < CURRENT_VERSION) {
        const step = MIGRATIONS[version]
        if (!step) return { v: CURRENT_VERSION }
        state = step(state)
        version += 1
    }
    return { ...state, v: CURRENT_VERSION }
}

function readStoredPreferences(tableId) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + tableId)
        return migrate(raw ? JSON.parse(raw) : {})
    } catch (e) {
        return { v: CURRENT_VERSION }
    }
}

export function useTablePreferences(
    tableId,
    {
        itemsPerPage: defaultItemsPerPage = 10,
        sortBy: defaultSortBy = [],
        hiddenColumns: defaultHiddenColumns = [],
        columnOrder: defaultColumnOrder = []
    } = {}
) {
    const stored = tableId ? readStoredPreferences(tableId) : {}

    const itemsPerPage = ref(stored.itemsPerPage ?? defaultItemsPerPage)
    const sortBy = ref(stored.sortBy ?? defaultSortBy)
    const hiddenColumns = ref(stored.hiddenColumns ?? defaultHiddenColumns)
    const columnOrder = ref(stored.columnOrder ?? defaultColumnOrder)

    function persist() {
        if (!tableId) return
        try {
            localStorage.setItem(
                STORAGE_PREFIX + tableId,
                JSON.stringify({
                    v: CURRENT_VERSION,
                    itemsPerPage: itemsPerPage.value,
                    sortBy: sortBy.value,
                    hiddenColumns: hiddenColumns.value,
                    columnOrder: columnOrder.value
                })
            )
        } catch (e) {
            // Safari private mode / quota exceeded
        }
    }

    watch(itemsPerPage, persist)
    watch([sortBy, hiddenColumns, columnOrder], persist, { deep: true })

    function reset() {
        if (tableId) {
            try {
                localStorage.removeItem(STORAGE_PREFIX + tableId)
            } catch (e) {
                // ignore
            }
        }
        itemsPerPage.value = defaultItemsPerPage
        sortBy.value = [...defaultSortBy]
        hiddenColumns.value = [...defaultHiddenColumns]
        columnOrder.value = []
    }

    return { itemsPerPage, sortBy, hiddenColumns, columnOrder, reset }
}
