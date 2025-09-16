<script setup>
import { computed } from 'vue'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
const store = useAuthStore()

const userRoles = computed(() => {
  return store.user.roles.filter((r) => {
    return (
      r !== 'default-roles-fega_test' &&
      r !== 'uma_authorization' &&
      r !== 'offline_access'
    )
  })
})
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- notifications DD -->
  <!-- ---------------------------------------------- -->
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn class="custom-hover-primary" variant="text" v-bind="props" icon>
        <v-avatar size="35">
          <UserIcon />
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="360" elevation="10">
      <template v-if="store.user.username">
        <div class="px-8 pt-6">
          <h6 class="text-h5 font-weight-medium">User Profile</h6>
          <div class="d-flex align-center mt-4 pb-6">
            <v-avatar size="80">
              <UserCircleIcon size="60" />
            </v-avatar>
            <div class="ml-3">
              <h6 class="text-h6 mb-n1">{{ store.user.username }}</h6>
              <span class="text-subtitle-1 font-weight-regular textSecondary">{{
                store.user.id
              }}</span>
            </div>
          </div>
          <v-divider></v-divider>
        </div>
        <perfect-scrollbar
          style="height: calc(100vh - 240px); max-height: 240px"
        >
          <v-list class="py-0 theme-list" lines="two">
            <v-list-item class="py-4 px-8 custom-text-primary">
              <template v-slot:prepend>
                <v-avatar
                  size="48"
                  color="lightprimary"
                  class="mr-3"
                  rounded="md"
                >
                  <EyeCogIcon />
                </v-avatar>
              </template>
              <div>
                <h6 class="text-subtitle-1 font-weight-bold mb-2 custom-title">
                  Roles
                </h6>
              </div>
              <p
                class="text-subtitle-1 font-weight-regular textSecondary"
                v-html="userRoles.join('<br />')"
              ></p>
            </v-list-item>
            <v-list-item class="py-4 px-8 custom-text-primary">
              <template v-slot:prepend>
                <v-avatar
                  size="48"
                  color="lightprimary"
                  class="mr-3"
                  rounded="md"
                >
                  <KeyIcon />
                </v-avatar>
              </template>
              <div>
                <h6 class="text-subtitle-1 font-weight-bold mb-2 custom-title">
                  Keys
                </h6>
              </div>
              <p
                class="text-subtitle-1 font-weight-regular textSecondary"
                v-if="store.user.sshPublicKeys !== undefined"
              >
                {{ store.user.sshPublicKeys.length }} SSH public key{{
                  store.user.sshPublicKeys.length > 1 ? 's' : ''
                }}
              </p>
              <p
                class="text-subtitle-1 font-weight-regular textSecondary"
                v-if="store.user.c4ghPublicKeys !== undefined"
              >
                {{ store.user.c4ghPublicKeys.length }} Crypt4GH public key{{
                  store.user.c4ghPublicKeys.length > 1 ? 's' : ''
                }}
              </p>
            </v-list-item>
          </v-list>
        </perfect-scrollbar>
        <div class="pt-4 pb-6 px-8 text-center">
          <v-btn color="primary" variant="outlined" block @click="$store.logout"
            >Logout</v-btn
          >
        </div>
      </template>
      <template v-else>
        <div class="pt-4 pb-6 px-8 text-center">
          <v-btn color="primary" variant="outlined" block @click="$store.login"
            >Login</v-btn
          >
        </div>
      </template>
    </v-sheet>
  </v-menu>
</template>
