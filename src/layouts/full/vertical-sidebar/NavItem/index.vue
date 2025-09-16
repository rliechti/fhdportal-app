<script setup>
import Icon from '../Icon.vue';
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
import {
  LockIcon
} from 'vue-tabler-icons';
const store = useAuthStore()
const props = defineProps({ item: Object, level: Number });
</script>

<template>
    <!---Single Item-->
    <v-list-item
        :to="item.type === 'external' ? '' : item.to"
        :href="item.type === 'external' ? item.to : ''"
        rounded
        class="mb-1"
        :disabled="item.disabled"
        v-if="!item.hidden"
        :target="item.type === 'external' ? '_blank' : ''"
    >
        <!---If icon-->
        <template v-slot:prepend>
            <Icon :item="item.icon" :level="level" size="24" />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <template v-slot:append v-if="item.protected && !store.authenticated">
            <Icon :item="LockIcon" :level="level" />
        </template>
        <!---If Caption-->
        <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
            {{ item.subCaption }}
        </v-list-item-subtitle>
        <!---If any chip or label-->
        <template v-slot:append v-if="item.chip">
            <v-chip
                :color="item.chipColor"
                :class="'sidebarchip hide-menu bg-' + item.chipBgColor"
                :size="item.chipIcon ? 'small' : 'small'"
                :variant="item.chipVariant"
                :prepend-icon="item.chipIcon"
            >
                {{ item.chip }}
            </v-chip>
        </template>
    </v-list-item>
</template>
