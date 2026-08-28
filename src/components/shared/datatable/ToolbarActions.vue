<template>
    <div class="d-flex align-center ga-2">
        <template v-if="primaryActionItems.length">
            <v-btn
                class="fega-dt-primary-btn"
                :color="primaryAction?.color || 'primary'"
                :disabled="primaryAction?.disabled"
                :prepend-icon="primaryAction?.icon || 'mdi-plus'"
                append-icon="mdi-chevron-down"
            >
                {{ primaryAction?.label || 'Add New' }}
                <v-menu activator="parent" location="bottom end">
                    <v-list density="compact" class="fega-dt-menu-list">
                        <v-list-item
                            v-for="item in primaryActionItems"
                            :key="item.value"
                            :disabled="item.disabled"
                            @click="$emit('primary-action-select', item.value)"
                        >
                            <template v-if="item.icon" #prepend>
                                <v-icon :icon="item.icon" size="18" />
                            </template>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                            <v-list-item-subtitle v-if="item.subtitle">{{
                                item.subtitle
                            }}</v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
        </template>
        <template v-else-if="primaryAction">
            <v-tooltip v-if="primaryAction.tooltip" :text="primaryAction.tooltip" location="top">
                <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                        <v-btn
                            class="fega-dt-primary-btn"
                            :color="primaryAction.color || 'primary'"
                            :disabled="primaryAction.disabled"
                            :prepend-icon="primaryAction.icon || 'mdi-plus'"
                            @click="$emit('primary-action')"
                        >
                            {{ primaryAction.label }}
                        </v-btn>
                    </span>
                </template>
            </v-tooltip>
            <v-btn
                v-else
                class="fega-dt-primary-btn"
                :color="primaryAction.color || 'primary'"
                :disabled="primaryAction.disabled"
                :prepend-icon="primaryAction.icon || 'mdi-plus'"
                @click="$emit('primary-action')"
            >
                {{ primaryAction.label }}
            </v-btn>
        </template>

        <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
                <v-btn icon="mdi-dots-vertical" variant="text" v-bind="menuProps" />
            </template>
            <v-list density="compact" class="fega-dt-menu-list">
                <template v-for="(item, i) in allSecondaryActions" :key="item.value || `divider-${i}`">
                    <v-divider v-if="item.divider" />
                    <v-list-item
                        v-else
                        :disabled="item.disabled"
                        :base-color="item.danger ? 'error' : undefined"
                        @click="$emit('secondary-action', item.value)"
                    >
                        <template v-if="item.icon" #prepend>
                            <v-icon :icon="item.icon" size="18" />
                        </template>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </template>
                <slot name="overflow-actions" />
            </v-list>
        </v-menu>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    primaryAction: { type: Object, default: null },
    primaryActionItems: { type: Array, default: () => [] },
    secondaryActions: { type: Array, default: () => [] }
})

defineEmits(['primary-action', 'primary-action-select', 'secondary-action'])

const BUILT_IN_ACTIONS = [
    { title: 'Reset Preferences', value: '__reset-preferences', icon: 'mdi-restore' },
    { title: 'Export to CSV', value: '__export-csv', icon: 'mdi-file-download-outline' }
]

const allSecondaryActions = computed(() => {
    if (!props.secondaryActions.length) return BUILT_IN_ACTIONS
    return [...BUILT_IN_ACTIONS, { divider: true }, ...props.secondaryActions]
})
</script>
