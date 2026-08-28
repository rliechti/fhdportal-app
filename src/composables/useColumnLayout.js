import { computed, watch } from 'vue'
import {
    normalizeHeaders,
    sortableKeySet,
    hideableKeySet,
    reorderableKeys,
    applyColumnOrder,
    applyColumnVisibility
} from '@/utils/dataTableHeaders'

export function useColumnLayout(headersRef, prefs, defaultHiddenRef) {
    const normalizedHeaders = computed(() => normalizeHeaders(headersRef.value))

    watch(
        normalizedHeaders,
        (list) => {
            if (!list.length) return

            const sortable = sortableKeySet(list)
            if (prefs.sortBy.value.length) {
                const next = prefs.sortBy.value.filter((s) => sortable.has(s.key))
                if (next.length !== prefs.sortBy.value.length) prefs.sortBy.value = next
            }

            const hideable = hideableKeySet(list)
            if (prefs.hiddenColumns.value.length) {
                const next = prefs.hiddenColumns.value.filter((k) => hideable.has(k))
                if (next.length !== prefs.hiddenColumns.value.length)
                    prefs.hiddenColumns.value = next
            }

            const movable = new Set(reorderableKeys(list))
            if (prefs.columnOrder.value.length) {
                const next = prefs.columnOrder.value.filter((k) => movable.has(k))
                if (next.length !== prefs.columnOrder.value.length) prefs.columnOrder.value = next
            }
        },
        { immediate: true }
    )

    const orderedHeaders = computed(() =>
        applyColumnOrder(normalizedHeaders.value, prefs.columnOrder.value)
    )
    const visibleHeaders = computed(() =>
        applyColumnVisibility(orderedHeaders.value, prefs.hiddenColumns.value)
    )

    const isDirty = computed(() => {
        if (prefs.columnOrder.value.length > 0) return true
        const current = [...prefs.hiddenColumns.value].sort()
        const defaults = [...(defaultHiddenRef?.value ?? [])].sort()
        if (current.length !== defaults.length) return true
        return current.some((k, i) => k !== defaults[i])
    })

    function setOrder(keys) {
        prefs.columnOrder.value = keys
    }
    function setHidden(keys) {
        prefs.hiddenColumns.value = keys
    }
    function reset() {
        prefs.columnOrder.value = []
        prefs.hiddenColumns.value = [...(defaultHiddenRef?.value ?? [])]
    }

    return {
        normalizedHeaders,
        orderedHeaders,
        visibleHeaders,
        isDirty,
        setOrder,
        setHidden,
        reset
    }
}
