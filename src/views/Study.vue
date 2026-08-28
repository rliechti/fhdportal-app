<template>
    <div class="Study">
        <v-sheet min-height="70vh" rounded="lg">
            <v-dialog v-model="modal.status" class="resource-dialog">
                <modal-request
                    :dataset_id="modal.dataset_id"
                    :dataset_title="modal.title"
                    @closeModal="closeModal"
                ></modal-request>
            </v-dialog>
            <v-container fluid>
                <PageTitle v-if="!loading && !errorMsg">{{ study.title }}</PageTitle>

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
                                        <CopyIdCell :value="study.public_id" notify-label="Study ID" />
                                        <span class="fega-dt-cell--mono">{{ study.public_id }}</span>
                                    </span>
                                </PropertyRow>
                                <PropertyRow label="Title" :value="study.title" />
                                <PropertyRow v-if="study.study_type" label="Study Type">
                                    <v-chip color="info" variant="tonal" size="small">{{
                                        study.study_type
                                    }}</v-chip>
                                </PropertyRow>
                                <PropertyRow
                                    v-if="study.description"
                                    label="Description"
                                    :value="study.description"
                                />
                            </tbody>
                        </v-table>
                    </v-card>

                    <v-card elevation="10">
                        <v-card-item class="py-4 px-6">
                            <v-card-title class="text-h6 pa-0">Datasets</v-card-title>
                        </v-card-item>
                        <v-divider></v-divider>
                        <v-card-text>
                            <DataTable
                                table-id="study-datasets"
                                :items="study.datasets || []"
                                :headers="datasetHeaders"
                            >
                                <template #item.public_id="{ item }">
                                    <CopyIdCell :value="item.public_id" notify-label="Dataset ID" />
                                </template>
                                <template #item.title="{ item }">
                                    <router-link :to="`/datasets/${item.public_id}`">{{
                                        item.title
                                    }}</router-link>
                                </template>
                                <template #item.types="{ item, value }">
                                    <div class="d-flex flex-wrap ga-1 py-2">
                                        <v-chip
                                            v-for="type in value"
                                            :key="`${item.public_id}-${type}`"
                                            size="small"
                                            variant="tonal"
                                            class="type-chip"
                                        >
                                            {{ type }}
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.request="{ item }">
                                    <v-btn
                                        v-if="
                                            item.request === undefined ||
                                            item.request === null ||
                                            item.request.dataset_id === undefined
                                        "
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        @click="requestAccessForm(item.id, item.title)"
                                    >
                                        Request Access
                                    </v-btn>
                                    <v-chip
                                        v-else
                                        size="small"
                                        variant="tonal"
                                        :color="
                                            item.request.request_status === 'approved'
                                                ? 'success'
                                                : item.request.request_status === 'rejected'
                                                  ? 'error'
                                                  : 'info'
                                        "
                                    >
                                        {{ item.request.request_status }}
                                        <v-tooltip activator="parent" location="top">
                                            {{ formatDate(item.request.action_time) }}
                                        </v-tooltip>
                                    </v-chip>
                                </template>
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
import { useStudyStore } from '@/stores/studies.js'
import ModalRequest from '@/components/modalRequest.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import PropertyRow from '@/components/shared/PropertyRow.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import { idColumn, numericColumn, fitColumn } from '@/utils/dataTableHeaders'
import { formatDate } from '@/utils/dates'

export default defineComponent({
    name: 'Study',
    components: { ModalRequest, PageTitle, PropertyRow, DataTable, CopyIdCell },
    computed: {
        ...mapState(useStudyStore, ['study'])
    },
    data() {
        return {
            loading: true,
            errorMsg: '',
            modal: { status: false, dataset_id: null, title: '' },
            datasetHeaders: [
                idColumn({ title: 'ID', value: 'public_id', align: 'center', hideable: false }),
                { title: 'Title', value: 'title', hideable: false },
                { title: 'Description', value: 'description' },
                { title: 'Types', value: 'types', sortable: false, nowrap: false },
                numericColumn({ title: 'Samples', value: 'nb_samples' }),
                fitColumn({ title: 'Access', value: 'request', sortable: false, align: 'center' })
            ]
        }
    },
    methods: {
        formatDate,
        closeModal() {
            this.modal.status = false
            this.getStudy()
        },
        getStudy() {
            const studyStore = useStudyStore()
            const study_id = this.$route.params.study_id
            this.loading = true
            studyStore
                .getStudy(study_id)
                .then(() => {
                    this.loading = false
                    this.errorMsg = ''
                })
                .catch((err) => {
                    this.loading = false
                    if (err.status === 404) {
                        this.errorMsg = 'Unknown study'
                    } else {
                        this.errorMsg = 'Error retrieving the study'
                    }
                })
        },
        requestAccessForm(dataset_id, title) {
            this.modal.status = true
            this.modal.dataset_id = dataset_id
            this.modal.title = title
        }
    },
    mounted() {
        this.getStudy()
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
