<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { GridDotsIcon, LanguageIcon, SearchIcon, Menu2Icon, BellRingingIcon, ShoppingCartIcon } from 'vue-tabler-icons';
import ProfileDD from './ProfileDD.vue';
import RightMobileSidebar from './RightMobileSidebar.vue';
import ThemeToggler from './ThemeToggler.vue';
const customizer = useCustomizerStore();
const showSearch = ref(false);
const appsdrawer = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
const env = ref(import.meta.env.MODE)
function searchbox() {
    showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
    priority.value = newPriority;
});

</script>

<template>
    <v-app-bar elevation="0" :priority="priority" height="70" class="">
        <v-btn
            class="hidden-md-and-down"
            icon
            color="primary"
            variant="text"
            @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
        >
            <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
        <v-btn class="hidden-lg-and-up" icon variant="flat" @click.stop="customizer.SET_SIDEBAR_DRAWER" size="small">
            <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
        <v-spacer />
        <p class="text-center text-red" >This is a development instance of the FHDPortal. Data might be erased without warning</p>

        <v-spacer />
        <!-- ---------------------------------------------- -->
        <!---right part -->
        <!-- ---------------------------------------------- -->
         <div class="me-2">
            <ThemeToggler />
        </div>

        <!-- right sidebar -->
        <v-btn
            variant="text"
            color="primary"
            class="hidden-lg-and-up"
            icon
            @click.stop="appsdrawer = !appsdrawer"
        >
            <GridDotsIcon size="17" stroke-width="1.5" />
        </v-btn>

        <!-- ---------------------------------------------- -->
        <!-- User Profile -->
        <!-- ---------------------------------------------- -->
        <div class="ml-2">
            <ProfileDD />
        </div>
    </v-app-bar>

    <!-- ---------------------------------------------- -->
    <!-- Right Sidebar -->
    <!-- ---------------------------------------------- -->
    <v-navigation-drawer v-model="appsdrawer" location="right" temporary>
        <RightMobileSidebar />
    </v-navigation-drawer>
</template>
