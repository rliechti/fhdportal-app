<template>
    <v-chip :color="color" :variant="color ? undefined : 'tonal'" :size="size">
        {{ label }}
        <template v-if="comment">
            <v-icon icon="mdi-information" class="ml-2" />
            <v-tooltip activator="parent" location="top">{{ comment }}</v-tooltip>
        </template>
    </v-chip>
</template>

<script setup>
import { computed } from 'vue'
import { useSubmissionStore } from '@/stores/submissions.js'

const props = defineProps({
    status: { type: String, default: '' },
    matchBy: { type: String, default: 'name' },
    comment: { type: String, default: '' },
    size: { type: String, default: 'small' }
})

const submissionStore = useSubmissionStore()

const statusType = computed(() =>
    (submissionStore.statusTypes || []).find((st) => st[props.matchBy] === props.status)
)

const color = computed(() => statusType.value?.class_name)
const label = computed(() =>
    props.matchBy === 'id' ? statusType.value?.name ?? props.status : props.status
)
</script>
