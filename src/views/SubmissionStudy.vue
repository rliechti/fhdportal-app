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
                                    <div class="text-center">
                                        <v-progress-circular
                                            color="primary"
                                            indeterminate
                                            v-if="filesUploading"
                                        >
                                        </v-progress-circular>
                                    </div>
                                </div>
                                <div v-else>
                                    <div v-if="!uploadedResources.success" class="px-5">
                                        <p class="bg-red my-3 text-center">File upload fail</p>
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
                                        <p class="bg-green mt-3 text-center">
                                            File uploaded successfully
                                        </p>
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
                                        <v-data-table
                                            v-if="uploadedResources.success"
                                            :items="
                                                uploadedResources.data[uploadedResources.nav]
                                                    .resources
                                            "
                                            :headers="batchUploadHeaders(uploadedResources.nav)"
                                            density="compact"
                                            hover
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
                                        </v-data-table>
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
            <v-container v-if="study">
                <v-btn class="float-right ml-2" color="grey-lighten-4" @click="downloadStudy()"
                    >Download Study</v-btn
                >
                <permissions v-model:study.access="study"></permissions>
                <h2 v-if="study.id" class="text-center">Study "{{ study.title }}"</h2>
                <h2 v-else class="text-center">New study</h2>

                <v-stepper non-linear :model-value="step" class="mt-10">
                    <v-stepper-header>
                        <template v-for="(idx, name) in steps" :key="`newStudy${idx}`">
                            <v-stepper-item
                                :edit-icon="null"
                                :value="getStepperValue(name)"
                                :editable="study.id !== undefined && study.id !== null"
                                :color="colorBar(idx)"
                                @click="changeStep(name)"
                            >
                                {{ name }}
                            </v-stepper-item>
                            <v-divider></v-divider>
                        </template>
                    </v-stepper-header>
                </v-stepper>
                <v-alert
                    style="margin-top: 10px"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    prominent
                >
                    <WarningSensitive />
                </v-alert>
                <div class="mt-10" style="margin-top: 20px !important">
                    <p style="margin-bottom: 10px">
                        <span style="color: white">t</span>
                        <v-btn
                            v-show="step > 1"
                            color="orange-lighten-5"
                            prepend-icon="mdi-chevron-left"
                            @click="changeStep(null, step - 1)"
                            >go back</v-btn
                        >
                        <v-btn
                            v-if="step < 6 && study.public_id"
                            color="orange-lighten-5"
                            class="float-right"
                            append-icon="mdi-chevron-right"
                            @click="changeStep(null, step + 1)"
                            >next</v-btn
                        >
                    </p>

                    <div v-if="step == 1">
                        <p v-if="study.status_type_id == 'PUB'" class="bg-green text-center">
                            Study published on {{ formatDate(study.released_date) }}
                        </p>

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
                        <v-card v-if="nav == 'form'" id="studyForm" class="jf-form">
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
                                        study.status_type_id !== 'PUB'
                                    "
                                    class="text-center"
                                >
                                    <v-btn color="primary" variant="flat" @click="showForm = true"
                                        >Edit</v-btn
                                    >
                                </p>
                            </v-card-actions>
                        </v-card>
                    </div>

                    <div v-if="step == 2">
                        <samples :study_id="study.id" @updateStudy="getStudy()"></samples>
                    </div>
                    <div v-if="step == 3">
                        <experiments :study_id="study.id" @updateStudy="getStudy()"></experiments>
                    </div>
                    <div v-if="step == 4">
                        <runs :study_id="study.id" @updateStudy="getStudy()"></runs>
                    </div>
                    <div v-if="step == 5">
                        <analyses :study_id="study.id" @updateStudy="getStudy()"></analyses>
                    </div>
                    <div v-if="step == 6">
                        <datasets
                            :study_id="study.id"
                            @submitStudy="submitStudy()"
                            @updateStudy="getStudy()"
                        ></datasets>
                    </div>
                </div>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers, mergeStyles, defaultStyles } from '@jsonforms/vue-vuetify'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
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
import moment from 'moment'
import _ from 'lodash'
import { mapState } from 'pinia'
import StudyUpload from '@/assets/documentation/StudyUpload.md'
import WarningSensitive from '@/assets/documentation/WarningSensitive.md'

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
        WarningSensitive
    },
    data() {
        return {
            nav: 'form',
            files: null,
            delete_study: false,
            modal: { status: false },
            filesUploading: false,
            uploadedResources: { nav: 'study', success: false, data: null, loaded: false },
            steps: {
                study: 1,
                samples: 2,
                experiments: 3,
                runs: 4,
                analyses: 5,
                datasets: 6
            },
            // steps: {
            //   study: 0,
            //   samples: 1,
            //   experiments: 2,
            //   runs: 3,
            //   analyses: 4,
            //   datasets: 5,
            // },
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
            data: {}
        }
    },
    computed: {
        ...mapState(useSubmissionStore, ['studies']),
        ...mapState(useSchemaStore, ['schemas']),
        readonly() {
            return (
                this.study.current_permission !== undefined &&
                this.study.current_permission.indexOf('edit') === -1
            )
        }
    },
    mounted() {
        let query_key = this.$route.query ? _.keys(this.$route.query) : null
        if (this.steps[query_key[0]]) this.step = this.steps[query_key[0]]
        this.sampleStore = useSampleStore()
        this.submissionStore = useSubmissionStore()
        this.study_id = this.$route.params.study_id
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
                                title: 'action',
                                key: field
                            })
                        } else if (field !== 'id' && field !== 'success') {
                            fields.push({
                                title: field,
                                key: field
                            })
                        }
                    }
                )
            }
            return fields
        },

        getStepperValue(resource_name) {
            if (resource_name == 'study') return 1
            else if (resource_name == 'samples')
                return this.study.nb_samples ? this.study.nb_samples : 0
            else if (resource_name == 'experiments')
                return this.study.nb_experiments ? this.study.nb_experiments : 0
            else if (resource_name == 'runs') return this.study.nb_runs ? this.study.nb_runs : 0
            else if (resource_name == 'analyses')
                return this.study.nb_analyses ? this.study.nb_analyses : 0
            else if (resource_name == 'datasets')
                return this.study.nb_datasets ? this.study.nb_datasets : 0
        },
        colorBar(idx) {
            let color = null
            if (idx == 1 && this.study.public_id) color = 'green'
            if (idx == 2 && this.study.nb_samples > 0) color = 'green'
            if (idx == 3 && this.study.nb_experiments > 0) color = 'green'
            if (idx == 4 && this.study.nb_runs > 0) color = 'green'
            if (idx == 5 && this.study.nb_analyses > 0) color = 'green'
            if (idx == 6 && this.study.nb_datasets > 0) color = 'green'
            return color
        },
        resetModal() {
            this.uploadedResources = { nav: 'study', success: false, data: null, loaded: false }
        },
        openUploadModal() {
            this.files = null
            this.uploadedResources = { nav: 'study', success: false, data: null, loaded: false }
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
                    .uploadStudy(formData)
                    .then((uploadedResources) => {
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
                .catch((err) =>
                    this.$notify({
                        title: err.response.statusText,
                        text: err.response.data,
                        type: 'error'
                    })
                )
        },
        formatDate(value) {
            return moment(value).format('DD.MM.YYYY')
        },
        submitStudy() {
            this.getStudy()
            this.step = 0
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
            this.step = step
            if (!n) {
                let step_names = _.keys(this.steps)
                n = step_names[step]
            }
            let query = { [n]: true }
            this.$router.push({ query: query })
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
                    .catch((err) =>
                        this.$notify({
                            title: err.response.statusText,
                            text: err.response.data,
                            type: 'error'
                        })
                    )
            }
        },
        submitForm() {
            if (this.study.id) this.data.id = this.study.id
            this.submissionStore
                .editStudy(this.data)
                .then((res) => {
                    if (res.success !== undefined && !res.success) {
                        this.$notify({
                            type: 'error',
                            title: res.message
                        })
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
                            this.getStudy(2)
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
                    if (this.study.status == 'published') this.showForm = false
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
                    if (nextstep) this.step = nextstep
                    if (this.study.status_type_id === 'SUB') {
                        _this.showForm = false
                    }
                })
                .catch((err) =>
                    this.$notify({
                        title: err.response.statusText,
                        text: err.response.data,
                        type: 'error'
                    })
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
                .catch((err) => {
                    _this.$notify({
                        title: err.response.statusText,
                        text: err.response.data,
                        type: 'error'
                    })
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
                .catch((err) => {
                    _this.$notify({
                        title: err.response.statusText,
                        text: err.response.data,
                        type: 'error'
                    })
                })
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
</style>
