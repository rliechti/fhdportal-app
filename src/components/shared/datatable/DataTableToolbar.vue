<template>
    <v-defaults-provider :defaults="TOOLBAR_CONTROL_DEFAULTS">
        <div class="fega-data-table__toolbar">
            <div class="fega-data-table__toolbar-start">
                <v-text-field
                    v-if="showSearch"
                    :model-value="search"
                    :label="searchLabel"
                    prepend-inner-icon="mdi-magnify"
                    single-line
                    clearable
                    class="fega-data-table__search"
                    @update:model-value="(v) => $emit('update:search', v)"
                />
                <slot name="inline" />
                <FilterMenu
                    v-if="showFilters"
                    :label="filterLabel"
                    :active="filtersActive"
                    :filter-count="filterCount"
                    @reset="$emit('reset-filters')"
                >
                    <slot name="filters" />
                </FilterMenu>
                <ColumnManagerMenu
                    v-if="showColumns"
                    :headers="headers"
                    :hidden="hiddenColumns"
                    :dirty="columnsDirty"
                    @update:hidden="(v) => $emit('update:hidden-columns', v)"
                    @update:order="(v) => $emit('update:column-order', v)"
                    @reset="$emit('reset-columns')"
                />
            </div>
            <div class="fega-data-table__toolbar-end">
                <slot name="actions" />
                <ToolbarActions
                    :primary-action="primaryAction"
                    :primary-action-items="primaryActionItems"
                    :secondary-actions="secondaryActions"
                    @primary-action="$emit('primary-action')"
                    @primary-action-select="(v) => $emit('primary-action-select', v)"
                    @secondary-action="(v) => $emit('secondary-action', v)"
                >
                    <template v-if="$slots['overflow-actions']" #overflow-actions>
                        <slot name="overflow-actions" />
                    </template>
                </ToolbarActions>
            </div>
        </div>
    </v-defaults-provider>
</template>

<script setup>
import FilterMenu from './FilterMenu.vue'
import ColumnManagerMenu from './ColumnManagerMenu.vue'
import ToolbarActions from './ToolbarActions.vue'

defineProps({
    search: { type: String, default: '' },
    searchLabel: { type: String, default: 'Search' },
    showSearch: { type: Boolean, default: true },
    showFilters: { type: Boolean, default: false },
    filterLabel: { type: String, default: 'Filters' },
    filtersActive: { type: Boolean, default: false },
    filterCount: { type: Number, default: null },
    showColumns: { type: Boolean, default: true },
    headers: { type: Array, default: () => [] },
    hiddenColumns: { type: Array, default: () => [] },
    columnsDirty: { type: Boolean, default: false },
    primaryAction: { type: Object, default: null },
    primaryActionItems: { type: Array, default: () => [] },
    secondaryActions: { type: Array, default: () => [] }
})

defineEmits([
    'update:search',
    'update:hidden-columns',
    'update:column-order',
    'reset-columns',
    'reset-filters',
    'primary-action',
    'primary-action-select',
    'secondary-action'
])

const TOOLBAR_CONTROL_DEFAULTS = {
    VTextField: { density: 'compact', hideDetails: true },
    VSelect: { density: 'compact', hideDetails: true },
    VSwitch: { density: 'compact', hideDetails: true, color: 'primary' }
}
</script>
