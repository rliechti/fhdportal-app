<template>
    <div class="fega-data-table">
        <DataTableToolbar
            v-if="showToolbar"
            :search="internalSearch"
            :search-label="searchLabel"
            :show-search="showSearch"
            :show-filters="!!slots.filters"
            :filter-label="filterLabel"
            :filters-active="filtersActive"
            :filter-count="filterCount"
            :show-columns="showColumnsMenu"
            :headers="layout.orderedHeaders.value"
            :hidden-columns="prefs.hiddenColumns.value"
            :columns-dirty="layout.isDirty.value"
            :primary-action="primaryAction"
            :primary-action-items="primaryActionItems"
            :secondary-actions="secondaryActions"
            @update:search="(v) => (internalSearch = v)"
            @update:hidden-columns="layout.setHidden"
            @update:column-order="layout.setOrder"
            @reset-columns="layout.reset"
            @reset-filters="emit('reset-filters')"
            @primary-action="emit('primary-action')"
            @primary-action-select="(v) => emit('primary-action-select', v)"
            @secondary-action="handleSecondaryAction"
        >
            <template v-if="inlineSlotName" #inline>
                <slot :name="inlineSlotName" />
            </template>
            <template v-if="actionsSlotName" #actions>
                <slot :name="actionsSlotName" />
            </template>
            <template v-if="slots.filters" #filters>
                <slot name="filters" />
            </template>
            <template v-if="slots['overflow-actions']" #overflow-actions>
                <slot name="overflow-actions" />
            </template>
        </DataTableToolbar>

        <v-sheet border rounded class="fega-data-table__frame">
            <DataTableSelectionBar
                v-if="showSelect"
                :count="selectedCount"
                :label="selectionLabel"
                :dismissible="selectionDismissible"
                @clear="clearSelection"
            >
                <slot
                    name="selection-actions"
                    :count="selectedCount"
                    :selected="selected"
                    :clear="clearSelection"
                />
            </DataTableSelectionBar>

            <DataGrid
                v-model:page="page"
                v-model:items-per-page="prefs.itemsPerPage.value"
                v-model:sort-by="prefs.sortBy.value"
                :selected="selected"
                :server-side="isServer"
                :items-length="effectiveItemsLength"
                :items="items"
                :headers="layout.visibleHeaders.value"
                :loading="loading"
                :search="passSearch"
                :item-key="itemKey"
                :show-select="showSelect"
                :select-strategy="selectStrategy"
                :filter-keys="filterKeys"
                :multi-sort="multiSort"
                :density="density"
                :hover="hover"
                :show-footer="showFooter"
                :items-per-page-options="itemsPerPageOptions"
                :items-per-page-label="itemsPerPageLabel"
                @update:selected="(v) => emit('update:selected', v)"
                @update:options="(o) => emit('update:options', o)"
            >
                <template #loading>
                    <slot name="loading">
                        <v-skeleton-loader type="table-row@6" />
                    </slot>
                </template>

                <template #no-data>
                    <slot name="no-data">
                        <div class="pa-6 text-center text-medium-emphasis">
                            {{ noDataText || 'No data available' }}
                        </div>
                    </slot>
                </template>

                <template v-if="slots['footer-prepend']" #footer-prepend>
                    <slot name="footer-prepend" />
                </template>
                <template v-if="slots['footer-append']" #footer-append>
                    <slot name="footer-append" />
                </template>

                <template v-for="name in forwardedSlotNames" #[name]="slotProps" :key="name">
                    <slot :name="name" v-bind="slotProps" />
                </template>
            </DataGrid>
        </v-sheet>
    </div>
</template>

<script setup>
import { computed, ref, useSlots, watch } from 'vue'
import _ from 'lodash'
import { useTablePreferences } from '@/composables/useTablePreferences'
import { useColumnLayout } from '@/composables/useColumnLayout'
import { flattenHeaders, headerKey } from '@/utils/dataTableHeaders'
import { notifyError } from '@/utils/notify'
import DataTableToolbar from './datatable/DataTableToolbar.vue'
import DataTableSelectionBar from './datatable/DataTableSelectionBar.vue'
import DataGrid from './datatable/DataGrid.vue'

const props = defineProps({
    // ── identity & data ──────────────────────────────────────────────
    tableId: { type: String, default: null },
    items: { type: Array, default: () => [] },
    headers: { type: Array, required: true },
    loading: { type: Boolean, default: false },

    // ── server mode ──────────────────────────────────────────────────
    serverSide: { type: Boolean, default: false },
    itemsLength: { type: Number, default: 0 },

    // ── search / filters ─────────────────────────────────────────────
    search: { type: String, default: '' },
    searchLabel: { type: String, default: 'Search' },
    showSearch: { type: Boolean, default: true },
    searchDebounce: { type: Number, default: 350 },
    externalFilter: { type: Boolean, default: false },
    filtersActive: { type: Boolean, default: false },
    filterCount: { type: Number, default: null },
    filterLabel: { type: String, default: 'Filters' },
    filterKeys: { type: [Array, String], default: undefined },

    // ── columns ──────────────────────────────────────────────────────
    showColumnsMenu: { type: Boolean, default: true },
    defaultHiddenColumns: { type: Array, default: () => [] },

    // ── selection ────────────────────────────────────────────────────
    showSelect: { type: Boolean, default: false },
    selected: { type: Array, default: () => [] },
    itemKey: { type: String, default: 'id' },
    selectStrategy: { type: String, default: 'page' },
    selectionLabel: { type: String, default: 'Selected' },
    selectionDismissible: { type: Boolean, default: true },

    // ── actions ──────────────────────────────────────────────────────
    primaryAction: { type: Object, default: null },
    primaryActionItems: { type: Array, default: () => [] },
    secondaryActions: { type: Array, default: () => [] },

    // ── pagination / footer ──────────────────────────────────────────
    itemsPerPageOptions: { type: Array, default: () => [10, 25, 50, 100] },
    defaultItemsPerPage: { type: Number, default: 10 },
    itemsPerPageLabel: { type: String, default: 'per page' },
    showFooter: { type: Boolean, default: true },

    // ── grid ─────────────────────────────────────────────────────────
    defaultSortBy: { type: Array, default: () => [] },
    multiSort: { type: Boolean, default: false },
    density: { type: String, default: 'compact' },
    hover: { type: Boolean, default: true },
    noDataText: { type: String, default: '' },

    exportFilename: { type: String, default: null },
    exportRows: { type: Function, default: null }
})

const emit = defineEmits([
    'update:search',
    'search',
    'update:selected',
    'update:options',
    'reset-filters',
    'primary-action',
    'primary-action-select',
    'secondary-action',
    'clear-selection'
])

const slots = useSlots()

const page = defineModel('page', { type: Number, default: 1 })

// ── search ─────────────────────────────────────────────────────────────────
const internalSearch = ref(props.search)
watch(
    () => props.search,
    (value) => {
        if (value !== internalSearch.value) internalSearch.value = value
    }
)
const debouncedEmitSearch = _.debounce((value) => emit('search', value), props.searchDebounce)
watch(internalSearch, (value) => {
    emit('update:search', value)
    debouncedEmitSearch(value)
})

// ── server mode ──────────────────────────────────────────────────────────────
const isServer = computed(() => props.serverSide)
const effectiveItemsLength = computed(() => props.itemsLength ?? 0)
const passSearch = computed(() =>
    isServer.value || props.externalFilter ? undefined : internalSearch.value
)

// ── preferences + column layout ───────────────────────────────────────────
const prefs = useTablePreferences(props.tableId, {
    itemsPerPage: props.defaultItemsPerPage,
    sortBy: props.defaultSortBy,
    hiddenColumns: props.defaultHiddenColumns,
    columnOrder: []
})
const headersRef = computed(() => props.headers)
const defaultHiddenRef = computed(() => props.defaultHiddenColumns)
const layout = useColumnLayout(headersRef, prefs, defaultHiddenRef)

// ── selection ────────────────────────────────────────────────────────────────
const selectedCount = computed(() => props.selected?.length ?? 0)
function clearSelection() {
    emit('update:selected', [])
    emit('clear-selection')
}

// ── toolbar slot resolution ────────────────────────────────────────────────
const inlineSlotName = computed(() => (slots['toolbar-inline'] ? 'toolbar-inline' : null))
const actionsSlotName = computed(() => (slots.actions ? 'actions' : null))

const showToolbar = computed(
    () =>
        props.showSearch ||
        !!slots.filters ||
        !!inlineSlotName.value ||
        !!actionsSlotName.value ||
        props.showColumnsMenu ||
        !!props.primaryAction ||
        props.primaryActionItems.length > 0
)

// ── overflow menu built-ins ────────────────────────────────────────────────
function resetPreferences() {
    prefs.reset()
    page.value = 1
}

function exportableLeafHeaders() {
    return flattenHeaders(layout.orderedHeaders.value).filter(
        (h) => !h.children && h.exportable !== false
    )
}

function exportCellValue(value) {
    if (value === null || value === undefined) return ''
    if (Array.isArray(value)) return value.map(exportCellValue).join('; ')
    if (typeof value === 'object') return value.title ?? value.name ?? JSON.stringify(value)
    return String(value)
}

async function exportCsv() {
    const headers = exportableLeafHeaders()
    if (!headers.length) return
    let rows
    try {
        rows = props.exportRows ? await props.exportRows() : props.items
    } catch (e) {
        notifyError('Failed to export table. Please try again.')
        return
    }
    // Neutralise spreadsheet formula injection (CWE-1236). A leading apostrophe
    // prevents Excel/LibreOffice from evaluating the cell; CSV quoting alone
    // does not, because the quotes are consumed by the CSV parser first.
    const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r']
    const neutraliseFormula = (str) =>
        FORMULA_TRIGGERS.some((c) => str.startsWith(c)) ? `'${str}` : str
    const escape = (value) => {
        // Strip C0 control characters, then neutralise, then apply CSV quoting.
        // eslint-disable-next-line no-control-regex -- intentional: stripping control chars, not matching them accidentally
        const raw = exportCellValue(value).replace(/[\x00-\x1F\x7F]/g, '')
        return `"${neutraliseFormula(raw).replace(/"/g, '""')}"`
    }
    const lines = [headers.map((h) => escape(h.title || headerKey(h))).join(',')]
    ;(rows || []).forEach((item) => {
        lines.push(headers.map((h) => escape(_.get(item, h.value))).join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    const filename = props.exportFilename || (props.tableId || 'table').replace(/^wizard-/, '')
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

function handleSecondaryAction(value) {
    if (value === '__reset-preferences') {
        resetPreferences()
        return
    }
    if (value === '__export-csv') {
        exportCsv()
        return
    }
    emit('secondary-action', value)
}

const RESERVED_SLOTS = [
    'default',
    'loading',
    'no-data',
    'filters',
    'toolbar-inline',
    'actions',
    'overflow-actions',
    'selection-actions',
    'footer-prepend',
    'footer-append'
]
const forwardedSlotNames = computed(() =>
    Object.keys(slots).filter((name) => !RESERVED_SLOTS.includes(name))
)

defineExpose({
    resetPreferences,
    resetColumns: () => layout.reset(),
    clearSelection
})
</script>
