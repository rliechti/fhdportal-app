<template>
    <span class="fega-truncated-text" style="cursor: pointer" @click="copy">
        <span class="fega-truncated-text__head">{{ head }}</span
        ><span class="fega-truncated-text__tail">{{ tail }}</span>
        <v-tooltip v-if="showTooltip" activator="parent" location="top">
            <div class="fega-truncated-text__tooltip">
                <div v-for="(line, i) in tooltipLines" :key="i">{{ line }}</div>
            </div>
        </v-tooltip>
    </span>
</template>

<script setup>
import { computed } from 'vue'
import useClipboard from 'vue-clipboard3'
import { notifySuccess } from '@/utils/notify'
const props = defineProps({
    text: { type: String, default: '' },
    // Characters always kept visible at the end (e.g. `.fastq.gz.c4gh` is 14 chars;
    // 20 gives a safety margin).
    tailLength: { type: Number, default: 20 },
    showTooltip: { type: Boolean, default: true }
})

const head = computed(() => {
    const value = props.text ?? ''
    return value.length > props.tailLength ? value.slice(0, -props.tailLength) : ''
})
const tail = computed(() => {
    const value = props.text ?? ''
    return value.length > props.tailLength ? value.slice(-props.tailLength) : value
})

const TARGET_LINE_LENGTH = 50
const tooltipLines = computed(() => {
    const parts = (props.text ?? '').split(/(?<=[-_.])/)
    const lines = []
    let current = ''
    for (const part of parts) {
        if (current && current.length + part.length > TARGET_LINE_LENGTH) {
            lines.push(current)
            current = part
        } else {
            current += part
        }
    }
    if (current) lines.push(current)
    return lines
})

async function copy() {
    const { toClipboard } = useClipboard()
    try {
        await toClipboard(props.text)
        notifySuccess('copied to clipboard')
    } catch (e) {
        console.error(e)
    }
}
</script>

<style scoped>
/*
 * Middle-truncation via flexbox, per https://wesbos.com/tip/css-truncate-text-from-middle
 * Contract: fills whatever bounded inline box it's placed in (max-width:100%) and
 * truncates responsively within it. Does NOT constrain its own container's width —
 * the consumer/table column is responsible for giving it a bounded box.
 */
.fega-truncated-text {
    display: inline-flex;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    vertical-align: bottom;
}
.fega-truncated-text__head,
.fega-truncated-text__tail {
    overflow: hidden;
    flex: 0 1 auto;
    white-space: pre;
}
.fega-truncated-text__head {
    flex-shrink: 1;
    text-overflow: ellipsis;
}
.fega-truncated-text__tail {
    flex: 1;
    min-width: fit-content;
}
.fega-truncated-text__tooltip {
    display: inline-block;
    line-height: 1.25;
}
.fega-truncated-text__tooltip > div {
    white-space: nowrap;
}
</style>
