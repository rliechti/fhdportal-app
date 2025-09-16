<script setup lang="ts">
import { ref } from 'vue';
import { AppsIcon, CalendarIcon, MailIcon, MessagesIcon } from 'vue-tabler-icons';
import AppsLink from './AppsLink.vue';

const open = ref(['Apps']);
</script>

<template>
    <div class="pt-6">
        <h5 class="text-h5 mb-4 px-5">Navigation</h5>
    </div>
</template>

<style scoped>
.right-sidebar .v-list-group__items .v-list-item {
    padding-inline-start: 26px !important;
}
</style>
