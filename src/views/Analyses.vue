<template>
    <div class="Analyses">
        <component :is="study_public_id ? 'div' : 'v-sheet'" v-bind="study_public_id ? {} : { minHeight: '70vh', rounded: 'lg' }">
            <v-dialog v-model="modal.status" class="resource-dialog">
                <modal-resource
                    cas="analysis"
                    :study_id="study_public_id"
                    :type="modal.type"
                    :input_data="modal.data"
                    :permissions="modal.permissions"
                    :title="modal.title"
                    :edit="modal.edit"
                    :hide_upload="modal.hide_upload"
                    @closeModal="close($event)"
                ></modal-resource>
            </v-dialog>
            <component :is="study_public_id ? 'div' : 'v-container'" v-bind="study_public_id ? {} : { fluid: true }">
                <p v-if="error" class="text-danger">{{ error }}</p>
                <PageTitle v-if="!study_public_id" title="Analyses" />
                <p v-if="loading" class="text-center mt-3">
                    <em>Loading analyses</em> <br />
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </p>
                <div v-else>
                    <div v-if="study_public_id">
                        <DataTable
                            table-id="wizard-analyses"
                            :items="analyses"
                            :headers="tableHeaders"
                            v-model:search="search"
                            v-model:selected="selectedAnalyses"
                            show-select
                            item-key="id"
                            :primary-action="primaryAction"
                            :primary-action-items="primaryActionItems"
                            @primary-action="createAnalysis(analysisTypes[0])"
                            @primary-action-select="
                                (value) =>
                                    createAnalysis(analysisTypes.find((t) => t.resource_type_id === value))
                            "
                        >
                            <template #selection-actions>
                                <ConfirmActionButtons
                                    v-if="canManageAnalyses"
                                    :actions="deleteActions()"
                                    :confirming="deleteAnalysis.status ? 'delete' : null"
                                    @arm="deleteAnalyses('init')"
                                    @confirm="deleteAnalyses('save')"
                                    @cancel="deleteAnalyses('cancel')"
                                />
                            </template>

                            <template #header.sample_public_ids="{}">Samples</template>
                            <template #header.molecularexperiment_public_ids="{}">Experiments</template>
                            <template #header.sdafile_public_ids="{}">Files</template>
                            <template #item.public_id="{ item }">
                                <CopyIdCell :value="item.public_id" />
                            </template>
                            <template #item.properties.title="{ item }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="editAnalysis(item)"
                                    >{{ item.title }}</v-btn
                                >
                            </template>

                            <template #item.sample_public_ids="{ item }">
                                <v-menu>
                                    <template #activator="{ props }">
                                        <v-btn color="info" v-bind="props" size="small" variant="outlined">
                                            {{ item.properties.sample_public_ids.length }}
                                            sample<template
                                                v-if="item.properties.sample_public_ids.length > 1"
                                                >s</template
                                            ><v-icon icon="mdi-menu-down" />
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item
                                            v-for="(public_id, index) in item.properties.sample_public_ids"
                                            :key="index"
                                            :value="public_id"
                                        >
                                            <v-list-item-title @click="showResource(public_id, 'Sample')">
                                                <span>
                                                    {{ getResourceName(public_id, 'Sample') }}
                                                </span>
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </template>

                            <template #item.molecularexperiment_public_ids="{ item }">
                                <v-menu>
                                    <template #activator="{ props }">
                                        <v-btn
                                            color="info"
                                            v-bind="props"
                                            size="small"
                                            variant="outlined"
                                            open-on-focus
                                        >
                                            {{ item.properties.molecularexperiment_public_ids.length }}
                                            experiment<template
                                                v-if="
                                                    item.properties.molecularexperiment_public_ids
                                                        .length > 1
                                                "
                                                >s</template
                                            ><v-icon icon="mdi-menu-down" />
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item
                                            v-for="(public_id, index) in item.properties
                                                .molecularexperiment_public_ids"
                                            :key="index"
                                            :value="public_id"
                                        >
                                            <v-list-item-title
                                                @click="showResource(public_id, 'molecularExperiment')"
                                            >
                                                <span>
                                                    {{ getResourceName(public_id, 'molecularExperiment') }}
                                                </span>
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </template>

                            <template #item.sdafile_public_ids="{ item }">
                                <CountChip :items="item.properties.sdafile_public_ids" label="file" />
                            </template>
                            <template #item.analysis_type="{ value }">
                                <InitialsChip :name="value" />
                            </template>
                            <template #item.properties.experiment_types="{ item }">
                                <CountChip :items="item.properties.experiment_types" label="type" />
                            </template>
                            <template #item.status="{ value }">
                                <StatusChip :status="value" />
                            </template>
                            <template #item.last_update="{ value }"><DateCell :value="value" /></template>
                            <template #item.actions="{ item }">
                                <ResourceActionButton
                                    :item="item"
                                    :study="study"
                                    @click="editAnalysis(item)"
                                />
                            </template>

                            <template #no-data>
                                <div class="text-center pt-2">
                                    Describe any computational processing or analysis performed on the
                                    raw sequencing data. <br />
                                    Examples include read alignment, variant calling, expression
                                    quantification, or other downstream analyses.
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
import { useExperimentStore } from '@/stores/experiments.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import ModalResource from '@/components/modalResource.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import CountChip from '@/components/shared/datatable/cells/CountChip.vue'
import InitialsChip from '@/components/shared/datatable/cells/InitialsChip.vue'
import ResourceActionButton from '@/components/shared/datatable/cells/ResourceActionButton.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import { useResourceTableHeaders } from '@/composables/useResourceTableHeaders'
import { fitColumn, dateColumn } from '@/utils/dataTableHeaders'
import { humanizeCamelCase } from '@/utils/format'
import { mapState } from 'pinia'
import _ from 'lodash'

export default defineComponent({
    name: 'Analyses',
    components: {
        ModalResource,
        PageTitle,
        DataTable,
        CopyIdCell,
        StatusChip,
        DateCell,
        CountChip,
        InitialsChip,
        ResourceActionButton,
        ConfirmActionButtons
    },
    props: ['study_id'],
    setup() {
        const { headers: tableHeaders, build: buildTableHeaders } = useResourceTableHeaders({
            source: 'ui_schema.displayedElements',
            defaultHeaders: [
                fitColumn({ title: 'Samples', value: 'sample_public_ids' }),
                fitColumn({ title: 'Experiments', value: 'molecularexperiment_public_ids' }),
                fitColumn({ title: 'Files', value: 'sdafile_public_ids' }),
                { title: 'Status', value: 'status', width: '1%' },
                dateColumn({ title: 'Last Updated', value: 'last_update', sortable: true }),
                { title: 'Created By', value: 'creator_name', width: '1%' },
                { title: 'Actions', value: 'actions', width: '1%', align: 'center' }
            ]
        })
        return { tableHeaders, buildTableHeaders }
    },
    data() {
        return {
            analysisStore: null,
            sampleStore: null,
            experimentStore: null,
            selectedAnalyses: [],
            modal: {
                status: false,
                title: null,
                data: {},
                type: { name: '', label: '' },
                edit: null
            },
            error: '',
            nav: 'form',
            loaded: false,
            study_public_id: null,
            uploadedAnalyses: [],
            upload: false,
            loading: true,
            analysis_type: null,
            files: null,
            filesUploading: false,
            deleteAnalysis: { status: false },
            data: {},
            data_schema: null,
            ui_schema: null,
            search: ''
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['study']),
        ...mapState(useAnalysisStore, ['analyses']),
        ...mapState(useSampleStore, ['samples']),
        ...mapState(useExperimentStore, ['experiments']),
        ...mapState(useSchemaStore, ['schemas']),
        analysisTypes() {
            return this.study?.analysisTypes ?? []
        },
        canManageAnalyses() {
            return (
                this.analysisTypes.length &&
                this.study.current_permission.indexOf('edit') > -1 &&
                (this.study.status_type_id === 'DRA' || this.study.status_type_id === 'REV')
            )
        },
        primaryAction() {
            if (!this.canManageAnalyses || this.deleteAnalysis.status) return null
            if (this.analysisTypes.length === 1) {
                return {
                    label: `New ${humanizeCamelCase(this.analysisTypes[0].label)}`,
                    icon: 'mdi-plus'
                }
            }
            return { label: 'Add New', icon: 'mdi-plus' }
        },
        primaryActionItems() {
            if (!this.canManageAnalyses || this.deleteAnalysis.status || this.analysisTypes.length <= 1) {
                return []
            }
            return this.analysisTypes.map((t) => ({
                title: humanizeCamelCase(t.label),
                value: t.resource_type_id
            }))
        }
    },
    mounted() {
        this.submissionStore = useSubmissionStore()
        this.analysisStore = useAnalysisStore()
        this.sampleStore = useSampleStore()
        this.experimentStore = useExperimentStore()
        if (this.study) {
            this.submissionStore.getStatusTypes()
            this.study_public_id = this.study.public_id
            this.submissionStore.getStudyFiles().then(() => {
                this.getAnalyses()
                this.getSamples()
                this.getExperiments()
            })
        } else {
            const study_id = this.$route.params.study_id || this.study_id
            this.submissionStore.getStudy(study_id).then(() => {
                this.submissionStore.getStatusTypes()
                this.submissionStore.getStudyFiles().then(() => {
                    this.study_public_id = this.study.public_id
                    this.getAnalyses()
                    this.getSamples()
                    this.getExperiments()
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

        editAnalysis(item) {
            this.analysis_type = { name: item.analysis_type }
            this.data = JSON.parse(JSON.stringify(item.properties))
            let title =
                item.current_permission.indexOf('edit') > -1
                    ? 'Update'
                    : 'Review' +
                      ' ' +
                      item.analysis_type.replace(/([A-Z])/g, ' $1') +
                      " '" +
                      item.title +
                      "'"
            this.nav = 'form'
            this.modal = {
                status: true,
                title: title,
                edit: item.public_id,
                type: { name: item.analysis_type, label: item.analysis_type },
                permissions: item.current_permission,
                data: this.data
            }
        },
        deleteAnalyses(action) {
            if (action == 'init' || action == 'cancel') {
                this.deleteAnalysis.status = !this.deleteAnalysis.status
            } else {
                let params
                if (this.modal.edit) {
                    params = this.modal.edit
                } else if (this.selectedAnalyses) {
                    params = []
                    _.forEach(this.selectedAnalyses, (id) => {
                        params.push({
                            study_id: this.study_id,
                            analysis_id: _.filter(this.analyses, (s) => s.id === id)[0].public_id
                        })
                    })
                }
                this.analysisStore
                    .deleteAnalyses(params)
                    .then(() => {
                        this.$emit('updateStudy')
                        this.$notify({
                            title: 'Success',
                            text: `${params.length} ${params.length > 1 ? 'analyses' : 'analysis'} deleted successfully`,
                            type: 'success'
                        })
                        this.deleteAnalysis.status = false
                        this.selectedAnalyses = []
                    })
                    .catch(() => {
                        this.deleteAnalysis.status = false
                        notifyError('Failed to delete the selected analyses. Please try again.')
                    })
            }
        },
        resetModal() {
            this.modal.status = false
            this.modal.title = ''
            this.modal.edit = false
            this.modal.permissions = []
            this.modal.data = {}
            this.modal.type = { name: '', label: '' }
            this.modal.hide_upload = false
        },
        close(e) {
            this.resetModal()
            if (e) {
                this.getAnalyses()
            }
        },
        createAnalysis(analysis_type) {
            this.analysis_type = analysis_type
            let title = 'Create ' + analysis_type.label.replace(/([A-Z])/g, ' $1')
            this.modal = {
                status: true,
                title: title,
                edit: false,
                type: this.analysis_type,
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
                formData.append('resource_type_id', this.analysis_type.resource_type_id)
                this.analysisStore
                    .uploadAnalyses(this.study_public_id, formData)
                    .then((uploadedAnalyses) => {
                        this.$emit('updateStudy')
                        const msg = `${uploadedAnalyses.length} analysis${uploadedAnalyses.length > 1 ? 's' : ''} uploaded successfully`
                        this.$notify({ title: 'Success', text: msg, type: 'success' })
                        this.uploadedAnalyses = uploadedAnalyses
                        this.getAnalyses()
                        this.filesUploading = false
                    })
                    .catch(() => {
                        this.filesUploading = false
                        notifyError('Failed to upload analysis files. Please try again.')
                    })
            }
        },
        getAnalyses() {
            this.loading = true
            if (this.study_public_id) {
                this.analysisStore
                    .getStudyAnalyses({ study_id: this.study_public_id })
                    .then(() => {
                        this.$emit('updateStudy')
                        this.loading = false
                        this.loaded = true
                        this.buildTableHeaders(this.analyses, 'analysis_type')
                    })
                    .catch(() => notifyError('Failed to load analyses. Please try again.'))
            } else {
                this.analysisStore
                    .getAnalyses()
                    .then(() => {
                        this.loading = false
                        this.loaded = true
                        this.buildTableHeaders(this.analyses, 'analysis_type')
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
                this.analysisStore
                    .getAnalyses()
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
        getAnalysisSchemas(analysis_type) {
            const schemaStore = useSchemaStore()
            if (this.samples.length) {
                schemaStore.getSchemas().then((schemas) => {
                    if (schemas[analysis_type] !== undefined) {
                        this.data_schema = schemas[analysis_type].data_schema
                        this.ui_schema = schemas[analysis_type].ui_schema
                    }
                })
            }
        },
        showResource(publicId, resourceType) {
            if (resourceType.toLowerCase().indexOf('experiment') > -1) {
                let idx = _.findIndex(this.experiments, (e) => e.public_id === publicId)
                if (idx > -1) {
                    this.modal = {
                        status: true,
                        title: `View Experiment ${publicId}`,
                        type: {
                            name: this.experiments[idx].experiment_type,
                            label: this.experiments[idx].experiment_type
                        },
                        edit: false,
                        permissions: ['read'],
                        data: this.experiments[idx].properties,
                        hide_upload: true
                    }
                }
            } else if (resourceType.toLowerCase().indexOf('sample') > -1) {
                let idx = _.findIndex(this.samples, (s) => s.public_id === publicId)
                if (idx > -1) {
                    this.modal = {
                        status: true,
                        title: `View Sample ${publicId}`,
                        type: {
                            name: this.samples[idx].sample_type,
                            label: this.samples[idx].sample_type
                        },
                        edit: false,
                        permissions: ['read'],
                        data: this.samples[idx].properties,
                        hide_upload: true
                    }
                }
            }
        },
        getResourceName(publicId, resourceType) {
            if (resourceType.toLowerCase().indexOf('experiment') > -1) {
                let idx = _.findIndex(this.experiments, (e) => e.public_id === publicId)
                if (idx > -1) {
                    return this.experiments[idx].properties.title
                }
            } else if (resourceType.toLowerCase().indexOf('sample') > -1) {
                let idx = _.findIndex(this.samples, (s) => s.public_id === publicId)
                if (idx > -1) {
                    return this.samples[idx].properties.title
                }
            }
        }
    }
})
</script>
