<template>
    <tr>
        <th
            class="property-row__label text-medium-emphasis"
            :class="{ 'property-row__label--compact': compact }"
        >
            {{ label }}
        </th>
        <td class="property-row__value" :class="{ 'property-row__value--compact': compact }">
            <slot>{{ value }}</slot>
        </td>
    </tr>
</template>

<script setup>
defineProps({
    label: { type: String, required: true },
    value: { type: [String, Number], default: '' },
    compact: { type: Boolean, default: false }
})
</script>

<style scoped>
.property-row__label {
    width: 220px;
    min-width: 160px;
    white-space: nowrap;
    text-align: left;
    font-weight: 600;
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
}

.property-row__label--compact {
    width: 104px;
    min-width: 104px;
    white-space: normal;
    font-size: 0.75rem;
    padding-left: 8px;
    padding-right: 8px;
}

.property-row__value {
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
    word-break: break-word;
}

.property-row__value--compact {
    padding-left: 8px;
    padding-right: 8px;
}
</style>
