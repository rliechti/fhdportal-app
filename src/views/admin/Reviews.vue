<template>
    <div class="adminReview">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="Dataset Publication Review" />


                <DataTable
                    table-id="admin-reviews"
                    :items="visibleDatasets"
                    :headers="headers"
                    v-model:search="search"
                    external-filter
                    :default-items-per-page="50"
                    :loading="loading"
                    :filters-active="hidePublished"
                    @reset-filters="hidePublished = false"
                >
                    <template #filters>
                        <v-switch
                            label="Hide published datasets"
                            v-model="hidePublished"
                        ></v-switch>
                    </template>

                    <template #item.dataset="{ item }">
                        <b>{{ item.study_title }}</b>
                        <br />
                        {{ item.title }}
                    </template>
                    <template #item.submitter="{ item }">
                        <b>{{ item.creator_name }}</b>
                        <br />
                        {{ item.creator_email }}
                    </template>
                    <template #item.released_date="{ value }">
                        <DateCell :value="value" />
                    </template>
                    <template #item.status="{ item }">
                        <StatusChip :status="item.status" />
                        <br />
                        <DateCell :value="item.validation_time" />
                    </template>
                    <template #item.actions="{ item }">
                        <v-btn
                            color="info"
                            density="compact"
                            class="mr-1"
                            @click="goToSubmission(item.study_public_id)"
                            >review...</v-btn
                        >
                        <v-chip v-if="item.validator">Reviewed by {{ item.validator }}</v-chip>
                        <ConfirmActionButtons
                            v-else-if="!confirmAction.id || confirmAction.id === item.id"
                            :actions="reviewActions"
                            :confirming="confirmAction.id === item.id ? confirmAction.status : null"
                            @arm="(key) => setConfirm(item, key)"
                            @confirm="patchDataset"
                            @cancel="cancelAction"
                        />
                    </template>
                </DataTable>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { useAdminStore } from '@/stores/admin.js'
import { useAuthStore } from '@/stores/auth.ts'
import { useSubmissionStore } from '@/stores/submissions.js'
import { notifyError } from '@/utils/notify'
import { mapState } from 'pinia'
import _ from 'lodash'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import { dateColumn } from '@/utils/dataTableHeaders'

export default {
    name: 'AdminReviews',
    components: {
        PageTitle,
        DataTable,
        StatusChip,
        DateCell,
        ConfirmActionButtons
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
        ...mapState(useAdminStore, ['datasets']),
        visibleDatasets() {
            let datasets = this.datasets
            if (this.hidePublished) {
                datasets = _.filter(datasets, (d) => d.status_type_id !== 'PUB')
            }
            if (this.search) {
                const term = this.search.toLowerCase()
                datasets = _.filter(datasets, (d) => {
                    return [
                        d.study_title,
                        d.title,
                        d.validator,
                        d.creator_name,
                        d.creator_email
                    ].some((field) => (field || '').toLowerCase().indexOf(term) > -1)
                })
            }
            return datasets
        },
        reviewActions() {
            return [
                {
                    key: 'PUB',
                    label: 'approve...',
                    confirmLabel: 'confirm publication',
                    color: 'success',
                    variant: 'flat'
                },
                {
                    key: 'DRA',
                    label: 'reject...',
                    confirmLabel: 'confirm rejection',
                    color: 'error',
                    variant: 'outlined'
                }
            ]
        }
    },
    data() {
        return {
            search: '',
            loading: true,
            hidePublished: false,
            confirmAction: {
                id: null,
                study_id: null,
                status: ''
            },
            headers: [
                {
                    title: 'Dataset',
                    value: 'dataset'
                },
                {
                    title: 'Submitter',
                    value: 'submitter'
                },
                dateColumn({
                    title: 'Released Date',
                    value: 'released_date'
                }),
                {
                    title: 'Status',
                    value: 'status'
                },
                {
                    title: 'Actions',
                    value: 'actions',
                    hideable: false
                }
            ]
        }
    },
    methods: {
        goToSubmission(public_id) {
            this.$router.push(`/submissions/${public_id}`)
        },
        setConfirm(item, pub_status) {
            this.confirmAction.id = item.id
            this.confirmAction.study_id = item.study_id
            this.confirmAction.status = pub_status
        },
        patchDataset() {
            if (this.confirmAction.id && this.confirmAction.study_id && this.confirmAction.status) {
                const publicationStore = useAdminStore()
                publicationStore
                    .patchDataset(this.confirmAction)
                    .then(() => {
                        const actionTitle =
                            this.confirmAction.status === 'PUB' ? 'published' : 'rejected'
                        this.$notify({
                            title: 'Dataset publication',
                            text: `Dataset ${actionTitle} successfully`,
                            type: 'success'
                        })
                        this.cancelAction()
                    })
                    .catch(() => {
                        notifyError(
                            'Failed to update dataset publication status. Please try again.'
                        )
                        this.cancelAction()
                    })
            }
        },
        cancelAction() {
            this.confirmAction.id = null
            this.confirmAction.study_id = null
            this.confirmAction.status = ''
        }
    },
    mounted() {
        useSubmissionStore().getStatusTypes()
        const publicationStore = useAdminStore()
        this.loading = true
        publicationStore
            .getDatasets()
            .then(() => {
                this.loading = false
            })
            .catch(() => {
                this.loading = false
            })
    }
}
</script>
