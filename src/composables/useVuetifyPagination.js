import { computed, inject } from 'vue'

const VUETIFY_PAGINATION = Symbol.for('vuetify:data-table-pagination')

export function useVuetifyPagination(fallback) {
    const ctx = inject(VUETIFY_PAGINATION, null)

    if (!ctx && import.meta.env.DEV) {
        console.warn('[DataTable] Vuetify pagination context unavailable — falling back to props.')
    }

    const page = computed(() => (ctx ? ctx.page.value : fallback.page.value))
    const itemsPerPage = computed(() =>
        ctx ? ctx.itemsPerPage.value : fallback.itemsPerPage.value
    )
    const itemsLength = computed(() => (ctx ? ctx.itemsLength.value : fallback.itemsLength.value))
    const pageCount = computed(() => {
        if (ctx) return ctx.pageCount.value
        if (!itemsLength.value || !itemsPerPage.value) return 1
        return Math.max(1, Math.ceil(itemsLength.value / itemsPerPage.value))
    })
    const firstItem = computed(() => {
        if (!itemsLength.value) return 0
        if (ctx) return ctx.startIndex.value + 1
        return (page.value - 1) * itemsPerPage.value + 1
    })
    const lastItem = computed(() => {
        if (ctx) return ctx.stopIndex.value
        return Math.min(itemsLength.value, page.value * itemsPerPage.value)
    })

    function setPage(value) {
        if (ctx) ctx.setPage(value)
        else fallback.setPage(value)
    }
    function setItemsPerPage(value) {
        if (ctx) ctx.setItemsPerPage(value)
        else fallback.setItemsPerPage(value)
    }

    return {
        available: !!ctx,
        page,
        itemsPerPage,
        itemsLength,
        pageCount,
        firstItem,
        lastItem,
        setPage,
        setItemsPerPage
    }
}
