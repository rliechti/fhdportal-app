<template>
    <div class="Dataset">
        <v-sheet min-height="70vh" rounded="lg">
            <v-dialog v-model="modal.status" class="resource-dialog">
                <modal-request
                    :dataset_id="modal.dataset_id"
                    :dataset_title="modal.title"
                    :dac_request_id="modal.dac_request_id"
                    @closeModal="closeModal"
                ></modal-request>
            </v-dialog>
            <v-container fluid>
                <PageTitle v-if="!loading && !errorMsg">{{ dataset.title }}</PageTitle>

                <v-card v-if="loading" color="info" variant="outlined" class="mx-auto state-card">
                    <h5 class="text-center py-3">loading...</h5>
                </v-card>
                <v-card v-else-if="errorMsg" color="error" variant="outlined" class="mx-auto state-card">
                    <h3 class="text-center py-3">{{ errorMsg }}</h3>
                </v-card>

                <template v-else>
                    <v-card class="mb-8" elevation="10">
                        <v-table class="property-table">
                            <tbody>
                                <PropertyRow label="Public ID">
                                    <span class="d-flex flex-wrap align-center ga-2">
                                        <CopyIdCell :value="dataset.public_id" notify-label="Dataset ID" />
                                        <span class="fega-dt-cell--mono">{{ dataset.public_id }}</span>
                                    </span>
                                </PropertyRow>
                                <PropertyRow label="Title" :value="dataset.title" />
                                <PropertyRow
                                    v-if="dataset.description"
                                    label="Description"
                                    :value="dataset.description"
                                />
                                <PropertyRow
                                    v-if="dataset.dataset_types && dataset.dataset_types.length"
                                    label="Dataset Types"
                                >
                                    <div class="d-flex flex-wrap ga-1">
                                        <v-chip
                                            v-for="type in dataset.dataset_types"
                                            :key="type"
                                            size="small"
                                            variant="tonal"
                                            class="type-chip"
                                            >{{ type }}</v-chip
                                        >
                                    </div>
                                </PropertyRow>
                                <PropertyRow v-if="dataset.released_date" label="Released">
                                    <DateCell :value="dataset.released_date" />
                                </PropertyRow>
                                <PropertyRow v-if="dataset.study_public_id" label="Study">
                                    <router-link :to="`/studies/${dataset.study_public_id}`">{{
                                        dataset.study_public_id
                                    }}</router-link>
                                </PropertyRow>
                                <PropertyRow label="Files" :value="dataset.files ? dataset.files.length : 0" />
                                <PropertyRow v-if="dataset.policy" label="Policy">
                                    <strong>{{ dataset.policy.title }}</strong> from
                                    {{ dataset.policy.dac.name }}
                                </PropertyRow>
                                <PropertyRow
                                    v-for="xa in dataset.extra_attributes"
                                    :key="xa.tag"
                                    :label="xa.tag.replace(/_/g, ' ')"
                                    :value="xa.value"
                                />
                            </tbody>
                        </v-table>
                        <v-divider></v-divider>
                        <v-card-actions class="justify-center py-4">
                            <v-btn
                                v-if="
                                    dataset.request === undefined ||
                                    dataset.request === null ||
                                    dataset.request.dataset_id === undefined
                                "
                                color="primary"
                                variant="tonal"
                                @click="requestAccessForm(dataset.public_id, dataset.title)"
                            >
                                Request Access
                            </v-btn>
                            <v-btn
                                v-else-if="dataset.request.request_status === 'daa_pending'"
                                color="warning"
                                variant="tonal"
                                @click="
                                    resumeAccessRequest(
                                        dataset.public_id,
                                        dataset.title,
                                        dataset.request.dac_request_id
                                    )
                                "
                            >
                                Resume Access Request
                            </v-btn>
                            <strong
                                v-else
                                :class="
                                    dataset.request.request_status === 'approved'
                                        ? 'text-success'
                                        : dataset.request.request_status === 'rejected'
                                          ? 'text-error'
                                          : 'text-info'
                                "
                            >
                                Access request {{ dataset.request.request_status }} on
                                {{ formatDate(dataset.request.action_time) }}
                            </strong>
                        </v-card-actions>
                    </v-card>

                    <v-card elevation="10">
                        <v-card-item class="py-4 px-6">
                            <v-card-title class="text-h6 pa-0">Files</v-card-title>
                        </v-card-item>
                        <v-divider></v-divider>
                        <v-card-text>
                            <DataTable
                                table-id="public-dataset-files"
                                :items="dataset.files || []"
                                :headers="fileHeaders"
                            >
                                <template #item.public_id="{ item }">
                                    <CopyIdCell :value="item.public_id" notify-label="Public File ID" />
                                </template>
                                <template #item.title="{ value }">
                                    <TruncatedText :text="value" />
                                </template>
                                <template #item.filesize="{ value }">{{
                                    formatFileSize(value)
                                }}</template>
                            </DataTable>
                        </v-card-text>
                    </v-card>
                </template>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useDatasetStore } from '@/stores/datasets.js'
import ModalRequest from '@/components/modalRequest.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import PropertyRow from '@/components/shared/PropertyRow.vue'
import DataTable from '@/components/shared/DataTable.vue'
import TruncatedText from '@/components/shared/TruncatedText.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import { fitColumn, flexColumn, numericColumn } from '@/utils/dataTableHeaders'
import { formatFileSize } from '@/utils/format'
import { formatDate } from '@/utils/dates'

export default defineComponent({
    name: 'Dataset',
    components: {
        ModalRequest,
        PageTitle,
        PropertyRow,
        DataTable,
        TruncatedText,
        CopyIdCell,
        DateCell
    },
    computed: {
        ...mapState(useDatasetStore, ['dataset'])
    },
    data() {
        return {
            loading: true,
            errorMsg: '',
            modal: { status: false, dataset_id: null, title: '', dac_request_id: null },
            fileHeaders: [
                fitColumn({ title: 'ID', value: 'public_id', align: 'center' }),
                flexColumn({ title: 'Name', value: 'title' }),
                numericColumn({ title: 'Size', value: 'filesize' })
            ]
        }
    },
    methods: {
        formatFileSize,
        formatDate,
        getDataset() {
            const datasetId = this.$route.params.dataset_id
            const datasetStore = useDatasetStore()
            datasetStore
                .getDataset(datasetId)
                .then(() => {
                    this.loading = false
                    this.errorMsg = ''
                })
                .catch((err) => {
                    this.loading = false
                    if (err.status === 404) {
                        this.errorMsg = 'Unknown dataset'
                    } else {
                        this.errorMsg = 'Error retrieving the dataset'
                    }
                })
        },
        closeModal() {
            this.modal.status = false
            this.getDataset()
        },
        requestAccessForm(dataset_id, title) {
            this.modal.status = true
            this.modal.dataset_id = dataset_id
            this.modal.title = title
            this.modal.dac_request_id = null
        },
        resumeAccessRequest(dataset_id, title, dacRequestId) {
            this.modal.status = true
            this.modal.dataset_id = dataset_id
            this.modal.title = title
            this.modal.dac_request_id = dacRequestId
        }
    },
    mounted() {
        this.getDataset()
    }
})
</script>

<style scoped>
.state-card {
    max-width: 480px;
}

.property-table :deep(table) {
    table-layout: fixed;
    width: 100%;
}

.type-chip {
    height: auto;
    min-height: 24px;
    overflow: visible;
    white-space: normal;
}

:deep(.type-chip .v-chip__content) {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
}
</style>
