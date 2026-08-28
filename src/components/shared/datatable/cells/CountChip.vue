<template>
    <v-chip v-if="items && items.length" size="small">
        {{ text }}
        <v-tooltip v-if="tooltip" activator="parent" location="top">
            <span style="white-space: pre-line">{{ items.join('\n') }}</span>
        </v-tooltip>
    </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    tooltip: { type: Boolean, default: true }
})

const text = computed(() =>
    props.label
        ? `${props.items.length} ${props.label}${props.items.length > 1 ? 's' : ''}`
        : String(props.items.length)
)
</script>
