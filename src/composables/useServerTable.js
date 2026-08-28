import { reactive, ref } from 'vue'
import _ from 'lodash'

export function useServerTable({
    fetcher,
    buildParams,
    onSuccess = () => {},
    guard = () => true,
    itemsPerPage = 10
}) {
    const page = ref(1)
    const loading = ref(false)
    const itemsLength = ref(0)
    const error = ref(null)
    const mirror = reactive({ itemsPerPage, sortBy: [] })
    const started = ref(false)

    function buildCurrentParams() {
        return buildParams({
            page: page.value,
            itemsPerPage: mirror.itemsPerPage,
            sortBy: mirror.sortBy,
            sort: mirror.sortBy.length
                ? { by: mirror.sortBy[0].key, order: mirror.sortBy[0].order || 'asc' }
                : { by: null, order: 'asc' }
        })
    }

    let seq = 0
    async function fetchNow() {
        if (!guard()) return
        const ticket = ++seq
        loading.value = true
        try {
            const response = await fetcher(buildCurrentParams())
            if (ticket !== seq) return // stale response — drop
            error.value = null
            onSuccess(response)
        } catch (e) {
            if (ticket === seq) error.value = e
        } finally {
            if (ticket === seq) loading.value = false
        }
    }

    function reload() {
        if (page.value !== 1) page.value = 1
        fetchNow()
    }

    function onOptions({ page: p, itemsPerPage: perPage, sortBy }) {
        const changed =
            !started.value ||
            p !== page.value ||
            perPage !== mirror.itemsPerPage ||
            !_.isEqual(sortBy || [], mirror.sortBy)
        page.value = p
        mirror.itemsPerPage = perPage
        mirror.sortBy = sortBy || []
        if (changed) {
            started.value = true
            fetchNow()
        }
    }

    return {
        page,
        loading,
        itemsLength,
        error,
        refresh: fetchNow,
        reload,
        onOptions,
        getParams: buildCurrentParams,
        setItemsLength: (n) => {
            itemsLength.value = n
        }
    }
}
