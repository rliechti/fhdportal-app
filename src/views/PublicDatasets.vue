<template>
  <div class="Studies">
    <v-sheet min-height="70vh" rounded="lg">
      <h1 class="text-center pt-10">Datasets</h1>
      <div style="display: flex" class="py-8">
        <div class="flex-fill w-100">
          <v-sheet width="100%" style="margin: auto">
            <v-data-table
              :loading="loading"
              :items="datasets"
              :headers="tableHeaders"
              :search="search"
              density="compact"
              hover
            >
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
              <template #item.public_id="{ value }">
                <v-btn
                  variant="text"
                  color="info"
                  @click="viewDataset(value)"
                  >{{ value }}</v-btn
                >
              </template>
              <template #item.types="{ item, value }">
                <v-chip
                  v-for="t in value"
                  :key="`${item.public_id}${t}`"
                  size="small"
                  >{{ t }}</v-chip
                >
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
import { useDatasetStore } from '@/stores/datasets.js'
import { mapState } from 'pinia'

export default defineComponent({
  name: 'PublicDatasets',
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
          title: 'Dataset',
          value: 'title',
          sortable: true,
        },
        {
          title: 'Description',
          value: 'description',
          sortable: false,
        },
        {
          title: 'Technology',
          value: 'types',
          sortable: true,
        },
        {
          title: 'Nb samples',
          value: 'nb_samples',
          sortable: true,
        },
      ],
    }
  },
  computed: {
    ...mapState(useDatasetStore, ['datasets']),
  },
  methods: {
    viewDataset(datasetPublicId) {
      this.$router.push(`/datasets/${datasetPublicId}`)
    }
  },
  mounted() {
    this.loading = true
    let store = useDatasetStore()
    store.resetDatasets().then(() => {
      store
        .getDatasets()
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
