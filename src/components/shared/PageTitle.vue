<template>
    <h1 class="text-center my-6">
        <slot>{{ title }}</slot>
    </h1>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: ''
    }
})
</script>
