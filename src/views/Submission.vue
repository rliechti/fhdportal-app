<template>
  <div class="Submission">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container style="padding: 0">
        <h1 class="text-center">Submission Portal</h1>
        <template v-if="user.roles.indexOf('submitter') > -1">
          <v-alert
            type="warning"
            variant="tonal"
            prominent
            style="margin: 20px"
          >
            <WarningSensitive style="margin: auto; padding: auto" />
          </v-alert>

          <v-alert
            style="margin: 20px"
            closable
            v-model="alert.steps"
            color="lightinfo"
          >
            <div class="github-markdown-body">
              <UploadSteps
                style="margin: auto; padding: auto"
                :sda_inbox_url="sda_inbox_url"
                :sda_c4gh_key="sda_c4gh_key"
                :sda_sftp_port="sda_sftp_port"
                :style="`color: ${alertTextColor}`"
              />
            </div>

            <v-btn
              variant="text"
              style="margin-bottom: 5px"
              color="info"
              @click="alert.encryption = !alert.encryption"
              prepend-icon="mdi-information"
            >
              <span v-if="alert.encryption">hide</span
              ><span v-else>show</span> help on file encryption</v-btn
            >
            <div class="github-markdown-body">
              <Encryption
                v-if="alert.encryption"
                style="margin: auto; padding: auto"
                :style="`color: ${alertTextColor}`"
              />
            </div>
          </v-alert>

          <p class="text-left ml-4" v-if="!alert.steps">
            <v-btn
              variant="text"
              color="info"
              size=""
              @click="alert.steps = !alert.steps"
              prepend-icon="mdi-help-circle"
              >Help dataset submission</v-btn
            >
          </p>
          <user-keys type="ssh"></user-keys>

          <study-list from="submission"></study-list>

          <p class="text-center">
            <v-btn
              class="bg-primary"
              @click="openNewStudy"
              v-if="user.sshPublicKeys.length"
              >submit a new study</v-btn
            >
            <v-alert type="info" v-else
              >Please first upload a public SSH key</v-alert
            >
          </p>
        </template>
        <template v-else>
          <h3 class="text-center my-10">
            Your account doesn't have a submitter role
          </h3>
          <v-alert
            text="To activate your submitter role, your institution’s legal representative—authorized to sign contracts on its behalf—must sign the Data Transfer and Processing Agreement (DTPA). 
            Once the DTPA is signed, please upload the fully executed copy using this form. 
            After submission, our Helpdesk Team will review your request and verify the DTPA signature. If the verification is successful, your request will be approved and the submitter role will be activated."
            type="info"
            variant="outlined"
            class="text-h5"
          >
          </v-alert>
          <v-card variant="outlined" class="my-10" v-if="displayRequestForm">
            <v-card-title> Request a submitter role </v-card-title>
            <v-card-text>
              <p class="h5 my-3">
                Download this
                <v-btn
                  color="primary"
                  variant="text"
                  prepend-icon="mdi-file"
                  @click="downloadTemplate('DTPA')"
                  >DTPA template</v-btn
                >, sign and upload it
              </p>
              <form>
                <v-container>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="user.username"
                        label="Username"
                        required
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-file-input
                        label="DTPA upload"
                        v-model="dtpa"
                      ></v-file-input>
                    </v-col>
                  </v-row>
                </v-container>
              </form>
            </v-card-text>
            <v-card-actions>
              <p class="text-center w-100">
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="requestSubmission()"
                  :disabled="!dtpa"
                  >Send request</v-btn
                >
              </p>
            </v-card-actions>
          </v-card>
          <v-card
            v-if="user.dtpas !== undefined && user.dtpas.length > 0"
            class="my-10"
          >
            <v-card-title>Submitter role request</v-card-title>
            <v-card-text>
              <p class="h5 my-3">
                A Data Transfer and Processing Agreement form has already been
                uploaded and is currently under review.
              </p>
              <p>The uploaded document is:</p>
              <v-list lines="two">
                <v-list-item
                  v-for="dtpa in user.dtpas"
                  :prependIcon="
                    dtpa.dtpa_document_type.indexOf('word') > -1
                      ? 'mdi-file-word'
                      : 'mdi-file-type-pdf'
                  "
                  :key="dtpa.request_date"
                  :title="dtpa.dtpa_document_name"
                  :subtitle="`uploaded on ${formatDate(dtpa.request_date)}`"
                ></v-list-item>
              </v-list>
              <p class="h5 my-3">
                You will be notified by email once your submitter role has been
                granted.
              </p>
            </v-card-text>
          </v-card>
        </template>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import HTTP from '@/services/api'
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import { useSubmissionStore } from '@/stores/submissions.js'
import StudyList from '@/views/StudyList.vue'
import UserKeys from '@/components/UserKeys.vue'
import { mapState } from 'pinia'
import Encryption from '@/assets/documentation/Encryption.md'
import SshKey from '@/assets/documentation/SshKey.md'
import UploadSteps from '@/assets/documentation/UploadSteps.md'
import WarningSensitive from '@/assets/documentation/WarningSensitive.md'
import { useTheme } from 'vuetify'
import moment from 'moment'
import '@/assets/styles/github.css'
export default defineComponent({
  name: 'Submission',
  components: {
    UserKeys,
    StudyList,
    Encryption,
    SshKey,
    UploadSteps,
    WarningSensitive,
  },
  data() {
    return {
      alert: {
        steps: true,
        sshkey: false,
        encryption: false,
      },
      dtpa: {},
      displayRequestForm: false,
      sda_inbox_url: import.meta.env.VITE_SDA_INBOX_URL,
      sda_c4gh_key: import.meta.env.VITE_SDA_C4GH_KEY,
      sda_sftp_port: import.meta.env.VITE_SDA_SFTP_PORT,
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    ...mapState(useSubmissionStore, ['studies']),
    alertTextColor() {
      const theme = useTheme()
      return theme.name.value.indexOf('DARK') > -1 ? '#BBF' : '#55B'
    }
  },
  methods: {
    formatDate(value) {
      return moment(value).format('LLLL')
    },
    getDTPA() {
      let userStore = useAuthStore()
      userStore
        .getUserDTPA()
        .then((dtpas) => {
          if (this.user.dtpas.length > 0) {
            this.displayRequestForm = false
          } else {
            this.displayRequestForm = true
          }
        })
        .catch((err) => {
          this.displayRequestForm = true
        })
    },
    downloadTemplate() {
      let _this = this
      let submissionStore = useSubmissionStore()
      submissionStore
        .downloadTemplate('DTPA')
        .then((res) => {
          let blob = new Blob([res.data], { type: 'application/vnd.ms-word' })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = 'SwissFEGA_DTPA.docx'
          link.click()
        })
        .catch((err) => {
          console.info(err)
          _this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          })
        })
    },
    openNewStudy() {
      let route = '/submissions/new'
      this.$router.push(route)
    },
    requestSubmission() {
      let formData = new FormData()
      formData.append('dtpa', this.dtpa)
      formData.append('role', 'submitter')
      HTTP.post('/users/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(() => {
          this.$notify({ title: 'Request sent Successfully', type: 'success' })
          this.getDTPA()
        })
        .catch((err) => {
          this.$notify({
            title: err.response.statusText,
            text: err.response.data.detail,
            type: 'error',
          })
        })
    },
  },
  watch: {
    studies (n,o){
      if ((o.length === 0 || o.length === n.length) && n.length > 0){
        this.alert.steps = false
      }
    }
  },
  mounted() {
    if (this.user.roles.indexOf('submitter') === -1) {
      this.getDTPA()
    }
  },
})
</script>
