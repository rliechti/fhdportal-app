<template>
  <div class="Runs">
    <v-sheet min-height="70vh" rounded="lg">
      <v-dialog v-model="modal.status" width="95%">
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

      <v-container>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <h1 v-if="!study_public_id" class="text-center">Runs</h1>
        <p v-if="!loaded || loading" class="text-center mt-3">
          <em>Loading runs</em> <br />
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </p>
        <div v-if="loaded">
          <div v-if="study_public_id">
            <h3
              v-if="!loading"
              class="text-center mb-7 d-flex align-center pe-2"
            >
              <v-icon icon="mdi-run"></v-icon>&nbsp;{{ runs.length }} Run<span
                v-if="runs.length > 1"
                >s</span
              >
              <span v-if="selectedRuns.length">
                - {{ selectedRuns.length }} selected</span
              >
              <v-spacer></v-spacer>
              <v-text-field
                v-if="runs.length && !loading"
                v-model="search"
                label="Search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
              ></v-text-field>
              <v-btn
                v-if="
                  study.runTypes.length &&
                  study.current_permission.indexOf('edit') > -1
                   && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')
                  "
                v-for="runType in study.runTypes"
                :key="runType.resource_type_id"
                variant="flat"
                color="primary"
                class="ml-2"
                @click="createRun(runType)"
              >
                create new
                {{ runType.label.replace(/([A-Z])/g, ' $1').trim() }}...
              </v-btn>
              
            </h3>
            <div v-if="!loading">
              <v-data-table
                fixed-header
                height="calc(100vh - 550px)"
                v-if="runs.length"
                v-model="selectedRuns"
                :items="runs"
                :item-value="'id'"
                :items-per-page="25"
                :footer-props="{
                  'items-per-page-options': [10, 25, 50, 100, -1],
                }"
                :headers="tableHeaders"
                :hover="true"
                :search="search"
                show-select
                density="compact"
              >
                <!-- <v-data-table v-model="selectedRuns" :items="runs" :headers="runTableHeaders" v-if="runs.length" show-select> -->
                <!-- <template v-slot:header.run_file_type="{column}">Tralala</template> -->
                <template #header.sample_public_id="{}"
                  >Sample</template
                >
                <template #header.molecularexperiment_public_id="{}"
                  >Experiment</template
                >
                <template #header.sdafile_public_ids="{}">Files</template>
                <template #item.title="{ item }">
                  {{ item.title }}
                  <v-chip
                    variant="text"
                    class="text-info"
                    @click="copy(item.public_id)"
                  >
                    <v-icon icon="mdi-information"></v-icon>
                    <v-tooltip activator="parent" location="top"
                      >{{ item.public_id }}
                    </v-tooltip>
                  </v-chip>
                </template>

                <template #item.sample_public_id="{ item }">
                  <v-btn
                    size="small"
                    variant="outlined"
                    @click="
                      showResource(
                        item.properties.sample_public_id,
                        'Sample',
                      )
                    "
                  >
                    <v-icon class="mr-1" icon="mdi-eye-outline" />
                    {{ formatId(item.properties.sample_public_id) }}
                    <v-tooltip activator="parent" location="top"
                      ><span
                        v-html="item.properties.sample_public_id"
                      />
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
                        'molecularExperiment',
                      )
                    "
                  >
                    <v-icon class="mr-1" icon="mdi-eye-outline" />
                    {{
                      formatId(item.properties.molecularexperiment_public_id)
                    }}
                    <v-tooltip activator="parent" location="top"
                      ><span
                        v-html="item.properties.molecularexperiment_public_id"
                      />
                    </v-tooltip>
                  </v-btn>
                </template>
                <template #item.run_file_type="{ value }">
                  <v-chip size="small">
                    {{ value }}
                    <v-tooltip activator="parent" location="top"
                      ><span v-html="value.replace(/([A-Z])/g, ' $1').trim()"
                    /></v-tooltip>
                  </v-chip>
                </template>
                <template #item.creator_name="{ value }">
                  <v-chip color="blue" size="small">
                    {{ value.replace(/([^A-Z])/g, '').trim() }}
                    <v-tooltip activator="parent" location="top"
                      ><span v-html="value.replace(/([A-Z])/g, ' $1').trim()"
                    /></v-tooltip>
                  </v-chip>
                </template>
                <template #item.sdafile_public_ids="{ item }">
                  <v-chip size="small">
                    {{ item.properties.sdafile_public_ids.length }} files
                    <v-tooltip activator="parent" location="top"
                      ><span
                        v-html="
                          item.properties.sdafile_public_ids.join('<br />')
                        "
                    /></v-tooltip>
                  </v-chip>
                </template>
                <template #item.status="{ value }">
                  <v-chip :color="getStatusClass(value)" size="small">{{
                    value
                  }}</v-chip>
                </template>
                <template #item.creation_date="{ value }">
                  {{ formatDate(value) }}
                </template>
                <template #item.last_update="{ value }">
                  {{ formatDate(value) }}
                </template>
                <template #item.actions="{ item }">
                  <p class="text-center" style="white-space: nowrap">
                    <v-btn
                      :disabled="
                        item.current_permission &&
                        item.current_permission.indexOf('edit') < 0 &&
                        item.current_permission.indexOf('review') < 0
                      "
                      size="small"
                      style="display: inline-flex; margin-bottom: 1px"
                      color="info"
                      variant="outlined"
                      @click="editRun(item)"
                      ><v-icon
                        class="mr-1"
                        :icon="
                          item.current_permission.indexOf('edit') < 0 &&
                          item.current_permission.indexOf('review') > -1
                            ? 'mdi-eye'
                            : 'mdi-pencil'
                        "
                      ></v-icon
                      >{{
                        (item.current_permission.indexOf('edit') < 0 &&
                          item.current_permission.indexOf('review') > -1) ||
                        study.status_type_id !== 'DRA'
                          ? 'review'
                          : 'edit'
                      }}
                    </v-btn>
                  </p>
                </template>
              </v-data-table>

              <p v-else class="text-center"><em>No run yet</em></p>
              <p
                v-if="
                  study.runTypes.length &&
                  study.current_permission.indexOf('edit') > -1
                   && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')
                "
                class="text-center"
              >
                <template v-if="selectedRuns.length">
                  <v-btn
                    v-if="!deleteRun.status"
                    class="ml-3"
                    color="error"
                    variant="flat"
                    @click="deleteRuns('init')"
                    >delete {{ selectedRuns.length }} selected <span
                      v-if="selectedRuns.length > 1"
                      > Runs</span
                    ><span v-else> Run</span></v-btn
                  >
                  <template v-if="deleteRun.status">
                    <v-btn
                      class="ml-3"
                      color="error"
                      variant="flat"
                      @click="deleteRuns('save')"
                      >confirm deletion of {{ selectedRuns.length }} <span
                        v-if="selectedRuns.length > 1"
                        >Runs</span
                      ><span v-else>Run</span></v-btn
                    >
                    <v-btn
                      class="ml-3"
                      color="secondary"
                      variant="outlined"
                      @click="deleteRuns('cancel')"
                      >cancel</v-btn
                    >
                  </template>
                </template>
              </p>
            </div>
          </div>
        </div>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useRunStore } from '@/stores/runs.js'
import { useExperimentStore } from '@/stores/experiments.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import ModalResource from '@/components/modalResource.vue'
import { mapState } from 'pinia'
import _ from 'lodash'
import moment from 'moment'

export default defineComponent({
  name: 'Runs',
  components: {
    ModalResource,
  },
  props: ['study_id'],
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
          label: '',
        },
        edit: false,
        permissions: [],
        data: {},
        hide_upload: false,
      },
      error: '',
      nav: 'form',
      loaded: false,
      loading: false,
      study_public_id: null,
      uploadedRuns: [],
      defaultTableHeaders: [
        // {
        //         title: 'ID',
        //         value: 'public_id'
        // },
        // {
        // 		title: 'Run type',
        // 		value: 'run_type'
        // },
        {
          title: 'Status',
          value: 'status',
        },
        // {
        //     title: 'Creation date',
        //     value: 'creation_date'
        // },
        {
          title: 'Last update',
          value: 'last_update',
        },
        {
          title: 'Created by',
          value: 'creator_name',
        },
        {
          title: '',
          value: 'actions',
        },
      ],
      tableHeaders: [],
      upload: false,
      run_type: null,
      files: null,
      filesUploading: false,
      deleteRun: { status: false },
      data: {},
      data_schema: null,
      ui_schema: null,
      search: '',
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['study']),
    ...mapState(useSubmissionStore, ['statusTypes']),
    ...mapState(useRunStore, ['runs']),
    ...mapState(useSampleStore, ['samples']),
    ...mapState(useExperimentStore, ['experiments']),
    ...mapState(useSchemaStore, ['schemas']),
  },
  mounted() {
    this.submissionStore = useSubmissionStore()
    this.runStore = useRunStore()
    this.sampleStore = useSampleStore()
    this.experimentStore = useExperimentStore()
    _.forEach(this.defaultTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
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
    close(e) {
      this.resetModal()
      if (e && this.modal.permissions.indexOf('edit') > -1) {
        //Get samples because when create sample via file, new samples are not displayed here. Idem for edition.
        this.getRuns()
      }
    },

    editRun(item) {
      this.run_type = {
        name: item.run_type,
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
        hide_upload: false,
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
              run_id: _.filter(this.runs, (s) => s.id === id)[0].public_id,
            })
          })
        }
        this.runStore
          .deleteRuns(params)
          .then(() => {
            this.$notify({
              title: 'Success',
              text: `${params.length} run${params.length > 1 ? 's' : ''} deleted successfully`,
              type: 'success',
            })
            this.deleteRun.status = false
            this.selectedRuns = []
          })
          .catch((err) => {
            this.deleteRun.status = false
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
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
        hide_upload: false,
      }
    },
    uploadAction() {
      if (this.files) {
        this.filesUploading = true
        let formData = new FormData()
        // files
        let fidx = 0
        for (let file of this.files) {
          fidx++
          formData.append(`file${fidx}`, file, file.name)
        }
        // additional data
        formData.append('nb_files', fidx)
        formData.append('resource_type_id', this.run_type.resource_type_id)
        this.runStore
          .uploadRuns(this.study_public_id, formData)
          .then((uploadedRuns) => {
            const msg = `${uploadedRuns.length} run${uploadedRuns.length > 1 ? 's' : ''} uploaded successfully`
            this.$notify({ title: 'Success', text: msg, type: 'success' })
            this.uploadedRuns = uploadedRuns
            this.getRuns()
            this.filesUploading = false
          })
          .catch((err) => {
            this.filesUploading = false
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
          })
      }
    },
    getRuns() {
      this.loading = true
      if (this.study_public_id) {
        this.runStore
          .getStudyRuns({ study_id: this.study_public_id })
          .then(() => {
            this.loading = false
            this.loaded = true
            this.setTableHeaders()
          })
          .catch((err) =>
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            }),
          )
      } else {
        this.runStore
          .getRuns()
          .then(() => {
            this.loaded = true
            this.setTableHeaders()
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
    setTableHeaders() {
      this.tableHeaders = []
      let runTypes = []
      _.forEach(this.runs, (e) => {
        if (runTypes.indexOf(e.run_type) === -1) {
          runTypes.push(e.run_type)
        }
      })
      const schemaStore = useSchemaStore()
      schemaStore.getSchemas().then((schemas) => {
        _.forEach(runTypes, (runType) => {
          if (schemas[runType] !== undefined) {
            if (schemas[runType].data_schema.required !== undefined) {
              _.forEach(schemas[runType].data_schema.required, (d) => {
                if (this.tableHeaders.indexOf(d) == -1)
                  this.tableHeaders.push({
                    headerProps: { style: 'font-weight: 600' },
                    value: d,
                    title: (d + '')
                      .replace(/_/g, ' ')
                      .replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                        return $1.toUpperCase()
                      }),
                  })
              })
            }
          }
        })
        for (let i = 0; i < this.defaultTableHeaders.length; i++) {
          this.tableHeaders.push(this.defaultTableHeaders[i])
        }
      })
    },

    getSamples() {
      if (this.study_public_id) {
        this.sampleStore
          .getStudySamples({ study_id: this.study_public_id })
          .then(() => {
            this.loaded = true
          })
          .catch((err) =>
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            }),
          )
      } else {
        this.runStore
          .getRuns()
          .then(() => {
            this.loaded = true
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
    getExperiments() {
      if (this.study_public_id) {
        this.experimentStore
          .getStudyExperiments({ study_id: this.study_public_id })
          .then(() => {
            this.loaded = true
          })
          .catch((err) =>
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            }),
          )
      } else {
        this.experimentStore
          .getExperiments()
          .then(() => {
            this.loaded = true
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
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
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
    getStatusClass(status_type) {
      let idx = _.findIndex(this.statusTypes, (sT) => {
        return sT.name === status_type
      })
      if (idx > -1) {
        return this.statusTypes[idx].class_name
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
              label: this.experiments[idx].experiment_type,
            },
            edit: false,
            permissions: ['read'],
            data: this.experiments[idx].properties,
            hide_upload: true,
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
              label: this.samples[idx].sample_type,
            },
            edit: false,
            permissions: ['read'],
            data: this.samples[idx].properties,
            hide_upload: true,
          }
        }
      }
    },
  },
})
</script>

<style>
@import '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css';
</style>
