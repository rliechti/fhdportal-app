<template>
    <div class="Runs">
        <component :is="study_public_id ? 'div' : 'v-sheet'" v-bind="study_public_id ? {} : { minHeight: '70vh', rounded: 'lg' }">
            <v-dialog v-model="modal.status" class="resource-dialog">
                <modal-resource
                    cas="run"
                    :study_id="study_public_id"
                    :type="modal.type"
                    :title="modal.title"
                    :input_data="modal.data"
                    :edit="modal.edit"
                    :permissions="modal.permissions"
                    :hide_upload="modal.hide_upload"
                    @closeModal="close($event)"
                ></modal-resource>
            </v-dialog>

            <component :is="study_public_id ? 'div' : 'v-container'" v-bind="study_public_id ? {} : { fluid: true }">
                <p v-if="error" class="text-danger">{{ error }}</p>
                <PageTitle v-if="!study_public_id" title="Runs" />
                <p v-if="!loaded || loading" class="text-center mt-3">
                    <em>Loading runs</em> <br />
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </p>
                <div v-if="loaded">
                    <div v-if="study_public_id">
                        <div v-if="!loading">
                            <DataTable
                                table-id="wizard-runs"
                                :items="runs"
                                :headers="tableHeaders"
                                v-model:search="search"
                                v-model:selected="selectedRuns"
                                show-select
                                item-key="id"
                                :primary-action="primaryAction"
                                :primary-action-items="primaryActionItems"
                                @primary-action="createRun(runTypes[0])"
                                @primary-action-select="
                                    (value) =>
                                        createRun(runTypes.find((t) => t.resource_type_id === value))
                                "
                            >
                                <template #selection-actions>
                                    <ConfirmActionButtons
                                        v-if="canManageRuns"
                                        :actions="deleteActions()"
                                        :confirming="deleteRun.status ? 'delete' : null"
                                        @arm="deleteRuns('init')"
                                        @confirm="deleteRuns('save')"
                                        @cancel="deleteRuns('cancel')"
                                    />
                                </template>

                                <template #header.sample_public_id="{}">Sample</template>
                                <template #header.molecularexperiment_public_id="{}"
                                    >Experiment</template
                                >
                                <template #header.sdafile_public_ids="{}">Files</template>
                                <template #item.public_id="{ item }">
                                    <CopyIdCell :value="item.public_id" />
                                </template>
                                <template #item.title="{ item }">
                                    <v-btn
                                        variant="text"
                                        color="info"
                                        class="fega-table-btn"
                                        @click="editRun(item)"
                                        >{{ item.title }}</v-btn
                                    >
                                </template>

                                <template #item.sample_public_id="{ item }">
                                    <v-btn
                                        size="small"
                                        variant="outlined"
                                        @click="
                                            showResource(item.properties.sample_public_id, 'Sample')
                                        "
                                    >
                                        <v-icon class="mr-1" icon="mdi-eye-outline" />
                                        {{ formatId(item.properties.sample_public_id) }}
                                        <v-tooltip activator="parent" location="top">
                                            <span style="white-space: pre-line">
                                                {{
                                                    getResourceName(
                                                        item.properties.sample_public_id,
                                                        'Sample'
                                                    )
                                                }}
                                            </span>
                                        </v-tooltip>
                                    </v-btn>
                                </template>
                                <template #item.molecularexperiment_public_id="{ item }">
                                    <v-btn
                                        size="small"
                                        variant="outlined"
                                        @click="
                                            showResource(
                                                item.properties.molecularexperiment_public_id,
                                                'molecularExperiment'
                                            )
                                        "
                                    >
                                        <v-icon class="mr-1" icon="mdi-eye-outline" />
                                        {{
                                            formatId(item.properties.molecularexperiment_public_id)
                                        }}
                                        <v-tooltip activator="parent" location="top">
                                            <span style="white-space: pre-line">
                                                {{
                                                    getResourceName(
                                                        item.properties
                                                            .molecularexperiment_public_id,
                                                        'molecularExperiment'
                                                    )
                                                }}
                                            </span>
                                        </v-tooltip>
                                    </v-btn>
                                </template>
                                <template #item.run_file_type="{ value }">
                                    <v-chip size="small">
                                        {{ value }}
                                        <v-tooltip activator="parent" location="top">
                                            <span style="white-space: pre-line">{{
                                                humanizeCamelCase(value)
                                            }}</span>
                                        </v-tooltip>
                                    </v-chip>
                                </template>
                                <template #item.sdafile_public_ids="{ item }">
                                    <CountChip :items="item.properties.sdafile_public_ids" label="file" />
                                </template>
                                <template #item.status="{ value }">
                                    <StatusChip :status="value" />
                                </template>
                                <template #item.creation_date="{ value }"
                                    ><DateCell :value="value"
                                /></template>
                                <template #item.last_update="{ value }"><DateCell :value="value" /></template>
                                <template #item.actions="{ item }">
                                    <ResourceActionButton :item="item" :study="study" @click="editRun(item)" />
                                </template>

                                <template #no-data>
                                    <div class="text-center pt-2">
                                        A run links a sample, a sequencing experiment, and the
                                        generated data files.<br />
                                        Use runs to associate biological samples with technical
                                        experiments and upload the corresponding raw data files
                                        (typically FASTQ, BAM, or CRAM files generated directly by
                                        the sequencing instrument)
                                    </div>
                                </template>
                            </DataTable>
                        </div>
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
import { useRunStore } from '@/stores/runs.js'
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
import ResourceActionButton from '@/components/shared/datatable/cells/ResourceActionButton.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import { useResourceTableHeaders } from '@/composables/useResourceTableHeaders'
import { humanizeCamelCase } from '@/utils/format'
import { mapState } from 'pinia'
import _ from 'lodash'

export default defineComponent({
    name: 'Runs',
    components: {
        ModalResource,
        PageTitle,
        DataTable,
        CopyIdCell,
        StatusChip,
        DateCell,
        CountChip,
        ResourceActionButton,
        ConfirmActionButtons
    },
    props: ['study_id'],
    setup() {
        const { headers: tableHeaders, build: buildTableHeaders } = useResourceTableHeaders({
            source: 'data_schema.required',
            defaultHeaders: [
                { title: 'Status', value: 'status', width: '1%' },
                { title: 'Last Updated', value: 'last_update', width: '1%', sortable: true },
                { title: 'Created By', value: 'creator_name', width: '1%', sortable: true },
                { title: 'Actions', value: 'actions', width: '1%', align: 'center' }
            ]
        })
        return { tableHeaders, buildTableHeaders, humanizeCamelCase }
    },
    data() {
        return {
            runStore: null,
            sampleStore: null,
            experimentStore: null,
            selectedRuns: [],
            modal: {
                status: false,
                title: '',
                type: {
                    name: '',
                    label: ''
                },
                edit: false,
                permissions: [],
                data: {},
                hide_upload: false
            },
            error: '',
            nav: 'form',
            loaded: false,
            loading: false,
            study_public_id: null,
            uploadedRuns: [],
            run_type: null,
            files: null,
            filesUploading: false,
            deleteRun: { status: false },
            data: {},
            data_schema: null,
            ui_schema: null,
            search: ''
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['study']),
        ...mapState(useRunStore, ['runs']),
        ...mapState(useSampleStore, ['samples']),
        ...mapState(useExperimentStore, ['experiments']),
        ...mapState(useSchemaStore, ['schemas']),
        runTypes() {
            return this.study?.runTypes ?? []
        },
        canManageRuns() {
            return this.study.status_type_id === 'DRA' || this.study.status_type_id === 'REV'
        },
        primaryAction() {
            if (!this.canManageRuns || !this.runTypes.length || this.deleteRun.status) return null
            if (this.runTypes.length === 1) {
                return {
                    label: `New ${humanizeCamelCase(this.runTypes[0].label)}`,
                    icon: 'mdi-plus'
                }
            }
            return { label: 'Add New', icon: 'mdi-plus' }
        },
        primaryActionItems() {
            if (!this.canManageRuns || this.deleteRun.status || this.runTypes.length <= 1) return []
            return this.runTypes.map((t) => ({
                title: humanizeCamelCase(t.label),
                value: t.resource_type_id
            }))
        }
    },
    mounted() {
        this.submissionStore = useSubmissionStore()
        this.runStore = useRunStore()
        this.sampleStore = useSampleStore()
        this.experimentStore = useExperimentStore()
        if (this.study) {
            this.submissionStore.getStatusTypes()
            this.study_public_id = this.study.public_id
            this.submissionStore.getStudyFiles().then(() => {
                this.getRuns()
                this.getSamples()
                this.getExperiments()
            })
        } else {
            const study_id = this.$route.params.study_id || this.study_id
            this.submissionStore.getStudy(study_id).then(() => {
                this.submissionStore.getStatusTypes()
                this.submissionStore.getStudyFiles().then(() => {
                    this.study_public_id = this.study.public_id
                    this.getRuns()
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

        close(e) {
            this.resetModal()
            if (e) {
                this.getRuns()
            }
        },

        editRun(item) {
            this.run_type = {
                name: item.run_type
            }
            this.data = JSON.parse(JSON.stringify(item.properties))
            let title =
                item.current_permission.indexOf('edit') > -1
                    ? 'Update'
                    : 'Review' +
                      ' ' +
                      item.run_type.replace(/([A-Z])/g, ' $1') +
                      " '" +
                      item.public_id +
                      "'"
            this.modal = {
                status: true,
                title: title,
                type: { name: item.run_type, label: item.run_type },
                edit: item.public_id,
                permissions: item.current_permission,
                data: this.data,
                hide_upload: false
            }
        },
        deleteRuns(action) {
            if (action == 'init' || action == 'cancel') {
                this.deleteRun.status = !this.deleteRun.status
            } else {
                let params = []
                if (this.modal.edit) {
                    params.push({ study_id: this.study_public_id, run: this.modal.edit })
                } else if (this.selectedRuns) {
                    _.forEach(this.selectedRuns, (id) => {
                        params.push({
                            study_id: this.study_public_id,
                            run_id: _.filter(this.runs, (s) => s.id === id)[0].public_id
                        })
                    })
                }
                this.runStore
                    .deleteRuns(params)
                    .then(() => {
                        this.$emit('updateStudy')
                        this.$notify({
                            title: 'Success',
                            text: `${params.length} run${params.length > 1 ? 's' : ''} deleted successfully`,
                            type: 'success'
                        })
                        this.deleteRun.status = false
                        this.selectedRuns = []
                    })
                    .catch(() => {
                        this.deleteRun.status = false
                        notifyError('Failed to delete the selected run(s). Please try again.')
                    })
            }
        },

        createRun(run_type) {
            this.run_type = run_type
            let title = 'Create ' + run_type.label.replace(/([A-Z])/g, ' $1')
            this.modal = {
                status: true,
                title: title,
                edit: false,
                type: this.run_type,
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
                formData.append('resource_type_id', this.run_type.resource_type_id)
                this.runStore
                    .uploadRuns(this.study_public_id, formData)
                    .then((uploadedRuns) => {
                        this.$emit('updateStudy')
                        const msg = `${uploadedRuns.length} run${uploadedRuns.length > 1 ? 's' : ''} uploaded successfully`
                        this.$notify({ title: 'Success', text: msg, type: 'success' })
                        this.uploadedRuns = uploadedRuns
                        this.getRuns()
                        this.filesUploading = false
                    })
                    .catch(() => {
                        this.filesUploading = false
                        notifyError('Failed to upload run(s). Please try again.')
                    })
            }
        },
        getRuns() {
            this.loading = true
            if (this.study_public_id) {
                this.runStore
                    .getStudyRuns({ study_id: this.study_public_id })
                    .then(() => {
                        this.$emit('updateStudy')
                        this.loading = false
                        this.loaded = true
                        this.buildTableHeaders(this.runs, 'run_type')
                    })
                    .catch(() => notifyError('Failed to load runs. Please try again.'))
            } else {
                this.runStore
                    .getRuns()
                    .then(() => {
                        this.loaded = true
                        this.buildTableHeaders(this.runs, 'run_type')
                    })
                    .catch(() => notifyError('Failed to load runs. Please try again.'))
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
                this.runStore
                    .getRuns()
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
        resetModal() {
            this.modal.status = false
            this.modal.title = ''
            this.modal.edit = false
            this.modal.permissions = []
            this.modal.data = {}
            this.modal.type = { name: '', label: '' }
            this.modal.hide_upload = false
        },
        formatId(value) {
            return value.substring(6, 7) + '0' + value.replace(/^CHFEGA.0+/, '')
        },
        getRunSchemas(run_type) {
            const schemaStore = useSchemaStore()
            if (this.samples.length) {
                schemaStore.getSchemas().then((schemas) => {
                    if (schemas[run_type] !== undefined) {
                        this.data_schema = schemas[run_type].data_schema
                        this.ui_schema = schemas[run_type].ui_schema
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

<style>
@import '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css';
</style>
