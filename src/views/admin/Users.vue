<template>
    <div class="adminUsers">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="Users" />

                <DataTable
                    table-id="admin-users"
                    :items="users"
                    :headers="headers"
                    v-model:search="search"
                    :default-items-per-page="50"
                    :loading="loading"
                >
                    <template #item.enabled="{ value }"
                        ><v-chip :color="value ? 'success' : 'error'" size="small">{{
                            value ? 'yes' : 'no'
                        }}</v-chip></template
                    >
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
                </DataTable>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { useAdminStore } from '@/stores/admin.js'
import { useAuthStore } from '@/stores/auth.ts'
import { notifyError } from '@/utils/notify'
import { mapState } from 'pinia'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
export default {
    name: 'AdminUsers',
    components: {
        PageTitle,
        DataTable
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
        ...mapState(useAdminStore, ['users'])
    },
    data() {
        return {
            search: '',
            loading: true,
            headers: [
                {
                    title: 'Enabled',
                    value: 'enabled'
                },
                {
                    title: 'Username',
                    value: 'username'
                },
                {
                    title: 'First Name',
                    value: 'firstName'
                },
                {
                    title: 'Last Name',
                    value: 'lastName'
                },
                {
                    title: 'Email',
                    value: 'email'
                },
                {
                    title: 'Requester',
                    value: 'requester'
                },
                {
                    title: 'Submitter',
                    value: 'submitter'
                },
                {
                    title: 'Admin',
                    value: 'admin'
                }
            ]
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
                        text: 'role updated successfully'
                    })
                })
                .catch(() => notifyError('Failed to update user role. Please try again.'))
        }
    }
}
</script>
