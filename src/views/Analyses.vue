<template>
  <div class="Analyses">
    <v-sheet min-height="70vh" rounded="lg">
      <v-dialog v-model="modal.status" width="95%">
        <modal-resource
          cas="analysis"
          :study_id="study_public_id"
          :type="modal.type"
          :input_data="modal.data"
          :permissions="modal.permissions"
          :title="modal.title"
          :edit="modal.edit"
          :hide_upload="modal.hide_upload"
          @closeModal="close($event)"
        ></modal-resource>
      </v-dialog>

      <v-container>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <h1 v-if="!study_public_id" class="text-center">Analyses</h1>
        <p v-if="loading" class="text-center mt-3">
          <em>Loading analyses</em> <br />
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </p>
        <div v-else>
          <div v-if="study_public_id">
            <h3
              class="text-center mb-5 d-flex align-center pe-2"
            >
              <v-icon icon="mdi-graphql"></v-icon>&nbsp;{{
                analyses.length
              }}
              Analys<span v-if="analyses.length > 1">es</span
              ><span v-else>is</span>
              <span v-if="selectedAnalyses.length">
                - {{ selectedAnalyses.length }} selected</span
              >
              <v-spacer></v-spacer>
              <v-text-field
                v-if="analyses.length && !loading"
                v-model="search"
                label="Search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
              ></v-text-field>
              <v-btn
                v-if="study.analysisTypes.length && study.current_permission.indexOf('edit') > -1 && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')"
                v-for="analysisType in study.analysisTypes"
                :key="analysisType.resource_type_id"
                variant="flat"
                color="primary"
                class="ml-2"
                @click="createAnalysis(analysisType)"
              >
                create new
                {{ analysisType.label.replace(/([A-Z])/g, ' $1').trim() }}...
              </v-btn>
              
            </h3>

            <v-data-table
              fixed-header
              height="calc(100vh - 550px)"
            
              v-if="analyses.length"
              v-model="selectedAnalyses"
              :items="analyses"
              item-value="id"
              :items-per-page="25"
              :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, -1],
              }"
              :headers="tableHeaders"
              :search="search"
              :loading="loading"
              show-select
              density="compact"
            >
              <template #header.sample_public_ids="{}"
                >Samples</template
              >
              <template #header.molecularexperiment_public_ids="{}"
                >Experiments</template
              >
              <template #item.properties.title="{ item }">
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

              <template #item.sample_public_ids="{ item }">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      color="info"
                      v-bind="props"
                      size="small"
                      variant="outlined"
                    >
                      {{ item.properties.sample_public_ids.length }}
                      sample<template
                        v-if="
                          item.properties.sample_public_ids.length > 1
                        "
                        >s</template
                      ><v-icon icon="mdi-menu-down" />
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="(public_id, index) in item.properties
                        .sample_public_ids"
                      :key="index"
                      :value="public_id"
                    >
                      <v-list-item-title
                        @click="showResource(public_id, 'Sample')"
                        >{{ public_id }}</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <template #item.molecularexperiment_public_ids="{ item }">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      color="info"
                      v-bind="props"
                      size="small"
                      variant="outlined"
                      open-on-focus
                    >
                      {{
                        item.properties.molecularexperiment_public_ids.length
                      }}
                      experiment<template
                        v-if="
                          item.properties.molecularexperiment_public_ids
                            .length > 1
                        "
                        >s</template
                      ><v-icon icon="mdi-menu-down" />
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="(public_id, index) in item.properties
                        .molecularexperiment_public_ids"
                      :key="index"
                      :value="public_id"
                    >
                      <v-list-item-title
                        @click="showResource(public_id, 'molecularExperiment')"
                        >{{ public_id }}</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <template #item.sdafile_public_ids="{ item }">
                <v-chip size="small">
                  {{ item.properties.sdafile_public_ids.length }} file<template
                    v-if="item.properties.sdafile_public_ids.length > 1"
                    >s</template
                  >
                  <v-tooltip activator="parent" location="top"
                    ><span
                      v-html="
                        item.properties.sdafile_public_ids.join('<br />')
                      "
                  /></v-tooltip>
                </v-chip>
              </template>

              <template #item.creation_date="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #item.last_update="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #item.analysis_type="{ value }">
                <v-chip size="small">
                  {{ value.replace(/([^A-Z])/g, '').trim() }}
                  <v-tooltip activator="parent" location="top"
                    ><span v-html="value.replace(/([A-Z])/g, ' $1').trim()"
                  /></v-tooltip>
                </v-chip>
              </template>
              <template #item.properties.experiment_types="{ item }">
                <v-chip size="small">
                  {{ item.properties.experiment_types.length }} type<template
                    v-if="item.properties.experiment_types.length > 1"
                    >s</template
                  >
                  <v-tooltip activator="parent" location="top"
                    ><span
                      v-html="item.properties.experiment_types.join('<br />')"
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
              <template #item.status="{ value }">
                <v-chip :color="getStatusClass(value)" size="small">{{
                  value
                }}</v-chip>
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
                    @click="editAnalysis(item)"
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

            <p v-else-if="!loading" class="text-center">
              <em>No analysis yet</em>
            </p>
            <p v-if="study.analysisTypes.length && study.current_permission.indexOf('edit') > -1 && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')" class="text-center">
              <template v-if="selectedAnalyses.length">
                <v-btn
                  v-if="!deleteAnalysis.status"
                  class="ml-3"
                  color="error"
                  variant="flat"
                  @click="deleteAnalyses('init')"
                  >delete {{ selectedAnalyses.length }} selected <span
                    v-if="selectedAnalyses.length > 1"
                    >Analyses</span
                  ><span v-else>Analysis</span></v-btn
                >
                <template v-if="deleteAnalysis.status">
                  <v-btn
                    class="ml-3"
                    color="error"
                    variant="flat"
                    @click="deleteAnalyses('save')"
                    >confirm deletion of
                    {{ selectedAnalyses.length }} <span
                      v-if="selectedAnalyses.length > 1"
                      >Analyses</span
                    ><span v-else>Analysis</span></v-btn
                  >
                  <v-btn
                    class="ml-3"
                    color="secondary"
                    variant="outlined"
                    @click="deleteAnalyses('cancel')"
                    >cancel</v-btn
                  >
                </template>
              </template>
            </p>
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
import { useAnalysisStore } from '@/stores/analyses.js'
import { useExperimentStore } from '@/stores/experiments.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import ModalResource from '@/components/modalResource.vue'
import { mapState } from 'pinia'
import _ from 'lodash'
import moment from 'moment'

export default defineComponent({
  name: 'Analyses',
  components: {
    ModalResource
  },
  props: ['study_id'],
  data() {
    return {
      analysisStore: null,
      sampleStore: null,
      experimentStore: null,
      selectedAnalyses: [],
      modal: {
        status: false,
        title: null,
        data: {},
        type: { name: '', label: '' },
        edit: null,
      },
      error: '',
      nav: 'form',
      loaded: false,
      study_public_id: null,
      uploadedAnalyses: [],
      defaultTableHeaders: [
        // {
        //         title: 'ID',
        //         value: 'public_id'
        // },
        // {
        // 		title: 'Analysis type',
        // 		value: 'analysis_type'
        // },
        {
          title: 'Samples',
          value: 'sample_public_ids',
        },
        {
          title: 'Experiments',
          value: 'molecularexperiment_public_ids',
        },
        {
          title: 'Files',
          value: 'sdafile_public_ids',
        },
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
      loading: true,
      analysis_type: null,
      files: null,
      filesUploading: false,
      deleteAnalysis: { status: false },
      data: {},
      data_schema: null,
      ui_schema: null,
      search: '',
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['study']),
    ...mapState(useAnalysisStore, ['analyses']),
    ...mapState(useSampleStore, ['samples']),
    ...mapState(useExperimentStore, ['experiments']),
    ...mapState(useSchemaStore, ['schemas']),
    ...mapState(useSubmissionStore, ['statusTypes']),
  },
  mounted() {
    this.submissionStore = useSubmissionStore()
    this.analysisStore = useAnalysisStore()
    this.sampleStore = useSampleStore()
    this.experimentStore = useExperimentStore()
    _.forEach(this.defaultTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
    if (this.study) {
      this.submissionStore.getStatusTypes()
      this.study_public_id = this.study.public_id
      this.submissionStore.getStudyFiles().then(() => {
        this.getAnalyses()
        this.getSamples()
        this.getExperiments()
      })
    } else {
      const study_id = this.$route.params.study_id || this.study_id
      this.submissionStore.getStudy(study_id).then(() => {
        this.submissionStore.getStatusTypes()
        this.submissionStore.getStudyFiles().then(() => {
          this.study_public_id = this.study.public_id
          this.getAnalyses()
          this.getSamples()
          this.getExperiments()
        })
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

    editAnalysis(item) {
      this.analysis_type = { name: item.analysis_type }
      // this.getAnalysisSchemas(item.analysis_type);
      this.data = JSON.parse(JSON.stringify(item.properties))
      let title =
        item.current_permission.indexOf('edit') > -1
          ? 'Update'
          : 'Review' +
            ' ' +
            item.analysis_type.replace(/([A-Z])/g, ' $1') +
            " '" +
            item.title +
            "'"
      this.nav = 'form'
      this.modal = {
        status: true,
        title: title,
        edit: item.analysis_public_id,
        type: { name: item.analysis_type, label: item.analysis_type },
        permissions: item.current_permission,
        data: this.data,
      }
    },
    deleteAnalyses(action) {
      if (action == 'init' || action == 'cancel') {
        this.deleteAnalysis.status = !this.deleteAnalysis.status
      } else {
        let params
        if (this.modal.edit) {
          params = this.modal.edit
        } else if (this.selectedAnalyses) {
          params = []
          _.forEach(this.selectedAnalyses, (id) => {
            params.push({
              study_id: this.study_id,
              analysis_id: _.filter(this.analyses, (s) => s.id === id)[0]
                .public_id,
            })
          })
        }
        this.analysisStore
          .deleteAnalyses(params)
          .then(() => {
            this.$notify({
              title: 'Success',
              text: `${params.length} ${params.length > 1 ? 'analyses' : 'analysis'} deleted successfully`,
              type: 'success',
            })
            this.deleteAnalysis.status = false
            this.selectedAnalyses = []
          })
          .catch((err) => {
            this.deleteAnalysis.status = false
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
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
        this.getAnalyses()
      }
    },
    createAnalysis(analysis_type) {
      this.analysis_type = analysis_type
      // this.getAnalysisSchemas(analysis_type.label);
      let title = 'Create ' + analysis_type.label.replace(/([A-Z])/g, ' $1')
      this.modal = {
        status: true,
        title: title,
        edit: false,
        type: this.analysis_type,
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
        formData.append('resource_type_id', this.analysis_type.resource_type_id)
        this.analysisStore
          .uploadAnalyses(this.study_public_id, formData)
          .then((uploadedAnalyses) => {
            const msg = `${uploadedAnalyses.length} analysis${uploadedAnalyses.length > 1 ? 's' : ''} uploaded successfully`
            this.$notify({ title: 'Success', text: msg, type: 'success' })
            this.uploadedAnalyses = uploadedAnalyses
            this.getAnalyses()
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
    getAnalyses() {
      this.loading = true
      if (this.study_public_id) {
        this.analysisStore
          .getStudyAnalyses({ study_id: this.study_public_id })
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
        this.analysisStore
          .getAnalyses()
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
      }
    },
    setTableHeaders() {
      this.tableHeaders = []
      let analysisTypes = []
      _.forEach(this.analyses, (e) => {
        if (analysisTypes.indexOf(e.analysis_type) === -1) {
          analysisTypes.push(e.analysis_type)
        }
      })
      const schemaStore = useSchemaStore()
      schemaStore.getSchemas().then((schemas) => {
        _.forEach(analysisTypes, (analysisType) => {
          if (schemas[analysisType] !== undefined) {
            if (
              schemas[analysisType].ui_schema.displayedElements !== undefined
            ) {
              _.forEach(
                schemas[analysisType].ui_schema.displayedElements,
                (d) => {
                  const label = d.split('.').pop()
                  if (this.tableHeaders.indexOf(label) == -1)
                    this.tableHeaders.push({
                      headerProps: { style: 'font-weight: 600' },
                      value: d,
                      title: (label + '')
                        .replace(/_/g, ' ')
                        .replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                          return $1.toUpperCase()
                        }),
                      sortable: true,
                    })
                },
              )
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
        this.analysisStore
          .getAnalyses()
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
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
    },
    getAnalysisSchemas(analysis_type) {
      const schemaStore = useSchemaStore()
      if (this.samples.length) {
        schemaStore.getSchemas().then((schemas) => {
          if (schemas[analysis_type] !== undefined) {
            this.data_schema = schemas[analysis_type].data_schema
            this.ui_schema = schemas[analysis_type].ui_schema
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