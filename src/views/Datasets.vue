<template>
    <div class="Datasets">
        <component :is="study_public_id ? 'div' : 'v-sheet'" v-bind="study_public_id ? {} : { minHeight: '70vh', rounded: 'lg' }">
            <v-dialog v-model="modal.status" class="resource-dialog">
                <modal-resource
                    cas="dataset"
                    :study_id="study_public_id"
                    :type="dataset_type"
                    :hide_upload="false"
                    :permissions="modal.permissions"
                    :input_data="modal.data"
                    :title="modal.title"
                    :edit="modal.edit"
                    @closeModal="close($event)"
                ></modal-resource>
            </v-dialog>

            <component :is="study_public_id ? 'div' : 'v-container'" v-bind="study_public_id ? {} : { fluid: true }">
                <p v-if="error" class="text-danger">{{ error }}</p>
                <PageTitle v-if="!study_public_id" title="Datasets" />
                <p v-if="!loaded" class="text-center mt-3">
                    <em>Loading datasets</em> <br />
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </p>
                <div v-else>
                    <div v-if="study_public_id">
                        <DataTable
                            table-id="wizard-datasets"
                            :items="datasets"
                            :headers="tableHeaders"
                            v-model:search="search"
                            v-model:selected="selectedDatasets"
                            :filter-keys="['title']"
                            show-select
                            item-key="id"
                            :primary-action="primaryAction"
                            :primary-action-items="primaryActionItems"
                            @primary-action="createDataset(datasetTypes[0])"
                            @primary-action-select="
                                (value) =>
                                    createDataset(datasetTypes.find((t) => t.resource_type_id === value))
                            "
                        >
                            <template #selection-actions>
                                <ConfirmActionButtons
                                    v-if="canManageDatasets"
                                    :actions="deleteActions()"
                                    :confirming="deleteDataset.status ? 'delete' : null"
                                    @arm="deleteDatasets('init')"
                                    @confirm="deleteDatasets('save')"
                                    @cancel="deleteDatasets('cancel')"
                                />
                            </template>

                            <template #item.public_id="{ item }">
                                <CopyIdCell :value="item.public_id" />
                            </template>
                            <template #item.title="{ item }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="editDataset(item)"
                                    >{{ item.title }}</v-btn
                                >
                            </template>
                            <template #item.status="{ value }">
                                <StatusChip :status="value" />
                            </template>
                            <template #item.last_update="{ value }"><DateCell :value="value" /></template>
                            <template #item.released_date="{ value }"><DateCell :value="value" /></template>

                            <template #item.actions="{ item }">
                                <span class="d-flex ga-1 justify-center align-center" style="white-space: nowrap">
                                    <ResourceActionButton
                                        :item="item"
                                        :study="study"
                                        @click="editDataset(item)"
                                    />
                                </span>
                            </template>

                            <template #no-data>
                                <div class="text-center pt-2">
                                    Group related samples, runs, and analyses into a dataset for
                                    controlled access and distribution.<br />
                                    A dataset represents the collection of data that authorized users
                                    will be able to request and access
                                </div>
                            </template>
                        </DataTable>
                    </div>
                </div>
            </component>
        </component>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { notifyError } from '@/utils/notify'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useAnalysisStore } from '@/stores/analyses.js'
import { useDatasetStore } from '@/stores/datasets.js'
import { useExperimentStore } from '@/stores/experiments.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import ModalResource from '@/components/modalResource.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import ResourceActionButton from '@/components/shared/datatable/cells/ResourceActionButton.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import { useResourceTableHeaders } from '@/composables/useResourceTableHeaders'
import { flexColumn, dateColumn } from '@/utils/dataTableHeaders'
import { humanizeCamelCase } from '@/utils/format'
import { mapState } from 'pinia'
import _ from 'lodash'

export default defineComponent({
    name: 'Datasets',
    components: {
        ModalResource,
        PageTitle,
        DataTable,
        CopyIdCell,
        StatusChip,
        DateCell,
        ResourceActionButton,
        ConfirmActionButtons
    },
    props: ['study_id'],
    setup() {
        const { headers: tableHeaders, build: buildTableHeaders } = useResourceTableHeaders({
            source: 'ui_schema.displayedElements',
            defaultHeaders: [
                flexColumn({ title: 'Title', value: 'title', sortable: true }),
                { title: 'Status', value: 'status', width: '1%' },
                dateColumn({ title: 'Last Updated', value: 'last_update', sortable: true }),
                dateColumn({ title: 'Released Date', value: 'released_date', sortable: true }),
                { title: 'Created By', value: 'creator_name', width: '1%' },
                { title: 'Actions', value: 'actions', width: '1%', align: 'center' }
            ]
        })
        return { tableHeaders, buildTableHeaders }
    },
    data() {
        return {
            datasetStore: null,
            analysisStore: null,
            sampleStore: null,
            experimentStore: null,
            selectedDatasets: [],
            modal: {
                status: false,
                title: null,
                edit: null,
                data: {},
                permissions: []
            },
            error: '',
            nav: 'form',
            loaded: false,
            study_public_id: null,
            uploadedDatasets: [],
            upload: false,
            dataset_type: null,
            files: null,
            filesUploading: false,
            deleteDataset: { status: false },
            data: {},
            data_schema: null,
            ui_schema: null,
            search: ''
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['study']),
        ...mapState(useDatasetStore, ['datasets']),
        ...mapState(useAnalysisStore, ['analyses']),
        ...mapState(useSampleStore, ['samples']),
        ...mapState(useExperimentStore, ['experiments']),
        ...mapState(useSchemaStore, ['schemas']),
        datasetTypes() {
            return this.study?.datasetTypes ?? []
        },
        canManageDatasets() {
            return (
                this.datasetTypes.length &&
                this.study.current_permission.indexOf('edit') > -1 &&
                (this.study.status_type_id === 'DRA' || this.study.status_type_id === 'REV')
            )
        },
        primaryAction() {
            if (!this.canManageDatasets || this.deleteDataset.status) return null
            if (this.datasetTypes.length === 1) {
                return {
                    label: `New ${humanizeCamelCase(this.datasetTypes[0].label)}`,
                    icon: 'mdi-plus'
                }
            }
            return { label: 'Add New', icon: 'mdi-plus' }
        },
        primaryActionItems() {
            if (!this.canManageDatasets || this.deleteDataset.status || this.datasetTypes.length <= 1) {
                return []
            }
            return this.datasetTypes.map((t) => ({
                title: humanizeCamelCase(t.label),
                value: t.resource_type_id
            }))
        }
    },
    mounted() {
        this.submissionStore = useSubmissionStore()
        this.analysisStore = useAnalysisStore()
        this.datasetStore = useDatasetStore()
        this.sampleStore = useSampleStore()
        this.experimentStore = useExperimentStore()
        if (this.study) {
            this.study_public_id = this.study.public_id
            this.submissionStore.getStudyFiles().then(() => {
                this.getAnalyses()
                this.getSamples()
                this.getExperiments()
                this.getDatasets()
            })
        } else {
            const study_id = this.$route.params.study_id || this.study_id
            this.submissionStore.getStudy(study_id).then(() => {
                this.submissionStore.getStudyFiles().then(() => {
                    this.study_public_id = this.study.public_id

                    this.getSamples()
                    this.getExperiments()
                    this.getDatasets()
                })
            })
        }
    },
    methods: {
        deleteActions() {
            return [
                {
                    key: 'delete',
                    label: 'Delete',
                    confirmLabel: 'Confirm Deletion',
                    color: 'error',
                    variant: 'flat'
                }
            ]
        },
        editDataset(item) {
            this.dataset_type = { name: item.dataset_type }
            this.getDatasetSchemas(item.dataset_type)
            this.data = JSON.parse(JSON.stringify(item.properties))
            let title =
                item.current_permission.indexOf('edit') > -1
                    ? 'Update'
                    : 'Review' +
                      ' ' +
                      item.dataset_type.replace(/([A-Z])/g, ' $1') +
                      " '" +
                      item.title +
                      "'"
            this.nav = 'form'
            this.modal = {
                status: true,
                title: title,
                edit: item.public_id,
                data: this.data,
                permissions: item.current_permission
            }
        },
        deleteDatasets(action) {
            if (action == 'init' || action == 'cancel') {
                this.deleteDataset.status = !this.deleteDataset.status
            } else {
                let params
                if (this.modal.edit) {
                    params = {
                        study_id: this.study_public_id,
                        dataset_id: this.modal.edit
                    }
                } else if (this.selectedDatasets) {
                    params = []
                    _.forEach(this.selectedDatasets, (id) => {
                        params.push({
                            study_id: this.study_public_id,
                            dataset_id: _.filter(this.datasets, (s) => s.id === id)[0].public_id
                        })
                    })
                }
                this.datasetStore
                    .deleteDatasets(params)
                    .then(() => {
                        this.$emit('updateStudy')
                        this.$notify({
                            title: 'Success',
                            text: `${params.length} dataset${params.length > 1 ? 's' : ''} deleted successfully`,
                            type: 'success'
                        })
                        this.deleteDataset.status = false
                        this.selectedDatasets = []
                    })
                    .catch(() => {
                        this.deleteDataset.status = false
                        notifyError('Failed to delete dataset(s). Please try again.')
                    })
            }
        },
        close(e) {
            this.modal = {
                status: false,
                title: null,
                data: {},
                permissions: [],
                edit: null
            }
            if (e) {
                this.getDatasets()
            }
        },
        createDataset(dataset_type) {
            this.dataset_type = dataset_type
            this.getDatasetSchemas(dataset_type.label)
            let title = 'Create ' + dataset_type.label.replace(/([A-Z])/g, ' $1')
            this.modal = {
                status: true,
                title: title,
                edit: false,
                type: this.dataset_type,
                permissions: ['edit', 'delete', 'read'],
                data: {},
                hide_upload: false
            }
        },
        uploadAction() {
            if (this.files) {
                this.filesUploading = true
                let formData = new FormData()
                let fidx = 0
                for (let file of this.files) {
                    fidx++
                    formData.append(`file${fidx}`, file, file.name)
                }
                formData.append('nb_files', fidx)
                formData.append('resource_type_id', this.dataset_type.resource_type_id)
                this.datasetStore
                    .uploadDatasets(this.study_public_id, formData)
                    .then((uploadedDatasets) => {
                        this.$emit('updateStudy')
                        const msg = `${uploadedDatasets.length} dataset${uploadedDatasets.length > 1 ? 's' : ''} uploaded successfully`
                        this.$notify({ title: 'Success', text: msg, type: 'success' })
                        this.uploadedDatasets = uploadedDatasets
                        this.getDatasets()
                        this.filesUploading = false
                    })
                    .catch(() => {
                        this.filesUploading = false
                        notifyError('Failed to upload dataset(s). Please try again.')
                    })
            }
        },
        getDatasets() {
            if (this.study_public_id) {
                this.datasetStore
                    .getStudyDatasets({ study_id: this.study_public_id })
                    .then(() => {
                        this.$emit('updateStudy')
                        this.loaded = true
                        this.buildTableHeaders(this.datasets, 'dataset_type')
                    })
                    .catch(() => notifyError('Failed to load datasets. Please try again.'))
            } else {
                this.datasetStore
                    .getDatasets()
                    .then(() => {
                        this.loaded = true
                        this.buildTableHeaders(this.datasets, 'dataset_type')
                    })
                    .catch(() => notifyError('Failed to load datasets. Please try again.'))
            }
        },
        getAnalyses() {
            if (this.study_public_id) {
                this.datasetStore
                    .getStudyDatasets({ study_id: this.study_public_id })
                    .then(() => {
                        this.loaded = true
                        this.buildTableHeaders(this.datasets, 'dataset_type')
                    })
                    .catch(() => notifyError('Failed to load analyses. Please try again.'))
            } else {
                this.datasetStore
                    .getDatasets()
                    .then(() => {
                        this.loaded = true
                        this.buildTableHeaders(this.datasets, 'dataset_type')
                    })
                    .catch(() => notifyError('Failed to load analyses. Please try again.'))
            }
        },
        getSamples() {
            if (this.study_public_id) {
                this.sampleStore
                    .getStudySamples({ study_id: this.study_public_id })
                    .then(() => {
                        this.loaded = true
                    })
                    .catch(() => notifyError('Failed to load samples. Please try again.'))
            } else {
                this.datasetStore
                    .getSamples()
                    .then(() => {
                        this.loaded = true
                    })
                    .catch(() => notifyError('Failed to load samples. Please try again.'))
            }
        },
        getExperiments() {
            if (this.study_public_id) {
                this.experimentStore
                    .getStudyExperiments({ study_id: this.study_public_id })
                    .then(() => {
                        this.loaded = true
                    })
                    .catch(() => notifyError('Failed to load experiments. Please try again.'))
            } else {
                this.experimentStore
                    .getExperiments()
                    .then(() => {
                        this.loaded = true
                    })
                    .catch(() => notifyError('Failed to load experiments. Please try again.'))
            }
        },
        updateData(event) {
            this.data = event.data
        },
        getDatasetSchemas(dataset_type) {
            const schemaStore = useSchemaStore()
            if (this.samples.length) {
                schemaStore.getSchemas().then((schemas) => {
                    if (schemas[dataset_type] !== undefined) {
                        this.data_schema = schemas[dataset_type].data_schema
                        this.ui_schema = schemas[dataset_type].ui_schema
                    }
                })
            }
        },
    }
})
</script>
