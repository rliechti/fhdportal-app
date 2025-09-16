<template>
<div class="CLI maxWidth" style="position: relative">
  <v-sheet min-height="70vh" rounded="lg">
  <v-btn color="primary" @click="downloadCli" style="position: absolute; right: 10px; top: 10px">Download CLI tool</v-btn>
    <Cli />
  </v-sheet>
</div>
</template>

<script>
import Cli from '@/assets/documentation/Cli.md'
import { useSubmissionStore } from '@/stores/submissions.js'
export default {
  name: 'CLI',
  components: {
    Cli
  },
  methods: {
    downloadCli() {
      let submissionStore = useSubmissionStore()
      submissionStore
        .downloadCli()
        .then((res) => {
          let blob = new Blob([res.data], { type: 'application/zip' })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = 'fega-cli.zip'
          link.click()
        })
        .catch((err) => {
          _this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          })
        })
    }
    
  }
}
</script>