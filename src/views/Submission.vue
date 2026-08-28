<template>
  <div class="Submission">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container fluid style="padding: 0">
        <PageTitle title="My Submissions" />
        <template v-if="user.roles.indexOf('submitter') > -1">
          <study-list from="submission"></study-list>
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
import { notifyError } from '@/utils/notify'
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import { useSubmissionStore } from '@/stores/submissions.js'
import StudyList from '@/views/StudyList.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import { mapState } from 'pinia'
import moment from 'moment'
export default defineComponent({
  name: 'Submission',
  components: {
    StudyList,
    PageTitle,
  },
  data() {
    return {
      dtpa: {},
      displayRequestForm: false,
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
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
          notifyError('Failed to download template. Please try again.')
        })
    },
    requestSubmission() {
      // The endpoint is the submitter-role request endpoint; the role is implied by
      // the route and must be decided server-side, not asserted by the client.
      let formData = new FormData()
      formData.append('dtpa', this.dtpa)
      HTTP.post('/users/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(() => {
          this.$notify({ title: 'Request sent Successfully', type: 'success' })
          this.getDTPA()
        })
        .catch(() => {
          notifyError('Failed to send submission request. Please try again.')
        })
    },
  },
  mounted() {
    if (this.user.roles.indexOf('submitter') === -1) {
      this.getDTPA()
    }
  },
})
</script>
