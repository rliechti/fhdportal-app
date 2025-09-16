<template>
  <div class="Sample">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <h1 class="text-center">Sample</h1>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useSampleStore } from '@/stores/samples.js'

export default defineComponent({
  name: 'Sample',
  components: {
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
        .catch((err) =>
          this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          }),
        )
    }
  }
})
</script>