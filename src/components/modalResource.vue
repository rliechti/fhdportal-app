<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title
        >{{ title }}
        <v-chip v-if="readonly" class="float-right mr-5" color="warning"
          >read only</v-chip
        >
        <v-chip
          class="float-right mr-5"
          :color="getResourceStatusClass(study.status)"
          >{{ study.status }}</v-chip
        ></v-card-title
      >
      <v-tabs
        v-if="!edit && !hide_upload && !readonly"
        v-model="nav"
        bg-color="blue-lighten-5"
        center-active
      >
        <v-tab value="form">Single creation with form</v-tab>
        <v-tab value="file">Batch creations with file</v-tab>
      </v-tabs>
      <template v-if="nav == 'form'">
        <v-card v-if="data_schema">
          <json-forms
            :data="data"
            :schema="data_schema"
            :uischema="ui_schema"
            :renderers="renderers"
            :readonly="readonly"
            @change="updateData"
          />
          <p v-if="error" class="bg-red">{{ error }}</p>
        </v-card>
      </template>

      <template v-if="nav == 'file'">
        <v-container>
          <v-card
            variant="flat"
            :title="`Multiple ${typeLabel.replace(
              /([A-Z])/g,
              ' $1',
            )} entries can be created in batch`"
          >
            <v-card-subtitle
              >Download, fill in and upload an Excel template
              file</v-card-subtitle
            >
            <div class="d-flex align-center pe-2">
              <p class="align-center text-align-center">
                <v-btn
                  v-if="nav == 'file'"
                  color="primary"
                  class="float-left"
                  variant="flat"
                  size="small"
                  @click="downloadTemplate()"
                  >Download an Excel template</v-btn
                >
              </p>
              <v-spacer></v-spacer>
              <v-file-input
                v-model="files"
                style="margin-top: 20px"
                multiple
                counter
                show-size
                :loading="filesUploading"
                label="Upload the Excel file, or one or multiple CSV file..."
                @change="uploadAction"
              ></v-file-input>
            </div>
            <v-data-table
              v-if="uploadedResources.length > 0"
              :items="uploadedResources"
            >
              <template #item.status="{ value }">
                <v-chip :color="getStatusClass(value)" size="small">{{
                  value
                }}</v-chip>
              </template>
            </v-data-table>
            <p v-if="error" class="bg-red">{{ error }}</p>
          </v-card>
        </v-container>
      </template>
      <template #actions>
        <p v-if="!uploadedResources.length && !readonly">
          <template v-if="!deleteResource.status">
            <v-btn
              v-if="nav == 'form'"
              color="primary"
              variant="flat"
              :disabled="disabled"
              @click="submitForm"
              >{{`Save ${typeLabel.replace(
              /([A-Z])/g,
              ' $1',
            )}`}}</v-btn
            >
            <v-btn
              color="secondary"
              variant="flat"
              class="ml-2"
              @click="close(false)"
              >Cancel</v-btn
            >
            <v-btn
              v-if="edit && permissions.indexOf('delete') > -1"
              color="warning"
              class="ml-2"
              variant="flat"
              @click="deleteResources('init')"
            >
              Delete
            </v-btn>
          </template>

          <template v-else>
            <v-btn
              class="ml-3"
              size="small"
              color="red"
              variant="outlined"
              @click="deleteResources('save')"
              >Confirm deletion</v-btn
            >
            <v-btn
              class="ml-3"
              size="small"
              color="grey"
              variant="outlined"
              @click="deleteResources('cancel')"
              >Cancel</v-btn
            >
          </template>
        </p>
        <p v-else class="text-center">
          <v-btn
            color="secondary"
            variant="outlined"
            class="ml-2"
            @click="close(true)"
          >
            Close
          </v-btn>
        </p>
      </template>
    </v-card>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers } from '@jsonforms/vue-vuetify'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSampleStore } from '@/stores/samples.js'
import { useExperimentStore } from '@/stores/experiments.js'
import { useRunStore } from '@/stores/runs.js'
import { useAnalysisStore } from '@/stores/analyses.js'
import { useDatasetStore } from '@/stores/datasets.js'
import { useSchemaStore } from '@/stores/schemas.js'
import { mapState } from 'pinia'
import ReferenceResourceControlRenderer from '@/components/ReferenceResourceControlRenderer.vue'
import ReferenceResourceControlTester from '@/testers/ReferenceResourceControlTester.js'
import ReferenceResourcesControlTester from '@/testers/ReferenceResourcesControlTester.js'
import ReferenceResourcesControlRenderer from '@/components/ReferenceResourcesControlRenderer.vue'
import VerticalCheckboxControlRenderer from '@/components/VerticalCheckboxControlRenderer.vue'
import VerticalCheckboxControlTester from '@/testers/VerticalCheckboxControlTester.js'

import _ from 'lodash'
import moment from 'moment'
const renderers = [
  ...vuetifyRenderers,
  {
    tester: ReferenceResourceControlTester,
    renderer: ReferenceResourceControlRenderer,
  },
  {
    tester: ReferenceResourcesControlTester,
    renderer: ReferenceResourcesControlRenderer,
  },
  {
    tester: VerticalCheckboxControlTester,
    renderer: VerticalCheckboxControlRenderer,
  },
]

export default defineComponent({
  name: 'ModalResource',
  components: {
    JsonForms,
  },
  props: [
    'cas',
    'study_id',
    'type',
    'input_data',
    'edit',
    'title',
    'hide_upload',
    'permissions',
  ],
  data() {
    return {
      currentStore: null,
      analysisStore: null,
      sampleStore: null,
      experimentStore: null,
      error: '',
      nav: 'form',
      study_public_id: null,
      uploadedResources: [],
      renderers: Object.freeze(renderers),
      upload: false,
      files: null,
      disabled: true,
      filesUploading: false,
      deleteResource: { status: false },
      data: {},
      //       data: {
      // alias:'Alias 1',
      // biological_sex: 'female',
      // subject_id: 'IND',
      // phenotype: 'cancer',
      // description: "this is a test"
      //       },
      data_schema: null,
      ui_schema: null,
      typeLabel: '',
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['study']),
    ...mapState(useSubmissionStore, ['statusTypes']),
    ...mapState(useSampleStore, ['samples']),
    ...mapState(useSchemaStore, ['schemas']),
    readonly() {
      return (
        this.permissions.indexOf('edit') === -1 ||
        this.study.status_type_id !== 'DRA'
      )
    },
  },
  mounted() {
    if (this.type.label !== undefined) {
      this.typeLabel = this.type.label
    }
    if (this.type.label === undefined && this.type.name !== undefined) {
      this.typeLabel = this.type.name
    }
    if (this.input_data) this.data = this.input_data
    if (this.cas == 'sample') this.currentStore = useSampleStore()
    else if (this.cas == 'experiment') this.currentStore = useExperimentStore()
    else if (this.cas == 'run') this.currentStore = useRunStore()
    else if (this.cas == 'analysis') this.currentStore = useAnalysisStore()
    else if (this.cas == 'dataset') this.currentStore = useDatasetStore()
    this.getSchemas(this.typeLabel)
  },

  methods: {
    downloadTemplate() {
      let _this = this
      let submissionStore = useSubmissionStore()
      submissionStore
        .downloadTemplate(this.typeLabel)
        .then((res) => {
          let blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = 'template_' + _this.typeLabel + '.xlsx'
          link.click()
        })
        .catch((err) => {
          console.info(err)
          _this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          })
        })
    },
    deleteResources(action) {
      let _this = this
      if (action == 'init' || action == 'cancel') {
        this.deleteResource.status = !this.deleteResource.status
      } else {
        //TODO
        let current_function
        if (_this.cas == 'sample') {
          current_function = _this.currentStore.deleteSamples([
            { study_id: this.study_id, sample_id: this.edit },
          ])
        } else if (_this.cas == 'experiment') {
          current_function = _this.currentStore.deleteExperiments([
            { study_id: this.study_id, experiment_id: this.edit },
          ])
        } else if (_this.cas == 'run') {
          current_function = _this.currentStore.deleteRuns([
            { study_id: this.study_id, run_id: this.edit },
          ])
        } else if (_this.cas == 'analysis') {
          current_function = _this.currentStore.deleteAnalyses([
            { study_id: this.study_id, analysis_id: this.edit },
          ])
        } else if (_this.cas == 'dataset') {
          current_function = _this.currentStore.deleteDatasets([
            { study_id: this.study_id, dataset_id: this.edit },
          ])
        }

        current_function
          .then(() => {
            let msg = _this.cas + ' successfully deleted'
            _this.$notify({ title: 'Success', text: msg, type: 'success' })
            _this.deleteResource.status = false
            _this.close()
          })
          .catch((err) => {
            _this.deleteResource.status = false
            _this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
          })
      }
    },
    close(reload) {
      this.$emit('closeModal', reload)
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
        formData.append('resource_type_id', _this.type.resource_type_id)
        let current_function
        if (_this.cas == 'sample') {
          current_function = _this.currentStore.uploadSamples(
            _this.study_id,
            formData,
          )
        } else if (_this.cas == 'experiment') {
          current_function = _this.currentStore.uploadExperiments(
            _this.study_id,
            formData,
          )
        } else if (_this.cas == 'run') {
          current_function = _this.currentStore.uploadRuns(
            _this.study_id,
            formData,
          )
        } else if (_this.cas == 'analysis') {
          current_function = _this.currentStore.uploadAnalyses(
            _this.study_id,
            formData,
          )
        } else if (_this.cas == 'dataset') {
          current_function = _this.currentStore.uploadDatasets(
            _this.study_id,
            formData,
          )
        }

        // _this.currentStore.uploadSamples(_this.study_public_id,formData).then(uploadedResources => {
        current_function
          .then((uploadedResources) => {
            let msg = uploadedResources.length + ' ' + _this.cas
            if (uploadedResources.length > 1) msg += 's'
            msg += ' uploaded successfully'
            _this.$notify({ title: 'Success', text: msg, type: 'success' })
            _this.uploadedResources = uploadedResources
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

    updateData(event) {
      let _this = this
      let dis = false
      this.data = event.data
      _.forEach(_this.data_schema.required, function (r) {
        if (!_this.data[r]) {
          dis = true
        }
      })
      this.disabled = dis
    },
    //     resetForm(event) {
    // let _this = this
    // this.error = null;
    // this.deleteResource.status = false;
    // this.uploadedResources=[];
    // Object.keys(this.data).forEach(function(index) { _this.data[index] = null });
    // this.nav = 'form';
    //     },
    submitForm() {
      let _this = this
      let current_function = null
      let param
      if (this.cas == 'sample') {
        param = {
          study_id: this.study_id,
          sample: { properties: this.data, sample_type: this.typeLabel },
        }
        current_function = this.currentStore.editSample(param)
      } else if (this.cas == 'experiment') {
        param = {
          study_id: this.study_id,
          experiment: {
            properties: this.data,
            experiment_type: this.typeLabel,
          },
        }
        current_function = this.currentStore.editExperiment(param)
      } else if (this.cas == 'run') {
        param = {
          study_id: this.study_id,
          run: { properties: this.data, run_type: this.typeLabel },
        }
        current_function = this.currentStore.editRun(param)
      } else if (this.cas == 'analysis') {
        param = {
          study_id: this.study_id,
          analysis: { properties: this.data, analysis_type: this.typeLabel },
        }
        current_function = this.currentStore.editAnalysis(param)
      } else if (this.cas == 'dataset') {
        param = {
          study_id: this.study_id,
          dataset: { properties: this.data, dataset_type: this.typeLabel },
        }
        current_function = this.currentStore.editDataset(param)
      }
      current_function
        .then(() => {
          _this.close(_this.edit)
          _this.data = {}
          _this.$notify({
            title: _this.cas + ' registered successfully',
            type: 'success',
          })
        })
        .catch((err) => {
          _this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          })
          _this.error = err.response.data
        })
    },
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
    },
    getSchemas(type) {
      const schemaStore = useSchemaStore()

      schemaStore.getSchemas().then((schemas) => {
        if (schemas[type] !== undefined) {
          this.data_schema = schemas[type].data_schema
          this.ui_schema = schemas[type].ui_schema
        }
      })
    },
    getResourceStatusClass(status_type) {
      let idx = _.findIndex(this.statusTypes, (sT) => {
        return sT.name === status_type
      })
      if (idx > -1) {
        return this.statusTypes[idx].class_name
      }
    },

    getStatusClass(status_type) {
      if (
        status_type.toLowerCase().indexOf('succ') > -1 ||
        status_type.toLowerCase().indexOf('valid') > -1
      ) {
        return 'green'
      }
      if (
        status_type.toLowerCase().indexOf('fail') > -1 ||
        status_type.toLowerCase().indexOf('danger') > -1 ||
        status_type.toLowerCase().indexOf('error') > -1
      ) {
        return 'red'
      }
    },
  },
})
</script>

<style>
@import '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css';
.vertical-checkbox {
  border: 2px solid blue;
}
/* Target v-text-field components within VJSF that are readonly */
.v-field--disabled {
  opacity: 1;
  color: rgba(0, 0, 0, 0.87);
}
html body .v-theme--light, html body .v-theme--dark {
    --v-disabled-opacity: 1;
}
.v-input--horizontal .v-btn.v-btn--icon {
  border-radius: 0;
}
.v-card .v-card {
  border: none;
  box-shadow: none !important;
}
</style>
