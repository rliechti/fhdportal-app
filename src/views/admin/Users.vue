<template>
  <div class="adminUsers">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container>
        <v-card title="Users" flat>
          <template #text>
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              single-line
            ></v-text-field>
          </template>
          <v-data-table
            :items="users"
            :headers="headers"
            :search="search"
            items-per-page="50"
            :loading="loading"
          >
            <template #item.enabled="{ value }"
              ><v-badge
                :color="value ? 'success' : 'error'"
                inline
                :content="value ? 'yes' : 'no'"
              ></v-badge
            ></template>
            <template #item.requester="{ item }">
              <v-switch
                v-model="item.roles"
                color="success"
                value="requester"
                hide-details
                @update:modelValue="updateRole(item.id, item.roles)"
              ></v-switch>
            </template>
            <template #item.submitter="{ item }">
              <v-switch
                v-model="item.roles"
                color="success"
                value="submitter"
                hide-details
                @update:modelValue="updateRole(item.id, item.roles)"
              ></v-switch>
            </template>
            <template #item.admin="{ item }">
              <v-switch
                v-model="item.roles"
                color="success"
                value="admin-fega"
                hide-details
                @update:modelValue="updateRole(item.id, item.roles)"
              ></v-switch>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { useAdminStore } from '@/stores/admin.js'
import { useAuthStore } from '@/stores/auth.ts'
import { mapState } from 'pinia'
export default {
  name: 'Users',
  computed: {
    ...mapState(useAuthStore, ['user']),
    ...mapState(useAdminStore, ['users']),
  },
  data() {
    return {
      search: '',
      loading: true,
      headers: [
        {
          title: 'Enabled',
          value: 'enabled',
        },
        {
          title: 'Username',
          value: 'username',
        },
        {
          title: 'First Name',
          value: 'firstName',
        },
        {
          title: 'Last Name',
          value: 'lastName',
        },
        {
          title: 'Email',
          value: 'email',
        },
        {
          title: 'Requester',
          value: 'requester',
        },
        {
          title: 'Submitter',
          value: 'submitter',
        },
        {
          title: 'Admin',
          value: 'admin',
        },
      ],
    }
  },
  mounted() {
    const userStore = useAdminStore()
    this.loading = true
    userStore
      .getUsers()
      .then(() => {
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  },
  methods: {
    updateRole(userId, roles) {
      const userStore = useAdminStore()
      userStore
        .setRoles(userId, roles)
        .then(() => {
          this.$notify({
            type: 'success',
            title: 'Success',
            text: 'role updated successfully',
          })
        })
        .catch((err) =>
          this.$notify({ type: 'error', title: 'Error', content: err }),
        )
    },
  },
}
</script>
