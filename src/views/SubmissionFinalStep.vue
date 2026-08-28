<template>
    <div class="SubmissionFinalStep">
        <v-alert
            v-if="study.status_type_id === 'PUB'"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
        >
            Published on {{ formatDate(study.released_date) }}
        </v-alert>

        <p v-if="!loaded" class="text-center mt-3">
            <em>Loading submission summary</em> <br />
            <v-progress-circular color="primary" indeterminate></v-progress-circular>
        </p>

        <v-row v-else>
            <v-col cols="12" md="4">
                <v-card elevation="10">
                    <v-card-item class="py-4 px-6">
                        <v-card-title class="text-h6 pa-0">Summary</v-card-title>
                    </v-card-item>
                    <v-divider></v-divider>
                    <v-table class="property-table">
                        <tbody>
                            <PropertyRow compact label="Study ID" :value="study.public_id" />
                            <PropertyRow compact label="Title" :value="study.title" />
                            <PropertyRow
                                v-if="study.properties?.study_type"
                                compact
                                label="Type"
                                :value="study.properties.study_type"
                            />
                            <PropertyRow compact label="Samples" :value="study.nb_samples" />
                            <PropertyRow compact label="Experiments" :value="study.nb_experiments" />
                            <PropertyRow compact label="Molecular Runs" :value="study.nb_runs" />
                            <PropertyRow compact label="Molecular Analyses" :value="study.nb_analyses" />
                            <PropertyRow compact label="Datasets" :value="study.nb_datasets" />
                        </tbody>
                    </v-table>
                    <v-card-actions
                        v-if="study.status_type_id !== 'PUB'"
                        class="d-flex flex-column align-center py-4"
                    >
                        <div class="d-flex align-center ga-2">
                            <v-btn
                                variant="flat"
                                color="success"
                                :disabled="!canSubmit"
                                @click="submitDialog = true"
                            >
                                {{ submissionInProgress ? 'Submission in progress...' : 'Submit' }}
                            </v-btn>
                            <v-btn
                                variant="outlined"
                                color="grey"
                                :disabled="healthLoading || submissionInProgress"
                                @click="getHealthCheck"
                            >
                                Check
                            </v-btn>
                        </div>
                        <p v-if="['SUB', 'RES'].includes(study.status_type_id)" class="text-info mt-2 mb-0">
                            Submission under review by the Data Access Committee...
                        </p>
                        <p v-else-if="study.status_type_id === 'APR'" class="text-info mt-2 mb-0">
                            Submission approved. Awaiting publication.
                        </p>
                        <p
                            v-else-if="hasHealthErrors"
                            class="text-error mt-2 mb-0 text-center"
                            style="font-size: 14px"
                        >
                            Resolve the issues listed below before submitting.
                        </p>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" md="8">
                <v-card elevation="10">
                    <v-card-item class="py-4 px-6">
                        <v-card-title class="text-h6 pa-0">Datasets</v-card-title>
                    </v-card-item>
                    <v-divider></v-divider>
                    <v-card-text>
                        <DataTable
                            table-id="submission-final-datasets"
                            :items="datasets"
                            :headers="datasetHeaders"
                            :show-search="false"
                            :show-columns-menu="false"
                        >
                            <template #item.public_id="{ item }">
                                <CopyIdCell :value="item.public_id" notify-label="Dataset ID" />
                            </template>
                            <template #item.title="{ item }">
                                <TruncatedText :text="item.title" />
                            </template>
                            <template #item.released_date="{ value }">
                                <DateCell :value="value" />
                            </template>
                            <template #item.policy="{ item }">
                                <v-dialog v-model="showPolicies[item.id]" max-width="600">
                                    <template #activator="{ props: activatorProps }">
                                        <v-btn
                                            class="text-none font-weight-regular"
                                            prepend-icon="mdi-police-badge"
                                            :append-icon="getPolicyIcon(item)"
                                            text="POLICY"
                                            variant="outlined"
                                            size="small"
                                            :color="getPolicyClass(item)"
                                            v-bind="activatorProps"
                                        ></v-btn>
                                    </template>

                                    <v-card v-if="showPolicies[item.id]">
                                        <v-card-title prepend-icon="mdi-police-badge">
                                            Data Access Policy
                                            <v-chip
                                                v-if="item.policy_status"
                                                class="float-right"
                                                variant="tonal"
                                                :append-icon="getPolicyIcon(item)"
                                                :color="getPolicyClass(item)"
                                                >{{ item.policy_status }}</v-chip
                                            >
                                        </v-card-title>
                                        <v-container v-if="canManageDatasets">
                                            <v-autocomplete
                                                v-model="item.properties.policy_id"
                                                :items="policies"
                                                item-title="value.title"
                                                item-value="value.id"
                                                label="Select a policy"
                                                @update:modelValue="updatePolicy(item)"
                                            >
                                                <template #item="{ item, props }">
                                                    <v-list-item
                                                        v-if="item.value.header !== undefined"
                                                        v-bind="props"
                                                        :key="item.value.header"
                                                        class="group-header"
                                                        :title="item.value.header"
                                                        :disabled="true"
                                                    >
                                                    </v-list-item>
                                                    <v-list-item
                                                        v-else-if="item.value !== undefined"
                                                        v-bind="props"
                                                        :key="item.value"
                                                        :title="item.title"
                                                        :value="item.id"
                                                    >
                                                    </v-list-item>
                                                </template>
                                            </v-autocomplete>
                                        </v-container>
                                        <v-row
                                            v-if="
                                                item.properties.policy_id &&
                                                selectedPolicies[item.id]
                                            "
                                        >
                                            <v-col cols="12">
                                                <v-card class="mx-auto" max-width="688">
                                                    <v-card-text>
                                                        <div>
                                                            <strong>{{
                                                                selectedPolicies[item.id].dac_name
                                                            }}</strong>
                                                        </div>
                                                        <p class="text-h6 font-weight-black">
                                                            {{ selectedPolicies[item.id].title }}
                                                        </p>

                                                        <div class="text-medium-emphasis">
                                                            {{
                                                                selectedPolicies[item.id]
                                                                    .description
                                                            }}
                                                        </div>
                                                    </v-card-text>

                                                    <v-card-actions>
                                                        <v-btn
                                                            color="deep-purple-accent-4"
                                                            variant="text"
                                                            @click="
                                                                getPolicyForm(
                                                                    item.id,
                                                                    item.properties.policy_id,
                                                                    'requester-form'
                                                                )
                                                            "
                                                        >
                                                            <ListCheckIcon />
                                                            Preview Requester form
                                                        </v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                        <div>&nbsp;</div>
                                        <v-card-actions v-if="canManageDatasets">
                                            <v-btn
                                                variant="outlined"
                                                color="warning"
                                                @click="setDatasetPolicy(item, false)"
                                                >remove</v-btn
                                            >
                                            <v-btn
                                                variant="outlined"
                                                color="primary"
                                                @click="setDatasetPolicy(item, true)"
                                                :disabled="!item.properties.policy_id"
                                                >Set policy</v-btn
                                            >
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </template>

                            <template #no-data>
                                <div class="text-center pt-2">No datasets in this study yet.</div>
                            </template>
                        </DataTable>
                        <p
                            v-if="!allDatasetsWithPolicy"
                            class="d-flex align-center text-warning mt-3 mb-0"
                            style="font-size: 14px"
                        >
                            <v-icon icon="mdi-alert-circle" size="18" class="mr-1"></v-icon>
                            Please assign a policy to every dataset by using the 'policy' button
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="(healthLoading || healthChecked) && !issuesDismissed">
            <v-col cols="12">
                <v-card elevation="10">
                    <v-card-item class="py-4 px-6">
                        <v-card-title class="text-h6 pa-0 d-flex align-center justify-space-between">
                            <span>Issues</span>
                            <div class="d-flex align-center ga-1">
                                <template v-if="!healthLoading && health">
                                    <v-chip v-if="errorCount" size="small" color="error">
                                        {{ errorCount }} error{{ errorCount === 1 ? '' : 's' }}
                                    </v-chip>
                                    <v-chip v-if="warningCount" size="small" color="warning">
                                        {{ warningCount }} warning{{ warningCount === 1 ? '' : 's' }}
                                    </v-chip>
                                    <v-chip v-if="noticeCount" size="small" color="info">
                                        {{ noticeCount }} notice{{ noticeCount === 1 ? '' : 's' }}
                                    </v-chip>
                                    <v-chip v-if="!errorCount && !warningCount && !noticeCount" size="small" color="success">
                                        No issues
                                    </v-chip>
                                </template>
                                <v-btn
                                    v-if="!healthLoading && health"
                                    icon="mdi-close"
                                    variant="text"
                                    size="small"
                                    density="comfortable"
                                    aria-label="Hide issues"
                                    @click="dismissIssues"
                                ></v-btn>
                            </div>
                        </v-card-title>
                    </v-card-item>
                    <v-divider></v-divider>
                    <v-card-text>
                        <p v-if="healthLoading" class="text-center my-3">
                            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                        </p>
                        <v-alert v-else-if="!health" type="error" variant="tonal" density="compact">
                            Failed to run the data integrity/consistency health check.
                        </v-alert>
                        <v-alert v-else-if="healthIssues.length === 0" type="success" variant="tonal" density="compact">
                            No data integrity or consistency problems found.
                        </v-alert>
                        <v-list v-else density="compact" class="py-0">
                            <v-list-item v-for="(issue, idx) in healthIssues" :key="idx" class="px-0">
                                <template #prepend>
                                    <v-icon
                                        :icon="severityIcon(issue.severity)"
                                        :color="severityColor(issue.severity)"
                                        class="mr-2"
                                    ></v-icon>
                                </template>
                                <v-list-item-title>{{ issue.message }}</v-list-item-title>
                                <v-list-item-subtitle v-if="issue.resource_type">
                                    {{ issue.resource_type }}<span v-if="issue.resource_public_id">
                                        &middot; {{ issue.resource_public_id }}</span
                                    >
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog v-model="submitDialog" width="auto">
            <v-card
                prepend-icon="mdi-check"
                text="You will not be able to edit the study anymore"
                :title="`Confirm submission of the study containing ${datasets.length} dataset${datasets.length > 1 ? 's' : ''}`"
            >
                <template v-slot:actions>
                    <v-btn
                        class="ms-auto"
                        variant="outlined"
                        color="success"
                        text="confirm submission"
                        :loading="healthLoading"
                        :disabled="healthLoading"
                        @click="confirmSubmit"
                    ></v-btn>
                    <v-btn
                        class="ms-auto"
                        variant="outlined"
                        color="secondary"
                        text="cancel"
                        @click="submitDialog = false"
                    ></v-btn>
                </template>
            </v-card>
        </v-dialog>

        <v-dialog v-model="modalRequester.status" max-width="800">
            <modal-policy-form
                :dataset_id="modalRequester.dataset_id"
                :policy_id="modalRequester.policy_id"
                :form="modalRequester.form"
                @closePolicyModal="modalRequester.status = false"
                :readonly="true"
            ></modal-policy-form>
        </v-dialog>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import _ from 'lodash'
import { notifyError } from '@/utils/notify'
import { formatDate } from '@/utils/dates'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useDatasetStore } from '@/stores/datasets.js'
import { useDacStore } from '@/stores/dacs.js'
import PropertyRow from '@/components/shared/PropertyRow.vue'
import TruncatedText from '@/components/shared/TruncatedText.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import ModalPolicyForm from '@/components/modalPolicyForm.vue'
import { idColumn, flexColumn, dateColumn, fitColumn } from '@/utils/dataTableHeaders'

export default defineComponent({
    name: 'SubmissionFinalStep',
    components: { PropertyRow, TruncatedText, DataTable, CopyIdCell, DateCell, ModalPolicyForm },
    props: ['study_id'],
    data() {
        return {
            datasetStore: null,
            dacStore: null,
            submissionStore: null,
            loaded: false,
            showPolicies: {},
            selectedPolicies: {},
            submitDialog: false,
            submissionInProgress: false,
            health: null,
            healthLoading: false,
            healthChecked: false,
            issuesDismissed: false,
            modalRequester: {
                status: false,
                dataset_id: null,
                policy_id: null,
                form: 'requester'
            },
            datasetHeaders: [
                idColumn({ title: 'ID', value: 'public_id', align: 'center' }),
                flexColumn({ title: 'Name', value: 'title' }),
                dateColumn({ title: 'Release Date', value: 'released_date' }),
                fitColumn({ title: 'Policy', value: 'policy', sortable: false, exportable: false, align: 'center' })
            ]
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['study']),
        ...mapState(useDatasetStore, ['datasets']),
        ...mapState(useDacStore, ['dacs']),
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
        policies() {
            let items = []
            _.forEach(this.dacs, (d) => {
                items.push({ header: d.name })
                _.forEach(d.policies, (p) => {
                    items.push({ title: p.title, value: p })
                })
            })
            return items
        },
        allDatasetsWithPolicy() {
            let isReady = true
            _.forEach(this.datasets, (d) => {
                if (!d.policy_id) {
                    isReady = false
                }
            })
            return isReady
        },
        healthIssues() {
            return this.health?.issues ?? []
        },
        errorCount() {
            return this.healthIssues.filter((issue) => issue.severity === 'error').length
        },
        warningCount() {
            return this.healthIssues.filter((issue) => issue.severity === 'warning').length
        },
        noticeCount() {
            return this.healthIssues.filter((issue) => issue.severity === 'notice').length
        },
        hasHealthErrors() {
            return this.errorCount > 0
        },
        hasHealthWarnings() {
            return this.warningCount > 0
        },
        canSubmit() {
            return (
                !this.submissionInProgress &&
                !this.healthLoading &&
                this.datasets.length > 0 &&
                this.allDatasetsWithPolicy &&
                ['DRA', 'REV'].includes(this.study.status_type_id) &&
                this.study.current_permission.indexOf('edit') > -1
            )
        }
    },
    methods: {
        formatDate,
        getHealthCheck() {
            this.healthLoading = true
            return this.submissionStore
                .checkSubmission(this.study.public_id)
                .then((result) => {
                    this.health = result
                })
                .catch(() => {
                    this.health = null
                    notifyError('Failed to run the submission health check. Please try again.')
                })
                .finally(() => {
                    this.healthLoading = false
                    this.healthChecked = true
                    this.issuesDismissed = false
                })
        },
        dismissIssues() {
            this.issuesDismissed = true
        },
        severityIcon(severity) {
            if (severity === 'error') return 'mdi-alert-circle'
            if (severity === 'notice') return 'mdi-information-outline'
            return 'mdi-alert'
        },
        severityColor(severity) {
            if (severity === 'error') return 'error'
            if (severity === 'notice') return 'info'
            return 'warning'
        },
        confirmSubmit() {
            this.getHealthCheck().then(() => {
                this.submitDialog = false
                if (this.health?.success) {
                    this.submitStudy()
                } else if (this.health) {
                    notifyError('Submission blocked: data integrity issues were found. Resolve them before submitting.')
                }
            })
        },
        getDatasets() {
            return this.datasetStore
                .getStudyDatasets({ study_id: this.study.public_id })
                .then((datasets) => {
                    this.showPolicies = {}
                    this.selectedPolicies = {}
                    _.forEach(datasets, (d) => {
                        this.showPolicies[d.id] = false
                        this.selectedPolicies[d.id] = null
                        if (d.properties.policy_id) {
                            const idx = _.findIndex(this.policies, (p) => {
                                return p.value !== undefined && p.value.id === d.properties.policy_id
                            })
                            if (idx > -1) {
                                this.selectedPolicies[d.id] = this.policies[idx].value
                            }
                        }
                    })
                })
                .catch(() => notifyError('Failed to load datasets. Please try again.'))
        },
        updatePolicy(item) {
            const idx = _.findIndex(this.policies, (p) => {
                return p.value !== undefined && p.value.id === item.properties.policy_id
            })
            if (idx > -1) {
                this.selectedPolicies[item.id] = this.policies[idx].value
            }
        },
        setDatasetPolicy(item, action) {
            if (action && item.properties.policy_id !== undefined) {
                this.datasetStore
                    .setPolicy({
                        study_id: this.study.public_id,
                        dataset_id: item.id,
                        policy_id: item.properties.policy_id
                    })
                    .then(() => {
                        this.$notify({ title: 'Policy attached successfully', type: 'success' })
                        this.showPolicies[item.id] = false
                        this.getDatasets()
                    })
                    .catch(() => {
                        notifyError('Failed to attach policy. Please try again.')
                        this.showPolicies[item.id] = false
                    })
            } else if (!action) {
                this.datasetStore
                    .setPolicy({
                        study_id: this.study.public_id,
                        dataset_id: item.id,
                        policy_id: null
                    })
                    .then(() => {
                        this.$notify({ title: 'Policy removed successfully', type: 'success' })
                        this.showPolicies[item.id] = false
                        this.getDatasets()
                    })
                    .catch(() => {
                        notifyError('Failed to remove policy. Please try again.')
                        this.showPolicies[item.id] = false
                    })
            }
        },
        getPolicyIcon(item) {
            if (item.policy_status === 'pending') return 'mdi-clock-alert-outline'
            return ''
        },
        getPolicyClass(item) {
            if (!item.policy_id) return 'warning'
            if (item.policy_status === 'draft') return 'secondary'
            if (item.policy_status === 'pending') return 'warning'
            if (item.policy_status === 'valid') return 'success'
            if (item.policy_status === 'approved') return 'success'
            if (item.policy_status === 'error') return 'error'
            return ''
        },
        getPolicyForm(dataset_id, policy_id, form) {
            const formName = _.toLower(form.replace('-form', ''))
            const modal = 'modal' + _.startCase(formName)
            this.dacStore
                .getPolicyForm(dataset_id, policy_id, form)
                .then((data) => {
                    this[modal].policy_id = policy_id
                    this[modal].dataset_id = dataset_id
                    this[modal].form = data
                    this[modal].status = true
                })
                .catch(() => notifyError('Failed to load policy form. Please try again.'))
        },
        submitStudy() {
            this.submitDialog = false
            if (!this.study?.public_id) return
            const new_status_type_id = this.study.status_type_id === 'REV' ? 'RES' : 'SUB'
            this.submissionInProgress = true
            this.submissionStore
                .patchStudy(this.study.public_id, { status_type_id: new_status_type_id })
                .then(() => {
                    this.$notify({
                        title: 'Success',
                        text: 'Study submitted successfully',
                        type: 'success'
                    })
                    this.submissionInProgress = false
                    this.$emit('updateStudy')
                })
                .catch(() => {
                    this.submissionInProgress = false
                    notifyError('Failed to submit study. Please try again.')
                })
        }
    },
    mounted() {
        this.datasetStore = useDatasetStore()
        this.dacStore = useDacStore()
        this.submissionStore = useSubmissionStore()
        if (!this.study || !this.study.public_id) return
        this.dacStore.getDacs().then(() => {
            this.getDatasets().finally(() => {
                this.loaded = true
            })
        })
    }
})
</script>

<style scoped>
.property-table :deep(table) {
    table-layout: fixed;
    width: 100%;
}

.property-table :deep(tbody tr:last-child > th),
.property-table :deep(tbody tr:last-child > td) {
    border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>

<style>
.SubmissionFinalStep .group-header {
    font-weight: bold;
    background-color: #f5f5f5;
}
</style>
