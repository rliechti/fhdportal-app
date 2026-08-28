<template>
  <div class="Submission">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container fluid>
        <PageTitle title="Codebase" />
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import PageTitle from '@/components/shared/PageTitle.vue'
export default defineComponent({
  name: 'Codebase',
  components: {
    PageTitle,
  },
})
</script>
