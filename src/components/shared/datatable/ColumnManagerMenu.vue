<template>
    <v-badge :model-value="dirty" dot color="primary" offset-x="6" offset-y="6">
        <v-btn
            variant="outlined"
            class="fega-dt-toggle-btn"
            prepend-icon="mdi-view-column-outline"
            :append-icon="open ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        >
            Columns
            <v-menu
                v-model="open"
                activator="parent"
                :close-on-content-click="false"
                location="bottom end"
                offset="6"
            >
                <v-card class="fega-dt-menu fega-dt-columns" border>
                    <div class="fega-dt-menu__header">
                        <span class="fega-dt-menu__title">Columns</span>
                        <v-spacer />
                        <v-btn
                            variant="text"
                            size="small"
                            density="comfortable"
                            prepend-icon="mdi-refresh"
                            :disabled="!dirty"
                            @click="$emit('reset')"
                        >
                            Reset
                        </v-btn>
                    </div>
                    <div class="fega-dt-menu__body">
                        <draggable
                            v-model="rows"
                            handle=".fega-dt-col__handle"
                            filter=".fega-dt-col--fixed"
                            :animation="150"
                            ghost-class="fega-dt-col--ghost"
                            drag-class="fega-dt-col--drag"
                            @end="emitOrder"
                        >
                            <div
                                v-for="row in rows"
                                :key="row.key"
                                class="fega-dt-col"
                                :class="{ 'fega-dt-col--fixed': !row.reorderable }"
                            >
                                <v-icon
                                    class="fega-dt-col__handle"
                                    icon="mdi-drag-horizontal-variant"
                                    size="18"
                                />
                                <v-checkbox-btn
                                    :model-value="!hidden.includes(row.key)"
                                    :disabled="!row.hideable"
                                    density="compact"
                                    @update:model-value="(v) => toggle(row.key, v)"
                                />
                                <span class="fega-dt-col__label">{{ row.title }}</span>
                            </div>
                        </draggable>
                        <template v-for="group in groupedRows" :key="`g-${group.key}`">
                            <div
                                v-for="child in group.children"
                                :key="child.key"
                                class="fega-dt-col fega-dt-col--child"
                            >
                                <v-checkbox-btn
                                    :model-value="!hidden.includes(child.key)"
                                    :disabled="!child.hideable"
                                    density="compact"
                                    @update:model-value="(v) => toggle(child.key, v)"
                                />
                                <span class="fega-dt-col__label">{{ child.title }}</span>
                            </div>
                        </template>
                    </div>
                </v-card>
            </v-menu>
        </v-btn>
    </v-badge>
</template>

<script setup>
import { ref, watch } from 'vue'
import { headerKey } from '@/utils/dataTableHeaders'

const props = defineProps({
    headers: { type: Array, required: true },
    hidden: { type: Array, default: () => [] },
    dirty: { type: Boolean, default: false }
})

const emit = defineEmits(['update:hidden', 'update:order', 'reset'])

const open = ref(false)

// Local list, re-synced from props on every headers/order change. If a
// non-reorderable row is somehow dragged, the parent's applyColumnOrder
// pins it back to its authored index on the next re-sync — self-correcting.
const rows = ref([])
const groupedRows = ref([])

watch(
    () => props.headers,
    (headers) => {
        const list = headers ?? []
        rows.value = list
            .filter((h) => h.title != null && !(h.children && h.children.length))
            .map((h) => ({
                key: headerKey(h),
                title: h.title,
                hideable: h.hideable !== false,
                reorderable: h.reorderable !== false
            }))
        groupedRows.value = list
            .filter((h) => h.children && h.children.length)
            .map((h) => ({
                key: headerKey(h),
                title: h.title,
                children: h.children
                    .filter((c) => c.title != null)
                    .map((c) => ({
                        key: headerKey(c),
                        title: c.title,
                        hideable: c.hideable !== false
                    }))
            }))
    },
    { immediate: true, deep: true }
)

function emitOrder() {
    emit(
        'update:order',
        rows.value.filter((r) => r.reorderable).map((r) => r.key)
    )
}

function visibleCount(hiddenList) {
    return rows.value.filter((r) => !hiddenList.includes(r.key)).length
}

function toggle(key, visible) {
    const next = visible ? props.hidden.filter((k) => k !== key) : [...props.hidden, key]
    // Never hide the last visible top-level column.
    if (!visible && visibleCount(next) < 1) return
    emit('update:hidden', next)
}
</script>
