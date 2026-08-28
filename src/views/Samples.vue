<template>
    <div class="Samples">
        <component :is="study_public_id ? 'div' : 'v-sheet'" v-bind="study_public_id ? {} : { minHeight: '70vh', rounded: 'lg' }">
            <v-dialog v-model="modal.status" class="resource-dialog">
                <modal-resource
                    cas="sample"
                    :study_id="study_public_id"
                    :type="sample_type"
                    :input_data="modal.data"
                    :title="modal.title"
                    :edit="modal.edit"
                    :permissions="modal.permissions"
                    @closeModal="close($event)"
                ></modal-resource>
            </v-dialog>

            <component :is="study_public_id ? 'div' : 'v-container'" v-bind="study_public_id ? {} : { fluid: true }">
                <PageTitle v-if="!study_public_id" title="Samples" />
                <p v-if="!loaded || loading" class="text-center mt-3">
                    <em>Loading samples</em> <br />
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </p>
                <div v-if="loaded">
                    <div v-if="study_public_id && !loading">
                        <DataTable
                            table-id="wizard-samples"
                            :items="samples"
                            :headers="sampleTableHeaders"
                            v-model:search="search"
                            :filter-keys="['title']"
                            v-model:selected="selectedSamples"
                            show-select
                            item-key="id"
                            :primary-action="primaryAction"
                            :primary-action-items="primaryActionItems"
                            @primary-action="createSample(sampleTypes[0])"
                            @primary-action-select="
                                (value) =>
                                    createSample(sampleTypes.find((t) => t.resource_type_id === value))
                            "
                        >
                            <template #selection-actions>
                                <ConfirmActionButtons
                                    v-if="canManageSamples"
                                    :actions="deleteActions()"
                                    :confirming="deleteSample.status ? 'delete' : null"
                                    @arm="deleteSamples('init')"
                                    @confirm="deleteSamples('save')"
                                    @cancel="deleteSamples('cancel')"
                                />
                            </template>

                            <template #item.public_id="{ item }">
                                <CopyIdCell :value="item.public_id" notify-label="Public Sample ID" />
                            </template>
                            <template #item.title="{ item }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="editSample(item)"
                                    >{{ item.title }}</v-btn
                                >
                            </template>
                            <template #item.sample_type="{ value }">
                                {{ humanizeCamelCase(value) }}
                            </template>
                            <template #item.creation_date="{ value }"><DateCell :value="value" /></template>
                            <template #item.last_update="{ value }"><DateCell :value="value" /></template>
                            <template #item.actions="{ item }">
                                <ResourceActionButton :item="item" :study="study" @click="editSample(item)" />
                            </template>
                            <template #item.status="{ value }">
                                <StatusChip :status="value" />
                            </template>

                            <template #no-data>
                                <div class="text-center pt-2">
                                    <p>
                                        Sample describe the biological origin of the sample, such as
                                        the individual, tissue, or cell line.<br />
                                        Examples: patient blood sample, tumor biopsy, cultured cells,
                                        reference material.
                                    </p>
                                    <p>At least 1 sample required to proceed</p>
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
import ModalResource from '@/components/modalResource.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import ResourceActionButton from '@/components/shared/datatable/cells/ResourceActionButton.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import { fitColumn, dateColumn } from '@/utils/dataTableHeaders'
import { humanizeCamelCase } from '@/utils/format'
import { mapState } from 'pinia'
import _ from 'lodash'

export default defineComponent({
    name: 'Samples',
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
    data() {
        return {
            sampleStore: null,
            selectedSamples: [],
            modal: { status: false, title: null },
            error: '',
            search: '',
            loading: false,
            loaded: false,
            study_public_id: null,
            sampleTableHeaders: [
                fitColumn({
                    title: 'ID',
                    value: 'public_id',
                    align: 'center',
                    sortable: true,
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' }
                }),
                {
                    title: 'Title',
                    value: 'title',
                    sortable: true
                },
                {
                    title: 'Status',
                    value: 'status',
                    width: '1%',
                    sortable: true
                },
                dateColumn({
                    title: 'Last Updated',
                    value: 'last_update',
                    sortable: true
                }),
                {
                    title: 'Created By',
                    value: 'creator_name',
                    width: '1%',
                    sortable: true
                },
                {
                    title: 'Actions',
                    value: 'actions',
                    width: '1%',
                    align: 'center'
                }
            ],
            sample_type: null,
            deleteSample: { status: false }
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['study']),
        ...mapState(useSampleStore, ['samples']),
        ...mapState(useSchemaStore, ['schemas']),
        sampleTypes() {
            if (this.study.sampleTypes !== undefined) {
                return this.study.sampleTypes
            }
            return []
        },
        canManageSamples() {
            return (
                this.sampleTypes.length > 0 &&
                this.study.current_permission.indexOf('edit') > -1 &&
                (this.study.status_type_id === 'DRA' || this.study.status_type_id === 'REV')
            )
        },
        primaryAction() {
            if (!this.canManageSamples || this.deleteSample.status) return null
            if (this.sampleTypes.length === 1) {
                return {
                    label: `New ${humanizeCamelCase(this.sampleTypes[0].label)}`,
                    icon: 'mdi-plus'
                }
            }
            return { label: 'Add New', icon: 'mdi-plus' }
        },
        primaryActionItems() {
            if (!this.canManageSamples || this.deleteSample.status || this.sampleTypes.length <= 1) {
                return []
            }
            return this.sampleTypes.map((t) => ({
                title: humanizeCamelCase(t.label),
                value: t.resource_type_id
            }))
        }
    },
    watch: {
        study_id(n, o) {
            if (n && n != o) {
                this.getStudy()
            }
        }
    },
    mounted() {
        this.submissionStore = useSubmissionStore()
        this.sampleStore = useSampleStore()
        this.getStudy()
        this.submissionStore.getStatusTypes()
    },
    methods: {
        humanizeCamelCase,
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
        editSample(item) {
            this.sample_type = { name: item.sample_type, label: item.sample_type }
            let data = JSON.parse(JSON.stringify(item.properties))
            let title =
                item.current_permission.indexOf('edit') > -1
                    ? 'Update'
                    : 'Review' +
                      ' ' +
                      item.sample_type.replace(/([A-Z])/g, ' $1') +
                      " '" +
                      item.alias +
                      "'"
            this.modal = {
                status: true,
                title: title,
                data: data,
                type: { name: item.sample_type, label: item.sample_type },
                edit: item.public_id,
                permissions: item.current_permission
            }
        },
        deleteSamples(action) {
            let _this = this
            if (action == 'init' || action == 'cancel') {
                this.deleteSample.status = !this.deleteSample.status
            } else {
                let params
                if (this.selectedSamples) {
                    params = []
                    _.forEach(this.selectedSamples, (id) => {
                        params.push({
                            study_id: this.study_id,
                            sample_id: _.filter(this.samples, (s) => s.id === id)[0].public_id
                        })
                    })
                }
                this.sampleStore
                    .deleteSamples(params)
                    .then(() => {
                        this.$emit('updateStudy')
                        this.$notify({
                            title: 'Success',
                            text: `${params.length} sample${params.length ? 's' : ''} deleted successfully`,
                            type: 'success'
                        })
                        _this.deleteSample.status = false
                        _this.selectedSamples = []
                    })
                    .catch(() => {
                        _this.deleteSample.status = false
                        notifyError('Failed to delete sample(s). Please try again.')
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
                //Get samples because when create sample via file, new samples are not displayed here. Idem for edition.
                this.getSamples()
            }
        },
        createSample(sample_type) {
            this.sample_type = sample_type
            let title = 'Create ' + sample_type.label.replace(/([A-Z])/g, ' $1')
            this.modal = {
                status: true,
                title: title,
                edit: false,
                type: this.sample_type,
                permissions: ['edit', 'delete', 'read'],
                data: {},
                hide_upload: false
            }
        },

        getSamples() {
            this.loading = true
            if (this.study_public_id) {
                this.sampleStore
                    .getStudySamples({ study_id: this.study_public_id })
                    .then(() => {
                        this.$emit('updateStudy')
                        this.loading = false
                        this.loaded = true
                    })
                    .catch(() => {
                        notifyError('Failed to load samples. Please try again.')
                        this.loading = false
                    })
            } else {
                this.sampleStore
                    .getSamples()
                    .then(() => {
                        this.loaded = true
                    })
                    .catch(() => notifyError('Failed to load samples. Please try again.'))
            }
        },

        getStudy() {
            if (this.study) {
                this.study_public_id = this.study.public_id
                this.getSamples()
            } else {
                const study_id = this.$route.params.study_id || this.study_id
                this.submissionStore.getStudy(study_id).then(() => {
                    this.study_public_id = this.study.public_id
                    this.getSamples()
                })
            }
        }
    }
})
</script>
