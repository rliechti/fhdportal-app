<template>
    <div v-if="count > 0" class="fega-data-table__selection">
        <span class="fega-data-table__selection-count">{{ count }} {{ label }}</span>
        <v-spacer />
        <div class="d-flex align-center ga-2">
            <slot />
        </div>
        <v-btn
            v-if="dismissible"
            icon="mdi-close"
            variant="text"
            density="comfortable"
            size="small"
            aria-label="Clear selection"
            @click="$emit('clear')"
        />
    </div>
</template>

<script setup>
defineProps({
    count: { type: Number, default: 0 },
    label: { type: String, default: 'Selected' },
    dismissible: { type: Boolean, default: true }
})
defineEmits(['clear'])
</script>
