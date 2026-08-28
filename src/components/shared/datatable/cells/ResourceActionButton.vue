<template>
    <p class="text-center" style="white-space: nowrap">
        <v-btn
            :disabled="disabled"
            size="small"
            style="display: inline-flex; margin-bottom: 1px"
            color="info"
            variant="outlined"
            @click="$emit('click')"
        >
            <v-icon class="mr-1" :icon="isReview ? 'mdi-eye' : 'mdi-pencil'" />
            {{ isReview ? 'review' : 'edit' }}
        </v-btn>
    </p>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    item: { type: Object, required: true },
    study: { type: Object, required: true }
})

defineEmits(['click'])

const permission = computed(() => props.item.current_permission || [])
const canEdit = computed(() => permission.value.indexOf('edit') > -1)
const canReview = computed(() => permission.value.indexOf('review') > -1)

const disabled = computed(() => Boolean(props.item.current_permission) && !canEdit.value && !canReview.value)

const isReview = computed(
    () =>
        (!canEdit.value && canReview.value) ||
        (props.study.status_type_id !== 'DRA' && props.study.status_type_id !== 'REV')
)
</script>
