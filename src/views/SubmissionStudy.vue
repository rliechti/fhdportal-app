<template>
  <div class="SubmissionStudy">
    <v-sheet min-height="70vh" rounded="lg">
      <v-dialog v-model="modal.status" width="95%">
        <v-card width="100%" min-height="50vh" title="Upload entire study">
          <div>
            <v-row>
              <v-col :cols="uploadedResources.status?12:6">
                <v-file-input
                  v-if="!uploadedResources.status"
                  v-model="files"
                  style="margin-top: 20px"
                  multiple
                  counter
                  show-size
                  :loading="filesUploading"
                  label="Upload one zip file..."
                  @change="uploadAction"
                ></v-file-input>
                <div v-else>
                  <div v-if="uploadedResources.status == 'FAIL'" class="px-5">
                    <p class="bg-red my-3 text-center">File upload fail</p>
                    <p>
                      {{ uploadedResources.message }} <br />
                      {{ uploadedResources.data.comment }}
                    </p>
                    <ul class="ml-5 my-3">
                      <template v-for="(d, t) in uploadedResources.data" :key="t">
                        <li v-if="t != 'comment' && t != 'status'">
                          {{ t }} : {{ d }}
                        </li>
                      </template>
                    </ul>
                  </div>
                  <div v-else>
                    <p class="bg-green mt-3 text-center">
                      File uploaded successfully
                    </p>
                    <v-tabs
                      v-if="uploadedResources.status"
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
                      v-if="uploadedResources.status"
                      :items="uploadedResources.data[uploadedResources.nav]"
                    ></v-data-table>
                  </div>
                  <p v-if="error" class="bg-red">{{ error }}</p>
                </div>
              </v-col>
              <v-col cols="6" v-if="!uploadedResources.status">
              <v-container>
                <v-alert style="margin: 20px">
                  <StudyUpload />
                  <v-btn color="primary" @click="downloadCli">Download CLI tool</v-btn>
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
          </p>
        </v-card>
      </v-dialog>
      <v-container v-if="study">
        <v-btn class="float-right ml-2" @click="downloadStudy()"
          >Download Study</v-btn
        >
        <permissions v-model:study.access="study"></permissions>
        <h1 v-if="study.id" class="text-center">
          Study "{{ study.title }}"
        </h1>
        <h1 v-else class="text-center">New study</h1>
        <v-stepper non-linear :model-value="step" class="mt-10">
          <v-stepper-header>
            <template v-for="(idx, name) in steps" :key="`newStudy${idx}`">
              <v-stepper-item
                :value="idx"
                :editable="study.id !== undefined && study.id !== null"
                :complete="idx <= step"
                @click="changeStep(name, idx)"
              >
                {{ name }}
              </v-stepper-item>
              <v-divider></v-divider>
            </template>
          </v-stepper-header>
        </v-stepper>
        <v-alert
             type="warning"
             variant="tonal"
             prominent
        >
          <WarningSensitive style="margin: auto; padding: auto; " />
        </v-alert>
        <div class="mt-10">

          <div v-if="+step === 0">
            <p
              v-if="study.status_type_id == 'PUB'"
              class="bg-green text-center"
            >
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
                >Large submissions in batch</v-tab
              >
            </v-tabs>
            <v-card v-if="nav == 'form'" id="studyForm">
              <json-forms
                :data="data"
                :schema="data_schema"
                :uischema="ui_schema"
                :renderers="renderers"
                :readonly="
                  !showForm || (study_id !== 'new' && study.current_permission.indexOf('edit') === -1)
                "
                @change="updateData"
              />
              <v-card-actions>
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
                    study.status_type_id !== 'SUB' && study.status_type_id !== 'PUB'
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
          <div v-if="step == 1">
            <samples :study_id="study.id"></samples>
          </div>
          <div v-if="step == 2">
            <experiments :study_id="study.id"></experiments>
          </div>
          <div v-if="step == 3">
            <runs :study_id="study.id"></runs>
          </div>
          <div v-if="step == 4">
            <analyses :study_id="study.id"></analyses>
          </div>
          <div v-if="step == 5">
            <datasets
              :study_id="study.id"
              @submitStudy="submitStudy()"
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
import {
  vuetifyRenderers,
  mergeStyles,
  defaultStyles,
} from '@jsonforms/vue-vuetify'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import IdentifierControlRenderer from '@/components/IdentifierControlRenderer.vue'
import IdentifierControlTester from '@/testers/IdentifierControlTester.js'
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
  { tester: IdentifierControlTester, renderer: IdentifierControlRenderer },
]

const myStyles = mergeStyles(defaultStyles, {
  control: {
    root: 'flex flex-col gap-2',
    input: 'p-inputtext p-component p-inputtext-fluid',
    textarea: 'p-textarea p-component',
  },
  arrayList: {
    addButton: 'v-btn b-btn__text v-btn__primary',
    toolbar: 'no-spacing',
    item: 'flex flex-col gap-2',
  },
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
      uploadedResources: { nav: 'study', status: false, data: null },
      steps: {
        study: 0,
        samples: 1,
        experiments: 2,
        runs: 3,
        analyses: 4,
        datasets: 5,
      },
      step: 0,
      sampleStore: null,
      error: '',
      study: null,
      study_id: null,
      properties: [],
      data_schema: null,
      ui_schema: null,
      showForm: false,
      renderers: Object.freeze(renderers),
      data: {},
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['studies']),
    ...mapState(useSchemaStore, ['schemas']),
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
  // watch: {
  // 	$route (n,o){
  // 		console.info(n);
  // 		console.info(o);
  // 	}
  // },
  methods: {
    openUploadModal() {
      this.files = null
      this.uploadedResources = { nav: 'study', status: false, data: null }
      this.modal.status = true
    },
    closeModal() {
      let _this = this
      if (
        _this.uploadedResources.status == 'SUCCESS' &&
        _this.uploadedResources.data &&
        _this.uploadedResources.data['Study']
      ) {
        let study_id = _this.uploadedResources.data['Study'][0].public_id
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
        _this.filesUploading = true
        let formData = new FormData()
        // files
        let fidx = 0
        for (let file of _this.files) {
          fidx++
          formData.append(`file${fidx}`, file, file.name)
        }
        // additional data
        formData.append('nb_files', fidx)
        // formData.append("resource_type_id", 'Study');

        this.submissionStore
          .uploadStudy(formData)
          .then((uploadedResources) => {
            if (uploadedResources.status == 'SUCCESS') {
              _this.$notify({
                title: 'Success',
                text: 'File uploaded successfully',
                type: 'success',
              })
              let keys = _.keys(uploadedResources.output)
              _this.uploadedResources = {
                nav: 'Study',
                status: uploadedResources.status,
                data: uploadedResources.output,
                keys: keys,
              }
            } else {
              _this.uploadedResources = {
                status: uploadedResources.status,
                message: uploadedResources.message,
                data: JSON.parse(uploadedResources.data),
              }
              _this.$notify({
                title: 'Error',
                text: 'File uploaded Fail',
                type: 'error',
              })
            }
            _this.files = null
            _this.filesUploading = false
          })
          .catch((err) => {
            _this.filesUploading = false
            _this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
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
            type: 'error',
          }),
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
      this.step = step
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
              type: 'success',
            })
            this.delete_study = false
            this.$router.push('/submissions')
          })
          .catch((err) =>
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            }),
          )
      }
    },
    submitForm() {
      if (this.study.id) this.data.id = this.study.id
      this.submissionStore
        .editStudy(this.data)
        .then((res) => {
          this.study = res
          this.properties = res.properties
          const action = this.data.id ? 'updated' : 'registered'
          this.$notify({
            title: 'Study ' + action + ' successfully',
            type: 'success',
          })
          this.showForm = false
          if (this.study_id == 'new') {
            this.$router.push('/submissions/' + res.public_id)
            this.study_id = res.public_id
            this.getStudy(1)
          }
        })
        .catch((err) => {
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
            type: 'error',
          }),
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
            type: 'error',
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
            type: 'error',
          })
        })
    },
    
  },
  provide() {
    return {
      styles: myStyles,
    }
  },
})
</script>

<style>
@import '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css';
#studyForm div.v-toolbar__content {
  height: 1.4em !important;
}
.markdown-body ol {
  padding: 16px 40px;
}

.markdown-body pre {
  padding: 0px 40px;
}

.no-spacing {
  margin: 0;
  padding: 0;
}
.v-col {
  padding: 0px 12px !important;
}
.v-toolbar__content {
  height: 48px !important;
}
div.v-input__control > div > div.v-field__outline > div.v-field__outline__notch > label {
/*  color: #333 !important;*/
}
</style>
