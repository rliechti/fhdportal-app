<template>
    <span v-if="date">
        {{ date }}
        <v-tooltip activator="parent" location="top">{{ dateTime }}</v-tooltip>
    </span>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, formatDateTime } from '@/utils/dates'

const props = defineProps({
    value: { type: [String, Number, Date], default: null }
})

const date = computed(() => formatDate(props.value))
const dateTime = computed(() => formatDateTime(props.value))
</script>
