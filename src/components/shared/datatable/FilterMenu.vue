<template>
    <v-badge :model-value="active" :content="badgeContent" :dot="filterCount == null" color="primary" offset-x="6" offset-y="6">
        <v-btn
            variant="outlined"
            class="fega-dt-toggle-btn"
            prepend-icon="mdi-filter-variant"
            :append-icon="open ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        >
            {{ label }}
            <v-menu
                v-model="open"
                activator="parent"
                :close-on-content-click="false"
                location="bottom start"
                offset="6"
            >
                <v-card class="fega-dt-menu fega-dt-filters" border>
                    <div class="fega-dt-menu__header">
                        <span class="fega-dt-menu__title">{{ label }}</span>
                        <v-spacer />
                        <v-btn
                            variant="text"
                            size="small"
                            density="comfortable"
                            prepend-icon="mdi-refresh"
                            :disabled="!active"
                            @click="$emit('reset')"
                        >
                            Reset
                        </v-btn>
                    </div>
                    <v-defaults-provider :defaults="FILTER_CONTROL_DEFAULTS">
                        <div class="fega-dt-menu__body">
                            <slot />
                        </div>
                    </v-defaults-provider>
                </v-card>
            </v-menu>
        </v-btn>
    </v-badge>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    label: { type: String, default: 'Filters' },
    active: { type: Boolean, default: false },
    filterCount: { type: Number, default: null }
})

defineEmits(['reset'])

const open = ref(false)
const badgeContent = computed(() => (props.filterCount != null ? String(props.filterCount) : undefined))

const FILTER_CONTROL_DEFAULTS = {
    VTextField: { density: 'compact', hideDetails: true },
    VSelect: { density: 'compact', hideDetails: true },
    VAutocomplete: { density: 'compact', hideDetails: true },
    VSwitch: { density: 'compact', hideDetails: true, color: 'primary' }
}
</script>
