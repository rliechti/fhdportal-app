<template>
    <div class="adminRequests">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="Dataset Requests" />

                <DataTable
                    table-id="admin-requests"
                    :items="visibleRequests"
                    :headers="headers"
                    v-model:search="search"
                    :default-items-per-page="50"
                    :loading="loading"
                    :filters-active="hideReviewed"
                    @reset-filters="hideReviewed = false"
                >
                    <template #filters>
                        <v-switch label="Hide reviewed requests" v-model="hideReviewed"></v-switch>
                    </template>

                    <template #item.dataset="{ item }">
                        <b>{{ item.study }}</b>
                        <br />
                        {{ item.dataset }}
                    </template>
                    <template #item.requester="{ item }">
                        <b>{{ item.requester }}</b>
                    </template>
                    <template #item.request_status="{ item }">
                        <StatusChip :status="item.request_status" />
                        <br />
                        <DateCell :value="item.action_time" />
                    </template>
                </DataTable>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { useAdminStore } from '@/stores/admin.js'
import { useAuthStore } from '@/stores/auth.ts'
import { mapState } from 'pinia'
import _ from 'lodash'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'

export default {
    name: 'AdminRequests',
    components: {
        PageTitle,
        DataTable,
        StatusChip,
        DateCell
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
        ...mapState(useAdminStore, ['requests']),
        visibleRequests() {
            if (this.hideReviewed) {
                return _.filter(this.requests, (r) => !r.validator_id)
            }
            return this.requests
        }
    },
    data() {
        return {
            search: '',
            loading: true,
            hideReviewed: false,
            headers: [
                {
                    title: 'Dataset',
                    value: 'dataset'
                },
                {
                    title: 'Requester',
                    value: 'requester'
                },
                {
                    title: 'Status',
                    value: 'request_status'
                }
            ]
        }
    },
    mounted() {
        const requestStore = useAdminStore()
        this.loading = true
        requestStore
            .getRequests()
            .then(() => {
                this.loading = false
            })
            .catch(() => {
                this.loading = false
            })
    }
}
</script>
