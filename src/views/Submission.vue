<template>
  <div class="Submission">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container>
        <h1 class="text-center">Submission Portal</h1>
        <template v-if="user.roles.indexOf('submitter') > -1">
          <v-alert style="margin: 20px" closable v-model="alert.steps" color="lightinfo">
            <UploadSteps style="margin: auto; padding: auto; " :style="`color: ${alertTextColor}`" />            
          </v-alert>
          <v-alert
               type="warning"
               variant="tonal"
               prominent
               style="margin: 0 20px"
          >
            <WarningSensitive style="margin: auto; padding: auto; " />
          </v-alert>
          
          <p class="text-left" v-if="!alert.steps"><v-btn variant="text" color="info" size="small" @click="alert.steps=!alert.steps" prepend-icon="mdi-information">show submission steps</v-btn></p>          
          <v-alert style="margin: 20px" closable v-model="alert.sshkey" color="lightinfo">
            <SshKey  style="margin: auto; padding: auto;"  :style="`color: ${alertTextColor}`" />
          </v-alert>
          <p class="text-right" v-if="!alert.sshkey"><v-btn variant="text" color="info" size="small" @click="alert.sshkey=!alert.sshkey" prepend-icon="mdi-information">show help on ssh public key</v-btn></p>          
          <user-keys type="ssh"></user-keys>
          <v-alert style="margin: 20px" closable v-model="alert.encryption" color="lightinfo">
            <Encryption  style="margin: auto; padding: auto;"  :style="`color: ${alertTextColor}`" />
          </v-alert>
          <p class="text-right" v-if="!alert.encryption"><v-btn variant="text" color="info" size="small" @click="alert.encryption=!alert.encryption"  prepend-icon="mdi-information">show help on file encryption</v-btn></p>
          <study-list from="submission"></study-list>

          <p class="text-center">
            <v-btn class="bg-primary" @click="openNewStudy" v-if="user.sshPublicKeys.length"
              >submit a new study</v-btn
            >
            <v-alert type="info" v-else>Please first upload a public SSH key</v-alert>
          </p>
        </template>
        <template v-else>
          <h3 class="text-center my-10">
            Your account doesn't have a submitter role
          </h3>
          <p class="text-center">
            <v-btn color="primary" variant="flat" @click="requestSubmission()"
              >Request a submitter role...</v-btn
            >
          </p>
        </template>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import HTTP from '@/services/api'
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import StudyList from '@/views/StudyList.vue'
import UserKeys from '@/components/UserKeys.vue'
import { mapState } from 'pinia'
import Encryption from '@/assets/documentation/Encryption.md'
import SshKey from '@/assets/documentation/SshKey.md'
import UploadSteps from '@/assets/documentation/UploadSteps.md'
import WarningSensitive from '@/assets/documentation/WarningSensitive.md'
import { useTheme } from 'vuetify';

export default defineComponent({
  name: 'Submission',
  components: {
    UserKeys,
    StudyList,
    Encryption,
    SshKey,
    UploadSteps,
    WarningSensitive
  },
  data() {
    return {
      alert: {
        steps: true,
        sshkey: false,
        encryption: false
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    alertTextColor () {
      const theme = useTheme();
      return (theme.name.value.indexOf("DARK") > -1) ? "#BBF" : "#55B"
    }
  },
  methods: {
    openNewStudy() {
      let route = '/submissions/new'
      this.$router.push(route)
    },
    requestSubmission() {
      HTTP.post('/users/request', { role: 'submitter' })
        .then(() => {
          this.$notify({ title: 'Request sent Successfully', type: 'success' })
        })
        .catch((err) => {
          console.log(err)
          this.$notify({
            title: err.response.statusText,
            text: err.response.data.detail,
            type: 'error',
          })
        })
    },
  },
})
</script>
