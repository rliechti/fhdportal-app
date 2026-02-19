<template>
  <div class="UserManual">
    <v-sheet min-height="70vh" rounded="lg">
    <v-container class="maxWidth">
    <v-card>
    <v-card-text>
      <div class="github-markdown-body">
        <UserManualContent />
      </div>
        
    </v-card-text>

    </v-card>
  </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import UserManualContent from '@/assets/documentation/UserManual.md'
export default defineComponent({
  name: 'Teams',
  components: {
    UserManualContent
  }
})
</script>

<style>
.UserManual img {
  max-width: 100%;
  height: auto;
}
  
</style>