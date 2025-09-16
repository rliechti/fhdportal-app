<template>
  <v-sheet min-height="70vh" rounded="lg">
    <v-container class="maxWidth">
      <h1 class="text-center mb-8">Welcome to the Swiss FEGA portal</h1>
      <br />
      <v-card>
        <Home style="padding: 20px 40px" />
      </v-card>
    </v-container>
  </v-sheet>
</template>

<script setup>
</script>

<script>
import { defineComponent } from 'vue'

import Home from '@/assets/documentation/Home.md'

export default defineComponent({
  name: 'App',
  components: {
      Home
  },
  data() {
    return {}
  }
})
</script>

<style>
.v-theme--light .v-main {
  background-color: #eee;
}
.v-theme--dark .v-main {
  background-color: var(--v-theme-background);
}
.markdown-body ul {
  padding-inline-start: 30px;
}
.markdown-body p {
  margin: 1em 0px !important;
  text-align: justify;
}
.markdown-body a {
  text-decoration: none;
}
.v-field__outline {
  color:  var(--v-theme-background) !important;
}
.v-toolbar {
  background: none !important;
}
</style>
