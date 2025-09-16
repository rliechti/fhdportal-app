<template>
  <div class="Datasets">
    <v-sheet min-height="70vh" rounded="lg">
      <v-dialog v-model="modal.status" width="95%">
        <modal-resource
          cas="dataset"
          :study_id="study_public_id"
          :type="dataset_type"
          :hide_upload="true"
          :permissions="modal.permissions"
          :input_data="modal.data"
          :title="modal.title"
          :edit="modal.edit"
          @closeModal="close($event)"
        ></modal-resource>
      </v-dialog>
      <v-container>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <h1 v-if="!study_public_id" class="text-center">Datasets</h1>
        <p v-if="!loaded" class="text-center mt-3">
          <em>Loading datasets</em> <br />
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
              <v-icon icon="mdi-file-document"></v-icon> &nbsp;{{
                datasets.length
              }}
              Dataset<span v-if="datasets.length > 1">s</span>
              <span v-if="selectedDatasets.length">
                - {{ selectedDatasets.length }} selected</span
              >
              <v-spacer></v-spacer>
              <v-text-field
                v-if="datasets.length"
                v-model="search"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
                density="compact"
              ></v-text-field>
              <!-- <v-spacer></v-spacer> -->
              <v-btn
              v-if="
                study.datasetTypes.length &&
                study.current_permission.indexOf('edit') > -1 &&
                (study.status_type_id === 'DRA'||study.status_type_id === 'REV')
              "
              v-for="datasetType in study.datasetTypes"
              :key="datasetType.resource_type_id"
              variant="flat"
              color="primary"
              class="ml-2"
              @click="createDataset(datasetType)"
              >
              create new
              {{ datasetType.label.replace(/([A-Z])/g, ' $1').trim() }}...
            </v-btn>
            </h3>

            <v-data-table
              fixed-header
              height="calc(50vh - 350px)"
              v-if="datasets.length"
              v-model="selectedDatasets"
              :items="datasets"
              item-value="id"
              :items-per-page="25"
              :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, -1],
              }"
              :headers="tableHeaders"
              :search="search"
              :filter-keys="['title']"
              show-select
              density="compact"
              :hover="true"
            >
              <template #header.sample_public_id="{}">Sample</template>
              <template #header.molecularexperiment_public_id="{}"
                >Experiment</template
              >
              <template #item.released_date="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #item.last_update="{ value }">
                {{ formatDate(value) }}
              </template>
              <template #item.status="{ value }">
                <v-chip :color="getStatusClass(value)" size="small">{{
                  value
                }}</v-chip>
              </template>
              <template #item.title="{ item }">
                {{ item.title }}
                <v-chip
                  variant="text"
                  class="text-info"
                  size="small"
                  @click="copy(item.public_id)"
                >
                  <v-icon icon="mdi-information"></v-icon>
                  <v-tooltip activator="parent" location="top"
                    >{{ item.public_id }}
                  </v-tooltip>
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
                    @click="editDataset(item)"
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
                  <!-- <v-btn :disabled="item.current_permission.indexOf('edit')<0" size="small" style="display:inline-flex;margin-bottom:1px" color="info" variant="outlined" @click="selectPolicy(item)"><v-icon class="mr-1" icon="mdi-police-badge"></v-icon>Policy {{item.properties.policy_public_id}}</v-btn> -->
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

                    <v-card v-if="showPolicies">
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
                      <v-container  v-if="
                        study.datasetTypes.length &&
                        study.current_permission.indexOf('edit') > -1 &&
                        (study.status_type_id === 'DRA'||study.status_type_id === 'REV')
                      ">
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
                      <v-row v-if="item.properties.policy_id">
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
                                  selectedPolicies[item.id].description
                                }}
                              </div>
                            </v-card-text>

                            <v-card-actions
                            >
                              <v-btn
                                color="deep-purple-accent-4"
                                variant="text"
                                @click="getPolicyForm(item.id, item.properties.policy_id,'daa-form')"
                              >
                              <ListCheckIcon />
                              Preview DAA form
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                      <div>&nbsp;</div>
                      <v-card-actions  v-if="
                        study.datasetTypes.length &&
                        study.current_permission.indexOf('edit') > -1 &&
                        (study.status_type_id === 'DRA'||study.status_type_id === 'REV')
                        ">
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
                          >Set policy</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-dialog v-model="modalPolicy.status"  max-width="800">
                    <modal-policy-form :dataset_id="modalPolicy.dataset_id" :policy_id="modalPolicy.policy_id" :form="modalPolicy.form" @closePolicyModal="modalPolicy.status=false" :readonly="true"></modal-policy-form>
                  </v-dialog>
                </p>
              </template>
            </v-data-table>

            <p v-else class="text-center"><em>No dataset yet</em></p>
            <p
              v-if="
                study.datasetTypes.length &&
                study.current_permission.indexOf('edit') > -1 &&
                (study.status_type_id === 'DRA'||study.status_type_id === 'REV')
              "
              class="text-center"
            >
              
              <template v-if="selectedDatasets.length">
                <v-btn
                  v-if="!deleteDataset.status"
                  class="ml-3"
                  color="error"
                  variant="flat"
                  @click="deleteDatasets('init')"
                  >delete {{ selectedDatasets.length }} selected <span
                    v-if="selectedDatasets.length > 1"
                    >Datasets</span
                  ><span v-else>Dataset</span></v-btn
                >
                <template v-if="deleteDataset.status">
                  <v-btn
                    class="ml-3"
                    color="error"
                    variant="flat"
                    @click="deleteDatasets('save')"
                    >confirm deletion of
                    {{ selectedDatasets.length }} <span
                      v-if="selectedDatasets.length > 1"
                      >Datasets</span
                    ><span v-else>Dataset</span></v-btn
                  >
                  <v-btn
                    class="ml-3"
                    color="secondary"
                    variant="outlined"
                    @click="deleteDatasets('cancel')"
                    >cancel</v-btn
                  >
                </template>
              </template>
              <v-btn
                v-if="isReadyForSubmission"
                variant="flat"
                color="success"
                class="ml-2"
                @click="submitDialog = true"
                :disabled="submissionInProgress"
              >
                {{
                  submissionInProgress
                    ? 'Submission in progress...'
                    : 'Submit study...'
                }}
              </v-btn>
              <h4 class="text-center text-warning" v-else-if="!allDatasetsWithPolicy">Please assign a policy to every dataset by using the 'policy' button</h4>
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
                      @click="submitStudy"
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
            </p>
            <p class="text-center text-info" v-else-if="study.status_type_id==='SUB'">Submission under review by the Data Access Commitee...</p>
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
import { useDatasetStore } from '@/stores/datasets.js'
import { useDacStore } from '@/stores/dacs.js'
import { useExperimentStore } from '@/stores/experiments.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import ModalResource from '@/components/modalResource.vue'
import ModalPolicyForm from '@/components/modalPolicyForm.vue'
import { mapState } from 'pinia'
import _ from 'lodash'
import moment from 'moment'

export default defineComponent({
  name: 'Datasets',
  components: {
    ModalResource,
    ModalPolicyForm
  },
  props: ['study_id'],
  data() {
    return {
      datasetStore: null,
      analysisStore: null,
      sampleStore: null,
      experimentStore: null,
      selectedDatasets: [],
      modal: {
        status: false,
        title: null,
        edit: null,
        data: {},
        permissions: [],
      },
      error: '',
      nav: 'form',
      loaded: false,
      study_public_id: null,
      uploadedDatasets: [],
      defaultTableHeaders: [
        // {
        //         title: 'ID',
        //         value: 'public_id'
        // },
        // {
        //         title: 'Dataset type',
        //         value: 'dataset_type'
        // },
        {
          title: 'Title',
          value: 'title',
        },
        {
          title: 'Status',
          value: 'status',
        },
        {
          title: 'Last update',
          value: 'last_update',
        },
        {
            title: 'Released date',
            value: 'released_date'
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
      dataset_type: null,
      files: null,
      filesUploading: false,
      deleteDataset: { status: false },
      data: {},
      data_schema: null,
      ui_schema: null,
      search: '',
      showPolicies: {},
      selectedPolicies: {},
      submitDialog: false,
      submissionInProgress: false,
      modalPolicy: {
        status: false, 
        dataset_id: null,
        policy_id:null,
        form: null
      }
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['study']),
    ...mapState(useDatasetStore, ['datasets']),
    ...mapState(useAnalysisStore, ['analyses']),
    ...mapState(useSampleStore, ['samples']),
    ...mapState(useSubmissionStore, ['statusTypes']),
    ...mapState(useExperimentStore, ['experiments']),
    ...mapState(useSchemaStore, ['schemas']),
    ...mapState(useDacStore, ['dacs']),
    policies() {
      let items = []
      _.forEach(this.dacs, (d) => {
        // items.push({title: d.title, disabled: true})
        items.push({ header: d.name })
        _.forEach(d.policies, (p) => {
          items.push({ title: p.title, value: p })
        })
      })
      return items
    },
    allDatasetsWithPolicy(){
      let isReady = true
      _.forEach(this.datasets, (d) => {
        if (!d.policy_id) {
          isReady = false
        }
      })
      return isReady;
    },
    isReadyForSubmission() {
      if (!this.study) return false
        if (!this.datasets.length) return false
      if (
        this.study.status_type_id !== 'DRA' &&
        this.study.status_type_id !== 'REV'
      )
      return false
      return this.allDatasetsWithPolicy
    },
  },
  mounted() {
    this.submissionStore = useSubmissionStore()
    this.analysisStore = useAnalysisStore()
    this.datasetStore = useDatasetStore()
    this.sampleStore = useSampleStore()
    this.dacStore = useDacStore()
    this.experimentStore = useExperimentStore()
    _.forEach(this.defaultTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
    if (this.study) {
      this.study_public_id = this.study.public_id
      this.submissionStore.getStudyFiles().then(() => {
        this.getAnalyses()
        this.getSamples()
        this.getExperiments()
        this.dacStore.getDacs().then(() => {
          this.getDatasets()          
        })
      })
    } else {
      const study_id = this.$route.params.study_id || this.study_id
      this.submissionStore.getStudy(study_id).then(() => {
        this.submissionStore.getStudyFiles().then(() => {
          this.study_public_id = this.study.public_id
          
          this.getSamples()
          this.getExperiments()
          this.dacStore.getDacs().then(() => {
            this.getDatasets()  
          })
        })
      })
    }
  },
  methods: {
    updatePolicy(item) {
      const idx = _.findIndex(this.policies, (p) => {
        return (
          p.value !== undefined &&
          p.value.id === item.properties.policy_id
        )
      })
      if (idx > -1) {
        this.selectedPolicies[item.id] = this.policies[idx].value
      }
    },
    setDatasetPolicy(item, action) {
      if (action && item.properties.policy_id !== undefined) {
        this.datasetStore
          .setPolicy({
            study_id: this.study_public_id,
            dataset_id: item.id,
            policy_id: item.properties.policy_id,
          })
          .then(() => {
            this.$notify({
              title: 'Policy attached successfully',
              type: 'success',
            })
            this.showPolicies[item.id] = false
          })
          .catch((err) => {
            this.$notify({ title: err, type: 'danger' })
            this.showPolicies[item.id] = false
          })
      } else if (!action) {
        this.datasetStore
          .setPolicy({
            study_id: this.study_public_id,
            dataset_id: item.id,
            policy_id: null
          })
          .then(() => {
            this.$notify({
              title: 'Policy removed successfully',
              type: 'success',
            })
            this.showPolicies[item.id] = false
          })
          .catch((err) => {
            this.$notify({ title: err, type: 'danger' })
            this.showPolicies[item.id] = false
          })
      }
    },
    getPolicyIcon(item) {
      if (item.policy_status === 'pending') return 'mdi-clock-alert-outline'
      return ''
    },
    getPolicyClass(item) {
      if (!item.policy_id) return "warning"
      if (item.policy_status === 'draft') return 'secondary'
      if (item.policy_status === 'pending') return 'warning'
      if (item.policy_status === 'valid') return 'success'
      return ''
    },
    isSelected(value) {
      return value && this.policies.includes(value)
    },
    clear() {
      this.selectedPolicies = {}
    },
    async copy(msg) {
      const { toClipboard } = useClipboard()
      try {
        await toClipboard(msg)
        this.$notify({ type: 'success', text: 'Public ID copied to clipboard' })
      } catch (e) {
        console.error(e)
      }
    },
    editDataset(item) {
      this.dataset_type = { name: item.dataset_type }
      this.getDatasetSchemas(item.dataset_type)
      this.data = JSON.parse(JSON.stringify(item.properties))
      let title =
        item.current_permission.indexOf('edit') > -1
          ? 'Update'
          : 'Review' +
            ' ' +
            item.dataset_type.replace(/([A-Z])/g, ' $1') +
            " '" +
            item.title +
            "'"
      this.nav = 'form'
      this.modal = {
        status: true,
        title: title,
        edit: item.public_id,
        data: this.data,
        permissions: item.current_permission,
      }
    },
    deleteDatasets(action) {
      if (action == 'init' || action == 'cancel') {
        this.deleteDataset.status = !this.deleteDataset.status
      } else {
        let params
        if (this.modal.edit) {
          params = {
            study_id: this.study_public_id,
            dataset_id: this.modal.edit,
          }
        } else if (this.selectedDatasets) {
          params = []
          _.forEach(this.selectedDatasets, (id) => {
            params.push({
              study_id: this.study_public_id,
              dataset_id: _.filter(this.datasets, (s) => s.id === id)[0]
                .public_id,
            })
          })
        }
        this.datasetStore
          .deleteDatasets(params)
          .then(() => {
            this.$notify({
              title: 'Success',
              text: `${params.length} dataset${params.length > 1 ? 's' : ''} deleted successfully`,
              type: 'success',
            })
            this.deleteDataset.status = false
            this.selectedDatasets = []
          })
          .catch((err) => {
            this.deleteDataset.status = false
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
          })
      }
    },
    close(e) {
      this.modal = {
        status: false,
        title: null,
        data: {},
        permissions: [],
        edit: null,
      }
      if (e) {
        //Get samples because when create sample via file, new samples are not displayed here. Idem for edition.
        this.getDatasets()
      }
    },
    createDataset(dataset_type) {
      this.dataset_type = dataset_type
      this.getDatasetSchemas(dataset_type.label)
      let title = 'Create ' + dataset_type.label.replace(/([A-Z])/g, ' $1')
      this.modal = {
        status: true,
        title: title,
        edit: false,
        type: this.dataset_type,
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
        formData.append('resource_type_id', this.dataset_type.resource_type_id)
        this.datasetStore
          .uploadDatasets(this.study_public_id, formData)
          .then((uploadedDatasets) => {
            const msg = `${uploadedDatasets.length} dataset${uploadedDatasets.length > 1 ? 's' : ''} uploaded successfully`
            this.$notify({ title: 'Success', text: msg, type: 'success' })
            this.uploadedDatasets = uploadedDatasets
            this.getDatasets()
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
    getDatasets() {
      if (this.study_public_id) {
        this.showPolicies = {}
        this.datasetStore
          .getStudyDatasets({ study_id: this.study_public_id })
          .then((datasets) => {
            this.loaded = true
            this.setTableHeaders()
            _.forEach(datasets, (d) => {
              this.showPolicies[d.id] = false
              this.selectedPolicies[d.id] = null
              if (d.properties.policy_id) {
                const idx = _.findIndex(this.policies, (p) => {
                  return (
                    p.value !== undefined &&
                    p.value.id === d.properties.policy_id
                  )
                })
                if (idx > -1) {
                  this.selectedPolicies[d.id] = this.policies[idx].value
                }
              }
            })
          })
          .catch((err) =>
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            }),
          )
      } else {
        this.datasetStore
          .getDatasets()
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
      let datasetTypes = []
      _.forEach(this.datasets, (e) => {
        if (datasetTypes.indexOf(e.dataset_type) === -1) {
          datasetTypes.push(e.dataset_type)
        }
      })
      const schemaStore = useSchemaStore()
      schemaStore.getSchemas().then((schemas) => {
        _.forEach(datasetTypes, (datasetType) => {
          if (schemas[datasetType] !== undefined) {
            if (
              schemas[datasetType].ui_schema.displayedElements !== undefined
            ) {
              _.forEach(
                schemas[datasetType].ui_schema.displayedElements,
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

    getAnalyses() {
      if (this.study_public_id) {
        this.datasetStore
          .getStudyDatasets({ study_id: this.study_public_id })
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
      } else {
        this.datasetStore
          .getDatasets()
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
        this.datasetStore
          .getSamples()
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
    getStatusClass(status_type) {
      let idx = _.findIndex(this.statusTypes, (sT) => {
        return sT.name === status_type
      })
      if (idx > -1) {
        return this.statusTypes[idx].class_name
      }
    },
    getDatasetSchemas(dataset_type) {
      const schemaStore = useSchemaStore()
      if (this.samples.length) {
        schemaStore.getSchemas().then((schemas) => {
          if (schemas[dataset_type] !== undefined) {
            this.data_schema = schemas[dataset_type].data_schema
            this.ui_schema = schemas[dataset_type].ui_schema
          }
        })
      }
    },
    submitStudy() {
      if (this.study_public_id) {
        this.submissionInProgress = true
        this.submissionStore
          .patchStudy(this.study_public_id, {
            status_type_id: 'SUB',
          })
          .then(() => {
            this.$notify({
              title: 'Success',
              text: 'Study subbmitted successfully',
              type: 'success',
            })
            this.submissionInProgress = false
          })
          .catch((err) => {
            this.submissionInProgress = false
            this.$notify({ text: err.message, type: 'danger' })
          })
      }
      this.submitDialog = false
    },
    getPolicyForm (dataset_id, policy_id, form){
      this.dacStore.getPolicyForm(dataset_id, policy_id, form).then(data => {
        this.modalPolicy.status = true
        this.modalPolicy.policy_id = policy_id
        this.modalPolicy.dataset_id = dataset_id
        this.modalPolicy.form = form
      }).catch(err => this.$notify({type: 'danger',text: err}))
    }
  },
})
</script>

<style>
.group-header {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
