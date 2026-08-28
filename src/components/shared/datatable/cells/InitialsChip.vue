<template>
    <v-chip v-if="name" :color="color" size="small">
        {{ initials }}
        <v-tooltip activator="parent" location="top">
            <span style="white-space: pre-line">{{ fullName }}</span>
        </v-tooltip>
    </v-chip>
</template>

<script setup>
import { computed } from 'vue'
import { humanizeCamelCase } from '@/utils/format'

const props = defineProps({
    name: { type: String, default: '' },
    color: { type: String, default: 'blue' }
})

const initials = computed(() => props.name.replace(/([^A-Z])/g, '').trim())
const fullName = computed(() => humanizeCamelCase(props.name))
</script>
