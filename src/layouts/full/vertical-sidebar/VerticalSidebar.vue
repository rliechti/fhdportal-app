<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useAuthStore } from '@/stores/auth'
import sidebarItems from './sidebarItem';

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Profile from './profile/Profile.vue';
import Logo from '../logo/Logo.vue';
import _ from 'lodash'

const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);

const store = useAuthStore()

const sidebarVisibleMenu = computed(() => {
  if (store.user !== undefined && store.user.roles !== undefined && store.user.roles.indexOf("admin-fega")> -1){
    return sidebarMenu.value;
  }
  else{
    let items = []
    _.forEach(sidebarMenu.value, item => {
      if (item.admin === undefined || item.admin !== true){
        items.push(item)
      }
    })
    return items
  }
})

</script>

<template>
    <v-navigation-drawer
        left
        v-model="customizer.Sidebar_drawer"
        elevation="0"
        rail-width="75"
        app
        class="leftSidebar"
        :rail="customizer.mini_sidebar"
        expand-on-hover width="270"
    >
        <!---Logo part -->

        <div class="pa-5">
            <Logo />
        </div>
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar">
            <v-list class="pa-6">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarVisibleMenu">
                    <!---Item Sub Header -->
                    <NavGroup :item="item" v-if="item.header" :key="item.title" />
                    <!---If Has Child -->
                    <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                    <!---Single Item-->
                    <NavItem :item="item" v-else class="leftPadding" />
                    <!---End Single Item-->
                </template>
            </v-list>
            <div class="pa-6 userbottom">
                <Profile />
            </div>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
