<template>
  <div class="CLI maxWidth" style="position: relative">
    <v-sheet min-height="70vh" rounded="lg">
      <!-- <v-btn color="primary" @click="downloadCli" >Download CLI tool</v-btn> -->
      <v-btn
            color="primary"
            style="position: absolute; right: 10px; top: 10px; width: 200px"
          >
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props" append-icon="mdi-download"> Download CLI Tool </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in binaries"
              :key="item.title"
              :value="item.value"
              @click="downloadCli(item.value)"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <div class="github-markdown-body">
        <Cli />
      </div>
    </v-sheet>
  </div>
</template>

<script>
import Cli from '@/assets/documentation/Cli.md'
import { useSubmissionStore } from '@/stores/submissions.js'
import '@/assets/styles/github.css'
export default {
  name: 'CLI',
  components: {
    Cli,
  },
  data() {
    return {
      binaries: [
        { title: 'Linux (x64)', value: 'fega-linux' },
        { title: 'macOS (Intel)', value: 'fega-macos-x64' },
        { title: 'macOS (Apple Silicon)', value: 'fega-macos-arm' },
        { title: 'Windows (x64)', value: 'fega-windows.exe' },
      ]
    }
  },
  methods: {
    downloadCli(binary) {
      let _this = this
      if (binary) {
        let submissionStore = useSubmissionStore()
        submissionStore
          .downloadCli(binary)
          .then((res) => {
            let blob = new Blob([res.data], {
              type: 'application/octet-stream',
            })
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = binary
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
    },
  },
}
</script>
