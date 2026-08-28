<template>
    <v-btn variant="flat" class="text-info fega-table-btn" @click="copy">
        <v-icon :icon="icon" />
        <v-tooltip activator="parent" location="top">
            <span class="fega-dt-cell--mono">{{ value }}</span>
        </v-tooltip>
    </v-btn>
</template>

<script setup>
import useClipboard from 'vue-clipboard3'
import { notifySuccess } from '@/utils/notify'

const props = defineProps({
    value: { type: String, required: true },
    notifyLabel: { type: String, default: 'Public ID' },
    icon: { type: String, default: 'mdi-identifier' }
})

async function copy() {
    const { toClipboard } = useClipboard()
    try {
        await toClipboard(props.value)
        notifySuccess(`${props.notifyLabel} copied to clipboard`)
    } catch (e) {
        console.error(e)
    }
}
</script>
