<template>
    <div class="Experiments">
        <component :is="study_id ? 'div' : 'v-sheet'" v-bind="study_id ? {} : { minHeight: '70vh', rounded: 'lg' }">
            <v-dialog
                v-model="modal.status"
                class="resource-dialog"
                @afterLeave="experiment_type = null"
            >
                <modal-resource
                    cas="experiment"
                    :study_id="study_id"
                    :type="modal.type"
                    :input_data="modal.data"
                    :hide_upload="false"
                    :title="modal.title"
                    :edit="modal.edit"
                    :permissions="modal.permissions"
                    @closeModal="close($event)"
                ></modal-resource>
            </v-dialog>
            <component :is="study_id ? 'div' : 'v-container'" v-bind="study_id ? {} : { fluid: true }">
                <p v-if="error" class="text-danger">{{ error }}</p>
                <PageTitle v-if="!study_id" title="Experiments" />
                <p v-if="!loaded" class="text-center mt-3">
                    <em>Loading experiments...</em> <br />
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </p>
                <div v-else>
                    <div v-if="study_id">
                        <DataTable
                            table-id="wizard-experiments"
                            :items="experimentTableItems"
                            :headers="tableHeaders"
                            v-model:search="search"
                            v-model:selected="selectedExperiments"
                            show-select
                            item-key="id"
                            :primary-action="primaryAction"
                            :primary-action-items="primaryActionItems"
                            @primary-action="createExperiment(experimentTypes[0])"
                            @primary-action-select="
                                (value) =>
                                    createExperiment(
                                        experimentTypes.find((t) => t.resource_type_id === value)
                                    )
                            "
                        >
                            <template #selection-actions>
                                <ConfirmActionButtons
                                    v-if="canManageExperiments"
                                    :actions="deleteActions()"
                                    :confirming="deleteExperiment.status ? 'delete' : null"
                                    @arm="deleteExperiments('init')"
                                    @confirm="deleteExperiments('save')"
                                    @cancel="deleteExperiments('cancel')"
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
                                    @click="editExperiment(item)"
                                    >{{ item.title }}</v-btn
                                >
                            </template>

                            <template #item.creation_date="{ value }"><DateCell :value="value" /></template>
                            <template #item.last_update="{ value }"><DateCell :value="value" /></template>
                            <template #item.actions="{ item }">
                                <ResourceActionButton
                                    :item="item"
                                    :study="study"
                                    @click="editExperiment(item)"
                                />
                            </template>

                            <template #no-data>
                                <div class="text-center pt-2">
                                    Experiments provide details about the library preparation and
                                    sequencing strategy used in the study.<br />
                                    Include information such as sequencing platform, library layout,
                                    and experimental protocol.
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
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import { useExperimentStore } from '@/stores/experiments.js'
import ModalResource from '@/components/modalResource.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import ResourceActionButton from '@/components/shared/datatable/cells/ResourceActionButton.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import { useResourceTableHeaders } from '@/composables/useResourceTableHeaders'
import { humanizeCamelCase } from '@/utils/format'
import { mapState } from 'pinia'
import _ from 'lodash'

export default defineComponent({
    name: 'Experiments',
    components: {
        ModalResource,
        PageTitle,
        DataTable,
        CopyIdCell,
        DateCell,
        ResourceActionButton,
        ConfirmActionButtons
    },
    setup() {
        const { headers: tableHeaders, build: buildTableHeaders } = useResourceTableHeaders({
            source: 'data_schema.required',
            isDescription: (label) => label.indexOf('description') > -1,
            defaultHeaders: [
                { title: 'Last Updated', value: 'last_update', width: '1%', sortable: true },
                { title: 'Created By', value: 'creator_name', width: '1%', sortable: true },
                { title: 'Actions', value: 'actions', width: '1%', align: 'center' }
            ]
        })
        return { tableHeaders, buildTableHeaders }
    },
    data() {
        return {
            experimentStore: null,
            selectedExperiments: [],
            modal: { status: false, title: null },
            error: '',
            loaded: false,
            study_id: null,
            uploadedExperiments: [],
            experiment_type: null,
            deleteExperiment: { status: false },
            data: {},
            search: '',
            data_schema: null,
            ui_schema: null
        }
    },
    computed: {
        ...mapState(useExperimentStore, ['experiments']),
        ...mapState(useSubmissionStore, ['study']),
        ...mapState(useSampleStore, ['samples']),
        ...mapState(useSchemaStore, ['schemas']),
        experimentTableItems() {
            return this.experiments.map((e) => {
                _.forEach(e.properties, (v, k) => {
                    e[k] = v
                })
                return e
            })
        },
        experimentTypes() {
            return this.study?.experimentTypes ?? []
        },
        canManageExperiments() {
            return (
                this.study.status_type_id === 'DRA' || this.study.status_type_id === 'REV'
            )
        },
        primaryAction() {
            if (!this.canManageExperiments || !this.experimentTypes.length || this.deleteExperiment.status) {
                return null
            }
            if (this.experimentTypes.length === 1) {
                return {
                    label: `New ${humanizeCamelCase(this.experimentTypes[0].label)}`,
                    icon: 'mdi-plus'
                }
            }
            return { label: 'Add New', icon: 'mdi-plus' }
        },
        primaryActionItems() {
            if (
                !this.canManageExperiments ||
                this.deleteExperiment.status ||
                this.experimentTypes.length <= 1
            ) {
                return []
            }
            return this.experimentTypes.map((t) => ({
                title: humanizeCamelCase(t.label),
                value: t.resource_type_id
            }))
        }
    },
    mounted() {
        const sampleStore = useSampleStore()
        const submissionStore = useSubmissionStore()
        this.experimentStore = useExperimentStore()
        if (this.study) {
            this.study_id = this.study.properties.public_id
            sampleStore.getStudySamples({ study_id: this.study_id })
            this.getExperiments()
        } else {
            this.study_id = this.$route.params.study_id
            submissionStore.getStudy(this.study_id).then((study) => {
                sampleStore.getStudySamples({ study_id: study.public_id })
                this.getExperiments()
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
        deleteExperiments(action) {
            if (action == 'init' || action == 'cancel') {
                this.deleteExperiment.status = !this.deleteExperiment.status
            } else {
                let params
                if (this.selectedExperiments) {
                    params = []
                    _.forEach(this.selectedExperiments, (id) => {
                        params.push({
                            study_id: this.study_id,
                            experiment_id: _.filter(this.experiments, (s) => s.id === id)[0]
                                .public_id
                        })
                    })
                }
                this.experimentStore
                    .deleteExperiments(params)
                    .then(() => {
                        this.$emit('updateStudy')
                        this.$notify({
                            title: 'Success',
                            text: `${params.length} experiment${params.length > 1 ? 's' : ''} deleted successfully`,
                            type: 'success'
                        })
                        this.deleteExperiment.status = false
                        this.selectedExperiments = []
                    })
                    .catch(() => {
                        this.deleteExperiment.status = false
                        notifyError('Failed to delete experiment(s). Please try again.')
                    })
            }
        },
        close(e) {
            this.resetModal()
            if (e) {
                //Get samples because when create sample via file, new samples are not displayed here. Idem for edition.
                this.getExperiments()
            }
        },
        createExperiment(experiment_type) {
            this.experiment_type = experiment_type
            this.getExperimentSchemas(experiment_type.label)
            let title = 'Create ' + experiment_type.label.replace(/([A-Z])/g, ' $1')
            this.modal = {
                status: true,
                title: title,
                edit: false,
                type: this.experiment_type,
                permissions: ['edit', 'delete', 'read'],
                data: {},
                hide_upload: false
            }
        },
        editExperiment(experiment) {
            this.data = JSON.parse(JSON.stringify(experiment.properties))
            this.experiment_type = { label: experiment.experiment_type }
            this.getExperimentSchemas(experiment.experiment_type)
            let title =
                experiment.current_permission.indexOf('edit') > -1
                    ? 'Update'
                    : 'Review' +
                      ' ' +
                      experiment.experiment_type.replace(/([A-Z])/g, ' $1') +
                      " '" +
                      experiment.properties.design_description +
                      "'"
            this.modal = {
                status: true,
                title: title,
                type: {
                    name: experiment.experiment_type,
                    label: experiment.experiment_type
                },
                data: this.data,
                edit: experiment.public_id,
                permissions: experiment.current_permission
            }
        },
        getExperiments() {
            if (this.study_id) {
                this.experimentStore
                    .getStudyExperiments({ study_id: this.study_id })
                    .then(() => {
                        this.$emit('updateStudy')
                        this.loaded = true
                        this.buildTableHeaders(this.experiments, 'experiment_type')
                    })
                    .catch(() => {
                        notifyError('Failed to load experiments. Please try again.')
                    })
            } else {
                this.experimentStore
                    .getExperiments()
                    .then(() => {
                        this.loaded = true
                        this.buildTableHeaders(this.experiments, 'experiment_type')
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
        resetForm() {
            let _this = this
            Object.keys(this.data).forEach(function (index) {
                _this.data[index] = null
            })
            this.showForm = false
        },
        submitForm() {
            let _this = this
            let param = {
                study_id: this.study_id,
                experiment: {
                    properties: this.data,
                    experiment_type: this.experiment_type.label
                }
            }
            this.experimentStore
                .editExperiment(param)
                .then(() => {
                    _this.$emit('updateStudy')
                    _this.showForm = false
                    _this.data = {}
                    _this.$notify({
                        title: 'Experiment registered successfully',
                        type: 'success'
                    })
                })
                .catch(() => {
                    notifyError('Failed to register experiment. Please try again.')
                })
        },
        getExperimentSchemas(experiment_type) {
            const schemaStore = useSchemaStore()
            schemaStore.getSchemas().then((schemas) => {
                if (schemas[experiment_type] !== undefined) {
                    this.data_schema = schemas[experiment_type].data_schema
                    this.ui_schema = schemas[experiment_type].ui_schema
                }
            })
        }
    }
})
</script>
