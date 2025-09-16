<template>
  <div class="Studies">
    <v-sheet rounded="lg">
      <v-container>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="!loaded" class="text-center mt-3">
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </p>
        <div v-else>
          <template v-if="studies.length">
            <v-card>
              <v-data-table
                :items="studies"
                :headers="studyTableHeaders"
                items-per-page="-1"
                :hide-default-footer="true"
                :hover="true"
              >
                <template #header.nb_samples="{}"
                  ><p>
                    <v-tooltip activator="parent" location="bottom"
                      >Nb samples
                    </v-tooltip>
                    <v-icon icon="mdi-water"></v-icon>
                  </p>
                </template>
                <template #header.nb_experiments="{}"
                  ><p>
                    <v-tooltip activator="parent" location="bottom"
                      >Nb experiments
                    </v-tooltip>
                    <v-icon icon="mdi-eyedropper"></v-icon>
                  </p>
                </template>
                <template #header.nb_runs="{}"
                  ><p>
                    <v-tooltip activator="parent" location="bottom"
                      >Nb runs
                    </v-tooltip>
                    <v-icon icon="mdi-run"></v-icon>
                  </p>
                </template>
                <template #header.nb_analyses="{}"
                  ><p>
                    <v-tooltip activator="parent" location="bottom"
                      >Nb analyses
                    </v-tooltip>
                    <v-icon icon="mdi-graphql"></v-icon>
                  </p>
                </template>
                <template #header.nb_datasets="{}"
                  ><p>
                    <v-tooltip activator="parent" location="bottom"
                      >Nb datasets
                    </v-tooltip>
                    <v-icon icon="mdi-file-document"></v-icon>
                  </p>
                </template>
                <template #item.title="{ item }">
                  {{ item.title }}
                  <v-btn
                    variant="flat"
                    class="text-info"
                    @click="copy(item.public_id)"
                  >
                    <v-icon icon="mdi-information"></v-icon>
                    <v-tooltip activator="parent" location="top"
                      >{{ item.public_id }}
                    </v-tooltip>
                  </v-btn>
                </template>

                <template #column.creation_date="{ column }">
                  {{ column.title }}
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
                      size="small"
                      style="display: inline-flex; margin-bottom: 1px"
                      :color="
                        item.current_permission.indexOf('edit') > -1
                          ? 'primary'
                          : 'warning'
                      "
                      variant="outlined"
                      @click="openStudy(item)"
                    >
                      <v-icon class="mr-1" icon="mdi-eye"></v-icon
                      >{{
                        item.current_permission.indexOf('edit') > -1
                          ? 'details'
                          : 'review'
                      }}</v-btn
                    >
                    <permissions
                      style="display: inline-flex; margin-left: 5px"
                      :study="item"
                      display="share"
                    >
                    </permissions>
                  </p>
                </template>
                <template #item.status="{ value }">
                  <v-chip :color="getStatusClass(value)">{{ value }}</v-chip>
                </template>
              </v-data-table>
            </v-card>
          </template>
        </div>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import useClipboard from 'vue-clipboard3'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSchemaStore } from '@/stores/schemas.js'

import Permissions from '@/views/Permissions.vue'
import moment from 'moment'
import _ from 'lodash'
import { mapState } from 'pinia'

export default defineComponent({
  name: 'Studies',
  components: {
    Permissions,
  },
  props: ['from', 'status'],
  data() {
    return {
      submissionStore: null,
      loaded: false,
      error: '',
      pmid: '',
      publications: [],
      studyTableHeaders: [
        // {
        //     title: 'ID',
        //     value: 'public_id'
        //
        // },
        {
          title: 'Title',
          value: 'title',
        },
        {
          title: 'Samples',
          value: 'nb_samples',
          icon: 'water',
        },
        {
          title: 'Experiments',
          value: 'nb_experiments',
          icon: 'eyedropper',
        },
        {
          title: 'Runs',
          value: 'nb_runs',
          icon: 'run',
        },
        {
          title: 'Analyses',
          value: 'nb_analyses',
          icon: 'graphql',
        },
        {
          title: 'Datasets',
          value: 'nb_datasets',
          icon: 'file-document',
        },
        {
          title: 'Status',
          value: 'status',
        },
        // {
        // 	title: 'Creation date',
        // 	value: 'creation_date'
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
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'center',
          headerProps: { style: 'font-weight: bold' },
        },
      ],
      showForm: false,
      data: {
        id: null,
        title: 'Sample Study',
        study_type: 'Whole Genome Sequencing',
        description: 'this is a test',
      },
      data_schema: null,
      ui_schema: null,
    }
  },
  computed: {
    ...mapState(useSubmissionStore, ['studies']),
    ...mapState(useSchemaStore, ['schemas']),
    ...mapState(useSubmissionStore, ['statusTypes']),
  },
  mounted() {
    this.submissionStore = useSubmissionStore()
    const schemaStore = useSchemaStore()
    _.forEach(this.studyTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
    schemaStore.getSchemas().then((schemas) => {
      if (schemas.Study !== undefined) {
        this.data_schema = schemas.Study.data_schema
        this.ui_schema = schemas.Study.ui_schema
      }
    })
    this.getStudies()
    this.getPublications = _.debounce(this.getPublications, 500)
    this.submissionStore.getStatusTypes()
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
    openStudy(study) {
      let route = '/submissions/' + study.public_id
      this.$router.push(route)
    },
    getStudies() {
      let params = {}
      if (this.from == 'submission') {
        params = { status: 'draft,submitted,published' }
      } else if (this.from == 'list') {
        params = { status: this.status }
      }
      this.submissionStore
        .getStudies(params)
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
    },
    editStudy(study) {
      this.data = JSON.parse(JSON.stringify(study.properties))
      this.data.id = study.id
      this.showForm = true
    },
    updateData(event) {
      this.data = event.data
    },
    resetForm() {
      let _this = this
      Object.keys(this.data).forEach(function (index) {
        _this.data[index] = null
      })
      this.showForm = false
    },
    submitForm() {
      this.submissionStore
        .editStudy(this.data)
        .then(() => {
          const action = this.data.id ? 'updated' : 'registered'
          this.$notify({
            title: 'Study ' + action + ' successfully',
            type: 'success',
          })
          this.showForm = false
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
      return moment(value).format('DD MMM YYYY')
    },
    getPublications(search) {
      const _this = this
      if (search !== null && search.length > 4) {
        this.submissionStore
          .getPubmeds(search)
          .then((pubmeds) => {
            _this.publications = Object.values(pubmeds)
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