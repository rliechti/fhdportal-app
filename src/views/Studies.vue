<template>
  <div class="Studies">
    <v-sheet min-height="70vh" rounded="lg">
      <h1 class="text-center pt-10">Studies and Cohorts</h1>
      <div style="display: flex" class="py-8">
        <div class="flex-fill w-100">
          <v-sheet width="80%" style="margin: auto">
            <v-data-table
              :loading="loading"
              :items="studies"
              :headers="tableHeaders"
              :search="search"
              density="compact"
            >
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
              <template #item.public_id="{ value }">
                <v-btn variant="text" color="info" @click="viewStudy(value)">{{
                  value
                }}</v-btn>
              </template>
            </v-data-table>
          </v-sheet>
        </div>
      </div>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useStudyStore } from '@/stores/studies.js'
import { mapState } from 'pinia'

export default defineComponent({
  name: 'Studies',
  components: {},
  data() {
    return {
      loading: false,
      search: '',
      tableHeaders: [
        {
          title: 'ID',
          value: 'public_id',
        },
        {
          title: 'Study',
          value: 'title',
          sortable: true,
        },
        {
          title: 'Type',
          value: 'study_type',
          sortable: true,
        },
        {
          title: 'Nb datasets',
          value: 'nb_datasets',
          sortable: true,
        },
        {
          title: 'Published date',
          value: 'released_date',
          sortable: true,
        },
      ],
    }
  },
  computed: {
    ...mapState(useStudyStore, ['studies']),
  },
  methods: {
    viewStudy(studyPublicId) {
      this.$router.push(`/studies/${studyPublicId}`)
    },
  },
  mounted() {
    this.loading = true
    let store = useStudyStore()
    store.resetStudies().then(() => {
      store
        .getStudies()
        .then(() => {
          this.loading = false
        })
        .catch((err) => {
          this.snotify({ title: 'Error', text: err, type: 'error' })
          this.loading = false
        })
    })
  },
})
</script>

<style></style>
