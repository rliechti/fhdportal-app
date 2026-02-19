<template>
  <div class="adminRequests">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container>
        <v-card title="Dataset requests" flat>
          <template #text>
            <v-row>
              <v-col cols="9">
                <v-text-field
                  v-model="search"
                  label="Search"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details
                  single-line
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-switch
                  label="Hide reviewed requests"
                  v-model="hideReviewed"
                ></v-switch>
              </v-col>
            </v-row>
          </template>
          <v-data-table
            :items="visibleRequests"
            :headers="headers"
            :search="search"
            items-per-page="50"
            :loading="loading"
          >
            <template #item.dataset="{ item }">
              <b>{{ item.study }}</b>
              <br />
              {{ item.dataset }}
            </template>
            <template #item.requester="{ item }">
              <b>{{ item.requester }}</b>
              <br />
              {{ item.institution }}
            </template>
            <template #item.request_status="{ item }">
              <b>{{ item.request_status }}</b>
              <br />
              {{ formatDate(item.action_time) }}
            </template>
            <template #item.requester_comment="{ item }">
              <!-- {{item.requester_comment}} -->
              <v-btn
                v-if="item.requester_comment"
                color="default"
                variant="outlined"
                density="compact"
              >
                Show comment...

                <v-menu activator="parent">
                  <v-card>
                    <v-card-title>Requester comment</v-card-title>
                    <v-card-text>{{ item.requester_comment }}</v-card-text>
                  </v-card>
                </v-menu>
              </v-btn>
            </template>
            <template #item.actions="{ item }">
              <v-chip v-if="item.validator"
                >Reviewed by {{ item.validator }}</v-chip
              >
              <template v-else>
                <template v-if="!confirmAction.request_id">
                  <v-btn
                    color="success"
                    density="compact"
                    @click="setConfirm(item.request_id, 'APR')"
                  >
                    approve...
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="outlined"
                    density="compact"
                    @click="setConfirm(item.request_id, 'REJ')"
                    class="ml-1"
                  >
                    reject...
                  </v-btn>
                </template>
                <template
                  v-else-if="confirmAction.request_id === item.request_id"
                >
                  <v-btn
                    :color="
                      confirmAction.request_status === 'APR'
                        ? 'success'
                        : 'error'
                    "
                    density="compact"
                    @click="patchRequest"
                  >
                    confirm
                    {{
                      confirmAction.request_status === 'APR'
                        ? 'approval'
                        : 'rejection'
                    }}
                  </v-btn>
                  <v-btn
                    color="grey"
                    variant="outlined"
                    density="compact"
                    @click="cancelAction"
                    class="ml-1"
                  >
                    cancel
                  </v-btn>
                </template>
              </template>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { useAdminStore } from '@/stores/admin.js'
import { useAuthStore } from '@/stores/auth.ts'
import { mapState } from 'pinia'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'Users',
  computed: {
    ...mapState(useAuthStore, ['user']),
    ...mapState(useAdminStore, ['requests']),
    visibleRequests() {
      if (this.hideReviewed) {
        return _.filter(this.requests, (r) => !r.validator_id)
      }
      return this.requests
    },
  },
  data() {
    return {
      search: '',
      loading: true,
      hideReviewed: false,
      confirmAction: {
        id: null,
        request_status: '',
      },
      headers: [
        {
          title: 'Dataset',
          value: 'dataset',
        },
        {
          title: 'Requester',
          value: 'requester',
        },
        {
          title: 'Comment',
          value: 'requester_comment',
        },
        {
          title: 'Status',
          value: 'request_status',
        },
        {
          title: 'Actions',
          value: 'actions',
        },
      ],
    }
  },
  methods: {
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
    },
    setConfirm(id, request_status) {
      this.confirmAction.request_id = id
      this.confirmAction.request_status = request_status
    },
    patchRequest() {
      if (this.confirmAction.request_id && this.confirmAction.request_status) {
        const requestStore = useAdminStore()
        requestStore
          .patchRequest(this.confirmAction)
          .then(() => {
            const actionTitle =
              this.confirmAction.request_status === 'APR' ? 'approved' : 'rejected'
            this.$notify({
              title: 'Dataset request',
              text: `Dataset request ${actionTitle} successfully`,
              type: 'success',
            })
          })
          .catch((err) => {
            this.$notify({ title: 'Error', text: err.message, type: 'error' })
          })
      }
    },
    cancelAction() {
      this.confirmAction.request_id = null
      this.confirmAction.request_status = ''
    },
  },
  mounted() {
    const requestStore = useAdminStore()
    this.loading = true
    requestStore
      .getRequests()
      .then(() => {
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  },
}
</script>
