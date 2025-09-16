<template>
  <div class="Experiments">
    <v-sheet min-height="70vh" rounded="lg">
      <v-dialog
        v-model="modal.status"
        width="95%"
        @afterLeave="experiment_type = null"
      >
        <modal-resource
          cas="experiment"
          :study_id="study_id"
          :type="modal.type"
          :input_data="modal.data"
          :hide_upload="true"
          :title="modal.title"
          :edit="modal.edit"
          :permissions="modal.permissions"
          @closeModal="close($event)"
        ></modal-resource>
      </v-dialog>
      <v-container :fluid="true">
        <p v-if="error" class="text-danger">{{ error }}</p>
        <h1 v-if="!study_id" class="text-center">Experiments</h1>
        <p v-if="!loaded" class="text-center mt-3">
          <em>Loading experiments...</em> <br />
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </p>
        <div v-else>
          <div v-if="study_id">
            <h3
              class="text-center mb-5 d-flex align-center pe-2"
            >
              <v-icon icon="mdi-eyedropper"></v-icon>&nbsp;{{
                experiments.length
              }}
              Experiment<span v-if="experiments.length > 1">s</span>
              <span v-if="selectedExperiments.length">
                - {{ selectedExperiments.length }} selected</span
              >
              <v-spacer></v-spacer>
              <v-text-field
                v-if="!upload && experiments.length"
                v-model="search"
                label="Search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
              ></v-text-field>
              <template v-if="!deleteExperiment.status && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')">
                <span
                  v-for="type in study.experimentTypes"
                  :key="type.resource_type_id"
                >
                  <v-btn
                    variant="flat"
                    color="primary"
                    class="ml-2"
                    @click="createExperiment(type)"
                    >create new
                    {{ type.label.replace(/([A-Z])/g, ' $1').trim() }}</v-btn
                  >
                </span>
                <!-- <v-btn @click="upload=true" class="ml-3" size="small" color="teal" variant="outlined">upload experiments via file</v-btn> -->
              </template>
              
            </h3>
            <template v-if="!upload">
              <v-data-table
                fixed-header
                height="calc(100vh - 550px)"
                v-if="experiments.length"
                v-model="selectedExperiments"
                :items="experimentTableItems"
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
                <template #item.title="{ item }">
                  <strong>{{ item.title }}</strong> <br />
                  {{ getDescription(item) }}
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

                <template #item.creation_date="{ value }">
                  {{ formatDate(value) }}
                </template>
                <template #item.last_update="{ value }">
                  {{ formatDate(value) }}
                </template>
                <template #item.creator_name="{ value }">
                  <v-chip color="blue" size="small">
                    {{ value.replace(/([^A-Z])/g, '').trim() }}
                    <v-tooltip activator="parent" location="top"
                      ><span v-html="value.replace(/([A-Z])/g, ' $1').trim()"
                    /></v-tooltip>
                  </v-chip>
                </template>

                <template #item.actions="{ item }">
                  <p class="text-center" style="white-space: nowrap">
                    <v-btn
                      size="small"
                      style="display: inline-flex; margin-bottom: 1px"
                      color="primary"
                      variant="outlined"
                      @click="editExperiment(item)"
                      :disabled="
                        item.current_permission &&
                        item.current_permission.indexOf('edit') < 0 &&
                        item.current_permission.indexOf('review') < 0
                      "
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
                      }}</v-btn
                    >
                  </p>
                </template>
              </v-data-table>
              <p v-else class="text-center"><em>No experiment yet</em></p>

              <p
                v-if="
                  study !== undefined &&
                  study.experimentTypes !== undefined &&
                  study.experimentTypes.length
                "
                class="text-center"
              >
                <template v-if="selectedExperiments.length">
                  <v-btn
                    v-if="!deleteExperiment.status"
                    class="ml-3"
                    color="error"
                    variant="flat"
                    @click="deleteExperiments('init')"
                    >delete {{ selectedExperiments.length }} selected
                    <span v-if="selectedExperiments.length > 1"
                      >experiments</span
                    ><span v-else>experiment</span></v-btn
                  >
                  <template v-if="deleteExperiment.status">
                    <v-btn
                      class="ml-3"
                      color="error"
                      variant="flat"
                      @click="deleteExperiments('save')"
                      >confirm deletion of
                      {{ selectedExperiments.length }} <span
                        v-if="selectedExperiments.length > 1"
                        >experiments</span
                      ><span v-else>experiment</span></v-btn
                    >
                    <v-btn
                      class="ml-3"
                      color="secondary"
                      variant="outlined"
                      @click="deleteExperiments('cancel')"
                      >cancel</v-btn
                    >
                  </template>
                </template>
              </p>
            </template>
          </div>
        </div>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import useClipboard from 'vue-clipboard3'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import { useExperimentStore } from '@/stores/experiments.js'
import ModalResource from '@/components/modalResource.vue'
import { mapState } from 'pinia'
import _ from 'lodash'
import moment from 'moment'

export default defineComponent({
  name: 'Experiments',
  components: {
    ModalResource,
  },
  data() {
    return {
      experimentStore: null,
      selectedExperiments: [],
      modal: { status: false, title: null },
      error: '',
      loaded: false,
      study_id: null,
      // experiments: [],
      uploadedExperiments: [],
      tableHeaders: [],
      defaultTableHeaders: [
        // {
        //     title: 'ID',
        //     value: 'public_id',
        //                     sortable: true
        // },
        // {
        //     title: 'Creation date',
        //     value: 'creation_date',
        //                     sortable: true
        // },
        {
          title: 'Last update',
          value: 'last_update',
          sortable: true,
        },
        {
          title: 'Created by',
          value: 'creator_name',
          sortable: true,
        },
        {
          title: '',
          value: 'actions',
        },
      ],
      showForm: false,
      upload: false,
      experiment_type: null,
      deleteExperiment: { status: false },
      data: {},
      search: '',
      data_schema: null,
      ui_schema: null,
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
  },
  mounted() {
    const sampleStore = useSampleStore()
    const submissionStore = useSubmissionStore()
    _.forEach(this.defaultTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
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
    async copy(msg) {
      const { toClipboard } = useClipboard()
      try {
        await toClipboard(msg)
        this.$notify({ type: 'success', text: 'Public ID copied to clipboard' })
      } catch (e) {
        console.error(e)
      }
    },
    getDescription(item) {
      let desc = ''
      _.forEach(item, (v, k) => {
        if (k.indexOf('description') > -1) desc = v
      })
      return desc
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
                .public_id,
            })
          })
        }
        this.experimentStore
          .deleteExperiments(params)
          .then(() => {
            this.$notify({
              title: 'Success',
              text: `${params.length} experiment${params.length > 1 ? 's' : ''} deleted successfully`,
              type: 'success',
            })
            this.deleteExperiment.status = false
            this.selectedExperiments = []
          })
          .catch((err) => {
            this.deleteExperiment.status = false
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
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
        hide_upload: false,
      }
    },
    editExperiment(experiment) {
      this.data = JSON.parse(JSON.stringify(experiment.properties))
      this.experiment_type = { label: experiment.experiment_type }
      this.getExperimentSchemas(experiment.experiment_type)
      let title =
        'Update ' +
        experiment.experiment_type.replace(/([A-Z])/g, ' $1') +
        " '" +
        experiment.properties.design_description +
        "'"
      this.modal = {
        status: true,
        title: title,
        type: {
          name: experiment.experiment_type,
          label: experiment.experiment_type,
        },
        data: this.data,
        edit: experiment.public_id,
        permissions: experiment.current_permission,
      }
      // this.showForm = true
    },
    getExperiments() {
      if (this.study_id) {
        this.experimentStore
          .getStudyExperiments({ study_id: this.study_id })
          .then(() => {
            this.loaded = true
            this.setTableHeaders()
          })
          .catch((err) => {
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
          })
      } else {
        this.experimentStore
          .getExperiments()
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
      let experimentTypes = []
      _.forEach(this.experiments, (e) => {
        if (experimentTypes.indexOf(e.experiment_type) === -1) {
          experimentTypes.push(e.experiment_type)
        }
      })
      const schemaStore = useSchemaStore()
      schemaStore.getSchemas().then((schemas) => {
        _.forEach(experimentTypes, (experimentType) => {
          if (schemas[experimentType] !== undefined) {
            if (schemas[experimentType].data_schema.required !== undefined) {
              _.forEach(schemas[experimentType].data_schema.required, (d) => {
                if (this.tableHeaders.indexOf(d) == -1) {
                  if (
                    d.indexOf('description') === -1 ||
                    schemas[experimentType].data_schema.required.indexOf(
                      'title',
                    ) === -1
                  ) {
                    this.tableHeaders.push({
                      headerProps: { style: 'font-weight: 600' },
                      value: d,
                      title: (d + '')
                        .replace(/_/g, ' ')
                        .replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                          return $1.toUpperCase()
                        }),
                      sortable: true,
                    })
                  }
                }
              })
            }
          }
        })
        for (let i = 0; i < this.defaultTableHeaders.length; i++) {
          this.tableHeaders.push(this.defaultTableHeaders[i])
        }
      })
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
          experiment_type: this.experiment_type.label,
        },
      }
      this.experimentStore
        .editExperiment(param)
        .then(() => {
          _this.showForm = false
          _this.data = {}
          _this.$notify({
            title: 'Experiment registered successfully',
            type: 'success',
          })
        })
        .catch((err) => {
          this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          })
        })
    },
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
    },
    getExperimentSchemas(experiment_type) {
      const schemaStore = useSchemaStore()
      schemaStore.getSchemas().then((schemas) => {
        if (schemas[experiment_type] !== undefined) {
          this.data_schema = schemas[experiment_type].data_schema
          this.ui_schema = schemas[experiment_type].ui_schema
        }
      })
    },
  },
})
</script>
