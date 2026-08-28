<template>
    <component
        :is="tableTag"
        class="fega-data-table__table"
        :items="items"
        :headers="headers"
        :loading="loading"
        :search="search"
        :item-value="itemKey"
        :show-select="showSelect"
        :select-strategy="selectStrategy"
        :model-value="selected"
        :filter-keys="filterKeys"
        :items-length="serverSide ? itemsLength : undefined"
        :multi-sort="multiSort"
        :density="density"
        :hover="hover"
        :page="page"
        :items-per-page="itemsPerPage"
        :sort-by="sortBy"
        @update:model-value="(v) => emit('update:selected', v)"
        @update:page="(v) => emit('update:page', v)"
        @update:items-per-page="(v) => emit('update:items-per-page', v)"
        @update:sort-by="(v) => emit('update:sort-by', v)"
        @update:options="(o) => emit('update:options', o)"
    >
        <template #loading>
            <slot name="loading" />
        </template>
        <template #no-data>
            <slot name="no-data" />
        </template>

        <template v-if="showFooter" #bottom>
            <DataTableFooter
                :items-per-page-options="itemsPerPageOptions"
                :items-per-page-label="itemsPerPageLabel"
                :page="page"
                :items-per-page="itemsPerPage"
                :items-length="serverSide ? itemsLength : items.length"
                @update:page="(v) => emit('update:page', v)"
                @update:items-per-page="(v) => emit('update:items-per-page', v)"
            >
                <template v-if="$slots['footer-prepend']" #prepend>
                    <slot name="footer-prepend" />
                </template>
                <template v-if="$slots['footer-append']" #append>
                    <slot name="footer-append" />
                </template>
            </DataTableFooter>
        </template>

        <template v-for="name in forwardedSlotNames" #[name]="slotProps" :key="name">
            <slot :name="name" v-bind="slotProps" />
        </template>
    </component>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import DataTableFooter from './DataTableFooter.vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    headers: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    search: { type: String, default: undefined },
    itemKey: { type: String, default: 'id' },
    showSelect: { type: Boolean, default: false },
    selected: { type: Array, default: () => [] },
    selectStrategy: { type: String, default: 'page' },
    filterKeys: { type: [Array, String], default: undefined },
    serverSide: { type: Boolean, default: false },
    itemsLength: { type: Number, default: 0 },
    multiSort: { type: Boolean, default: false },
    density: { type: String, default: 'compact' },
    hover: { type: Boolean, default: true },
    page: { type: Number, default: 1 },
    itemsPerPage: { type: Number, default: 10 },
    sortBy: { type: Array, default: () => [] },
    itemsPerPageOptions: { type: Array, default: () => [10, 25, 50, 100] },
    itemsPerPageLabel: { type: String, default: 'per page' },
    showFooter: { type: Boolean, default: true }
})

const emit = defineEmits([
    'update:selected',
    'update:page',
    'update:items-per-page',
    'update:sort-by',
    'update:options'
])

const tableTag = computed(() => (props.serverSide ? 'v-data-table-server' : 'v-data-table'))

const RESERVED_SLOTS = ['default', 'loading', 'no-data', 'footer-prepend', 'footer-append']
const slots = useSlots()
const forwardedSlotNames = computed(() =>
    Object.keys(slots).filter((name) => !RESERVED_SLOTS.includes(name))
)
</script>
