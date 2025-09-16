<template>
  <div class="Teams">
    <v-sheet min-height="70vh" rounded="lg">
    <v-container class="maxWidth">
    <v-card>
    <v-card-text>
        <TeamsContent />
    </v-card-text>
    
    </v-card>
  </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import TeamsContent from '@/assets/documentation/Teams.md'
export default defineComponent({
  name: 'Teams',
  components: {
    TeamsContent
  }
})
</script>
