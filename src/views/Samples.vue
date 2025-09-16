<template>
  <div class="Samples">
    <v-sheet min-height="70vh" rounded="lg">
      <v-dialog v-model="modal.status" width="95%">
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

      <v-container>
        <h1 v-if="!study_public_id" class="text-center">Samples</h1>
        <p v-if="!loaded || loading" class="text-center mt-3">
          <em>Loading samples</em> <br />
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </p>
        <div v-if="loaded">
          <div v-if="study_public_id && !loading">
            <h3
              class="text-center mb-5 d-flex align-center pe-2"
            >
              <v-icon icon="mdi-water"></v-icon>&nbsp;{{
                samples.length
              }}
              Sample<span v-if="samples.length > 1">s</span>
              <span v-if="selectedSamples.length">
                - {{ selectedSamples.length }} selected</span
              >
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                v-if="samples.length"
                label="Search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
              ></v-text-field>
                <template v-if="!deleteSample.status && study.sampleTypes.length && study.current_permission.indexOf('edit') > -1 && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')">
                  <v-btn
                    v-for="sampleType in study.sampleTypes"
                    :key="sampleType.resource_type_id"
                    variant="flat"
                    color="primary"
                    class="ml-2"
                    @click="createSample(sampleType)"
                  >
                    create new
                    {{ sampleType.label.replace(/([A-Z])/g, ' $1').trim() }}...
                  </v-btn>
                </template>
              
            </h3>

            <v-data-table
              fixed-header
              height="calc(100vh - 550px)"
              v-if="samples.length"
              v-model="selectedSamples"
              class="mt-5"
              :items="samples"
              :items-per-page="25"
              :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, -1],
              }"
              :item-value="'id'"
              :search="search"
              :filter-keys="['title']"
              :headers="sampleTableHeaders"
              :hover="true"
              show-select
              density="compact"
            >
              <!-- <v-data-table v-model="selectedSamples" :items="samples" :headers="sampleTableHeaders" v-if="samples.length" show-select> -->
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
              <template #item.sample_type="{ value }">
                {{ value.replace(/([A-Z])/g, ' $1').trim() }}
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
                    @click="editSample(item)"
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
            </v-data-table>

            <p v-else class="text-center"><em>No sample yet</em></p>
            <p v-if="study.sampleTypes.length && study.current_permission.indexOf('edit') > -1 && (study.status_type_id === 'DRA'||study.status_type_id === 'REV')" class="text-center">
              <template v-if="selectedSamples.length">
                <v-btn
                  v-if="!deleteSample.status"
                  class="ml-3"
                  color="error"
                  variant="flat"
                  @click="deleteSamples('init')"
                  >delete {{ selectedSamples.length }} selected <span
                    v-if="selectedSamples.length > 1"
                    >Samples</span
                  ><span v-else>Sample</span></v-btn
                >
                <template v-if="deleteSample.status">
                  <v-btn
                    class="ml-3"
                    color="error"
                    variant="flat"
                    @click="deleteSamples('save')"
                    >confirm deletion of
                    {{ selectedSamples.length }} <span
                      v-if="selectedSamples.length > 1"
                      >Samples</span
                    ><span v-else>Sample</span></v-btn
                  >
                  <v-btn
                    class="ml-3"
                    color="secondary"
                    variant="outlined"
                    @click="deleteSamples('cancel')"
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
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSampleStore } from '@/stores/samples.js'
import { useSchemaStore } from '@/stores/schemas.js'
import ModalResource from '@/components/modalResource.vue'
import useClipboard from 'vue-clipboard3'
import { mapState } from 'pinia'
import _ from 'lodash'
import moment from 'moment'

export default defineComponent({
  name: 'Samples',
  components: {
    ModalResource,
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
        // {
        //     title: 'Sample type',
        //     value: 'sample_type',
        //                     sortable: true
        // },
        // {
        //     title: 'ID',
        //     value: 'public_id',
        //                     sortable: true
        // },
        // {
        // 		title: 'Alias',
        // 		value: 'alias'
        // 	},
        {
          title: 'Title',
          value: 'title',
          sortable: true,
        },
        {
          title: 'Status',
          value: 'status',
          sortable: true,
        },
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
          align: 'center',
        },
      ],
      sample_type: null,
      deleteSample: { status: false },
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['study']),
    ...mapState(useSampleStore, ['samples']),
    ...mapState(useSchemaStore, ['schemas']),
    ...mapState(useSubmissionStore, ['statusTypes']),
  },
  watch: {
    study_id(n, o) {
      if (n && n != o) {
        this.getStudy()
      }
    },
  },
  mounted() {
    this.submissionStore = useSubmissionStore()
    this.sampleStore = useSampleStore()
    _.forEach(this.sampleTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
    this.getStudy()
    this.submissionStore.getStatusTypes()
  },
  methods: {
    async copy(msg) {
      const { toClipboard } = useClipboard()
      try {
        await toClipboard(msg)
        this.$notify({
          type: 'success',
          text: 'Public Sample ID copied to clipboard',
        })
      } catch (e) {
        console.error(e)
      }
    },

    editSample(item) {
      this.sample_type = { name: item.sample_type, label: item.sample_type }
      // this.getSampleSchemas(item.sample_type);
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
        permissions: item.current_permission,
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
              sample_id: _.filter(this.samples, (s) => s.id === id)[0]
                .public_id,
            })
          })
        }
        this.sampleStore
          .deleteSamples(params)
          .then(() => {
            this.$notify({
              title: 'Success',
              text: `${params.length} sample${params.length ? 's' : ''} deleted successfully`,
              type: 'success',
            })
            _this.deleteSample.status = false
            _this.selectedSamples = []
          })
          .catch((err) => {
            _this.deleteSample.status = false
            _this.$notify({
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
        hide_upload: false,
      }
    },

    getSamples() {
      this.loading = true
      if (this.study_public_id) {
        this.sampleStore
          .getStudySamples({ study_id: this.study_public_id })
          .then(() => {
            this.loading = false
            this.loaded = true
          })
          .catch((err) => {
            this.$notify({
              title: err.response.statusText,
              text: err.response.data,
              type: 'error',
            })
            this.loading = false
          })
      } else {
        this.sampleStore
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

    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
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
    },
    getStatusClass(status_type) {
      let idx = _.findIndex(this.statusTypes, (sT) => {
        return sT.name === status_type
      })
      if (idx > -1) {
        return this.statusTypes[idx].class_name
      }
    },
  },
})
</script>
