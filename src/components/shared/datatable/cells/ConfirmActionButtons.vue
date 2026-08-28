<template>
    <span class="d-flex align-center ga-2">
        <template v-if="!confirming">
            <v-btn
                v-for="action in actions"
                :key="action.key"
                size="small"
                :variant="action.variant || 'outlined'"
                :color="action.color || 'error'"
                :disabled="disabled"
                @click="$emit('arm', action.key)"
            >
                <v-icon v-if="action.icon" :icon="action.icon" class="mr-1" />
                {{ action.label }}
            </v-btn>
        </template>
        <template v-else>
            <v-btn
                size="small"
                :variant="armedAction?.variant || 'outlined'"
                :color="armedAction?.color || 'error'"
                @click="$emit('confirm', confirming)"
            >
                {{ armedAction?.confirmLabel || `confirm ${armedAction?.label}` }}
            </v-btn>
            <v-btn size="small" variant="outlined" color="secondary" @click="$emit('cancel')">
                cancel
            </v-btn>
        </template>
    </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    actions: { type: Array, required: true },
    confirming: { type: [String, Number], default: null },
    disabled: { type: Boolean, default: false }
})

defineEmits(['arm', 'confirm', 'cancel'])

const armedAction = computed(() => props.actions.find((a) => a.key === props.confirming))
</script>
