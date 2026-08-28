<template>
    <div class="fega-data-table__footer">
        <div class="fega-data-table__footer-start">
            <slot name="prepend" />
            <v-select
                :model-value="resolvedItemsPerPage"
                :items="perPageItems"
                density="compact"
                variant="outlined"
                hide-details
                class="fega-data-table__per-page"
                @update:model-value="(v) => setItemsPerPage(Number(v))"
            />
            <span class="fega-data-table__per-page-label">{{ itemsPerPageLabel }}</span>
        </div>
        <div class="fega-data-table__footer-end">
            <span v-if="resolvedItemsLength" class="fega-data-table__range">
                {{ firstItem }}&#8211;{{ lastItem }} of {{ resolvedItemsLength }}
            </span>
            <v-pagination
                v-if="pageCount > 1"
                :model-value="resolvedPage"
                :length="pageCount"
                :total-visible="totalVisible"
                density="compact"
                variant="text"
                rounded="circle"
                first-icon="mdi-chevron-double-left"
                prev-icon="mdi-chevron-left"
                next-icon="mdi-chevron-right"
                last-icon="mdi-chevron-double-right"
                show-first-last-page
                @update:model-value="setPage"
            />
            <slot name="append" />
        </div>
    </div>
</template>

<style scoped>
/* Hide page numbers and ellipses in pagination */
:deep(.v-pagination__item),
:deep(.v-pagination__more) {
    display: none;
}
</style>

<script setup>
import { computed } from 'vue'
import { useVuetifyPagination } from '@/composables/useVuetifyPagination'

const props = defineProps({
    itemsPerPageOptions: {
        type: Array,
        default: () => [10, 25, 50, 100]
    },
    itemsPerPageLabel: {
        type: String,
        default: 'per page'
    },
    page: {
        type: Number,
        default: 1
    },
    itemsPerPage: {
        type: Number,
        default: 10
    },
    itemsLength: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['update:page', 'update:items-per-page'])

const fallback = {
    page: computed(() => props.page),
    itemsPerPage: computed(() => props.itemsPerPage),
    itemsLength: computed(() => props.itemsLength),
    setPage: (v) => emit('update:page', v),
    setItemsPerPage: (v) => emit('update:items-per-page', v)
}

const {
    page: resolvedPage,
    itemsPerPage: resolvedItemsPerPage,
    itemsLength: resolvedItemsLength,
    pageCount,
    firstItem,
    lastItem,
    setPage,
    setItemsPerPage
} = useVuetifyPagination(fallback)

const perPageItems = computed(() =>
    props.itemsPerPageOptions.map((v) => ({ title: String(v), value: v }))
)

const totalVisible = computed(() => (pageCount.value > 7 ? 5 : undefined))
</script>
