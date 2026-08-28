<template>
    <div class="SubmissionStudy">
        <v-sheet min-height="70vh" rounded="lg">
            <v-dialog v-model="modal.status" width="95%">
                <v-card
                    width="100%"
                    min-height="50vh"
                    title="Submit Full Study Package"
                    class="px-3 py-3"
                >
                    <div>
                        <v-row>
                            <v-col
                                :cols="
                                    uploadedResources.success
                                        ? 12
                                        : uploadedResources.loaded
                                          ? 8
                                          : 6
                                "
                            >
                                <div v-if="!uploadedResources.loaded">
                                    <v-file-input
                                        v-model="files"
                                        style="margin-top: 20px"
                                        multiple
                                        counter
                                        show-size
                                        :loading="filesUploading"
                                        label="Upload one zip file..."
                                        @change="uploadAction"
                                    ></v-file-input>
                                    <v-card
                                        v-if="filesUploading"
                                        variant="tonal"
                                        :color="uploadProgressColor"
                                        rounded="lg"
                                        class="pa-4 mt-4 mx-auto upload-progress-card"
                                        max-width="420"
                                    >
                                        <div class="d-flex align-center justify-center mb-3">
                                            <v-icon
                                                :icon="uploadProgressIcon"
                                                :color="uploadProgressColor"
                                                size="24"
                                                class="mr-2"
                                            ></v-icon>
                                            <span class="text-subtitle-1 font-weight-medium">{{
                                                uploadProgressTitle
                                            }}</span>
                                        </div>
                                        <v-progress-linear
                                            :indeterminate="!uploadProgressIsDeterminate"
                                            :model-value="uploadProgressIsDeterminate ? uploadProgressPercent : 0"
                                            :color="uploadProgressColor"
                                            :bg-opacity="0.25"
                                            height="22"
                                            rounded
                                        >
                                            <template v-if="uploadProgressIsDeterminate" #default>
                                                <strong class="upload-progress-nums text-white">{{ uploadProgressPercent }}%</strong>
                                            </template>
                                        </v-progress-linear>
                                        <p class="text-caption text-medium-emphasis mt-2 mb-0 upload-progress-nums">
                                            {{ uploadProgressSubtitle }}
                                        </p>
                                    </v-card>
                                </div>
                                <div v-else>
                                    <div v-if="!uploadedResources.success" class="px-5">
                                        <v-alert type="error" variant="tonal" density="compact" class="my-3">
                                            File upload fail
                                        </v-alert>
                                        <p>{{ uploadedResources.message }}</p>

                                        <v-row>
                                            <v-col cols="4">
                                                <v-list density="compact">
                                                    <v-list-item
                                                        v-for="key in uploadedResources.keys"
                                                        :key="key"
                                                        :value="key"
                                                        @click="uploadedResources.nav = key"
                                                        color="primary"
                                                    >
                                                        <template v-slot:prepend>
                                                            <v-icon
                                                                icon="mdi-check-circle"
                                                                v-if="
                                                                    uploadedResources.data[key]
                                                                        .status == 'SUCCESS'
                                                                "
                                                                color="green"
                                                            ></v-icon>
                                                            <v-icon
                                                                icon="mdi-cancel"
                                                                v-if="
                                                                    uploadedResources.data[key]
                                                                        .status == 'FAIL'
                                                                "
                                                                color="red"
                                                            ></v-icon>
                                                        </template>

                                                        <v-list-item-title
                                                            :active="key == uploadedResources.nav"
                                                            color="blue"
                                                            >{{ key }}</v-list-item-title
                                                        >
                                                    </v-list-item>
                                                </v-list>
                                            </v-col>
                                            <v-col cols="8">
                                                <div
                                                    v-if="
                                                        uploadedResources && uploadedResources.data
                                                    "
                                                    class="mt-3"
                                                >
                                                    <h4>{{ uploadedResources.nav }}</h4>
                                                    <p>
                                                        {{
                                                            uploadedResources.data[
                                                                uploadedResources.nav
                                                            ].totalRows
                                                        }}
                                                        resource<span
                                                            v-if="
                                                                uploadedResources.data[
                                                                    uploadedResources.nav
                                                                ].totalRows > 1
                                                            "
                                                            >s</span
                                                        >
                                                    </p>
                                                    <p>
                                                        {{
                                                            uploadedResources.data[
                                                                uploadedResources.nav
                                                            ].status
                                                        }}
                                                        :
                                                        {{
                                                            uploadedResources.data[
                                                                uploadedResources.nav
                                                            ].message
                                                        }}
                                                    </p>
                                                    <ul>
                                                        <li
                                                            v-for="(
                                                                error, line
                                                            ) in uploadedResources.data[
                                                                uploadedResources.nav
                                                            ].errors"
                                                            :key="line"
                                                        >
                                                            Line {{ line }} : {{ error.message }}
                                                            <code>{{ error.errors }}</code>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </div>
                                    <div v-else>
                                        <v-alert type="success" variant="tonal" density="compact" class="mt-3">
                                            File uploaded successfully
                                        </v-alert>
                                        <v-tabs
                                            v-if="uploadedResources.success"
                                            v-model="uploadedResources.nav"
                                            bg-color="green-lighten-5"
                                            class="mt-3"
                                            center-active
                                        >
                                            <v-tab
                                                v-for="key in uploadedResources.keys"
                                                :value="key"
                                                :key="key"
                                                >{{ key }}</v-tab
                                            >
                                        </v-tabs>
                                        <DataTable
                                            v-if="uploadedResources.success"
                                            :items="
                                                uploadedResources.data[uploadedResources.nav]
                                                    .resources
                                            "
                                            :headers="batchUploadHeaders(uploadedResources.nav)"
                                            :show-search="false"
                                            :show-columns-menu="false"
                                        >
                                            <template #item.action_type_id="{ item }">
                                                <span class="text-uppercase"
                                                    >{{
                                                        item.action_type_id === 'CRE'
                                                            ? 'creation'
                                                            : 'update'
                                                    }}:
                                                </span>
                                                <span class="text-start">
                                                    <v-chip
                                                        :color="item.success ? 'green' : 'red'"
                                                        :text="`${item.success ? 'success' : 'fail'}`"
                                                        class="text-uppercase"
                                                        size="small"
                                                        label
                                                    ></v-chip>
                                                </span>
                                            </template>
                                        </DataTable>
                                    </div>
                                </div>
                            </v-col>
                            <v-col
                                :cols="uploadedResources.loaded ? 4 : 6"
                                v-if="!uploadedResources.success"
                            >
                                <v-container>
                                    <v-alert style="margin: 20px">
                                        <StudyUpload />
                                        <v-btn color="primary" @click="downloadCli"
                                            >Download CLI tool</v-btn
                                        >
                                    </v-alert>
                                </v-container>
                            </v-col>
                        </v-row>
                    </div>
                    <p class="text-center mt-5">
                        <v-btn
                            color="secondary"
                            variant="outlined"
                            class="ml-2"
                            :disabled="filesUploading"
                            @click="closeModal()"
                        >
                            Close
                        </v-btn>
                        <v-btn
                            variant="outlined"
                            class="ml-2"
                            :disabled="filesUploading"
                            @click="resetModal()"
                            v-if="uploadedResources.loaded && !uploadedResources.success"
                        >
                            Reset
                        </v-btn>
                    </p>
                </v-card>
            </v-dialog>
            <v-container fluid v-if="study">
                <v-btn class="float-right ml-2" color="grey-lighten-4" @click="downloadStudy()" v-if="study.id"
                    >Download Study</v-btn
                >
                <permissions v-model:study.access="study"></permissions>
                <PageTitle v-if="study.id">Study "{{ study.title }}"</PageTitle>
                <PageTitle v-else>New Study</PageTitle>

                <div class="submission-stepper-bar">
                    <v-tooltip text="Go back" location="top">
                        <template #activator="{ props }">
                            <v-btn
                                v-show="step > 1"
                                v-bind="props"
                                icon="mdi-chevron-left"
                                variant="text"
                                size="large"
                                class="submission-stepper-arrow"
                                @click="changeStep(null, step - 1)"
                            />
                        </template>
                    </v-tooltip>

                    <v-stepper non-linear :model-value="step" flat class="submission-stepper">
                        <v-stepper-header>
                            <v-divider></v-divider>
                            <template v-for="(idx, name) in steps" :key="`newStudy${idx}`">
                                <v-stepper-item
                                    :value="idx"
                                    :editable="isStepEditable(name)"
                                    :complete="isStepComplete(name)"
                                    :color="stepColor(name)"
                                    @click="changeStep(name)"
                                >
                                    <template #icon>
                                        <span v-if="hasStepCount(name)">{{ stepCount(name) }}</span>
                                        <v-icon v-else-if="isStepComplete(name)" icon="mdi-check"></v-icon>
                                        <v-icon
                                            v-else-if="step === idx && isStepEditable(name)"
                                            icon="mdi-pencil"
                                        ></v-icon>
                                        <v-icon v-else icon="mdi-check"></v-icon>
                                    </template>
                                    <span :class="{ 'font-weight-bold text-decoration-underline': step === idx }">{{
                                        name
                                    }}</span>
                                </v-stepper-item>
                                <v-divider></v-divider>
                            </template>
                        </v-stepper-header>
                    </v-stepper>

                    <v-tooltip text="Next" location="top">
                        <template #activator="{ props }">
                            <span v-bind="props" class="submission-stepper-arrow-wrap">
                                <v-btn
                                    v-if="step < steps.submission"
                                    icon="mdi-chevron-right"
                                    variant="text"
                                    size="large"
                                    class="submission-stepper-arrow"
                                    :disabled="!canGoNext"
                                    @click="goNext"
                                />
                            </span>
                        </template>
                    </v-tooltip>
                </div>
                <v-divider class="submission-stepper-divider"></v-divider>
                <div v-if="step == steps.acknowledgment" class="submission-start-row">
                    <v-checkbox
                        v-model="sensitiveDataChecked"
                        :disabled="hasStartedThisSubmission"
                        label="I have read and I accept the notice below"
                        hide-details
                        class="flex-grow-0"
                    ></v-checkbox>
                    <v-btn
                        v-if="!hasStartedThisSubmission"
                        color="primary"
                        :disabled="!canProceedFromSubmission"
                        @click="changeStep('study')"
                    >
                        Next
                    </v-btn>
                </div>
                <p
                    v-if="step == steps.acknowledgment && !hasSshKey && !hasStartedThisSubmission"
                    class="text-right text-caption text-medium-emphasis"
                >
                    You need to register an SSH key before continuing.
                </p>
                <div class="submission-content">
                    <div v-if="step == steps.acknowledgment">
                        <submission-info-tab
                            v-if="studiesLoaded"
                            :has-ssh-key="hasSshKey"
                            :default-info-expanded="defaultInfoExpanded"
                            :show-quick-start="hasAnySubmissionCompleted"
                            :submitted="hasSubmittedThisSubmission"
                            :sda-inbox-url="sda_inbox_url"
                            :sda-inbox-ip="sda_inbox_ip"
                            :sda-c4gh-key="formattedSdaC4ghKey"
                            :sda-sftp-port="sda_sftp_port"
                            :email="user.email"
                        ></submission-info-tab>
                        <p v-else class="text-center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </p>
                    </div>

                    <div v-if="step == steps.study">
                        <v-tabs
                            v-if="!study.public_id"
                            v-model="nav"
                            bg-color="blue-lighten-5"
                            center-active
                        >
                            <v-tab value="form">(Small) submission with web forms</v-tab>
                            <v-tab value="file" @click="openUploadModal()"
                                >Full submission with study package</v-tab
                            >
                        </v-tabs>
                        <v-card v-if="nav == 'form'" id="studyForm" class="jf-form" flat>
                        <!-- <pre>{{study}}</pre> -->
                            <json-forms
                                :data="data"
                                :schema="data_schema"
                                :uischema="ui_schema"
                                :renderers="renderers"
                                :readonly="
                                    !showForm ||
                                    (study_id !== 'new' &&
                                        study.current_permission.indexOf('edit') === -1)
                                "
                                @change="updateData"
                            />
                            <v-card-actions v-if="!readonly">
                                <p v-if="showForm" class="text-center">
                                    <template v-if="!delete_study">
                                        <v-btn color="primary" variant="flat" @click="submitForm">
                                            Save and create samples
                                        </v-btn>
                                        <v-btn
                                            color="secondary"
                                            variant="flat"
                                            class="ml-2"
                                            @click="resetForm"
                                        >
                                            Cancel
                                        </v-btn>
                                        <v-btn
                                            v-if="study_id != 'new'"
                                            color="warning"
                                            variant="flat"
                                            class="ml-2"
                                            @click="deleteStudy('init')"
                                        >
                                            Delete
                                        </v-btn>
                                    </template>
                                    <template v-else>
                                        <v-btn
                                            color="red"
                                            variant="flat"
                                            class="ml-2"
                                            @click="deleteStudy('confirm')"
                                        >
                                            Confirm deletion</v-btn
                                        >
                                        <v-btn
                                            color="grey"
                                            variant="flat"
                                            class="ml-2"
                                            @click="deleteStudy('cancel')"
                                        >
                                            Cancel
                                        </v-btn>
                                    </template>
                                </p>
                                <p
                                    v-else-if="
                                        study.current_permission.indexOf('edit') > -1 &&
                                        study.status_type_id !== 'SUB' &&
                                        study.status_type_id !== 'RES' &&
                                        study.status_type_id !== 'APR' &&
                                        study.status_type_id !== 'PUB'
                                    "
                                    class="text-center"
                                >
                                    <v-btn color="primary" variant="flat" @click="showForm = true">
                                      Edit
                                    </v-btn>
                                  </p>
                                  <!-- <p v-else-if="study.status_type_id === 'PUB'">
                                    <v-btn color="primary" variant="flat" @click="createNewVersion">Create a new version</v-btn>
                                  </p>                                 -->
                                  <p v-else-if="study.status_type_id === 'APR'" class="text-info">
                                    Submission waiting to be approved by the Help Desk team.
                                  </p>                                
                              </v-card-actions>
                        </v-card>
                    </div>

                    <div v-if="step == steps.samples">
                        <samples :study_id="study.id" @updateStudy="getStudy()"></samples>
                    </div>
                    <div v-if="step == steps.experiments">
                        <experiments :study_id="study.id" @updateStudy="getStudy()"></experiments>
                    </div>
                    <div v-if="step == steps.runs">
                        <runs :study_id="study.id" @updateStudy="getStudy()"></runs>
                    </div>
                    <div v-if="step == steps.analyses">
                        <analyses :study_id="study.id" @updateStudy="getStudy()"></analyses>
                    </div>
                    <div v-if="step == steps.datasets">
                        <datasets
                            :study_id="study.id"
                            @updateStudy="getStudy()"
                        ></datasets>
                    </div>
                    <div v-if="step == steps.submission">
                        <submission-final-step
                            :study_id="study.id"
                            @updateStudy="getStudy()"
                        ></submission-final-step>
                    </div>
                </div>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { notifyError } from '@/utils/notify'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers, mergeStyles, defaultStyles } from '@jsonforms/vue-vuetify'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import { useAuthStore } from '@/stores/auth.ts'
import IdentifierControlRenderer from '@/components/IdentifierControlRenderer.vue'
import IdentifierControlTester from '@/testers/IdentifierControlTester.js'
import NumberControlRenderer from '@/components/NumberControlRenderer.vue'
import NumberControlTester from '@/testers/NumberControlTester.js'
import Samples from '@/views/Samples.vue'
import Experiments from '@/views/Experiments.vue'
import Datasets from '@/views/Datasets.vue'
import Runs from '@/views/Runs.vue'
import Analyses from '@/views/Analyses.vue'
import Permissions from '@/views/Permissions.vue'
import SubmissionFinalStep from '@/views/SubmissionFinalStep.vue'
import _ from 'lodash'
import { mapState } from 'pinia'
import StudyUpload from '@/assets/documentation/StudyUpload.md'
import PageTitle from '@/components/shared/PageTitle.vue'
import SubmissionInfoTab from '@/views/SubmissionInfoTab.vue'
import DataTable from '@/components/shared/DataTable.vue'

const renderers = [
    ...vuetifyRenderers,
    { tester: NumberControlTester, renderer: NumberControlRenderer },
    { tester: IdentifierControlTester, renderer: IdentifierControlRenderer }
]

const myStyles = mergeStyles(defaultStyles, {
    control: {
        root: 'flex flex-col gap-2',
        input: 'p-inputtext p-component p-inputtext-fluid',
        textarea: 'p-textarea p-component'
    },
    arrayList: {
        addButton: 'v-btn b-btn__text v-btn__primary',
        toolbar: 'no-spacing',
        item: 'flex flex-col gap-2'
    }
})

export default defineComponent({
    name: 'SubmissionStudy',
    components: {
        JsonForms,
        Samples,
        Permissions,
        Experiments,
        Runs,
        Analyses,
        Datasets,
        StudyUpload,
        PageTitle,
        SubmissionInfoTab,
        SubmissionFinalStep,
        DataTable
    },
    data() {
        return {
            nav: 'form',
            files: null,
            delete_study: false,
            modal: { status: false },
            filesUploading: false,
            uploadProgress: { phase: null, current: 0, total: 0, resource_type: null },
            uploadedResources: { nav: 'study', success: false, data: null, loaded: false },
            steps: {
                acknowledgment: 1,
                study: 2,
                samples: 3,
                experiments: 4,
                runs: 5,
                analyses: 6,
                datasets: 7,
                submission: 8
            },
            step: 1,
            sampleStore: null,
            error: '',
            study: null,
            study_id: null,
            properties: [],
            data_schema: null,
            ui_schema: null,
            showForm: true,
            renderers: Object.freeze(renderers),
            data: {},
            sensitiveDataAcceptedThisSession: false,
            studiesLoaded: false,
            initialStepResolved: false,
            sda_inbox_url: import.meta.env.VITE_SDA_INBOX_URL,
            sda_inbox_ip: import.meta.env.VITE_SDA_INBOX_IP,
            sda_c4gh_key: import.meta.env.VITE_SDA_C4GH_KEY,
            sda_sftp_port: import.meta.env.VITE_SDA_SFTP_PORT
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['studies']),
        ...mapState(useSchemaStore, ['schemas']),
        ...mapState(useAuthStore, ['user']),
        readonly() {
            return (
                this.study.current_permission !== undefined &&
                this.study.current_permission.indexOf('edit') === -1
            )
        },
        uploadProgressPercent() {
            if (!this.uploadProgress.total) return 0
            return Math.round((this.uploadProgress.current / this.uploadProgress.total) * 100)
        },
        uploadProgressIsDeterminate() {
            return this.uploadProgress.phase === 'importing' || this.uploadProgress.phase === 'done'
        },
        uploadProgressColor() {
            if (this.uploadProgress.phase === 'done') return 'success'
            if (this.uploadProgress.phase === 'importing') return 'primary'
            return 'info'
        },
        uploadProgressIcon() {
            if (this.uploadProgress.phase === 'done') return 'mdi-check-circle'
            if (this.uploadProgress.phase === 'importing') return 'mdi-database-import-outline'
            return 'mdi-file-search-outline'
        },
        uploadProgressTitle() {
            if (this.uploadProgress.phase === 'done') return 'Import complete'
            if (this.uploadProgress.phase === 'importing') return 'Importing data'
            return 'Validating file(s)'
        },
        uploadProgressSubtitle() {
            if (this.uploadProgress.phase === 'done') {
                const n = this.uploadProgress.total
                return `${n} row${n === 1 ? '' : 's'} imported`
            }
            if (this.uploadProgress.phase === 'importing') {
                return this.uploadProgress.resource_type
                    ? `${this.uploadProgress.resource_type}: ${this.uploadProgress.current} / ${this.uploadProgress.total}`
                    : `${this.uploadProgress.current} / ${this.uploadProgress.total}`
            }
            return 'Checking structure and content against the schema...'
        },
        hasSshKey() {
            return this.user.sshPublicKeys && this.user.sshPublicKeys.length > 0
        },
        hasStartedThisSubmission() {
            return !!(this.study && this.study.public_id)
        },
        hasSubmittedThisSubmission() {
            return !!(this.study && ['SUB', 'RES', 'APR', 'PUB'].includes(this.study.status_type_id))
        },
        hasAcceptedSensitiveData() {
            return this.hasStartedThisSubmission || this.sensitiveDataAcceptedThisSession
        },
        canProceedFromSubmission() {
            return this.hasSshKey && this.hasAcceptedSensitiveData
        },
        canGoNext() {
            if (this.step === this.steps.acknowledgment) return this.canProceedFromSubmission
            if (this.step > this.steps.acknowledgment && this.step < this.steps.submission) {
                return !!this.study.public_id
            }
            return false
        },
        sensitiveDataChecked: {
            get() {
                return this.hasStartedThisSubmission || this.sensitiveDataAcceptedThisSession
            },
            set(value) {
                this.sensitiveDataAcceptedThisSession = value
            }
        },
        hasAnySubmissionStarted() {
            return this.studies.length > 0
        },
        hasAnySubmissionCompleted() {
            return this.studies.some((s) => ['SUB', 'RES', 'APR', 'PUB'].includes(s.status_type_id))
        },
        defaultInfoExpanded() {
            return !this.hasAnySubmissionStarted
        },
        formattedSdaC4ghKey() {
            return this.sda_c4gh_key ? this.sda_c4gh_key.replace(/\\n/g, '\n') : ''
        }
    },
    mounted() {
        let query_key = this.$route.query ? _.keys(this.$route.query) : null
        if (this.steps[query_key[0]]) {
            this.step = this.steps[query_key[0]]
            this.initialStepResolved = true
        }
        this.sampleStore = useSampleStore()
        this.submissionStore = useSubmissionStore()
        this.study_id = this.$route.params.study_id
        if (this.studies.length === 0) {
            this.submissionStore
                .getStudies({ status: 'draft,submitted,revised,published,approved,re-submitted' })
                .finally(() => {
                    this.studiesLoaded = true
                })
        } else {
            this.studiesLoaded = true
        }
        const schemaStore = useSchemaStore()
        schemaStore.getSchemas().then((schemas) => {
            if (schemas.Study !== undefined) {
                this.data_schema = schemas.Study.data_schema
                this.ui_schema = schemas.Study.ui_schema
                this.getStudy()
            }
        })
    },

    methods: {
        batchUploadHeaders(resource_name) {
            let fields = []
            if (
                this.uploadedResources.data[resource_name].resources !== undefined &&
                this.uploadedResources.data[resource_name].resources.length
            ) {
                _.forEach(
                    Object.keys(this.uploadedResources.data[resource_name].resources[0]),
                    (field) => {
                        if (field === 'action_type_id') {
                            fields.push({
                                title: 'Action',
                                key: field
                            })
                        } else if (field !== 'id' && field !== 'success') {
                            fields.push({
                                title: _.startCase(field),
                                key: field
                            })
                        }
                    }
                )
            }
            return fields
        },

        isStepEditable(name) {
            if (name === 'acknowledgment') return true
            return (
                this.study.id !== undefined &&
                this.study.id !== null &&
                this.canProceedFromSubmission
            )
        },
        isStepComplete(name) {
            if (name === 'acknowledgment') return this.canProceedFromSubmission
            if (name === 'study') return !!this.study.public_id
            if (name === 'samples') return this.study.nb_samples > 0
            if (name === 'experiments') return this.study.nb_experiments > 0
            if (name === 'runs') return this.study.nb_runs > 0
            if (name === 'analyses') return this.study.nb_analyses > 0
            if (name === 'datasets') return this.study.nb_datasets > 0
            if (name === 'submission')
                return ['SUB', 'RES', 'APR', 'PUB'].includes(this.study.status_type_id)
            return false
        },
        stepColor(name) {
            if (this.isStepComplete(name)) return 'green'
            if (this.step === this.steps[name]) return 'primary'
            return undefined
        },
        hasStepCount(name) {
            return ['study', 'samples', 'experiments', 'runs', 'analyses', 'datasets'].includes(name)
        },
        stepCount(name) {
            if (name === 'study') return this.study.public_id ? 1 : 0
            const counts = {
                samples: this.study.nb_samples,
                experiments: this.study.nb_experiments,
                runs: this.study.nb_runs,
                analyses: this.study.nb_analyses,
                datasets: this.study.nb_datasets
            }
            return counts[name] || 0
        },
        resetModal() {
            this.uploadedResources = { nav: 'study', success: false, data: null, loaded: false }
        },
        openUploadModal() {
            this.files = null
            this.uploadedResources = { nav: 'study', success: false, data: null, loaded: false }
            this.uploadProgress = { phase: null, current: 0, total: 0, resource_type: null }
            this.modal.status = true
        },
        closeModal() {
            let _this = this
            if (
                _this.uploadedResources.success &&
                _this.uploadedResources.data &&
                _this.uploadedResources.data['Study']
            ) {
                let study_id = _this.uploadedResources.data['Study'].resources[0].public_id
                this.$router.push('/submissions/' + study_id)
                this.study_id = study_id
                this.getStudy()
            } else {
                this.nav = 'form'
                this.modal.status = false
            }
        },

        uploadAction() {
            let _this = this
            if (_this.files) {
                _this.filesUploading = 'primary'
                _this.uploadProgress = { phase: null, current: 0, total: 0, resource_type: null }
                let formData = new FormData()
                // files
                let fidx = 0
                for (let file of _this.files) {
                    fidx++
                    formData.append(`file${fidx}`, file, file.name)
                }
                // additional data
                formData.append('nb_files', fidx)

                this.submissionStore
                    .uploadStudy(formData, (event) => {
                        _this.uploadProgress = event
                    })
                    .then(async (uploadedResources) => {
                        if (uploadedResources.success && _this.uploadProgress.total > 0) {
                            // Let the bar visibly land on 100% before the view switches away
                            _this.uploadProgress = {
                                phase: 'done',
                                current: _this.uploadProgress.total,
                                total: _this.uploadProgress.total,
                                resource_type: null
                            }
                            await new Promise((resolve) => setTimeout(resolve, 600))
                        }
                        if (uploadedResources.success) {
                            _this.$notify({
                                title: 'Success',
                                text: 'File uploaded successfully',
                                type: 'success'
                            })
                            let keys = _.keys(uploadedResources.resources)
                            _this.uploadedResources = {
                                loaded: true,
                                nav: 'Study',
                                message: uploadedResources.message,
                                success: uploadedResources.success,
                                data: uploadedResources.resources,
                                keys: keys
                            }
                        } else {
                            let tmp_nav = 'Study'
                            _.forEach(uploadedResources.output, function (k, o) {
                                if (o.status == 'FAIL') tmp_nav = k
                            })
                            let keys = _.keys(uploadedResources.output)
                            _this.uploadedResources = {
                                loaded: true,
                                nav: tmp_nav,
                                success: uploadedResources.success,
                                data: uploadedResources.output,
                                errors: uploadedResources.errors,
                                keys: keys
                            }
                            _this.$notify({
                                title: 'Error',
                                text: 'File uploaded Fail',
                                type: 'error'
                            })
                        }
                        _this.files = null
                        _this.filesUploading = false
                    })
                    .catch((err) => {
                        _this.filesUploading = false
                        console.info(err)
                        // _this.$notify({
                        //   title: err.response.statusText,
                        //   text: err.response.data,
                        //   type: 'error',
                        // })
                        //   _this.$notify({
                        //   title: "fail",
                        //   text: "fail",
                        //   type: 'error',
                        // })
                    })
            }
        },

        downloadStudy() {
            let _this = this
            this.submissionStore
                .downloadStudy(this.study_id)
                .then((res) => {
                    let blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(blob)
                    link.download = 'study_' + _this.study_id + '.xlsx'
                    link.click()
                    // _this.downloading = false
                })
                .catch(() =>
                    notifyError('Failed to download study. Please try again.')
                )
        },
        editStudy(study) {
            this.data = JSON.parse(JSON.stringify(study.properties))
            this.data.id = study.id
            this.showForm = true
        },
        changeStep(n, step) {
            if (!step && n) {
                _.forEach(this.steps, function (idx, s) {
                    if (s == n) step = idx
                })
            }
            if (step > this.steps.acknowledgment && !this.canProceedFromSubmission) {
                step = this.steps.acknowledgment
                n = 'acknowledgment'
            }
            this.step = step
            if (!n) {
                let step_names = _.keys(this.steps)
                n = step_names[step - 1]
            }
            let query = { [n]: true }
            this.$router.push({ query: query })
        },
        goNext() {
            if (this.step === this.steps.acknowledgment) {
                this.changeStep('study')
            } else {
                this.changeStep(null, this.step + 1)
            }
        },
        resetForm() {
            if (this.study_id === 'new') {
                this.$router.push('/submissions')
            } else {
                this.getStudy()
                this.showForm = false
            }
        },
        deleteStudy(action) {
            if (action == 'init') {
                this.delete_study = true
            } else if (action == 'cancel') {
                this.delete_study = false
            } else if (action == 'confirm') {
                this.submissionStore
                    .deleteStudy(this.study_id)
                    .then(() => {
                        this.$notify({
                            title: 'Study deleted successfully',
                            type: 'success'
                        })
                        this.delete_study = false
                        this.$router.push('/submissions')
                    })
                    .catch(() =>
                        notifyError('Failed to delete study. Please try again.')
                    )
            }
        },
        submitForm() {
            if (this.study.id) this.data.id = this.study.id
            this.submissionStore
                .editStudy(this.data)
                .then((res) => {
                    if (res.success !== undefined && !res.success) {
                        notifyError('Failed to save study. Please try again.')
                    } else {
                        this.study = res
                        this.properties = res.properties
                        const action = this.data.id ? 'updated' : 'registered'
                        this.$notify({
                            title: 'Study ' + action + ' successfully',
                            type: 'success'
                        })
                        this.showForm = false
                        if (this.study_id == 'new') {
                            this.$router.push('/submissions/' + res.public_id)
                            this.study_id = res.public_id
                            this.getStudy(this.steps.samples)
                        }
                    }
                })
                .catch(
                    (err) => {
                        console.log(err)
                    }
                    // this.$notify({
                    //   title: err.response.statusText,
                    //   text: err.response.data,
                    //   type: 'error',
                    // }),
                )
        },

        getStudy(nextstep) {
            let _this = this
            this.submissionStore
                .getStudy(this.study_id)
                .then((study) => {
                    this.study = study
                    if (this.study.status == 'published' || this.study.status == 'approved') this.showForm = false
                    this.nav = 'form'
                    this.modal.status = false
                    this.properties = []
                    _.forEach(study.properties, function (p, t) {
                        _this.properties.push({ id: t, value: p })
                        _this.data = JSON.parse(JSON.stringify(study.properties))
                    })
                    if (this.study_id === 'new') {
                        _this.showForm = true
                    }
                    if (nextstep) {
                        this.step = nextstep
                    } else if (!this.initialStepResolved) {
                        this.step = this.hasStartedThisSubmission
                            ? this.steps.study
                            : this.steps.acknowledgment
                    }
                    this.initialStepResolved = true
                    if (this.study.status_type_id === 'SUB' || this.study.status_type_id === 'RES') {
                        _this.showForm = false
                    }
                    if (this.step > this.steps.acknowledgment && !this.canProceedFromSubmission) {
                        this.changeStep('acknowledgment')
                    }
                })
                .catch(() =>
                    notifyError('Failed to load study. Please try again.')
                )
        },
        updateData(event) {
            this.data = event.data
        },
        downloadTemplates() {
            let submissionStore = useSubmissionStore()
            submissionStore
                .downloadTemplate('Submission')
                .then((res) => {
                    let blob = new Blob([res.data], { type: 'application/zip' })
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(blob)
                    link.download = 'fega_templates.zip'
                    link.click()
                })
                .catch(() => {
                    notifyError('Failed to download templates. Please try again.')
                })
        },
        downloadCli() {
            let submissionStore = useSubmissionStore()
            submissionStore
                .downloadCli()
                .then((res) => {
                    let blob = new Blob([res.data], { type: 'application/zip' })
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(blob)
                    link.download = 'fega-cli.zip'
                    link.click()
                })
                .catch(() => {
                    notifyError('Failed to download CLI. Please try again.')
                })
        },
        createNewVersion() {
		      if (this.study.status_type_id === 'PUB'){
		        let submissionStore = useSubmissionStore()
		        submissionStore.createSubmissionVersion().then((res) => {

		        })
		      }
		      
		    }
    },

    provide() {
        return {
            styles: myStyles
        }
    }
})
</script>

<style>
.no-spacing {
    margin: 0;
    padding: 0;
}

/* Keep digit widths constant so the caption doesn't jitter as counts tick up (e.g. "5 / 50" -> "12 / 50") */
.upload-progress-nums {
    font-variant-numeric: tabular-nums;
}

/* Markdown documentation pages */
.markdown-body ol {
    padding: 16px 40px;
}
.markdown-body pre {
    padding: 0 40px;
}
.v-alert .little-v-alert {
    margin-top: 100px;
}

#studyForm.v-card {
    box-shadow: none !important;
    border: none !important;
}

#studyForm.jf-form > .vertical-layout > .v-row > .v-col.vertical-layout-item {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

#studyForm.jf-form > .v-card-actions {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

.submission-stepper-bar {
    display: flex;
    align-items: center;
    gap: 4px;
}

.submission-stepper-arrow.v-btn {
    align-self: center;
}

.submission-stepper-arrow-wrap {
    display: inline-flex;
    flex: 0 0 auto;
}

.submission-stepper {
    flex: 1 1 0%;
    width: auto !important;
}

.submission-stepper .v-stepper-header {
    overflow-x: visible;
}

.submission-stepper-divider {
    margin: 16px 0;
}

.submission-content {
    margin-top: 0;
}

.submission-start-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 0 0 16px;
}
</style>
