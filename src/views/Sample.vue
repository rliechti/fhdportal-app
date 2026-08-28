<template>
  <div class="Sample">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container fluid>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <PageTitle title="Sample" />
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { notifyError } from '@/utils/notify'
import { useSampleStore } from '@/stores/samples.js'
import PageTitle from '@/components/shared/PageTitle.vue'

export default defineComponent({
  name: 'Sample',
  components: {
    PageTitle,
  },
  data() {
    return {
      sampleStore: null,
      error: '',
      samples: [],
      data_schema: null,
      ui_schema: null,
    }
  },
  mounted() {
    this.sampleStore = useSampleStore()
  },
  methods: {
    getSamples() {
      this.sampleStore
        .getSamples()
        .then(() => {
          this.samples = samples
        })
        .catch(() =>
          notifyError('Failed to load samples. Please try again.'),
        )
    }
  }
})
</script>