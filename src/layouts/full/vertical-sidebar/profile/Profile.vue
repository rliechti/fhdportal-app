<script>
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
import _ from 'lodash'
export default defineComponent({
  name: "Profile",
  data () {
    return {
      
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user'])
  }
})
</script>

<template>
    <v-sheet rounded="md" color="lightsecondary" class="px-4 py-3 ExtraBox">
        <div class="d-flex align-center hide-menu">
            <v-avatar size="40">
                <UserCircleIcon size="24" />
            </v-avatar>
            <div class="ml-4" v-if="$store.authenticated">
                <h4 class="mb-n1 text-h6 textPrimary">{{user.username}}</h4>
            </div>
            <div class="ml-auto">
                <v-btn variant="text" icon rounded="md" color="primary" @click="$store.logout" v-if="$store.authenticated">
                    <PowerIcon />
                    <v-tooltip activator="parent" location="top" >Logout</v-tooltip>
                </v-btn>
                <v-btn variant="outlined"  rounded="md" color="dark" @click="$store.login" v-else>
                    <LoginIcon class="mr-2"/> Login 
                </v-btn>
            </div>
        </div>
    </v-sheet>
</template>
<style lang="scss">
.ExtraBox {
    position: relative;
    overflow: hidden;
}
.line-height-none {
    line-height: normal;
}
</style>
